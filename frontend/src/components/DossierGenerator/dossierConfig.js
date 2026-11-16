/* Informations de la compagnie reprises sur la page « contact et crédits » du dossier
   artistique (valeurs du dossier GYNT). À rendre modifiables dans l'éditeur plus tard. */

export const COMPANY_INFOS = {
  contacts: [
    { role: 'Responsable artistique', name: 'Julien Rocha', lines: ['06 61 19 39 35', 'julien.rocha63@gmail.com'] },
    { role: 'Administration de production', name: 'Cédric Veschambre', lines: ['07 86 55 81 26'] },
  ],
  email: 'ciesouffleur@hotmail.com',
  name: 'Compagnie Le Souffleur de Verre',
  address: ['36 rue de Blanzat', '63100 Clermont-Ferrand'],
  website: 'souffleurdeverre.fr',
  credits: ['Identité visuelle et logo Compagnie Souffleur de Verre © Ben Gibert', 'www.bengibert.com'],
  conventions: [
    'La Compagnie Le Souffleur de Verre est conventionnée',
    'avec le Ministère de la Culture/Drac Auvergne-Rhône-Alpes,',
    'la Région Auvergne-Rhône-Alpes, et la Ville de Clermont-Ferrand.',
  ],
};

/* Format de page (A4 paysage). Les dimensions sont reprises dans le SCSS. */
export const PAGE = {
  widthMm: 297,
  heightMm: 210,
};
