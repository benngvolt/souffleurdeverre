import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PX_PER_MM = 96 / 25.4;

/* Répartit une suite de blocs sur plusieurs pages.
   Chaque bloc est mesuré dans un conteneur invisible de même largeur que la colonne,
   puis placé page par page tant qu'il reste de la place (premier bloc qui dépasse = nouvelle page).

   - blocks : [{ key, node, spacer?, keepWithNext? }]
   - widthMm : largeur de la colonne de texte
   - firstCapacityMm / capacityMm : hauteur disponible sur la première page / les suivantes
   - renderPage(blocksOfPage, pageIndex, pageCount, pageCapacityMm) : rendu d'une page.
     Un bloc plus haut qu'une page entière est marqué `tooTall` (il sera coupé et signalé). */
export default function Paginator({ blocks, widthMm, firstCapacityMm, capacityMm, renderPage }) {
  const measureRef = useRef(null);
  const [pages, setPages] = useState(null);

  useLayoutEffect(() => {
    let cancelled = false;

    const compute = () => {
      if (cancelled || !measureRef.current) return;

      const heights = [...measureRef.current.children].map((element) => element.getBoundingClientRect().height);
      const result = [[]];
      const tooTall = new Set();
      let used = 0;
      let capacity = firstCapacityMm * PX_PER_MM;

      blocks.forEach((block, index) => {
        const height = heights[index] || 0;
        let current = result[result.length - 1];

        // un bloc "keepWithNext" (sous-titre) reste avec le bloc qui le suit
        let needed = height;
        for (let next = index; blocks[next] && blocks[next].keepWithNext && blocks[next + 1]; next += 1) {
          needed += heights[next + 1] || 0;
          if (!blocks[next + 1].keepWithNext) break;
        }

        if (current.length > 0 && used + needed > capacity) {
          current = [];
          result.push(current);
          used = 0;
          capacity = capacityMm * PX_PER_MM;
        }

        // pas de ligne blanche en haut d'une page
        if (current.length === 0 && block.spacer) return;

        const pageCapacityPx = result.length === 1 ? firstCapacityMm * PX_PER_MM : capacityMm * PX_PER_MM;
        if (height > pageCapacityPx) tooTall.add(index);

        current.push(index);
        used += height;
      });

      setPages({ pages: result, tooTall });
    };

    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(compute);

    return () => {
      cancelled = true;
    };
  }, [blocks, widthMm, firstCapacityMm, capacityMm]);

  const effectivePages = pages ? pages.pages : [blocks.map((_, index) => index)];
  const tooTall = pages ? pages.tooTall : new Set();

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

      {effectivePages.map((indices, pageIndex) =>
        renderPage(
          indices.map((index) => (tooTall.has(index) ? { ...blocks[index], tooTall: true } : blocks[index])),
          pageIndex,
          effectivePages.length,
          pageIndex === 0 ? firstCapacityMm : capacityMm
        )
      )}
    </>
  );
}
