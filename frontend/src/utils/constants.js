// API_URL peut être surchargée localement via VITE_API_URL dans un .env.development.local
// (voir .env.example). Sans variable définie, on retombe sur l'API de production.
export const API_URL = import.meta.env.VITE_API_URL || 'https://crafty-shield-416614.oa.r.appspot.com';

// URL canonique du site (sans www, en https, sans slash final) : sert de référence unique
// pour les balises <link rel="canonical"> et évite que Google indexe des variantes en double.
export const SITE_URL = 'https://souffleurdeverre.fr';

// Passer à true puis redéployer pour afficher HomeSpecial au lieu de Home sur "/".
export const USE_HOME_SPECIAL = true;
