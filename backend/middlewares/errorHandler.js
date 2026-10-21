const multer = require('multer');

// Certaines routes répondent puis appellent next() pour enchaîner un nettoyage de fichiers :
// si la réponse est déjà partie, il n'y a plus rien à renvoyer.
function notFoundHandler(req, res) {
  if (res.headersSent) return;
  res.status(404).json({ error: 'Route introuvable' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) return;

  if (error instanceof multer.MulterError || /non autorisé/.test(error.message || '')) {
    return res.status(400).json({ error: error.message });
  }

  res.status(error.status || 500).json({
    error: 'Une erreur interne est survenue.',
  });
}

module.exports = { notFoundHandler, errorHandler };
