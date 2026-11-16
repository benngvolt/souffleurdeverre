// API_URL peut être surchargée localement via VITE_API_URL dans un .env.development.local
// (voir .env.example). Sans variable définie, on retombe sur l'API de production.
export const API_URL = import.meta.env.VITE_API_URL || 'https://crafty-shield-416614.oa.r.appspot.com';

// URL canonique du site (sans www, en https, sans slash final) : sert de référence unique
// pour les balises <link rel="canonical"> et évite que Google indexe des variantes en double.
export const SITE_URL = 'https://souffleurdeverre.fr';

// Passer à true puis redéployer pour afficher HomeSpecial au lieu de Home sur "/".
export const USE_HOME_SPECIAL = true;


// Biographie courte pour les dossiers artistiques : limite de caractères (espaces compris).
// Référence : la bio de Clément Dubois du dossier GYNT (2 105 caractères), arrondie vers le haut.
// Même valeur côté backend (backend/config/dossierBiography.js).
export const DOSSIER_BIOGRAPHY_MAX_CHARS = 2150;
