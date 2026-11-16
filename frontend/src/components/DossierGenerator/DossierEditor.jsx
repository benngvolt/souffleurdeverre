import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faFilePdf,
  faFloppyDisk,
  faFont,
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
import PageOverview from './PageOverview';
import PhotoPicker from './PhotoPicker';
import TextPagePanel from './TextPagePanel';
import ConfirmBox from '../ConfirmBox/ConfirmBox';
import {
  htmlToText,
  splitLeadingItalic,
  htmlToBlocks,
  calendarGroups,
  formatCreationDate,
  firstItem,
} from '../../utils/dossier/dossierData';
import {
  buildInitialState,
  buildStateFromDraft,
  dossierReducer,
  newPhotoPage,
  newTextPage,
  serializeDraft,
} from '../../utils/dossier/dossierState';
import { buildPdfFileName, defaultDraftName, formatDateTime } from '../../utils/dossier/dossierExport';
import { apiFetch } from '../../utils/api';
import { PAGE } from './dossierConfig';

const PAGE_WIDTH_PX = (PAGE.widthMm * 96) / 25.4;

function fitZoom() {
  const width = window.innerWidth || document.documentElement.clientWidth || 1200;
  // l'aperçu à gauche occupe 214 px
  return Math.min(1, Math.max(0.3, (width - 214 - 48) / PAGE_WIDTH_PX));
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
    calendarBlocks: calendarGroups(project.residenciesList).flatMap((group) => calendarBlocks(group, 'calendar')),
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

/* Page de la partie 3 avec sa barre d'outils : modifiable, supprimable.
   L'ordre des pages se change dans l'aperçu, à gauche. */
function MiddlePageFrame({ page, index, count, onEdit, onDelete, children }) {
  const label = page.type === 'text' ? 'Page texte' : 'Page photo';

  return (
    <div className='dossierFrame'>
      <div className='dossierFrame_bar'>
        <span className='dossierFrame_label'>
          {label} · {index + 1}/{count}
        </span>
        <div className='dossierFrame_actions'>
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

/* Invite « Enregistrer sous… » : demande le nom du nouveau brouillon */
function NamePrompt({ initialName, onConfirm, onCancel }) {
  const [value, setValue] = useState(initialName);

  return createPortal(
    <div className='dossierPicker' role='dialog' aria-modal='true' aria-label='Enregistrer sous' onClick={onCancel}>
      <form
        className='dossierPicker_box dossierPicker_box--prompt'
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) onConfirm(value.trim());
        }}
      >
        <p className='dossierPicker_title'>ENREGISTRER SOUS…</p>
        <p className='dossierDrafts_date'>Le brouillon actuel reste tel qu’il est enregistré ; une copie portant ce nom est créée.</p>
        <input
          className='dossierPicker_search'
          type='text'
          value={value}
          maxLength={120}
          onChange={(event) => setValue(event.target.value)}
          aria-label='Nom du nouveau brouillon'
          autoFocus
        />
        <div className='dossierDrafts_promptButtons'>
          <button type='submit' disabled={!value.trim()}>ENREGISTRER</button>
          <button type='button' onClick={onCancel}>ANNULER</button>
        </div>
      </form>
    </div>,
    document.body
  );
}

/* ----------------------------------
   Éditeur
---------------------------------- */

function DossierEditor({ project, biographies, logos, draft, onBack }) {
  const [zoom, setZoom] = useState(fitZoom);
  const [state, dispatch] = useReducer(dossierReducer, null);
  const [editingId, setEditingId] = useState(null);
  const [picker, setPicker] = useState(null); // { kind: 'cover' } | { kind: 'slot', pageId, slotIndex }
  const [pageToDelete, setPageToDelete] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const pagesRef = useRef(null);
  const scrollRef = useRef(null);

  /* ----- brouillon : enregistrement ----- */
  const [draftId, setDraftId] = useState(draft ? draft._id : null);
  const [name, setName] = useState(() => (draft ? draft.name : defaultDraftName()));
  const [baseline, setBaseline] = useState(null); // contenu tel qu'il est enregistré (ou tel qu'il était à l'ouverture)
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', text }
  const [warnings, setWarnings] = useState([]);
  const [askLeave, setAskLeave] = useState(false);
  const [askSaveAs, setAskSaveAs] = useState(false);

  const content = useMemo(() => buildContent(project, logos), [project, logos]);

  // Le contenu par défaut est construit une seule fois par projet (il demande de mesurer le texte)
  useEffect(() => {
    let cancelled = false;

    const start = (initialState, initialWarnings = []) => {
      if (cancelled) return;
      dispatch({ type: 'init', state: initialState });
      setWarnings(initialWarnings);
      setBaseline(JSON.stringify(serializeDraft(initialState, name)));
    };

    if (draft) {
      const restored = buildStateFromDraft(draft, project, biographies);
      start(restored.state, restored.warnings);
    } else {
      buildInitialState(project, biographies).then((initialState) => start(initialState));
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id]);

  // Modifications non enregistrées : le contenu actuel diffère de celui enregistré
  const currentJson = state ? JSON.stringify(serializeDraft(state, name)) : null;
  const dirty = Boolean(state) && baseline !== null && currentJson !== baseline;

  // Avertit avant de fermer ou recharger la page avec des modifications non enregistrées
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function saveDraft(overrides = {}) {
    if (!state || saving) return;

    const content = serializeDraft(state, (overrides.name ?? name).trim() || defaultDraftName());
    const asNew = overrides.asNew || !draftId;

    setSaving(true);
    setSaveStatus(null);
    try {
      const saved = asNew
        ? await apiFetch('/api/dossiers', { method: 'POST', auth: true, json: { ...content, project: project._id } })
        : await apiFetch(`/api/dossiers/${draftId}`, { method: 'PUT', auth: true, json: content });

      setDraftId(saved._id);
      setName(content.name);
      setBaseline(JSON.stringify(content));
      setSaveStatus({ type: 'success', text: `✓ Enregistré le ${formatDateTime(saved.updatedAt)}` });
    } catch (error) {
      console.error(error);
      setSaveStatus({ type: 'error', text: error.payload?.error || 'L’enregistrement a échoué : vos modifications restent dans l’éditeur, réessayez.' });
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (dirty) setAskLeave(true);
    else onBack();
  }

  /* Export PDF : le navigateur propose comme nom de fichier le titre de la page au moment de l'impression */
  function exportPdf() {
    const originalTitle = document.title;
    document.title = buildPdfFileName(project.title, new Date(), 'A4-RVB');

    const restore = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);

    window.print();
  }

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
        <button type='button' className='dossierEditor_toolbar_button' onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> DOSSIERS
        </button>

        <input
          className='dossierEditor_toolbar_name'
          type='text'
          value={name}
          maxLength={120}
          onChange={(event) => setName(event.target.value)}
          aria-label='Nom du brouillon'
          title={`Brouillon de ${project.title}`}
        />

        <p
          className={`dossierEditor_toolbar_status ${dirty ? 'dossierEditor_toolbar_status--dirty' : ''} ${saveStatus && saveStatus.type === 'error' ? 'dossierEditor_toolbar_status--error' : ''}`}
          role='status'
        >
          {saveStatus && saveStatus.type === 'error'
            ? saveStatus.text
            : dirty
              ? '● Modifications non enregistrées'
              : saveStatus
                ? saveStatus.text
                : draftId
                  ? '✓ Enregistré'
                  : 'Nouveau dossier'}
        </p>

        <div className='dossierEditor_toolbar_group'>
          <button type='button' className='dossierEditor_toolbar_button dossierEditor_toolbar_button--icon' onClick={() => changeZoom(-0.1)} aria-label='Réduire'>
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <span className='dossierEditor_toolbar_zoom'>{Math.round(zoom * 100)} %</span>
          <button type='button' className='dossierEditor_toolbar_button dossierEditor_toolbar_button--icon' onClick={() => changeZoom(0.1)} aria-label='Agrandir'>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button type='button' className='dossierEditor_toolbar_button' onClick={() => saveDraft()} disabled={!state || saving}>
            <FontAwesomeIcon icon={faFloppyDisk} /> {saving ? 'ENREGISTREMENT…' : 'ENREGISTRER'}
          </button>
          <button type='button' className='dossierEditor_toolbar_button' onClick={() => setAskSaveAs(true)} disabled={!state || saving}>
            ENREGISTRER SOUS…
          </button>
          <button type='button' className='dossierEditor_toolbar_button dossierEditor_toolbar_button--primary' onClick={exportPdf} disabled={!state}>
            <FontAwesomeIcon icon={faFilePdf} /> EXPORTER EN PDF
          </button>
        </div>
      </header>

      <p className='dossierEditor_hint'>
        Pour l’export : destination « Enregistrer au format PDF », marges « Aucune », option « Graphiques d’arrière-plan » cochée.
        Le fichier est nommé automatiquement (AAMMJJHHMM_PROJET_A4RVB).
      </p>

      {warnings.map((warning) => (
        <p key={warning} className='dossierEditor_warning' role='alert'>{warning}</p>
      ))}

      {!state && <p className='dossierEditor_loading'>Préparation du dossier…</p>}

      {state && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDrag(null)}>
          <div className='dossierEditor_body'>
          <PageOverview pagesRef={pagesRef} scrollRef={scrollRef} ready={Boolean(state)} dragging={Boolean(activeDrag)} />
          <div ref={scrollRef} className='dossierEditor_main'>
          <div ref={pagesRef} className='dossierEditor_pages' style={{ zoom }}>
            <SectionLabel number='1' title='COUVERTURE' hint='Seule la photo est modifiable : changez-la, ou faites-la glisser pour la recadrer.' />
            <CoverPage
              {...content.cover}
              photo={state.cover}
              onPan={(position) => dispatch({ type: 'setCover', patch: position })}
              onChoose={() => setPicker({ kind: 'cover' })}
            />

            <SectionLabel number='2' title='INFOS ET DISTRIBUTION' hint='Reprises des données du projet.' />
            <GenericPage {...content.generic} />

            <SectionLabel number='3' title='DESCRIPTIONS ET PHOTOS' hint='Ajoutez et supprimez des pages texte et photo ; l’ordre se change dans l’aperçu, à gauche.' />
            <AddPageBar index={0} onAdd={addPage} />
            {state.middle.map((page, index) => (
              <React.Fragment key={page.id}>
                <MiddlePageFrame
                  page={page}
                  index={index}
                  count={state.middle.length}
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

            <SectionLabel number='·' title='CALENDRIER DE CRÉATION' hint='Résidences d’écriture et de création, reprises des données du projet.' />
            <FlowPages title='Calendrier de création' blocks={content.calendarBlocks} variant='calendar' />

            <SectionLabel number='6' title='INFOS DE LA COMPAGNIE ET LOGOS' hint='Page fixe, logos choisis dans le projet.' />
            <ContactPage logos={content.logos} />
          </div>
          </div>
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

      {askSaveAs && (
        <NamePrompt
          initialName={defaultDraftName()}
          onCancel={() => setAskSaveAs(false)}
          onConfirm={(chosenName) => {
            setAskSaveAs(false);
            saveDraft({ name: chosenName, asNew: true });
          }}
        />
      )}

      <ConfirmBox
        confirmBoxState={askLeave}
        question='Quitter sans enregistrer ? Les modifications seront perdues.'
        affirmativeChoice={onBack}
        negativeChoice={() => setAskLeave(false)}
      />

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
