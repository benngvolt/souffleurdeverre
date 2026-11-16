import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import 'trix';
import '../../utils/trix.scss';

/* Panneau d'édition d'une page texte (à droite de l'écran) : titre facultatif, alignement vertical
   et texte enrichi. Les modifications s'affichent en direct dans la page. */
function TextPagePanel({ page, pageNumber, onChange, onClose }) {
  const inputId = `dossier-trix-input-${page.id}`;
  const editorId = `dossier-trix-editor-${page.id}`;

  // L'éditeur n'est chargé qu'une fois par page : la saisie ne doit pas être réécrasée par l'état
  useEffect(() => {
    const element = document.getElementById(editorId);
    if (!element) return undefined;

    const handleChange = () => onChange({ html: element.value });
    const loadContent = () => {
      element.editor.loadHTML(page.html || '');
      element.addEventListener('trix-change', handleChange);
    };

    if (element.editor) {
      loadContent();
    } else {
      element.addEventListener('trix-initialize', loadContent, { once: true });
    }

    return () => {
      element.removeEventListener('trix-initialize', loadContent);
      element.removeEventListener('trix-change', handleChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  return createPortal(
    <aside className='dossierPanel' aria-label='Édition de la page texte'>
      <div className='dossierPanel_header'>
        <p className='dossierPanel_title'>PAGE TEXTE{pageNumber ? ` · ${pageNumber}` : ''}</p>
        <button type='button' className='dossierPanel_done' onClick={onClose}>
          TERMINÉ
        </button>
      </div>

      <label className='dossierPanel_label' htmlFor={`dossier-title-${page.id}`}>Titre de la page (facultatif)</label>
      <input
        id={`dossier-title-${page.id}`}
        className='dossierPanel_input'
        type='text'
        value={page.title}
        placeholder='Ex. Note d’intention'
        onChange={(event) => onChange({ title: event.target.value })}
      />

      <label className='dossierPanel_label' htmlFor={`dossier-align-${page.id}`}>Position du texte (sans titre)</label>
      <select
        id={`dossier-align-${page.id}`}
        className='dossierPanel_input'
        value={page.align}
        onChange={(event) => onChange({ align: event.target.value })}
      >
        <option value='top'>En haut de la page</option>
        <option value='center'>Centré verticalement</option>
      </select>

      <p className='dossierPanel_label'>Texte</p>
      <input id={inputId} type='hidden' />
      <trix-editor id={editorId} input={inputId} class='dossierPanel_editor' />
    </aside>,
    document.body
  );
}

export default TextPagePanel;
