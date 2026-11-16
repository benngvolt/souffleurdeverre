/* Biographie courte pour les dossiers artistiques : limite de caractères.
   Référence : la biographie de Clément Dubois du dossier GYNT (2 105 caractères, espaces compris),
   arrondie vers le haut. Même valeur côté frontend (frontend/src/utils/constants.js). */
const DOSSIER_BIOGRAPHY_MAX_CHARS = 2150;

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };

/* Nombre de caractères du TEXTE d'un contenu HTML (éditeur trix), espaces compris.
   Les balises et les retours à la ligne ne comptent pas. Doit rester équivalent à
   countPlainCharacters() du frontend. */
function plainTextLength(html) {
  const text = String(html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos|#39);/g, (entity) => ENTITIES[entity])
    .replace(/[\r\n]/g, '');

  return text.length;
}

module.exports = { DOSSIER_BIOGRAPHY_MAX_CHARS, plainTextLength };
