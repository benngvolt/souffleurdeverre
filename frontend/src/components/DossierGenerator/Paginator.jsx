import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PX_PER_MM = 96 / 25.4;
const PX_PER_PT = 96 / 72;

const MIN_LINES_LAST = 2; // "veuve" : au moins 2 lignes en haut de la page suivante
const MIN_LINES_FIRST = 2; // "orpheline" : au moins 2 lignes en bas de page

/* Répartit une suite de blocs sur plusieurs pages.

   Chaque bloc est mesuré dans un conteneur invisible de même largeur que la colonne, puis placé
   page par page. Un bloc "splittable" (texte) qui ne tient pas dans la place restante est coupé
   LIGNE PAR LIGNE : chaque morceau montre une "fenêtre" du texte (les lignes ayant toutes la même
   hauteur, la coupe tombe toujours entre deux lignes), comme le fait InDesign.

   Bloc : {
     key, node, spacer?, keepWithNext?,
     splittable?     : le bloc peut être coupé entre deux lignes
     lineHeightPt    : hauteur de ligne du texte (pt), requise si splittable
     splitSelector?  : élément du bloc qui contient les lignes (défaut : le bloc entier)
     minFirstMm?     : hauteur minimale du premier morceau (ex. un portrait à côté du texte)
   }

   renderPage(blocksOfPage, pageIndex, pageCount, pageCapacityMm) : rendu d'une page. */
export default function Paginator({ blocks, widthMm, firstCapacityMm, capacityMm, renderPage }) {
  const measureRef = useRef(null);
  const [layout, setLayout] = useState(null);

  useLayoutEffect(() => {
    let cancelled = false;

    const compute = () => {
      if (cancelled || !measureRef.current) return;

      const metrics = [...measureRef.current.children].map((element, index) => {
        const block = blocks[index] || {};
        const total = element.getBoundingClientRect().height;
        let text = total;
        if (block.splitSelector) {
          const target = element.querySelector(block.splitSelector);
          if (target) text = target.getBoundingClientRect().height;
        }
        return { total, text };
      });

      const pages = [[]];
      let used = 0;
      let capacityPx = firstCapacityMm * PX_PER_MM;

      const currentPage = () => pages[pages.length - 1];
      const startNewPage = () => {
        pages.push([]);
        used = 0;
        capacityPx = capacityMm * PX_PER_MM;
      };

      blocks.forEach((block, index) => {
        const { total, text } = metrics[index] || { total: 0, text: 0 };
        const lineHeight = (block.lineHeightPt || 0) * PX_PER_PT;

        // ligne blanche : jamais en haut d'une page
        if (block.spacer && currentPage().length === 0) return;

        /* ----- bloc coupable (texte) ----- */
        if (block.splittable && lineHeight > 0) {
          const extra = Math.max(0, total - text);
          const lineCount = Math.max(1, Math.round(text / lineHeight));
          const minFirst = Math.max(MIN_LINES_FIRST, Math.ceil(((block.minFirstMm || 0) * PX_PER_MM) / lineHeight));

          let start = 0;

          while (start < lineCount) {
            const left = lineCount - start;
            const free = capacityPx - used;

            // tout le reste tient sur la page
            const fullHeight = start === 0 ? total : left * lineHeight + extra;
            if (fullHeight <= free) {
              currentPage().push(
                start === 0
                  ? { index }
                  : { index, fragment: { start, lines: left, height: left * lineHeight + extra } }
              );
              used += fullHeight;
              break;
            }

            // sinon on coupe : nombre de lignes qui tiennent, en gardant au moins 2 lignes pour la suite
            let lines = Math.floor(free / lineHeight);
            if (left - lines < MIN_LINES_LAST) lines = left - MIN_LINES_LAST;
            const minimum = start === 0 ? minFirst : MIN_LINES_FIRST;

            if (lines >= minimum && lines > 0) {
              currentPage().push({ index, fragment: { start, lines, height: lines * lineHeight } });
              start += lines;
              startNewPage();
              continue;
            }

            // pas assez de place pour couper ici : on passe à la page suivante
            if (currentPage().length > 0) {
              startNewPage();
              continue;
            }

            // page vide et coupe impossible : on place le reste tel quel
            currentPage().push({ index, fragment: { start, lines: left, height: left * lineHeight + extra } });
            used += left * lineHeight + extra;
            break;
          }
          return;
        }

        /* ----- bloc entier (titre, tableau, espaceur...) ----- */
        // un bloc "keepWithNext" (sous-titre) reste avec le début du bloc qui le suit
        let needed = total;
        for (let next = index; blocks[next] && blocks[next].keepWithNext && blocks[next + 1]; next += 1) {
          const following = blocks[next + 1];
          const followingHeight = (metrics[next + 1] || {}).total || 0;
          if (following.keepWithNext) {
            needed += followingHeight;
            continue;
          }
          const followingLine = (following.lineHeightPt || 0) * PX_PER_PT;
          needed +=
            following.splittable && followingLine > 0
              ? Math.min(followingHeight, (MIN_LINES_FIRST + 1) * followingLine)
              : followingHeight;
          break;
        }

        if (currentPage().length > 0 && used + needed > capacityPx) startNewPage();

        currentPage().push({ index });
        used += total;
      });

      // blocs plus longs qu'une page entière : signalés (à raccourcir)
      const longBlocks = {};
      blocks.forEach((block, index) => {
        const { total } = metrics[index] || { total: 0 };
        const pageCount = Math.ceil(total / (capacityMm * PX_PER_MM));
        if (block.splittable && pageCount >= 2) longBlocks[index] = pageCount;
      });

      setLayout({ pages, longBlocks });
    };

    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(compute);

    return () => {
      cancelled = true;
    };
  }, [blocks, widthMm, firstCapacityMm, capacityMm]);

  // Avant la première mesure : tout sur une seule page
  const pages = layout ? layout.pages : [blocks.map((_, index) => ({ index }))];
  const longBlocks = layout ? layout.longBlocks : {};
  const seenLongBlocks = new Set();

  function resolveItem(item) {
    const block = blocks[item.index];

    // le signalement "texte trop long" n'est affiché que sur le premier morceau du bloc
    let tooLong;
    if (longBlocks[item.index] && !seenLongBlocks.has(item.index)) {
      seenLongBlocks.add(item.index);
      tooLong = longBlocks[item.index];
    }

    if (!item.fragment) {
      return tooLong ? { ...block, tooLong } : block;
    }

    const lineHeight = (block.lineHeightPt || 0) * PX_PER_PT;
    const { start, height } = item.fragment;

    return {
      ...block,
      key: `${block.key}#${start}`,
      tooLong,
      // fenêtre sur le texte : on décale le bloc complet de `start` lignes et on masque le reste
      node: (
        <div className='dossierFragment' style={{ height: `${height}px` }} inert=''>
          <div style={{ marginTop: `-${start * lineHeight}px` }}>{block.node}</div>
        </div>
      ),
    };
  }

  return (
    <>
      {createPortal(
        <div ref={measureRef} lang='fr' className='dossierMeasure dossierTypo' style={{ width: `${widthMm}mm` }} aria-hidden='true'>
          {blocks.map((block) => (
            <div key={block.key} className='dossierBlock'>
              {block.node}
            </div>
          ))}
        </div>,
        document.body
      )}

      {pages.map((items, pageIndex) =>
        renderPage(
          items.map(resolveItem),
          pageIndex,
          pages.length,
          pageIndex === 0 ? firstCapacityMm : capacityMm
        )
      )}
    </>
  );
}
