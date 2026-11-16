import {
  htmlToBlocks,
  splitLeadingItalic,
  sanitizeHtml,
  matchBiographies,
  escapeHtml,
} from './dossierData';

/* État de l'éditeur de dossier.

   state = {
     cover:     { imageUrl, x, y },                 // photo de couverture (x, y : cadrage en %)
     middle:    [ page, ... ],                      // partie 3 : pages texte et pages photo
     teamOrder: [ identifiant de biographie, ... ]  // partie 4 : ordre des biographies
   }

   page texte  : { id, type: 'text',   title, html, align: 'top' | 'center' }
   page photo  : { id, type: 'photos', slots: [ { imageUrl, x, y } x 3 ] }       */

export const PHOTOS_PER_PAGE = 3;

const PX_PER_MM = 96 / 25.4;
const TEXT_COLUMN_MM = 187;
const TEXT_PAGE_CAPACITY_MM = 189;
const TEXT_LINE_HEIGHT_PX = 12.2 * (96 / 72);

let idCounter = 0;
export function newPageId(prefix = 'page') {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function emptyPhotoSlot() {
  return { imageUrl: '', x: 50, y: 50 };
}

export function newTextPage(overrides = {}) {
  return { id: newPageId('text'), type: 'text', title: '', html: '', align: 'top', ...overrides };
}

export function newPhotoPage(images = []) {
  const slots = Array.from({ length: PHOTOS_PER_PAGE }, (_, index) =>
    images[index] ? { imageUrl: images[index].imageUrl, x: 50, y: 50 } : emptyPhotoSlot()
  );
  return { id: newPageId('photos'), type: 'photos', slots };
}

/* ----------------------------------
   Répartition par défaut du texte sur les pages
---------------------------------- */

async function measureHeights(htmlList) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;

  const holder = document.createElement('div');
  holder.lang = 'fr';
  holder.className = 'dossierMeasure dossierTypo';
  holder.style.width = `${TEXT_COLUMN_MM}mm`;

  htmlList.forEach((html) => {
    const item = document.createElement('div');
    item.className = 'dossierText';
    item.innerHTML = sanitizeHtml(html);
    holder.appendChild(item);
  });

  document.body.appendChild(holder);
  const heights = [...holder.children].map((child) => child.getBoundingClientRect().height);
  holder.remove();

  return heights;
}

/* Regroupe des morceaux de texte (HTML) sur des pages, sans couper un morceau, sauf s'il est
   plus haut qu'une page (il est alors découpé par paragraphes). Retourne le HTML de chaque page. */
export async function packTextPages(itemsHtml) {
  const items = itemsHtml.filter((html) => html && html.trim());
  if (!items.length) return [];

  const capacity = TEXT_PAGE_CAPACITY_MM * PX_PER_MM;
  const itemHeights = await measureHeights(items);

  // 1) un morceau trop haut est découpé en paragraphes
  const units = [];
  items.forEach((html, group) => {
    if (itemHeights[group] <= capacity) {
      units.push({ html, group });
    } else {
      htmlToBlocks(html).forEach((block) => units.push({ html: block.html, group, spacer: block.spacer }));
    }
  });

  // 2) remplissage page par page
  const heights = await measureHeights(units.map((unit) => unit.html));
  const pages = [{ units: [], used: 0 }];

  units.forEach((unit, index) => {
    let page = pages[pages.length - 1];
    const previous = page.units[page.units.length - 1];
    const gap = previous && previous.group !== unit.group ? TEXT_LINE_HEIGHT_PX : 0;

    if (page.units.length > 0 && page.used + gap + heights[index] > capacity) {
      page = { units: [], used: 0 };
      pages.push(page);
    }

    if (page.units.length === 0 && unit.spacer) return; // pas de ligne blanche en haut de page

    const extraGap = page.units.length && page.units[page.units.length - 1].group !== unit.group ? TEXT_LINE_HEIGHT_PX : 0;
    page.used += extraGap + heights[index];
    page.units.push(unit);
  });

  const blank = '<div><br></div>';

  return pages
    .filter((page) => page.units.length > 0)
    .map((page) =>
      page.units
        .map((unit, index) => {
          const previous = page.units[index - 1];
          return (previous && previous.group !== unit.group ? blank : '') + unit.html;
        })
        .join('')
    );
}

/* ----------------------------------
   État initial d'un dossier
---------------------------------- */

function chunk(list, size) {
  const result = [];
  for (let i = 0; i < list.length; i += size) result.push(list.slice(i, i + size));
  return result;
}

export function coverImageIndex(project) {
  const images = project.images || [];
  return project.mainImageIndex >= 0 && project.mainImageIndex < images.length ? project.mainImageIndex : 0;
}

/* Partie 3 par défaut : le résumé principal sur la première page, les résumés secondaires à partir de
   la page suivante, puis les photos du spectacle (autres que celle de couverture) par trois. */
export async function buildInitialState(project, biographies) {
  const images = project.images || [];
  const mainIndex = coverImageIndex(project);
  const mainImage = images[mainIndex];
  const otherImages = images.filter((_, index) => index !== mainIndex);

  // la mention en italique qui ouvre la description va sur la couverture
  const { blocks } = splitLeadingItalic(htmlToBlocks(project.description));
  const descriptionHtml = blocks.map((block) => block.html).join('');

  const secondaryItems = (project.paragraphList || []).map((paragraph) => {
    const title = paragraph.paragraphTitle && paragraph.paragraphTitle.trim();
    const heading = title ? `<div><strong>${escapeHtml(title)}</strong></div><div><br></div>` : '';
    return `${heading}${paragraph.paragraphText || ''}`;
  });

  const descriptionPages = await packTextPages([descriptionHtml]);
  const secondaryPages = await packTextPages(secondaryItems);

  const middle = [
    ...descriptionPages.map((html, index) =>
      newTextPage({ html, align: descriptionPages.length === 1 && index === 0 ? 'center' : 'top' })
    ),
    ...secondaryPages.map((html) => newTextPage({ html })),
    ...chunk(otherImages, PHOTOS_PER_PAGE).map((group) => newPhotoPage(group)),
  ];

  return {
    cover: { imageUrl: mainImage ? mainImage.imageUrl : '', x: 50, y: 50 },
    middle,
    teamOrder: matchBiographies(project, biographies).map((biography) => biography._id),
  };
}

/* ----------------------------------
   Actions
---------------------------------- */

function moveItem(list, from, to) {
  if (from < 0 || to < 0 || from >= list.length || to >= list.length || from === to) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function dossierReducer(state, action) {
  switch (action.type) {
    case 'init':
      return action.state;

    case 'setCover':
      return { ...state, cover: { ...state.cover, ...action.patch } };

    case 'addPage': {
      const middle = [...state.middle];
      middle.splice(action.index, 0, action.page);
      return { ...state, middle };
    }

    case 'deletePage':
      return { ...state, middle: state.middle.filter((page) => page.id !== action.id) };

    case 'movePage': {
      const from = state.middle.findIndex((page) => page.id === action.id);
      const to = action.overId ? state.middle.findIndex((page) => page.id === action.overId) : action.index;
      return { ...state, middle: moveItem(state.middle, from, to) };
    }

    case 'updatePage':
      return {
        ...state,
        middle: state.middle.map((page) => (page.id === action.id ? { ...page, ...action.patch } : page)),
      };

    case 'updateSlot':
      return {
        ...state,
        middle: state.middle.map((page) =>
          page.id === action.pageId
            ? { ...page, slots: page.slots.map((slot, index) => (index === action.slotIndex ? { ...slot, ...action.patch } : slot)) }
            : page
        ),
      };

    case 'moveBio': {
      const from = state.teamOrder.indexOf(action.id);
      const to = state.teamOrder.indexOf(action.overId);
      return { ...state, teamOrder: moveItem(state.teamOrder, from, to) };
    }

    default:
      return state;
  }
}

/* ----------------------------------
   Enregistrement / ouverture d'un brouillon
---------------------------------- */

/* Contenu envoyé au serveur (et comparé pour détecter les modifications non enregistrées) */
export function serializeDraft(state, name) {
  return {
    name,
    cover: { imageUrl: state.cover.imageUrl, x: state.cover.x, y: state.cover.y },
    middle: state.middle.map((page) =>
      page.type === 'photos'
        ? { pageId: page.id, type: 'photos', slots: page.slots.map((slot) => ({ imageUrl: slot.imageUrl, x: slot.x, y: slot.y })) }
        : { pageId: page.id, type: 'text', title: page.title, html: page.html, align: page.align }
    ),
    teamOrder: state.teamOrder,
  };
}

/* État de l'éditeur à partir d'un brouillon enregistré, recalé sur le projet actuel :
   - une photo qui n'est plus dans le projet laisse son emplacement vide (avec un avertissement) ;
   - les biographies qui ne sont plus dans la distribution disparaissent, les nouvelles arrivent à la fin. */
export function buildStateFromDraft(draft, project, biographies) {
  const projectUrls = new Set((project.images || []).map((image) => image.imageUrl));
  let missingPhotos = 0;

  const keepPhoto = (photo) => {
    const imageUrl = photo && photo.imageUrl ? photo.imageUrl : '';
    const x = photo && Number.isFinite(photo.x) ? photo.x : 50;
    const y = photo && Number.isFinite(photo.y) ? photo.y : 50;
    if (imageUrl && !projectUrls.has(imageUrl)) {
      missingPhotos += 1;
      return { imageUrl: '', x: 50, y: 50 };
    }
    return { imageUrl, x, y };
  };

  const cover = keepPhoto(draft.cover);

  const middle = (draft.middle || []).map((page) =>
    page.type === 'photos'
      ? { id: page.pageId, type: 'photos', slots: [0, 1, 2].map((index) => keepPhoto(page.slots && page.slots[index])) }
      : {
          id: page.pageId,
          type: 'text',
          title: page.title || '',
          html: page.html || '',
          align: ['top', 'center', 'bottom'].includes(page.align) ? page.align : 'top',
        }
  );

  const current = matchBiographies(project, biographies).map((biography) => biography._id);
  const saved = (draft.teamOrder || []).filter((id) => current.includes(id));
  const teamOrder = [...saved, ...current.filter((id) => !saved.includes(id))];

  const warnings = [];
  if (missingPhotos) {
    warnings.push(
      missingPhotos === 1
        ? 'Une photo de ce brouillon n’est plus dans le projet : son emplacement est vide.'
        : `${missingPhotos} photos de ce brouillon ne sont plus dans le projet : leurs emplacements sont vides.`
    );
  }

  return { state: { cover, middle, teamOrder }, warnings };
}
