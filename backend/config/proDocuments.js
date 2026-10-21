// Documents de l'espace pro : tous types de documents courants, mais pas de fichiers exécutables / scripts.
// (La même liste existe côté frontend dans src/utils/proDocuments.js : à garder synchronisée.)
const PRO_DOCUMENT_MAX_SIZE = 10 * 1024 * 1024; // 10 Mo par document

const PRO_DOCUMENT_EXTENSIONS = [
  // documents
  'pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'md',
  // tableurs / présentations
  'xls', 'xlsx', 'ods', 'csv', 'ppt', 'pptx', 'odp', 'key', 'pages', 'numbers',
  // images
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'tif', 'tiff', 'heic',
  // archives
  'zip',
  // audio / vidéo
  'mp3', 'wav', 'm4a', 'mp4', 'mov',
];

module.exports = { PRO_DOCUMENT_MAX_SIZE, PRO_DOCUMENT_EXTENSIONS };
