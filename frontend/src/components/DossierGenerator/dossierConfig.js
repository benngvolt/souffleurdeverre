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

/* Page « La compagnie » (texte du dossier GYNT). À rendre modifiable pour tous les dossiers plus tard. */
export const COMPANY_PAGE = {
  title: 'La compagnie',
  paragraphs: [
    'La Compagnie Le Souffleur de Verre a vu le jour en Auvergne en juillet 2003. Sa responsabilité artistique est aujourd’hui assumée par Julien Rocha et la responsabilité administrative et de production par Cédric Veschambre.',
    'Accompagnés des créateurs du plateau (artistes et techniciens), le travail de la compagnie donne une place importante à l’écriture contemporaine et au travail de direction d’acteur. Les créations sont à part égale à destination du public adulte et à destination du jeune public. Le travail artistique est mené en parallèle avec celui du territoire dont des actions auprès des habitants. La compagnie a été en résidence à Cournon d’Auvergne 2004/11, à Monistrol sur Loire 2012/15, associée à la Comédie de Saint-Étienne 2013/16, associée et responsable de l’École du jeune spectateur au Caméléon à Pont-du-Chateau, scène labellisée pour l’émergence et la création en Auvergne-Rhône-Alpes 2020/23 et conventionnée avec la Ville de Clermont-Ferrand pour son projet artistique actuel.',
  ],
  quote: '« Tendre vers un théâtre citoyen. Déployer ainsi des problématiques qui appartiennent au monde et faire du plateau un lieu de l’écrit, un lieu de parole et un lieu de plaisir qui s’adresse à tous. Un théâtre épique où l’acteur est à la fois figures tragicomiques, créateur d’images, porteur de sens. Un théâtre qui cultive le dialogue, l’ouverture sur le débat. Un théâtre pour tous les publics. »',
  signature: 'Julien Rocha & Cédric Veschambre',
  photoCredit: '© Julien Bruhat',
};

/* Format de page (A4 paysage). Les dimensions sont reprises dans le SCSS. */
export const PAGE = {
  widthMm: 297,
  heightMm: 210,
};
