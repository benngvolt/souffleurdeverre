const { storage, bucket } = require('../config/storage');
const Project = require('../models/project');
const Biography = require('../models/biography');
const Logo = require('../models/logo');
const User = require('../models/user');
const pcloud = require('./pcloud');
const { syncFilesToPcloud } = require('./backupFiles');
const { serializeDump, encryptBuffer } = require('./backupCrypto');

// Sauvegarde chiffrée de la base MongoDB, envoyée à deux endroits indépendants :
//   1. Google Cloud Storage (dossier backups/ du bucket, ou BACKUP_GCS_BUCKET si défini : bucket privé conseillé)
//   2. pCloud (copie hors Google), si PCLOUD_ACCESS_TOKEN est défini
// Avec pCloud, les fichiers du site (photos, PDF...) sont aussi copiés, de façon incrémentale (voir backupFiles.js).
// Variables : BACKUP_ENCRYPTION_KEY (obligatoire, 16 caractères minimum), BACKUP_KEEP (nombre de sauvegardes
// conservées par destination, 30 par défaut), BACKUP_GCS_BUCKET, PCLOUD_ACCESS_TOKEN, PCLOUD_API_HOST,
// PCLOUD_BACKUP_FOLDER, BACKUP_FILES_TIME_BUDGET_MS (temps max de la copie des fichiers, 7 min par défaut).

const GCS_PREFIX = 'backups/';

const SOURCES = [
  ['projects', Project],
  ['biographies', Biography],
  ['logos', Logo],
  ['users', User],
];

function notConfigured(message) {
  const error = new Error(message);
  error.code = 'BACKUP_NOT_CONFIGURED';
  return error;
}

function keepCount() {
  const keep = parseInt(process.env.BACKUP_KEEP || '30', 10);
  return Number.isFinite(keep) && keep >= 1 ? keep : 30;
}

// Ne jamais laisser le jeton pCloud ou la clé de chiffrement filtrer dans une réponse ou un log
function scrub(message) {
  return [process.env.PCLOUD_ACCESS_TOKEN, process.env.BACKUP_ENCRYPTION_KEY]
    .filter(Boolean)
    .reduce((text, secret) => text.split(secret).join('***'), String(message));
}

async function collectCollections() {
  const collections = {};

  for (const [name, Model] of SOURCES) {
    collections[name] = await Model.find().lean();
  }

  return collections;
}

async function saveToGcs(filename, buffer, keep) {
  const target = process.env.BACKUP_GCS_BUCKET ? storage.bucket(process.env.BACKUP_GCS_BUCKET) : bucket;

  await target.file(`${GCS_PREFIX}${filename}`).save(buffer, {
    resumable: false,
    metadata: { contentType: 'application/octet-stream' },
  });

  // Rotation : on ne supprime qu'après un envoi réussi, et jamais au-delà des `keep` plus récentes
  const [files] = await target.getFiles({ prefix: GCS_PREFIX });
  const names = files.map((file) => file.name).sort();
  const obsolete = names.slice(0, Math.max(0, names.length - keep));

  for (const name of obsolete) {
    await target.file(name).delete({ ignoreNotFound: true });
  }

  return `${target.name}/${GCS_PREFIX}${filename} (${names.length - obsolete.length} conservées)`;
}

async function saveToPcloud(filename, buffer, keep) {
  const folder = pcloud.backupFolder();

  await pcloud.ensureFolderPath(folder);
  await pcloud.uploadFile(folder, filename, buffer);

  const backups = await pcloud.listBackups(folder);
  const obsolete = backups.slice(0, Math.max(0, backups.length - keep));

  for (const entry of obsolete) {
    await pcloud.deleteFile(entry.fileid);
  }

  return `${folder}/${filename} (${backups.length - obsolete.length} conservées)`;
}

async function copyFilesToPcloud() {
  const budget = parseInt(process.env.BACKUP_FILES_TIME_BUDGET_MS || '420000', 10);
  const report = await syncFilesToPcloud({ deadline: Date.now() + (Number.isFinite(budget) ? budget : 420000) });
  const summary = `${report.uploaded} envoyés (${Math.round(report.bytes / 1024 / 1024)} Mo), ${report.skipped} déjà présents`;

  // Une copie partielle est signalée comme une erreur : le cron réessaie et la reprise est automatique
  if (report.incomplete || report.errors.length > 0) {
    throw new Error(`copie des fichiers incomplète (${summary}) : ${report.incomplete ? 'temps imparti atteint, reprise au prochain passage' : ''}${report.errors.join(' ; ')}`);
  }

  return summary;
}

async function runBackup(now = new Date()) {
  const passphrase = process.env.BACKUP_ENCRYPTION_KEY;

  // Jamais de sauvegarde en clair : sans clé, on refuse de tourner
  if (!passphrase) {
    throw notConfigured('BACKUP_ENCRYPTION_KEY n\'est pas définie : sauvegarde non exécutée.');
  }

  const collections = await collectCollections();
  const counts = Object.fromEntries(Object.entries(collections).map(([name, docs]) => [name, docs.length]));
  const encrypted = encryptBuffer(serializeDump(collections), passphrase);
  const filename = `${pcloud.BACKUP_FILE_PREFIX}${now.toISOString().slice(0, 19).replace(/:/g, '-')}Z.json.gz.enc`;
  const keep = keepCount();

  const destinations = {};
  const attempts = [
    ['gcs', () => saveToGcs(filename, encrypted, keep)],
    ['pcloud', pcloud.isConfigured() ? () => saveToPcloud(filename, encrypted, keep) : null],
    ['fichiers', pcloud.isConfigured() ? copyFilesToPcloud : null],
  ];

  // Chaque destination est indépendante : l'échec de l'une n'empêche pas l'autre
  for (const [name, attempt] of attempts) {
    if (!attempt) {
      destinations[name] = { status: 'ignoré', detail: 'non configuré' };
      continue;
    }

    try {
      destinations[name] = { status: 'ok', detail: await attempt() };
    } catch (error) {
      console.error(`Sauvegarde ${name} échouée :`, scrub(error.message));
      destinations[name] = { status: 'erreur', detail: scrub(error.message) };
    }
  }

  const statuses = Object.values(destinations).map((destination) => destination.status);

  return {
    ok: statuses.includes('ok') && !statuses.includes('erreur'),
    file: filename,
    sizeBytes: encrypted.length,
    documents: counts,
    destinations,
  };
}

module.exports = { runBackup };
