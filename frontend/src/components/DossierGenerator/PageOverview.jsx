import { useEffect, useRef, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';

const SECTION_LABELS = {
  cover: 'COUVERTURE',
  generic: 'INFOS ET DISTRIBUTION',
  middle: 'DESCRIPTIONS ET PHOTOS',
  team: 'L’ÉQUIPE',
  company: 'LA COMPAGNIE',
  calendar: 'CALENDRIER DE CRÉATION',
  contact: 'INFOS COMPAGNIE ET LOGOS',
};

/* Une miniature : copie visuelle d'une page. Seules les pages de la partie centrale se déplacent ;
   les autres sont affichées en filigrane (pages fixes). */
function Thumb({ item, index, active, onSelect }) {
  const movable = item.section === 'middle';
  const id = movable ? `page:${item.pageId}` : `fixed:${index}`;
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id, disabled: !movable });
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id, disabled: !movable });

  const className = [
    'dossierThumb',
    movable ? 'dossierThumb--movable' : 'dossierThumb--fixed',
    active ? 'dossierThumb--active' : '',
    isOver ? 'dossierThumb--over' : '',
    isDragging ? 'dossierThumb--dragging' : '',
  ].join(' ');

  return (
    <div
      ref={(node) => {
        setDropRef(node);
        setDragRef(node);
      }}
      className={className}
      data-thumb-index={index}
      role='button'
      tabIndex={0}
      aria-label={movable ? `Page ${index + 1} (déplaçable)` : `Page ${index + 1} (fixe)`}
      onClick={() => onSelect(index)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSelect(index);
      }}
      {...(movable ? { ...attributes, ...listeners } : {})}
    >
      <div className='dossierThumb_frame'>
        <div className='dossierThumb_page' dangerouslySetInnerHTML={{ __html: item.html }} />
        {movable && (
          <span className='dossierThumb_grip' aria-hidden='true'>
            <FontAwesomeIcon icon={faGripVertical} />
          </span>
        )}
      </div>
    </div>
  );
}

/* Aperçu de l'ensemble du dossier, à gauche du défilement des pages.
   Les miniatures sont recopiées depuis les pages affichées (elles restent donc toujours fidèles) et
   mises à jour quand le contenu change. */
function PageOverview({ pagesRef, scrollRef, ready, dragging }) {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);

  /* Recopie des pages (avec un léger délai pour ne pas recalculer à chaque frappe) */
  useEffect(() => {
    const container = pagesRef.current;
    if (!ready || !container) return undefined;

    let timer;
    const collect = () => {
      const pages = [...container.querySelectorAll('.dossierPage')];
      setItems(
        pages.map((page) => ({
          section: page.dataset.section || 'fixed',
          pageId: page.dataset.pageId || null,
          html: page.outerHTML,
        }))
      );
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(collect, 220);
    };

    collect();
    const observer = new MutationObserver(schedule);
    observer.observe(container, { childList: true, subtree: true, attributes: true, characterData: true });

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [pagesRef, ready]);

  /* Page affichée au centre de l'écran : mise en évidence dans l'aperçu */
  useEffect(() => {
    const scroller = scrollRef.current;
    const container = pagesRef.current;
    if (!ready || !scroller || !container) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const middle = scroller.getBoundingClientRect().top + scroller.clientHeight / 2;
      const pages = [...container.querySelectorAll('.dossierPage')];
      let best = 0;
      let bestDistance = Infinity;
      pages.forEach((page, index) => {
        const rect = page.getBoundingClientRect();
        const distance = middle >= rect.top && middle <= rect.bottom ? 0 : Math.min(Math.abs(rect.top - middle), Math.abs(rect.bottom - middle));
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      setActiveIndex(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pagesRef, scrollRef, ready, items.length]);

  /* Garde la miniature active visible dans l'aperçu (sauf pendant un glisser-déposer) */
  useEffect(() => {
    if (dragging || !listRef.current) return;
    const thumb = listRef.current.querySelector(`[data-thumb-index="${activeIndex}"]`);
    if (thumb && typeof thumb.scrollIntoView === 'function') thumb.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, dragging]);

  function goToPage(index) {
    const container = pagesRef.current;
    if (!container) return;
    const page = container.querySelectorAll('.dossierPage')[index];
    if (!page) return;
    const target = page.closest('.dossierFrame') || page;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav className='dossierOverview' aria-label='Aperçu des pages du dossier'>
      <p className='dossierOverview_title'>APERÇU · {items.length} PAGES</p>
      <p className='dossierOverview_hint'>Glissez les pages de la partie centrale pour changer l’ordre. Les pages en filigrane sont fixes.</p>

      <div ref={listRef} className='dossierOverview_list'>
        {items.map((item, index) => (
          <div key={item.pageId || `fixed-${index}`}>
            {(index === 0 || items[index - 1].section !== item.section) && (
              <p className='dossierOverview_section'>{SECTION_LABELS[item.section] || ''}</p>
            )}
            <Thumb item={item} index={index} active={index === activeIndex} onSelect={goToPage} />
          </div>
        ))}
      </div>
    </nav>
  );
}

export default PageOverview;
