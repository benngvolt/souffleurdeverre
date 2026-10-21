const { bucket } = require('../config/storage');
const pcloud = require('./pcloud');

// Copie des fichiers du site (photos, PDF, documents pro, logos) du bucket vers pCloud.
// Les noms de fichiers sont uniques et ne changent jamais (horodatage + uuid) : la copie est donc incrémentale,
// seuls les fichiers absents de pCloud sont envoyés. Rien n'est jamais supprimé côté pCloud : un fichier
// effacé par erreur du site reste récupérable dans la copie.

const FILE_PREFIXES = [
  'projects_images/',
  'biographies_images/',
  'logos/',
  'pdfList/',
  'pro_space_documents/',
  'pro_space_zips/',
];

const MAX_LISTED_ERRORS = 10;

async function syncFilesToPcloud({ deadline = Infinity } = {}) {
  const report = { uploaded: 0, skipped: 0, bytes: 0, incomplete: false, errors: [] };

  for (const prefix of FILE_PREFIXES) {
    if (report.incomplete) break;

    const [files] = await bucket.getFiles({ prefix });
    const candidates = files.filter((file) => {
      const name = file.name.slice(prefix.length);
      return name && !name.includes('/');
    });

    if (candidates.length === 0) continue;

    const folder = `${pcloud.backupFolder()}/Fichiers/${prefix.replace(/\/$/, '')}`;
    await pcloud.ensureFolderPath(folder);

    const existing = new Map((await pcloud.listFiles(folder)).map((entry) => [entry.name, entry.size]));

    for (const file of candidates) {
      const name = file.name.slice(prefix.length);
      const size = Number(file.metadata?.size);

      // Déjà copié (même nom, même taille)
      if (existing.has(name) && (!Number.isFinite(size) || existing.get(name) === size)) {
        report.skipped += 1;
        continue;
      }

      // Budget de temps atteint : on s'arrête proprement, la reprise se fait au prochain passage du cron
      if (Date.now() > deadline) {
        report.incomplete = true;
        break;
      }

      try {
        const [content] = await file.download();
        await pcloud.uploadFile(folder, name, content);
        report.uploaded += 1;
        report.bytes += content.length;
      } catch (error) {
        if (report.errors.length < MAX_LISTED_ERRORS) {
          report.errors.push(`${file.name} : ${error.message}`);
        }
      }
    }
  }

  return report;
}

module.exports = { syncFilesToPcloud, FILE_PREFIXES };
