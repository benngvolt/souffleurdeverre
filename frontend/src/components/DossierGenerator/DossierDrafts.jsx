import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { apiFetch } from '../../utils/api';
import { formatDateTime } from '../../utils/dossier/dossierExport';
import ConfirmBox from '../ConfirmBox/ConfirmBox';

/* Liste des brouillons de dossier d'un projet : nouveau dossier, ouvrir, dupliquer, renommer, supprimer. */
function DossierDrafts({ project, onNew, onOpen, onChangeProject, onClose }) {
  const [drafts, setDrafts] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [renamingId, setRenamingId] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const loadDrafts = useCallback(async () => {
    try {
      setDrafts(await apiFetch(`/api/dossiers?project=${project._id}`, { auth: true }));
      setError('');
    } catch (requestError) {
      console.error(requestError);
      setDrafts([]);
      setError('Impossible de charger les brouillons. Vérifiez votre connexion et réessayez.');
    }
  }, [project._id]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !renamingId && !toDelete) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, renamingId, toDelete]);

  async function run(draftId, action) {
    setBusyId(draftId);
    setError('');
    try {
      await action();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.payload?.error || 'L’opération a échoué. Réessayez.');
    } finally {
      setBusyId('');
    }
  }

  const duplicate = (draft) =>
    run(draft._id, async () => {
      await apiFetch(`/api/dossiers/${draft._id}/duplicate`, { method: 'POST', auth: true, json: {} });
      await loadDrafts();
    });

  const open = (draft) =>
    run(draft._id, async () => {
      const full = await apiFetch(`/api/dossiers/${draft._id}`, { auth: true });
      onOpen(full);
    });

  const rename = (draft) =>
    run(draft._id, async () => {
      await apiFetch(`/api/dossiers/${draft._id}`, { method: 'PATCH', auth: true, json: { name: renameValue } });
      setRenamingId('');
      await loadDrafts();
    });

  const remove = () => {
    const draft = toDelete;
    setToDelete(null);
    return run(draft._id, async () => {
      await apiFetch(`/api/dossiers/${draft._id}`, { method: 'DELETE', auth: true });
      await loadDrafts();
    });
  };

  return createPortal(
    <>
    <div className='dossierPicker' role='dialog' aria-modal='true' aria-label='Brouillons de dossier' onClick={onClose}>
      <div className='dossierPicker_box dossierPicker_box--drafts' onClick={(event) => event.stopPropagation()}>
        <div className='dossierPicker_header'>
          <p className='dossierPicker_title'>DOSSIERS · {project.title}</p>
          <button type='button' className='dossierPicker_close' onClick={onClose} aria-label='Fermer'>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <button type='button' className='dossierDrafts_new' onClick={onNew}>
          + NOUVEAU DOSSIER
        </button>

        {error && <p className='dossierDrafts_error' role='alert'>{error}</p>}
        {drafts === null && <p className='dossierPicker_empty'>Chargement…</p>}
        {drafts && drafts.length === 0 && !error && (
          <p className='dossierPicker_empty'>Aucun brouillon pour ce projet. Créez un nouveau dossier pour commencer.</p>
        )}

        <ul className='dossierDrafts_list'>
          {(drafts || []).map((draft) => (
            <li key={draft._id} className='dossierDrafts_item'>
              {renamingId === draft._id ? (
                <form
                  className='dossierDrafts_rename'
                  onSubmit={(event) => {
                    event.preventDefault();
                    rename(draft);
                  }}
                >
                  <input
                    type='text'
                    value={renameValue}
                    maxLength={120}
                    onChange={(event) => setRenameValue(event.target.value)}
                    aria-label='Nouveau nom'
                    autoFocus
                  />
                  <button type='submit' disabled={!renameValue.trim() || busyId === draft._id}>OK</button>
                  <button type='button' onClick={() => setRenamingId('')}>ANNULER</button>
                </form>
              ) : (
                <>
                  <div className='dossierDrafts_info'>
                    <p className='dossierDrafts_name'>{draft.name}</p>
                    <p className='dossierDrafts_date'>Modifié le {formatDateTime(draft.updatedAt)}</p>
                  </div>
                  <div className='dossierDrafts_actions'>
                    <button type='button' onClick={() => open(draft)} disabled={busyId === draft._id}>OUVRIR</button>
                    <button type='button' onClick={() => duplicate(draft)} disabled={busyId === draft._id}>DUPLIQUER</button>
                    <button
                      type='button'
                      onClick={() => {
                        setRenamingId(draft._id);
                        setRenameValue(draft.name);
                      }}
                      disabled={busyId === draft._id}
                    >
                      RENOMMER
                    </button>
                    <button type='button' onClick={() => setToDelete(draft)} disabled={busyId === draft._id}>SUPPRIMER</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        <button type='button' className='dossierPicker_clear' onClick={onChangeProject}>
          CHANGER DE PROJET
        </button>
      </div>
    </div>

    <ConfirmBox
      confirmBoxState={Boolean(toDelete)}
      question={toDelete ? `Supprimer « ${toDelete.name} » ? Cette action est définitive.` : ''}
      affirmativeChoice={remove}
      negativeChoice={() => setToDelete(null)}
    />
    </>,
    document.body
  );
}

export default DossierDrafts;
