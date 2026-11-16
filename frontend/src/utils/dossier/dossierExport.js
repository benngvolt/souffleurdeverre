import { API_URL } from '../constants';
import { getAuthToken } from '../api';

/* Noms utilisés pour les brouillons et les fichiers PDF exportés, et allègement des photos avant l'export. */

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

/* ----------------------------------
   Allègement des photos avant l'export PDF (objectif : PDF de moins de 10 Mo)

   Le navigateur n'intègre une photo dans le PDF telle quelle que si elle est en JPEG ; les photos WebP du site sont
   décompressées en pixels bruts (24 Mo pour GYNT). Avant l'impression, on remplace donc chaque photo par une version
   JPEG à la largeur utile (jusqu'à 300 dpi, sans dépasser l'original), puis on rétablit les photos d'origine.
---------------------------------- */

// Du plus fin au plus léger : on s'arrête dès que les photos tiennent dans le budget
const QUALITY_STEPS = [
  { dpi: 300, quality: 85 },
  { dpi: 240, quality: 75 },
  { dpi: 190, quality: 65 },
  { dpi: 150, quality: 55 },
];

// 8,5 Mo de photos : avec les polices et le texte (≈ 0,5 Mo), le PDF reste sous 10 Mo
export const PDF_IMAGES_BUDGET_BYTES = 8.5 * 1024 * 1024;

// Photos (pas les logos : un JPEG n'a pas de transparence)
const PHOTO_SELECTOR = '.photoFrame_image, .dossierTeamRow_photo img, .dossierCompany_photos img';

/* Largeur utile d'une photo en pixels, pour une résolution donnée (dpi) : largeur réellement affichée dans le cadre
   (la photo remplit son cadre, donc peut dépasser), jamais plus que l'original. */
function usefulWidth(image, zoom, dpi) {
  const frame = image.closest('.photoFrame, .dossierTeamRow_photo') || image;
  const rect = frame.getBoundingClientRect();
  const { naturalWidth: width, naturalHeight: height } = image;
  if (!rect.width || !rect.height || !width) return width;

  const scale = Math.max(rect.width / width, rect.height / height);
  const drawnCssPixels = (width * scale) / zoom; // la page est affichée avec un zoom : on le retire
  return Math.min(width, Math.max(200, Math.ceil((drawnCssPixels / 96) * dpi)));
}

function isSameOrigin(src) {
  try {
    const url = new URL(src, window.location.href);
    return url.origin === window.location.origin || url.protocol === 'data:' || url.protocol === 'blob:';
  } catch (error) {
    return false;
  }
}

// Photos du site lui-même (même origine) : conversion directe dans le navigateur
function convertInBrowser(image, width, quality) {
  const height = Math.round((image.naturalHeight * width) / image.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Conversion impossible'))), 'image/jpeg', quality / 100);
  });
}

// Photos du bucket Google Cloud : conversion par le serveur (le bucket n'autorise pas la lecture par le navigateur)
async function convertOnServer(src, width, quality) {
  const response = await fetch(`${API_URL}/api/dossiers/image?url=${encodeURIComponent(src)}&width=${width}&quality=${quality}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error(`Conversion refusée (${response.status})`);
  return response.blob();
}

async function mapWithLimit(items, limit, task) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await task(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

/* Remplace les photos des pages affichées par des versions JPEG allégées.
   Retourne { restore, bytes, step, count, failures, overBudget } : `restore()` remet les photos d'origine. */
export async function optimizeImagesForPdf(root, { zoom = 1, budget = PDF_IMAGES_BUDGET_BYTES } = {}) {
  const images = [...root.querySelectorAll(PHOTO_SELECTOR)].filter((image) => image.complete && image.naturalWidth > 0);
  const originals = images.map((image) => ({ image, src: image.getAttribute('src') }));

  let best = null;
  for (const step of QUALITY_STEPS) {
    const cache = new Map();
    const blobs = await mapWithLimit(images, 6, (image) => {
      const width = usefulWidth(image, zoom, step.dpi);
      const key = `${image.src}|${width}`;
      if (!cache.has(key)) {
        const conversion = isSameOrigin(image.src)
          ? convertInBrowser(image, width, step.quality)
          : convertOnServer(image.src, width, step.quality);
        cache.set(key, conversion.catch((error) => {
          console.error(error);
          return null;
        }));
      }
      return cache.get(key);
    });

    const unique = [...new Set(blobs.filter(Boolean))];
    best = { step, blobs, bytes: unique.reduce((total, blob) => total + blob.size, 0) };
    if (best.bytes <= budget) break;
  }

  const urls = new Map();
  images.forEach((image, index) => {
    const blob = best.blobs[index];
    if (!blob) return;
    if (!urls.has(blob)) urls.set(blob, URL.createObjectURL(blob));
    image.src = urls.get(blob);
  });
  await Promise.all(images.map((image) => (typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve())));

  return {
    bytes: best.bytes,
    step: best.step,
    count: images.length,
    failures: best.blobs.filter((blob) => !blob).length,
    overBudget: best.bytes > budget,
    restore() {
      originals.forEach(({ image, src }) => image.setAttribute('src', src));
      urls.forEach((url) => URL.revokeObjectURL(url));
    },
  };
}
