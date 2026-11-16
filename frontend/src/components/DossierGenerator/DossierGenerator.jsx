import { useContext, useState } from 'react';
import { Context } from '../../utils/Context';
import { apiFetch } from '../../utils/api';
import { slugify } from '../../utils/dossier/dossierData';
import ProjectPicker from './ProjectPicker';
import DossierEditor from './DossierEditor';
import './DossierGenerator.scss';

/* Onglet « GÉNÉRATEUR DE DOSSIER » du back-office :
   1. on choisit un projet dans une modale,
   2. les données du projet sont récupérées auprès du serveur,
   3. l'éditeur de dossier s'ouvre avec les pages générées. */
function DossierGenerator() {
  const { projects, biographies, logos } = useContext(Context);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notice, setNotice] = useState('');

  async function handleSelect(project) {
    setPickerOpen(false);
    setLoading(true);
    setNotice('');

    try {
      const freshProject = await apiFetch(`/api/projects/${slugify(project.title)}`);
      setSelectedProject(freshProject);
    } catch (error) {
      // En cas d'échec, on se rabat sur les données déjà chargées dans le back-office.
      console.error(error.message);
      setSelectedProject(project);
      setNotice('Les données du projet n’ont pas pu être rechargées : les dernières données chargées sont utilisées.');
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setSelectedProject(null);
    setPickerOpen(true);
  }

  return (
    <div className='dossierGenerator'>
      <p className='dossierGenerator_title'>GÉNÉRATEUR DE DOSSIER</p>

      <p className='dossierGenerator_tuto'>
        Génère le dossier artistique d’un spectacle à partir des informations déjà saisies sur le site
        (générique, textes, photos, biographies, calendrier de création, logos), selon la charte graphique de la compagnie.
        Les textes peuvent ensuite être retouchés avant l’export en PDF.
      </p>

      <button
        type='button'
        className='dossierGenerator_startButton'
        onClick={() => setPickerOpen(true)}
        disabled={loading}
      >
        {loading ? 'CHARGEMENT…' : 'CHOISIR UN PROJET'}
      </button>

      {notice && <p className='dossierGenerator_notice'>{notice}</p>}

      {pickerOpen && (
        <ProjectPicker projects={projects} onSelect={handleSelect} onClose={() => setPickerOpen(false)} />
      )}

      {selectedProject && (
        <DossierEditor
          key={selectedProject._id}
          project={selectedProject}
          biographies={biographies}
          logos={logos}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default DossierGenerator;
