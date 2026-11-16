import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowLeft,
  faArrowUp,
  faFilePdf,
  faFont,
  faGripVertical,
  faImage,
  faMinus,
  faPenToSquare,
  faPlus,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import {
  CoverPage,
  GenericPage,
  FlowPages,
  TextPage,
  PhotosPage,
  TeamPages,
  CompanyPage,
  ContactPage,
  calendarBlocks,
} from './DossierPages';
import PhotoPicker from './PhotoPicker';
import TextPagePanel from './TextPagePanel';
import ConfirmBox from '../ConfirmBox/ConfirmBox';
import {
  htmlToText,
  splitLeadingItalic,
  htmlToBlocks,
  groupResidencies,
  groupDiffusion,
  formatCreationDate,
  firstItem,
} from '../../utils/dossier/dossierData';
import { buildInitialState, dossierReducer, newPhotoPage, newTextPage } from '../../utils/dossier/dossierState';
import { PAGE } from './dossierConfig';

const PAGE_WIDTH_PX = (PAGE.widthMm * 96) / 25.4;

function fitZoom() {
  const width = window.innerWidth || document.documentElement.clientWidth || 1200;
  return Math.min(1, Math.max(0.3, (width - 48) / PAGE_WIDTH_PX));
}

/* Contenu dérivé des données du projet (parties qui ne se modifient pas). */
function buildContent(project, allLogos) {
  const artists = project.artistsList || [];
  const production = project.productionList || [];
  const images = project.images || [];

  const { lead } = splitLeadingItalic(htmlToBlocks(project.description));

  const coverCredits = artists
    .filter((artist) => /^(texte|mise en scène)$/i.test((artist.artistFunction || '').trim()))
    .map((artist) => ({ label: artist.artistFunction, value: firstItem(artist.artistName) }));

  const coverNotes = [project.creationDate ? `création ${formatCreationDate(project.creationDate)}` : '', lead].filter(Boolean);

  const genericRows = [
    ...artists.map((artist) => ({ label: artist.artistFunction, value: artist.artistName })),
    ...(project.duration ? [{ label: 'Durée', value: project.duration, gap: true }] : []),
    ...production.map((item, index) => ({ label: item.productionFunction, value: item.productionName, gap: index === 0 })),
  ];

  return {
    images,
    cover: { title: project.title, credits: coverCredits, notes: coverNotes },
    generic: { title: project.title, tagline: project.moreInfos ? htmlToText(project.moreInfos) : '', rows: genericRows },
    calendarBlocks: groupResidencies(project.residenciesList).flatMap((group) => calendarBlocks(group, 'calendar')),
    diffusionBlocks: groupDiffusion(project.showsList).flatMap((group) => calendarBlocks(group, 'diffusion')),
    logos: (project.logos || []).map((name) => allLogos.find((logo) => logo.name === name)).filter(Boolean),
  };
}

/* ----------------------------------
   Éléments d'interface (visibles à l'écran seulement)
---------------------------------- */

function SectionLabel({ number, title, hint }) {
  return (
    <div className='dossierEditor_section'>
      <p className='dossierEditor_section_title'>
        <span>{number}</span> {title}
      </p>
      {hint && <p className='dossierEditor_section_hint'>{hint}</p>}
    </div>
  );
}

function AddPageBar({ index, onAdd }) {
  return (
    <div className='dossierEditor_addBar'>
      <span className='dossierEditor_addBar_label'>
        <FontAwesomeIcon icon={faPlus} /> AJOUTER UNE PAGE
      </span>
      <button type='button' onClick={() => onAdd(index, 'text')}>
        <FontAwesomeIcon icon={faFont} /> Page texte
      </button>
      <button type='button' onClick={() => onAdd(index, 'photos')}>
        <FontAwesomeIcon icon={faImage} /> Page photo
      </button>
    </div>
  );
}

/* Page de la partie 3 avec sa barre d'outils : déplaçable (glisser-déposer ou flèches), modifiable, supprimable */
function MiddlePageFrame({ page, index, count, onMove, onEdit, onDelete, children }) {
  const id = `page:${page.id}`;
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id });
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id });
  const label = page.type === 'text' ? 'Page texte' : 'Page photo';

  return (
    <div ref={setDropRef} className={`dossierFrame ${isOver ? 'dossierFrame--over' : ''} ${isDragging ? 'dossierFrame--dragging' : ''}`}>
      <div className='dossierFrame_bar'>
        <button
          type='button'
          ref={setDragRef}
          className='dossierFrame_handle'
          aria-label={`Déplacer cette ${label.toLowerCase()}`}
          {...listeners}
          {...attributes}
        >
          <FontAwesomeIcon icon={faGripVertical} />
        </button>
        <span className='dossierFrame_label'>
          {label} · {index + 1}/{count}
        </span>
        <div className='dossierFrame_actions'>
          <button type='button' onClick={() => onMove(page.id, index - 1)} disabled={index === 0} aria-label='Monter la page'>
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
          <button type='button' onClick={() => onMove(page.id, index + 1)} disabled={index === count - 1} aria-label='Descendre la page'>
            <FontAwesomeIcon icon={faArrowDown} />
          </button>
          {page.type === 'text' && (
            <button type='button' className='dossierFrame_edit' onClick={() => onEdit(page.id)}>
              <FontAwesomeIcon icon={faPenToSquare} /> MODIFIER
            </button>
          )}
          <button type='button' onClick={() => onDelete(page.id)} aria-label='Supprimer la page'>
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ----------------------------------
   Éditeur
---------------------------------- */

function DossierEditor({ project, biographies, logos, onBack }) {
  const [zoom, setZoom] = useState(fitZoom);
  const [state, dispatch] = useReducer(dossierReducer, null);
  const [editingId, setEditingId] = useState(null);
  const [picker, setPicker] = useState(null); // { kind: 'cover' } | { kind: 'slot', pageId, slotIndex }
  const [pageToDelete, setPageToDelete] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);

  const content = useMemo(() => buildContent(project, logos), [project, logos]);

  // Le contenu par défaut est construit une seule fois par projet (il demande de mesurer le texte)
  useEffect(() => {
    let cancelled = false;
    buildInitialState(project, biographies).then((initialState) => {
      if (!cancelled) dispatch({ type: 'init', state: initialState });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const biographyById = useMemo(() => new Map(biographies.map((biography) => [biography._id, biography])), [biographies]);
  const team = state ? state.teamOrder.map((id) => biographyById.get(id)).filter(Boolean) : [];

  function changeZoom(delta) {
    setZoom((current) => Math.min(1.5, Math.max(0.3, Math.round((current + delta) * 10) / 10)));
  }

  /* ----- partie 3 : pages ----- */
  function addPage(index, type) {
    const page = type === 'text' ? newTextPage() : newPhotoPage();
    dispatch({ type: 'addPage', index, page });
    if (type === 'text') setEditingId(page.id);
  }

  function movePage(id, index) {
    dispatch({ type: 'movePage', id, index });
  }

  function confirmDelete() {
    if (!pageToDelete) return;
    dispatch({ type: 'deletePage', id: pageToDelete });
    if (editingId === pageToDelete) setEditingId(null);
    setPageToDelete(null);
  }

  /* ----- photos ----- */
  function selectPhoto(imageUrl) {
    if (!picker) return;
    if (picker.kind === 'cover') {
      dispatch({ type: 'setCover', patch: { imageUrl, x: 50, y: 50 } });
    } else {
      dispatch({ type: 'updateSlot', pageId: picker.pageId, slotIndex: picker.slotIndex, patch: { imageUrl, x: 50, y: 50 } });
    }
    setPicker(null);
  }

  function clearPhoto() {
    if (picker && picker.kind === 'slot') {
      dispatch({ type: 'updateSlot', pageId: picker.pageId, slotIndex: picker.slotIndex, patch: { imageUrl: '', x: 50, y: 50 } });
    }
    setPicker(null);
  }

  const pickerCurrentUrl = (() => {
    if (!picker || !state) return '';
    if (picker.kind === 'cover') return state.cover.imageUrl;
    const page = state.middle.find((item) => item.id === picker.pageId);
    return page && page.slots[picker.slotIndex] ? page.slots[picker.slotIndex].imageUrl : '';
  })();

  /* ----- glisser-déposer (pages de la partie 3 et biographies) ----- */
  function handleDragStart({ active }) {
    const [kind, id] = String(active.id).split(/:(.+)/);
    if (kind === 'page') {
      const page = state.middle.find((item) => item.id === id);
      setActiveDrag(page ? (page.type === 'text' ? 'Page texte' : 'Page photo') : 'Page');
    } else {
      const biography = biographyById.get(id);
      setActiveDrag(biography ? `${biography.name} ${biography.surname}` : 'Biographie');
    }
  }

  function handleDragEnd({ active, over }) {
    setActiveDrag(null);
    if (!over || active.id === over.id) return;

    const [kind, id] = String(active.id).split(/:(.+)/);
    const [overKind, overId] = String(over.id).split(/:(.+)/);
    if (kind !== overKind) return;

    if (kind === 'page') dispatch({ type: 'movePage', id, overId });
    if (kind === 'bio') dispatch({ type: 'moveBio', id, overId });
  }

  const editingPage = state && editingId ? state.middle.find((page) => page.id === editingId) : null;
  const editingIndex = editingPage ? state.middle.indexOf(editingPage) + 1 : null;

  return createPortal(
    <div className={`dossierEditor ${editingPage ? 'dossierEditor--withPanel' : ''}`} lang='fr'>
      <header className='dossierEditor_toolbar'>
        <button type='button' className='dossierEditor_toolbar_button' onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> CHANGER DE PROJET
        </button>

        <p className='dossierEditor_toolbar_title'>Dossier artistique · {project.title}</p>

        <div className='dossierEditor_toolbar_group'>
          <button type='button' className='dossierEditor_toolbar_button dossierEditor_toolbar_button--icon' onClick={() => changeZoom(-0.1)} aria-label='Réduire'>
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <span className='dossierEditor_toolbar_zoom'>{Math.round(zoom * 100)} %</span>
          <button type='button' className='dossierEditor_toolbar_button dossierEditor_toolbar_button--icon' onClick={() => changeZoom(0.1)} aria-label='Agrandir'>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button type='button' className='dossierEditor_toolbar_button dossierEditor_toolbar_button--primary' onClick={() => window.print()}>
            <FontAwesomeIcon icon={faFilePdf} /> EXPORTER EN PDF
          </button>
        </div>
      </header>

      <p className='dossierEditor_hint'>
        Les modifications ne sont pas encore sauvegardées : elles disparaissent si vous fermez l’éditeur.
        Pour l’export : destination « Enregistrer au format PDF », marges « Aucune », option « Graphiques d’arrière-plan » cochée.
      </p>

      {!state && <p className='dossierEditor_loading'>Préparation du dossier…</p>}

      {state && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDrag(null)}>
          <div className='dossierEditor_pages' style={{ zoom }}>
            <SectionLabel number='1' title='COUVERTURE' hint='Seule la photo est modifiable : changez-la, ou faites-la glisser pour la recadrer.' />
            <CoverPage
              {...content.cover}
              photo={state.cover}
              onPan={(position) => dispatch({ type: 'setCover', patch: position })}
              onChoose={() => setPicker({ kind: 'cover' })}
            />

            <SectionLabel number='2' title='INFOS ET DISTRIBUTION' hint='Reprises des données du projet.' />
            <GenericPage {...content.generic} />

            <SectionLabel number='3' title='DESCRIPTIONS ET PHOTOS' hint='Ajoutez, supprimez et déplacez les pages texte et photo.' />
            <AddPageBar index={0} onAdd={addPage} />
            {state.middle.map((page, index) => (
              <React.Fragment key={page.id}>
                <MiddlePageFrame
                  page={page}
                  index={index}
                  count={state.middle.length}
                  onMove={movePage}
                  onEdit={setEditingId}
                  onDelete={setPageToDelete}
                >
                  {page.type === 'text' ? (
                    <TextPage page={page} />
                  ) : (
                    <PhotosPage
                      page={page}
                      images={content.images}
                      onPanSlot={(pageId, slotIndex, position) => dispatch({ type: 'updateSlot', pageId, slotIndex, patch: position })}
                      onChooseSlot={(pageId, slotIndex) => setPicker({ kind: 'slot', pageId, slotIndex })}
                    />
                  )}
                </MiddlePageFrame>
                <AddPageBar index={index + 1} onAdd={addPage} />
              </React.Fragment>
            ))}

            <SectionLabel number='4' title='L’ÉQUIPE' hint='Biographies courtes. Faites glisser une biographie pour changer l’ordre, y compris d’une page à l’autre.' />
            <TeamPages title='L’équipe' biographies={team} />

            <SectionLabel number='5' title='LA COMPAGNIE' hint='Page fixe.' />
            <CompanyPage />

            <SectionLabel number='·' title='CALENDRIER DE CRÉATION ET DIFFUSION' hint='Repris des résidences et des représentations du projet.' />
            <FlowPages title='Calendrier de création' blocks={content.calendarBlocks} variant='calendar' />
            <FlowPages title='Diffusion' blocks={content.diffusionBlocks} variant='calendar' />

            <SectionLabel number='6' title='INFOS DE LA COMPAGNIE ET LOGOS' hint='Page fixe, logos choisis dans le projet.' />
            <ContactPage logos={content.logos} />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDrag ? <div className='dossierEditor_dragLabel'>{activeDrag}</div> : null}
          </DragOverlay>
        </DndContext>
      )}

      {editingPage && (
        <TextPagePanel
          key={editingPage.id}
          page={editingPage}
          pageNumber={editingIndex}
          onChange={(patch) => dispatch({ type: 'updatePage', id: editingPage.id, patch })}
          onClose={() => setEditingId(null)}
        />
      )}

      {picker && (
        <PhotoPicker
          images={content.images}
          currentUrl={pickerCurrentUrl}
          onSelect={selectPhoto}
          onClear={picker.kind === 'slot' ? clearPhoto : null}
          onClose={() => setPicker(null)}
        />
      )}

      <ConfirmBox
        confirmBoxState={Boolean(pageToDelete)}
        question='Supprimer cette page ?'
        affirmativeChoice={confirmDelete}
        negativeChoice={() => setPageToDelete(null)}
      />
    </div>,
    document.body
  );
}

export default DossierEditor;
