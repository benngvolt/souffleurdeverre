const crypto = require('crypto');
const zlib = require('zlib');
const mongoose = require('mongoose');

// Extended JSON : conserve les types BSON (ObjectId, Date...) pour une restauration fidèle.
const { EJSON } = mongoose.mongo.BSON;

const MAGIC = Buffer.from('SDVB1'); // "Souffleur De Verre Backup", format version 1
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const MIN_PASSPHRASE_LENGTH = 16;

function deriveKey(passphrase, salt) {
  return crypto.scryptSync(passphrase, salt, 32);
}

function assertPassphrase(passphrase) {
  if (typeof passphrase !== 'string' || passphrase.length < MIN_PASSPHRASE_LENGTH) {
    throw new Error(`La clé de chiffrement doit faire au moins ${MIN_PASSPHRASE_LENGTH} caractères.`);
  }
}

// { collection: [documents] } -> JSON (EJSON) compressé en gzip
function serializeDump(collections) {
  const json = EJSON.stringify({ createdAt: new Date(), collections }, { relaxed: false });
  return zlib.gzipSync(Buffer.from(json, 'utf8'));
}

function parseDump(gzipped) {
  return EJSON.parse(zlib.gunzipSync(gzipped).toString('utf8'), { relaxed: false });
}

// Format : MAGIC | salt | iv | tag d'authentification | données chiffrées (AES-256-GCM)
function encryptBuffer(buffer, passphrase) {
  assertPassphrase(passphrase);

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(passphrase, salt), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  return Buffer.concat([MAGIC, salt, iv, cipher.getAuthTag(), encrypted]);
}

function decryptBuffer(payload, passphrase) {
  assertPassphrase(passphrase);

  const headerLength = MAGIC.length + SALT_LENGTH + IV_LENGTH + TAG_LENGTH;

  if (payload.length <= headerLength || !payload.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error("Ce fichier n'est pas une sauvegarde Souffleur de Verre valide.");
  }

  const salt = payload.subarray(MAGIC.length, MAGIC.length + SALT_LENGTH);
  const iv = payload.subarray(MAGIC.length + SALT_LENGTH, MAGIC.length + SALT_LENGTH + IV_LENGTH);
  const tag = payload.subarray(MAGIC.length + SALT_LENGTH + IV_LENGTH, headerLength);
  const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(passphrase, salt), iv);
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([decipher.update(payload.subarray(headerLength)), decipher.final()]);
  } catch (error) {
    throw new Error('Déchiffrement impossible : clé incorrecte ou fichier altéré.');
  }
}

module.exports = { serializeDump, parseDump, encryptBuffer, decryptBuffer, MIN_PASSPHRASE_LENGTH };
