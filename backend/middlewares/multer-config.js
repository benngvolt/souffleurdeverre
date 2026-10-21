const Multer = require('multer');
const path = require('path');
const { PRO_DOCUMENT_EXTENSIONS } = require('../config/proDocuments');

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Mo par fichier

const ALLOWED_MIME_TYPES_BY_FIELD = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  logoImage: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  pdfFiles: ['application/pdf'],
};

function fileFilter(req, file, callback) {
  // Espace pro : n'importe quel type de document, filtré sur l'extension (les navigateurs envoient
  // des types MIME très variables pour les formats bureautiques).
  if (file.fieldname === 'proDocuments') {
    const extension = path.extname(file.originalname || '').slice(1).toLowerCase();

    if (!PRO_DOCUMENT_EXTENSIONS.includes(extension)) {
      return callback(new Error(`Type de fichier non autorisé pour l'espace pro (.${extension || '?'}).`));
    }

    return callback(null, true);
  }

  const allowedMimeTypes = ALLOWED_MIME_TYPES_BY_FIELD[file.fieldname];

  if (!allowedMimeTypes || !allowedMimeTypes.includes(file.mimetype)) {
    return callback(new Error(`Type de fichier non autorisé pour "${file.fieldname}".`));
  }

  callback(null, true);
}

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

module.exports = multer;
