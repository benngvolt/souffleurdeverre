import DOMPurify from 'dompurify';

/* Fonctions pures qui transforment les données d'un projet (API) en contenu
   prêt à être mis en page dans le générateur de dossier artistique. */

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/* ----------------------------------
   HTML (éditeur trix) -> blocs
---------------------------------- */

const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: ['div', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'blockquote', 'span', 'del', 'sup', 'sub'],
  ALLOWED_ATTR: ['href'],
};

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html || '', SANITIZE_OPTIONS);
}

export function htmlToText(html) {
  const doc = new DOMParser().parseFromString(sanitizeHtml(html), 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

/* Découpe un HTML en blocs de premier niveau (un <div> trix = un bloc).
   Les blocs vides sont des "espaceurs" (ligne blanche) : on supprime ceux du début,
   de la fin, et on fusionne les doublons. */
export function htmlToBlocks(html) {
  const clean = sanitizeHtml(html);
  if (!clean.trim()) return [];

  const doc = new DOMParser().parseFromString(`<body>${clean}</body>`, 'text/html');
  const raw = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim()) {
        const wrapper = doc.createElement('div');
        wrapper.textContent = node.textContent;
        raw.push({ html: wrapper.outerHTML, spacer: false });
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    raw.push({ html: node.outerHTML, spacer: !node.textContent.trim() });
  });

  const blocks = [];
  raw.forEach((block) => {
    const previous = blocks[blocks.length - 1];
    if (block.spacer && (!previous || previous.spacer)) return;
    blocks.push(block);
  });
  while (blocks.length && blocks[blocks.length - 1].spacer) blocks.pop();

  return blocks;
}

/* Si le premier bloc n'est composé que de texte en italique (ex. « Texte lauréat de
   l'aide à la création... »), on l'extrait : il sert de mention sur la couverture. */
export function splitLeadingItalic(blocks) {
  if (!blocks.length) return { lead: '', blocks };

  const body = new DOMParser().parseFromString(blocks[0].html, 'text/html').body;
  const text = body.textContent.trim();
  if (!text) return { lead: '', blocks };

  const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  let onlyItalic = true;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.textContent.trim() && !node.parentElement.closest('em, i')) {
      onlyItalic = false;
      break;
    }
  }
  if (!onlyItalic) return { lead: '', blocks };

  const rest = blocks.slice(1);
  while (rest.length && rest[0].spacer) rest.shift();
  return { lead: text, blocks: rest };
}

/* ----------------------------------
   Dates
---------------------------------- */

function parseDay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  return match ? { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) } : null;
}

export function formatDateRange(start, end, withYear = false) {
  const a = parseDay(start);
  const b = parseDay(end);
  if (!a) return '';

  const fmt = (day, { month = true, year = false } = {}) =>
    `${day.d}${month ? ` ${MONTHS[day.m]}` : ''}${year ? ` ${day.y}` : ''}`;

  if (!b || (a.y === b.y && a.m === b.m && a.d === b.d)) return fmt(a, { year: withYear });
  if (a.y !== b.y) return `${fmt(a, { year: true })} au ${fmt(b, { year: true })}`;
  if (a.m === b.m) return `${a.d} au ${fmt(b, { year: withYear })}`;
  return `${fmt(a, {})} au ${fmt(b, { year: withYear })}`;
}

export function formatCreationDate(value) {
  const match = /^(\d{4})(?:-(\d{2}))?/.exec(value || '');
  if (!match) return value || '';
  return match[2] ? `${MONTHS[Number(match[2]) - 1]} ${match[1]}` : match[1];
}

/* Résidences regroupées par type, triées par date. L'année n'est affichée que si
   le groupe s'étend sur plusieurs années. */
export function groupResidencies(list = []) {
  const sorted = [...list]
    .filter((residency) => residency.startDates)
    .sort((a, b) => a.startDates.localeCompare(b.startDates));

  const groups = [];
  const byType = new Map();

  sorted.forEach((residency) => {
    const type = residency.residencyType || 'Résidences';
    if (!byType.has(type)) {
      const group = { type, items: [] };
      byType.set(type, group);
      groups.push(group);
    }
    byType.get(type).items.push(residency);
  });

  return groups.map((group) => {
    const years = new Set(
      group.items.flatMap((r) => [r.startDates.slice(0, 4), (r.endDates || r.startDates).slice(0, 4)])
    );
    const withYear = years.size > 1;

    return {
      type: group.type,
      items: group.items.map((r) => ({
        dates: formatDateRange(r.startDates, r.endDates, withYear),
        lines: [
          r.moreInfos ? htmlToText(r.moreInfos) : '',
          [r.placeName, r.city].filter(Boolean).join(', '),
        ].filter(Boolean),
      })),
    };
  });
}

/* ----------------------------------
   Équipe : biographies citées dans la distribution
---------------------------------- */

export function matchBiographies(project, biographies = []) {
  const haystack = normalizeText(
    [...(project.artistsList || []).map((a) => a.artistName), ...(project.productionList || []).map((p) => p.productionName)].join(' ; ')
  );

  return biographies
    .map((biography) => {
      const fullName = normalizeText(`${biography.name} ${biography.surname}`);
      const index = fullName ? haystack.indexOf(fullName) : -1;
      return { biography, index };
    })
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.biography);
}

export function firstItem(value) {
  return String(value || '').split(',')[0].trim();
}
