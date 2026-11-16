import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { normalizeText } from '../../utils/dossier/dossierData';

/* Modale de choix du projet dont on veut générer le dossier. */
function ProjectPicker({ projects, onSelect, onClose }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredProjects = useMemo(() => {
    const search = normalizeText(query);
    return [...projects]
      .sort((a, b) => a.title.localeCompare(b.title))
      .filter((project) => !search || normalizeText(project.title).includes(search));
  }, [projects, query]);

  return createPortal(
    <div className='dossierPicker' role='dialog' aria-modal='true' aria-label='Choisir un projet' onClick={onClose}>
      <div className='dossierPicker_box' onClick={(event) => event.stopPropagation()}>
        <div className='dossierPicker_header'>
          <p className='dossierPicker_title'>CHOISIR UN PROJET</p>
          <button type='button' className='dossierPicker_close' onClick={onClose} aria-label='Fermer'>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <input
          className='dossierPicker_search'
          type='search'
          placeholder='Rechercher un projet…'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />

        <ul className='dossierPicker_list'>
          {filteredProjects.map((project) => (
            <li key={project._id}>
              <button type='button' className='dossierPicker_item' onClick={() => onSelect(project)}>
                <span className='dossierPicker_item_name'>{project.title}</span>
                <span className='dossierPicker_item_state'>
                  {project.projectState === '*non visible*' ? 'non publié' : project.projectState}
                </span>
              </button>
            </li>
          ))}
          {filteredProjects.length === 0 && <li className='dossierPicker_empty'>Aucun projet trouvé.</li>}
        </ul>
      </div>
    </div>,
    document.body
  );
}

export default ProjectPicker;
