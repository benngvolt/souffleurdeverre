import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

/* Modale de choix d'une photo parmi celles du projet. */
function PhotoPicker({ images, currentUrl, onSelect, onClear, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className='dossierPicker' role='dialog' aria-modal='true' aria-label='Choisir une photo' onClick={onClose}>
      <div className='dossierPicker_box dossierPicker_box--photos' onClick={(event) => event.stopPropagation()}>
        <div className='dossierPicker_header'>
          <p className='dossierPicker_title'>CHOISIR UNE PHOTO</p>
          <button type='button' className='dossierPicker_close' onClick={onClose} aria-label='Fermer'>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {images.length === 0 && <p className='dossierPicker_empty'>Ce projet n’a pas encore de photo.</p>}

        <ul className='dossierPicker_photos'>
          {images.map((image, index) => (
            <li key={`${image.imageUrl}-${index}`}>
              <button
                type='button'
                className={image.imageUrl === currentUrl ? 'dossierPicker_photo dossierPicker_photo--current' : 'dossierPicker_photo'}
                onClick={() => onSelect(image.imageUrl)}
                aria-label={`Photo ${index + 1}`}
              >
                <img src={image.imageUrl} alt='' loading='lazy' />
              </button>
            </li>
          ))}
        </ul>

        {onClear && currentUrl && (
          <button type='button' className='dossierPicker_clear' onClick={onClear}>
            RETIRER LA PHOTO
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}

export default PhotoPicker;
