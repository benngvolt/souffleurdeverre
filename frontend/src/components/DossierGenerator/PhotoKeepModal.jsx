import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

/* Quand on passe à moins de photos que celles déjà placées : on choisit celles qu'on garde. */
function PhotoKeepModal({ photos, count, onConfirm, onCancel }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  function toggle(index) {
    setSelected((current) => {
      if (current.includes(index)) return current.filter((item) => item !== index);
      if (count === 1) return [index]; // une seule photo : choix direct, sans devoir désélectionner
      return current.length < count ? [...current, index] : current;
    });
  }

  return createPortal(
    <div className='dossierPicker' role='dialog' aria-modal='true' aria-label='Photos à garder' onClick={onCancel}>
      <div className='dossierPicker_box dossierPicker_box--keep' onClick={(event) => event.stopPropagation()}>
        <div className='dossierPicker_header'>
          <p className='dossierPicker_title'>PHOTOS À GARDER</p>
          <button type='button' className='dossierPicker_close' onClick={onCancel} aria-label='Annuler'>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className='dossierKeep_text'>
          Cette disposition contient {count === 1 ? 'une seule photo' : `${count} photos`}. Choisissez
          {count === 1 ? ' celle que vous gardez' : ` les ${count} photos que vous gardez`} ({selected.length}/{count}) ; les autres seront retirées de la page
          (elles restent dans le projet).
        </p>

        <ul className='dossierKeep_list'>
          {photos.map(({ index, slot }) => {
            const isSelected = selected.includes(index);
            const isFull = selected.length >= count && !isSelected && count > 1;
            return (
              <li key={index}>
                <button
                  type='button'
                  className={`dossierKeep_photo ${isSelected ? 'dossierKeep_photo--selected' : ''}`}
                  onClick={() => toggle(index)}
                  disabled={isFull}
                  aria-pressed={isSelected}
                  aria-label={`Photo ${index + 1}${isSelected ? ' (gardée)' : ''}`}
                >
                  <img src={slot.imageUrl} alt='' />
                  {isSelected && <span className='dossierKeep_badge'>{selected.indexOf(index) + 1}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className='dossierDrafts_promptButtons'>
          <button type='button' disabled={selected.length !== count} onClick={() => onConfirm([...selected].sort((a, b) => a - b))}>
            VALIDER
          </button>
          <button type='button' onClick={onCancel}>ANNULER</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PhotoKeepModal;
