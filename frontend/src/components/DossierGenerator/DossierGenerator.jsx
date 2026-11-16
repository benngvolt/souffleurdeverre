import { useContext, useState } from 'react';
import { Context } from '../../utils/Context';
import { apiFetch } from '../../utils/api';
import { slugify } from '../../utils/dossier/dossierData';
import ProjectPicker from './ProjectPicker';
import DossierDrafts from './DossierDrafts';
import DossierEditor from './DossierEditor';
import './DossierGenerator.scss';

/* Onglet « GÉNÉRATEUR DE DOSSIER » du back-office :
   1. on choisit un projet dans une modale,
   2. ses données sont récupérées auprès du serveur,
   3. on choisit un brouillon existant ou on en crée un nouveau,
   4. l'éditeur de dossier s'ouvre. */
function DossierGenerator() {
  const { projects, biographies, logos } = useContext(Context);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null); // projet choisi (données fraîches)
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [session, setSession] = useState(null); // { draft: brouillon ouvert ou null, key }
  const [notice, setNotice] = useState('');

  async function handleSelectProject(chosen) {
    setPickerOpen(false);
    setLoading(true);
    setNotice('');

    try {
      setProject(await apiFetch(`/api/projects/${slugify(chosen.title)}`));
    } catch (error) {
      // En cas d'échec, on se rabat sur les données déjà chargées dans le back-office.
      console.error(error.message);
      setProject(chosen);
      setNotice('Les données du projet n’ont pas pu être rechargées : les dernières données chargées sont utilisées.');
    } finally {
      setLoading(false);
      setDraftsOpen(true);
    }
  }

  function startSession(draft) {
    setDraftsOpen(false);
    setSession({ draft, key: `${draft ? draft._id : 'new'}-${Date.now()}` });
  }

  function closeEditor() {
    setSession(null);
    setDraftsOpen(true);
  }

  return (
    <div className='dossierGenerator'>
      <p className='dossierGenerator_title'>GÉNÉRATEUR DE DOSSIER</p>

      <p className='dossierGenerator_tuto'>
        Génère le dossier artistique d’un spectacle à partir des informations déjà saisies sur le site
        (générique, textes, photos, biographies, calendrier de création, logos), selon la charte graphique de la compagnie.
        Plusieurs brouillons peuvent être enregistrés par spectacle, puis exportés en PDF.
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
        <ProjectPicker projects={projects} onSelect={handleSelectProject} onClose={() => setPickerOpen(false)} />
      )}

      {project && draftsOpen && !session && (
        <DossierDrafts
          key={project._id}
          project={project}
          onNew={() => startSession(null)}
          onOpen={(draft) => startSession(draft)}
          onChangeProject={() => {
            setDraftsOpen(false);
            setPickerOpen(true);
          }}
          onClose={() => setDraftsOpen(false)}
        />
      )}

      {project && session && (
        <DossierEditor
          key={session.key}
          project={project}
          biographies={biographies}
          logos={logos}
          draft={session.draft}
          onBack={closeEditor}
        />
      )}
    </div>
  );
}

export default DossierGenerator;
