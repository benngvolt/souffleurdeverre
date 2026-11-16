/* Noms utilisés pour les brouillons et les fichiers PDF exportés. */

const pad = (value) => String(value).padStart(2, '0');

/* Format du fichier PDF : AAMMJJHHMM_NOMDUPROJET_A4RVB (ex. 2611161637_GYNT_A4RVB, pour le 16/11/2026 à 16h37).
   Le nom du projet est débarrassé de ses accents et de ses signes (« LE MÉDECIN - SOLO » -> LE-MEDECIN-SOLO).
   Navigateur : le nom proposé à l'enregistrement du PDF est le titre de la page au moment de l'impression. */
export function buildPdfFileName(projectTitle, date = new Date(), format = 'A4-RVB') {
  const stamp = `${pad(date.getFullYear() % 100)}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
  const safeTitle =
    String(projectTitle || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'DOSSIER';

  return `${stamp}_${safeTitle}_${String(format).replace(/-/g, '')}`;
}

/* Nom par défaut d'un brouillon : « Brouillon du 16/11/2026 à 16h37 » */
export function defaultDraftName(date = new Date()) {
  return `Brouillon du ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} à ${pad(date.getHours())}h${pad(date.getMinutes())}`;
}

/* « 16/11/2026 à 16h37 » */
export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} à ${pad(date.getHours())}h${pad(date.getMinutes())}`;
}
