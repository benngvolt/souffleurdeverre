import './ProjectForm.scss'
import { apiFetch } from '../../utils/api'
import {useRef, useState, useEffect, useContext } from 'react'
import { Context } from '../../utils/Context'
import { v4 as uuidv4 } from 'uuid'
import DNDGallery from '../../components/DNDGallery/DNDGallery'
import TitleAndParagraphInput from '../TitleAndParagraphInput/TitleAndParagraphInput'
import ResidenciesEditor from '../ResidenciesEditor/ResidenciesEditor'
import ShowsEditor from '../ShowsEditor/ShowsEditor'
import { isBlankResidency, isBlankShow } from '../../utils/projectItems'
import Loader from '../Loader/Loader'
import ErrorText from '../ErrorText/ErrorText'
import ConfirmBox from '../ConfirmBox/ConfirmBox'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faFileZipper } from '@fortawesome/free-solid-svg-icons'
import {
    MAX_REQUEST_FILES_SIZE,
    PRO_DOCUMENT_EXTENSIONS,
    formatFileSize,
    getDocumentIcon,
    validateProDocument,
} from '../../utils/proDocuments'
import 'trix';
import '../../utils/trix.scss'

/* --------------------------------------------------------
----- SOUS-SECTIONS DE L'ÉDITEUR (ordre + libellés) -------
--------------------------------------------------------*/
const SUB_SECTIONS = [
    { id: 'generalInfo', label: 'INFORMATIONS GÉNÉRALES' },
    { id: 'images', label: 'IMAGES' },
    { id: 'paragraphs', label: 'PARAGRAPHES' },
    { id: 'artists', label: 'DISTRIBUTION' },
    { id: 'production', label: 'PRODUCTION' },
    { id: 'press', label: 'PRESSE' },
    { id: 'links', label: 'LIEN DIVERS' },
    { id: 'residencies', label: 'RÉSIDENCES' },
    { id: 'shows', label: 'REPRÉSENTATIONS' },
    { id: 'pdfs', label: 'DOSSIERS' },
    { id: 'logos', label: 'LOGOS' },
    { id: 'proSpace', label: 'GESTION ESPACE PRO' },
];

// Limites d'envoi côté serveur (voir backend/middlewares/multer-config.js)
const MAX_UPLOAD_FILE_SIZE = 15 * 1024 * 1024;
const MAX_IMAGES = 11;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EMPTY_PRO_SPACE = { enabled: false, zipUrl: '', password: '', documents: [] };

// Anciens projets : pas de tableau `documents` (un seul ZIP dans zipUrl)
function normalizeProSpace(proSpace) {
    return { ...EMPTY_PRO_SPACE, ...(proSpace || {}), documents: proSpace?.documents || [] };
}

function ProjectForm({
        projectEdit,
        projectFormMode,
        setHandleDisplayProjectForm,
        handleDisplayProjectForm,
        artistsList,
        setArtistsList,
        productionList,
        setProductionList,
        pressList,
        setPressList,
        paragraphList,
        setParagraphList,
        linksList,
        setLinksList,
        residenciesList,
        setResidenciesList,
        showsList,
        setShowsList,
        imageFiles,
        setImageFiles,
        mainImageIndex,
        setMainImageIndex,
        pdfFiles,
        setPdfFiles
    }) {

    /* ---------------------------
    ----- RÉCUPÉRATION CONTEXT ---
    ----------------------------*/
    const { projectStates,
            projectTypes,
            handleLoadProjects,
            productionFunctions,
            residencyTypes,
            logos,
            setProjects,
            loaderDisplay,
            displayLoader,
            hideLoader}
            = useContext(Context);

    /* ---------------------------
    ----- DÉFINITION USEREF ------
    ----------------------------*/

    const inputProjectTitleRef = useRef(null);
    const inputProjectSubtitleRef = useRef(null);
    const inputProjectStateRef = useRef(null);
    const inputProjectTypeRef = useRef(null);
    const inputProjectDurationRef = useRef(null);
    const inputProjectCreationDateRef = useRef(null);
    const inputProjectDescriptionRef = useRef(null);
    const inputProjectMoreInfosRef = useRef(null);

    const paragraphRefs = useRef([]);
    const pressRefs = useRef([]);
    const projectFormRef = useRef();

    /* ---------------------------------------------
    ----- NAVIGATION SOUS-SECTIONS + INSTANTANÉS ----
    ----------------------------------------------*/
    const [activeSubSection, setActiveSubSection] = useState('generalInfo');
    const sectionSnapshotRef = useRef({});
    const [leavePromptOpen, setLeavePromptOpen] = useState(false);

    // Enregistrement depuis une sous-section (sans quitter l'éditeur)
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', text } | null
    const [saveVersion, setSaveVersion] = useState(0);
    const saveStatusTimeoutRef = useRef(null);
    // Après le 1er enregistrement d'un NOUVEAU projet, les suivants doivent le modifier (PUT), pas en recréer un
    const [savedProjectId, setSavedProjectId] = useState(null);
    const currentProjectId = projectFormMode === 'edit' ? projectEdit?._id : savedProjectId;
    // Incrémentés quand une section est restaurée/validée : les éditeurs de lieux referment alors leur formulaire
    const [residenciesResetSignal, setResidenciesResetSignal] = useState(0);
    const [showsResetSignal, setShowsResetSignal] = useState(0);

    /* ------------------------
    ----- CHAMPS SIMPLES ------
    -------------------------*/

    const [projectTitle, setProjectTitle] = useState('')
    const [projectSubtitle, setProjectSubtitle] = useState('')
    const [projectState, setProjectState] = useState('')
    const [projectType, setProjectType] = useState('')
    const [projectDuration, setProjectDuration] = useState('')
    const [projectCreationDate, setProjectCreationDate] = useState('')
    const [projectDescription, setProjectDescription] = useState('')
    const [projectMoreInfos, setProjectMoreInfos] = useState('')
    // Noms des logos affichés en bas de la page du projet (jointure avec le modèle Logo côté site)
    const [projectLogos, setProjectLogos] = useState([])
        // ✅ AJOUT ESPACE PRO
    const [proSpace, setProSpace] = useState(EMPTY_PRO_SPACE);
    // Documents ajoutés mais pas encore enregistrés : [{ id, file, name }]
    const [proDocumentFiles, setProDocumentFiles] = useState([]);
    const [proDocumentsError, setProDocumentsError] = useState('');
    const [displayServerError, setDisplayServerError] = useState(false);
    const [displayError, setDisplayError] = useState(false);
    const [projectCurrentDescription, setProjectCurrentDescription] = useState('');

    function initializeFields() {
        setDisplayServerError(false);
        setDisplayError(false);
        if (projectFormMode === 'edit' && projectEdit) {
            setProjectTitle(projectEdit.title);
            setProjectSubtitle(projectEdit.subtitle);
            setProjectState(projectEdit.projectState);
            setProjectType(projectEdit.projectType);
            setProjectDuration(projectEdit.duration);
            setProjectCreationDate(projectEdit.creationDate);
            setProjectDescription(projectEdit.description);
            setProjectMoreInfos(projectEdit.moreInfos);
            setProjectLogos(projectEdit.logos || []);
            setProSpace(normalizeProSpace(projectEdit.proSpace));
            setProDocumentFiles([]);
        } else if (projectFormMode === 'add') {
            setProjectTitle('');
            setProjectSubtitle('');
            setProjectState('');
            setProjectType('');
            setProjectDuration('');
            setProjectCreationDate('');
            setProjectDescription('');
            setProjectMoreInfos('');
            setProjectLogos([]);
            setProSpace(EMPTY_PRO_SPACE);
            setProDocumentFiles([]);
        }
    }

    // "Informations générales" est ouverte par défaut : son instantané doit être
    // construit depuis la source (projectEdit / mode add), pas depuis le state React
    // (setState de initializeFields() n'est pas encore reflété au moment du montage).
    function buildInitialGeneralInfoSnapshot() {
        if (projectFormMode === 'edit' && projectEdit) {
            return {
                projectTitle: projectEdit.title,
                projectSubtitle: projectEdit.subtitle,
                projectState: projectEdit.projectState,
                projectType: projectEdit.projectType,
                projectDuration: projectEdit.duration,
                projectCreationDate: projectEdit.creationDate,
                projectMoreInfos: projectEdit.moreInfos,
                description: projectEdit.description,
            };
        }
        return {
            projectTitle: '',
            projectSubtitle: '',
            projectState: '',
            projectType: '',
            projectDuration: '',
            projectCreationDate: '',
            projectMoreInfos: '',
            description: '',
        };
    }

    /* ---------------------------
    ----- ARTISTS LIST -----------
    ----------------------------*/
    const handleAddArtist = () => {
        setArtistsList([...artistsList, { artistFunction: '', artistName: '' }]);
    };
    const handleSupprArtist = (index) => {
        setArtistsList (artistsList.filter((_, i) => i !== index));
    };

    /* ------------------------
    ----- PROD LIST -----------
    -------------------------*/
    const handleAddProduction = () => {
        setProductionList([...productionList, { productionFunction: '', productionName: '' }]);
    };
    const handleSupprProduction = (index) => {
        setProductionList (productionList.filter((_, i) => i !== index));
    }

    /* ------------------------
    ----- LINKS LIST -----------
    -------------------------*/
    const handleAddLink = () => {
        setLinksList([...linksList, { linkName: '', linkUrl: '', linkType: ''}]);
    };
    const handleSupprLink = (index) => {
        setLinksList (linksList.filter((_, i) => i !== index));
    }

    /* -------------------------------------------------------------
    ----- RÉSIDENCES / REPRÉSENTATIONS : voir ResidenciesEditor / ShowsEditor -----
    -------------------------------------------------------------*/

    /* ---------------------------
    ----- LOGOS DU PROJET --------
    ----------------------------*/
    function toggleProjectLogo(logoName) {
        setProjectLogos((previous) =>
            previous.includes(logoName)
                ? previous.filter((name) => name !== logoName)
                : [...previous, logoName]
        );
    }

    /* --------------------
    ----- PDF FIELDS ------
    ---------------------*/
    const [pdfsNotice, setPdfsNotice] = useState('');

    // Sélection multiple : chaque PDF est ajouté directement, son nom d'affichage reprend celui du fichier
    function handleAddPdfFiles(event) {
        const selectedFiles = Array.from(event.target.files || []);
        // Permet de re-sélectionner un fichier retiré juste avant
        event.target.value = '';

        const problems = [];
        const accepted = [];

        selectedFiles.forEach((file) => {
            const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

            if (!isPdf) {
                problems.push(`« ${file.name} » n'est pas un PDF.`);
            } else if (file.size > MAX_UPLOAD_FILE_SIZE) {
                problems.push(`« ${file.name} » dépasse la limite de ${MAX_UPLOAD_FILE_SIZE / (1024 * 1024)} Mo.`);
            } else {
                file._id = uuidv4();
                file.pdfName = file.name.replace(/\.pdf$/i, '');
                accepted.push(file);
            }
        });

        setPdfsNotice(problems.join(' '));
        if (accepted.length > 0) {
            setPdfFiles([...pdfFiles, ...accepted]);
        }
    }

    function handleSupprPdf(index) {
        const updatedSupprPdfFiles = pdfFiles.filter((_, i) => i !== index);
        setPdfFiles(updatedSupprPdfFiles);
    }

    const newPdfFiles = Array.from(pdfFiles);
    const pdfWithIndex = newPdfFiles.map((pdf, index) => ({
        index,
        pdf,
    }));


    /* -----------------------
    ----- IMAGES FIELDS ------
    ------------------------*/
    const [imagesNotice, setImagesNotice] = useState('');

    // Sélection multiple : les images sont ajoutées directement à la galerie (dans l'ordre choisi),
    // dans la limite de MAX_IMAGES par projet.
    function handleAddImageFiles(event) {
        const selectedFiles = Array.from(event.target.files || []);
        // Permet de re-sélectionner une image retirée juste avant
        event.target.value = '';

        const problems = [];
        const valid = [];

        selectedFiles.forEach((file) => {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                problems.push(`« ${file.name} » : format non accepté (JPEG, PNG, WebP ou GIF).`);
            } else if (file.size > MAX_UPLOAD_FILE_SIZE) {
                problems.push(`« ${file.name} » dépasse la limite de ${MAX_UPLOAD_FILE_SIZE / (1024 * 1024)} Mo.`);
            } else {
                valid.push(file);
            }
        });

        const freeSlots = Math.max(0, MAX_IMAGES - imageFiles.length);
        const accepted = valid.slice(0, freeSlots);

        if (valid.length > accepted.length) {
            problems.push(`${valid.length - accepted.length} image(s) non ajoutée(s) : ${MAX_IMAGES} images maximum par projet.`);
        }

        accepted.forEach((file) => {
            file._id = uuidv4();
            file.sampleImageUrl = URL.createObjectURL(file);
        });

        setImagesNotice(problems.join(' '));
        if (accepted.length > 0) {
            setImageFiles([...imageFiles, ...accepted]);
        }
    }

    const newImageFiles = Array.from(imageFiles);
    const imagesWithIndex = newImageFiles.map((image, index) => ({
        index,
        image
    }));

    /* ---------------------------------
    ----- ESPACE PRO : DOCUMENTS ---------
    ----------------------------------*/
    function handleProDocumentsChange(event) {
        const selectedFiles = Array.from(event.target.files || []);
        // Permet de re-sélectionner le même fichier après l'avoir retiré
        event.target.value = '';

        const errors = [];
        const accepted = [];

        selectedFiles.forEach((file) => {
            const error = validateProDocument(file);
            if (error) {
                errors.push(error);
            } else {
                accepted.push({ id: uuidv4(), file, name: file.name });
            }
        });

        setProDocumentsError(errors.join(' '));
        if (accepted.length > 0) {
            setProDocumentFiles((previous) => [...previous, ...accepted]);
        }
    }

    const renameProDocument = (index, name) =>
        setProSpace((previous) => ({
            ...previous,
            documents: previous.documents.map((document, i) => (i === index ? { ...document, name } : document)),
        }));

    const removeProDocument = (index) =>
        setProSpace((previous) => ({
            ...previous,
            documents: previous.documents.filter((_, i) => i !== index),
        }));

    const renameNewProDocument = (id, name) =>
        setProDocumentFiles((previous) => previous.map((entry) => (entry.id === id ? { ...entry, name } : entry)));

    const removeNewProDocument = (id) =>
        setProDocumentFiles((previous) => previous.filter((entry) => entry.id !== id));

    const hasProDocuments = Boolean(
        proSpace.documents.length > 0 || proDocumentFiles.length > 0 || proSpace.zipUrl
    );

    // Sans document, l'espace pro ne peut pas être affiché
    useEffect(() => {
        if (!hasProDocuments && proSpace.enabled) {
            setProSpace((prev) => ({
                ...prev,
                enabled: false,
            }));
        }
    }, [hasProDocuments, proSpace.enabled]);

    /* ------------------------
    ----- FORM FUNCTIONS ------
    -------------------------*/
    function showSaveStatus(type, text) {
        clearTimeout(saveStatusTimeoutRef.current);
        setSaveStatus({ type, text });
        if (type === 'success') {
            saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(null), 4000);
        }
    }

    useEffect(() => () => clearTimeout(saveStatusTimeoutRef.current), []);

    // Soumission du formulaire (ENREGISTRER ET QUITTER) : enregistre puis referme l'éditeur
    function projectFormSubmit(event) {
        event.preventDefault();
        saveProject({ closeAfter: true });
    }

    // Après un enregistrement sans quitter : les images/PDF/ZIP fraîchement envoyés (et documents de l'espace pro) doivent être
    // remplacés par leur version serveur (sinon le prochain enregistrement les renverrait en double).
    async function refreshFromServer(projectId) {
        try {
            const allProjects = await apiFetch('/api/projects');
            setProjects(allProjects || []);

            const saved = (allProjects || []).find((project) => project._id === projectId);
            if (saved) {
                setImageFiles(saved.images || []);
                setMainImageIndex(saved.mainImageIndex || 0);
                setPdfFiles(saved.pdfList || []);
                setProSpace(normalizeProSpace(saved.proSpace));
                setProDocumentFiles([]);
                setProDocumentsError('');
            }
        } catch (error) {
            console.error(error);
        }
        // Les instantanés ANNULER repartent de l'état qui vient d'être enregistré
        setSaveVersion((version) => version + 1);
    }

    async function saveProject({ closeAfter = false } = {}) {
        displayLoader();
        setDisplayServerError(false);
        setDisplayError(false);
        clearTimeout(saveStatusTimeoutRef.current);
        setSaveStatus(null);

        // RÉORGANISATION DES RÉSIDENCES PAR DÉBUT CHRONO
        const sortedResidenciesList = residenciesList.filter((residency) => !isBlankResidency(residency)).sort((a, b) => {
            const dateA = new Date(a.startDates);
            const dateB = new Date(b.startDates);
            return dateA - dateB;
        });

        // 1) Nettoyage simple : supprimer les dates vides
        const cleanedShowsList = showsList.filter((show) => !isBlankShow(show)).map(show => ({
            ...show,
            dates: (show.dates || []).filter(d => d && d !== '')
        }));

        // 2) Tri des lieux par la première date (jour simple ou début de période)
        const sortedShowsList = cleanedShowsList.sort((a, b) => {
            const a0 = a.dates?.[0];
            const b0 = b.dates?.[0];
            const dateA = new Date(a0?.day || a0?.period?.startDate || 0);
            const dateB = new Date(b0?.day || b0?.period?.startDate || 0);
            return dateA - dateB;
        });

        // 3) Clone profond + suppression des périodes incomplètes (option "safe")
        const payloadShowsList = structuredClone(sortedShowsList);
        for (const show of payloadShowsList) {
            for (const d of show.dates || []) {
                const start = d?.period?.startDate;
                const end = d?.period?.endDate;
                if (!start || !end) {
                    if (d?.period) delete d.period; // <- on enlève period si incomplet
                }
            }
        }

        const projectFormData = new FormData();
        projectFormData.append('title', inputProjectTitleRef.current.value);
        projectFormData.append('subtitle', inputProjectSubtitleRef.current.value);
        projectFormData.append('projectState', inputProjectStateRef.current.value);
        projectFormData.append('projectType', inputProjectTypeRef.current.value);
        projectFormData.append('creationDate', inputProjectCreationDateRef.current.value);
        projectFormData.append('duration', inputProjectDurationRef.current.value);
        projectFormData.append('description', projectCurrentDescription);
        projectFormData.append('moreInfos', inputProjectMoreInfosRef.current.value);
        projectFormData.append('mainImageIndex', mainImageIndex);
        projectFormData.append('artistsList', JSON.stringify(artistsList));
        projectFormData.append('productionList', JSON.stringify(productionList));
        projectFormData.append('pressList', JSON.stringify(pressList));
        projectFormData.append('paragraphList', JSON.stringify(paragraphList));
        projectFormData.append('linksList', JSON.stringify(linksList));
        projectFormData.append('logos', JSON.stringify(projectLogos));
        projectFormData.append('residenciesList', JSON.stringify(sortedResidenciesList));

        // 🔁 ICI on envoie la version nettoyée
        projectFormData.append('showsList', JSON.stringify(payloadShowsList));
        // ✅ AJOUT ESPACE PRO
        projectFormData.append('proSpace', JSON.stringify(proSpace));

        proDocumentFiles.forEach(({ file, name }) => {
            projectFormData.append('proDocuments', file);
            projectFormData.append('proDocumentNames', name.trim() || file.name);
        });

        pdfWithIndex.forEach(({ index, pdf }) => {
            if (pdf instanceof File) {
                projectFormData.append('pdfFiles', pdf);
                projectFormData.append('pdfFileIndexes', index);
                projectFormData.append('pdfNames', pdf.pdfName)
            } else {
                projectFormData.append(`existingPdfs[${index}]`, JSON.stringify(pdf));
            }
        });

        imagesWithIndex.forEach(({ index, image }) => {
            if (image instanceof File) {
                projectFormData.append('images', image);
                projectFormData.append('fileIndexes', index)
            } else {
                projectFormData.append(`existingImages[${index}]`, JSON.stringify(image));
            }
        });

        if (
            !inputProjectTitleRef.current.value ||
            !inputProjectStateRef.current.value ||
            !inputProjectTypeRef.current.value
        ) {
            hideLoader();
            setDisplayError(true);
            showSaveStatus('error', "Le titre, l'état et le type du projet sont obligatoires (onglet INFORMATIONS GÉNÉRALES).");
            return;
        }

        // App Engine refuse les requêtes de plus de 32 Mo : on prévient plutôt que d'échouer sans explication.
        const newFilesSize = [...imageFiles, ...pdfFiles, ...proDocumentFiles.map(({ file }) => file)]
            .filter((file) => file instanceof File)
            .reduce((total, file) => total + file.size, 0);

        if (newFilesSize > MAX_REQUEST_FILES_SIZE) {
            hideLoader();
            showSaveStatus('error', `Les fichiers ajoutés pèsent ${formatFileSize(newFilesSize)} : au-delà de 30 Mo l'envoi échoue. Enregistrez en plusieurs fois (ENREGISTRER, sans quitter) en n'ajoutant que quelques fichiers à la fois.`);
            return;
        }

        const targetId = currentProjectId;
        const url = targetId ? `/api/projects/${targetId}` : '/api/projects';
        const method = targetId ? 'PUT' : 'POST';

        try {
            const result = await apiFetch(url, { method, auth: true, body: projectFormData });
            const projectId = targetId || result?._id;

            // Sans _id (nouveau projet créé), impossible de continuer à le modifier sans le dupliquer : on ferme.
            if (closeAfter || !projectId) {
                hideLoader();
                closeForm();
                return;
            }

            setSavedProjectId(projectId);

            // Les ajouts de lieux restés vides ne sont pas enregistrés : on les retire aussi du formulaire
            const keptResidencies = residenciesList.filter((residency) => !isBlankResidency(residency));
            if (keptResidencies.length !== residenciesList.length) {
                setResidenciesList(keptResidencies);
                setResidenciesResetSignal((signal) => signal + 1);
            }
            const keptShows = showsList.filter((show) => !isBlankShow(show));
            if (keptShows.length !== showsList.length) {
                setShowsList(keptShows);
                setShowsResetSignal((signal) => signal + 1);
            }

            await refreshFromServer(projectId);
            hideLoader();
            showSaveStatus('success', '✓ Projet enregistré');
        } catch (error) {
            console.error(error);
            hideLoader();
            setDisplayServerError(true);
            showSaveStatus('error', "L'enregistrement a échoué. Vos modifications restent dans le formulaire : réessayez.");
        }
    }

    function closeForm() {
        clearTrixEditor();
        setHandleDisplayProjectForm(false);
        handleLoadProjects();
        hideLoader();
    }

    /* ------------------------
    ----- TRIX  EDITOR ------
    -------------------------*/

    const handleOneTrixChange = (event) => {
        const newValue = event.target.value;
        setProjectCurrentDescription(newValue);
    };

    useEffect(() => {
        if (inputProjectDescriptionRef) {
            inputProjectDescriptionRef.current.editor.loadHTML(projectDescription);
            setProjectCurrentDescription(projectDescription);
        }
    }, [projectDescription, handleDisplayProjectForm]);

    useEffect(() => {
        if (inputProjectDescriptionRef && inputProjectDescriptionRef.current) {
            const editor = inputProjectDescriptionRef.current;
            editor.addEventListener('trix-change', handleOneTrixChange);
            return () => {
                editor.removeEventListener('trix-change', handleOneTrixChange);
            };
        }
    }, [inputProjectDescriptionRef]);

    useEffect(() => {
        if (projectFormRef.current) {
            projectFormRef.current.scrollTo(0, 0);
        }
        initializeFields();
        sectionSnapshotRef.current.generalInfo = buildInitialGeneralInfoSnapshot();
    }, [projectEdit, handleDisplayProjectForm  ]);

    function clearTrixEditor() {
        const elements = document.querySelectorAll("trix-editor");
        elements.forEach(element => {
            const editor = element.editor;
            editor.setSelectedRange([0, 0]);
            editor.loadHTML('');
        });
    }

    /* ---------------------------------------------
    ----- SOUS-SECTIONS : INSTANTANÉ / VALIDER / ANNULER ----
    ----------------------------------------------*/
    function buildSectionSnapshot(id) {
        switch (id) {
            case 'images':
                return { imageFiles: [...imageFiles], mainImageIndex };
            case 'generalInfo':
                return {
                    projectTitle,
                    projectSubtitle,
                    projectState,
                    projectType,
                    projectDuration,
                    projectCreationDate,
                    projectMoreInfos,
                    description: projectCurrentDescription,
                };
            case 'paragraphs':
                return structuredClone(paragraphList);
            case 'artists':
                return structuredClone(artistsList);
            case 'production':
                return structuredClone(productionList);
            case 'press':
                return structuredClone(pressList);
            case 'links':
                return structuredClone(linksList);
            case 'residencies':
                return structuredClone(residenciesList);
            case 'shows':
                return structuredClone(showsList);
            case 'logos':
                return [...projectLogos];
            case 'pdfs':
                return { order: [...pdfFiles], names: pdfFiles.map((pdf) => pdf.pdfName) };
            case 'proSpace':
                return { proSpace: structuredClone(proSpace), proDocumentFiles: [...proDocumentFiles] };
            default:
                return null;
        }
    }

    useEffect(() => {
        if (saveVersion > 0) {
            sectionSnapshotRef.current[activeSubSection] = buildSectionSnapshot(activeSubSection);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveVersion]);

    function openSubSection(id) {
        sectionSnapshotRef.current[id] = buildSectionSnapshot(id);
        setActiveSubSection(id);
        setSaveStatus(null);
    }

    function revertSubSection(id) {
        const snapshot = sectionSnapshotRef.current[id];

        if (snapshot) {
            switch (id) {
                case 'images':
                    setImageFiles(snapshot.imageFiles);
                    setMainImageIndex(snapshot.mainImageIndex);
                    setImagesNotice('');
                    break;
                case 'generalInfo':
                    setProjectTitle(snapshot.projectTitle);
                    setProjectSubtitle(snapshot.projectSubtitle);
                    setProjectState(snapshot.projectState);
                    setProjectType(snapshot.projectType);
                    setProjectDuration(snapshot.projectDuration);
                    setProjectCreationDate(snapshot.projectCreationDate);
                    setProjectMoreInfos(snapshot.projectMoreInfos);
                    setProjectCurrentDescription(snapshot.description);
                    if (inputProjectDescriptionRef.current?.editor) {
                        inputProjectDescriptionRef.current.editor.loadHTML(snapshot.description);
                    }
                    break;
                case 'paragraphs': {
                    const restored = structuredClone(snapshot);
                    setParagraphList(restored);
                    paragraphRefs.current.forEach((trix, i) => {
                        trix?.editor?.loadHTML(restored[i]?.paragraphText ?? '');
                    });
                    break;
                }
                case 'artists':
                    setArtistsList(structuredClone(snapshot));
                    break;
                case 'production':
                    setProductionList(structuredClone(snapshot));
                    break;
                case 'press': {
                    const restored = structuredClone(snapshot);
                    setPressList(restored);
                    pressRefs.current.forEach((trix, i) => {
                        trix?.editor?.loadHTML(restored[i]?.quote ?? '');
                    });
                    break;
                }
                case 'links':
                    setLinksList(structuredClone(snapshot));
                    break;
                case 'residencies':
                    setResidenciesList(structuredClone(snapshot));
                    setResidenciesResetSignal((signal) => signal + 1);
                    break;
                case 'shows':
                    setShowsList(structuredClone(snapshot));
                    setShowsResetSignal((signal) => signal + 1);
                    break;
                case 'logos':
                    setProjectLogos([...snapshot]);
                    break;
                case 'pdfs': {
                    const restoredOrder = snapshot.order;
                    restoredOrder.forEach((pdf, i) => {
                        pdf.pdfName = snapshot.names[i];
                    });
                    setPdfFiles(restoredOrder);
                    setPdfsNotice('');
                    break;
                }
                case 'proSpace':
                    setProSpace(structuredClone(snapshot.proSpace));
                    setProDocumentFiles([...snapshot.proDocumentFiles]);
                    setProDocumentsError('');
                    break;
                default:
                    break;
            }
        }
    }

    function subSectionClassName(id) {
        return activeSubSection === id
            ? 'projectForm_subSection'
            : 'projectForm_subSection projectForm_subSection--hidden';
    }

    function renderSectionActions(id) {
        return (
            <div className='projectForm_subSection_buttons'>
                <button type='button' onClick={() => setSaveConfirmOpen(true)}>ENREGISTRER</button>
                <button type='button' onClick={() => revertSubSection(id)}>ANNULER</button>
                {saveStatus && (
                    <p
                        className={`projectForm_subSection_buttons_status projectForm_subSection_buttons_status--${saveStatus.type}`}
                        role='status'
                    >
                        {saveStatus.text}
                    </p>
                )}
            </div>
        );
    }

    /* ------------------------
    ----- QUITTER L'ÉDITEUR ------
    -------------------------*/
    function openLeavePrompt() {
        setLeavePromptOpen(true);
    }
    function closeLeavePrompt() {
        setLeavePromptOpen(false);
    }
    function handleSaveAndLeave() {
        closeLeavePrompt();
        projectFormRef.current.requestSubmit();
    }
    function handleDiscardAndLeave() {
        closeLeavePrompt();
        closeForm();
    }


    return  (
        <form onSubmit={(event) => projectFormSubmit(event)} method="post" className='projectForm' ref={projectFormRef}>
            <button type='button' className='projectForm_backButton' onClick={openLeavePrompt}>
                &lt; REVENIR À LA LISTE DES PROJETS
            </button>

            <p className='projectForm_editorTitle'>
                {projectTitle || (projectFormMode === 'add' ? 'NOUVEAU PROJET' : '')}
            </p>

            <div className='projectForm_editorBody'>
            <nav className='projectForm_subNav' aria-label='Sous-sections du projet'>
                {SUB_SECTIONS.map((section) => (
                    <button
                        key={section.id}
                        type='button'
                        className={activeSubSection === section.id ? 'projectForm_subNav_item projectForm_subNav_item--active' : 'projectForm_subNav_item'}
                        onClick={() => openSubSection(section.id)}
                    >
                        {section.label}
                    </button>
                ))}
            </nav>

            <div className='projectForm_editorBody_content'>

            <div className={subSectionClassName('images')}>
                <p className='projectForm_subSection_title'>IMAGES</p>
                {renderSectionActions('images')}
                <div className='projectForm_projectImageField'>
                    <DNDGallery imageFiles={imageFiles} setImageFiles={setImageFiles} mainImageIndex={mainImageIndex} setMainImageIndex={setMainImageIndex} />
                    <div className={imageFiles.length < MAX_IMAGES ? 'projectForm_projectImageField_imageFile' : 'projectForm_projectImageField_imageFile--displayOff'}>
                        <label htmlFor='inputProjectImageFile'>+ AJOUTER DES IMAGES</label>
                        <input
                            type='file'
                            id='inputProjectImageFile'
                            name="images"
                            multiple
                            accept={ALLOWED_IMAGE_TYPES.join(',')}
                            onChange={handleAddImageFiles}
                            style={{ display: 'none' }}
                        />
                        <p className='projectForm_fileHint'>Vous pouvez en sélectionner plusieurs à la fois ({imageFiles.length}/{MAX_IMAGES}).</p>
                        {imagesNotice && <p className='projectForm_fileNotice' role='alert'>{imagesNotice}</p>}
                    </div>
                </div>
            </div>

            <div className={subSectionClassName('generalInfo')}>
                <p className='projectForm_subSection_title'>INFORMATIONS GÉNÉRALES</p>
                {renderSectionActions('generalInfo')}
                <div className='projectForm_projectTitle'>
                    <label htmlFor='inputProjectTitle'>TITRE*</label>
                    <input type='text' id='inputProjectTitle' ref={inputProjectTitleRef} value={projectTitle} onChange={(e) =>setProjectTitle(e.target.value)}></input>
                </div>
                <div className='projectForm_projectSubtitle'>
                    <label htmlFor='inputProjectSubtitle'>SOUS-TITRE</label>
                    <input type='text' id='inputProjectSubtitle' ref={inputProjectSubtitleRef} value={projectSubtitle} onChange={(e) =>setProjectSubtitle(e.target.value)}></input>
                </div>
                <div className='projectForm_projectState'>
                    <label htmlFor='inputProjectState'>ÉTAT*</label>
                    <select id='inputProjectState'
                            ref={inputProjectStateRef}
                            name="projectState"
                            value={projectState}
                            onChange={(e) =>setProjectState(e.target.value)}>
                        <option value=""></option>
                        {projectStates.map((projectState)=>(
                            <option value={projectState}>{projectState}</option>
                        ))}
                    </select>
                </div>
                <div className='projectForm_projectType'>
                    <label htmlFor='inputProjectType'>TYPE DE PROJET*</label>
                    <select id='inputProjectType'
                            ref={inputProjectTypeRef}
                            name="projectType"
                            value={projectType}
                            onChange={(e) =>setProjectType(e.target.value)}>
                        <option value=""></option>
                        {projectTypes.map((projectType)=>(
                            <option value={projectType}>{projectType}</option>
                        ))}
                    </select>
                </div>
                <div className='projectForm_projectDuration'>
                    <label htmlFor='inputProjectDuration'>DURÉE</label>
                    <input type='text' id='inputProjectDuration' ref={inputProjectDurationRef} value={projectDuration} onChange={(e) =>setProjectDuration(e.target.value)}></input>
                </div>
                <div className='projectForm_projectCreationDate'>
                    <label htmlFor='inputProjectCreationDate'>DATE DE CRÉATION</label>
                    <input type='month' id='inputProjectCreationDate' ref={inputProjectCreationDateRef} value={projectCreationDate} onChange={(e) =>setProjectCreationDate(e.target.value)}></input>
                </div>
                <div className='projectForm_projectMoreInfos'>
                    <label htmlFor='inputProjectMoreInfos'>PLUS D'INFOS</label>
                    <input type='text' id='inputProjectMoreInfos' ref={inputProjectMoreInfosRef} value={projectMoreInfos} onChange={(e) =>setProjectMoreInfos(e.target.value)}></input>
                </div>
                <div className='projectForm_projectDescription'>
                    <label htmlFor='inputProjectDescription'>RÉSUMÉ</label>
                    <input id='trix-description' type="hidden" name="descriptionContent" defaultValue={projectDescription} ></input>
                    <trix-editor
                        id='inputProjectDescription'
                        input="trix-description"
                        ref={inputProjectDescriptionRef}
                    />
                </div>
            </div>

            <div className={subSectionClassName('paragraphs')}>
                <p className='projectForm_subSection_title'>PARAGRAPHES</p>
                {renderSectionActions('paragraphs')}
                <TitleAndParagraphInput
                    setList={setParagraphList}
                    topic="PARAGRAPHES"
                    paragraphTopic="PARAGRAPHE"
                    titleTopic="TITRE DU PARAGRAPHE"
                    list={paragraphList}
                    paragraphProp="paragraphText"
                    titleProp="paragraphTitle"
                    trixRefs={paragraphRefs}
                    displayForm={handleDisplayProjectForm}
                />
            </div>

            <div className={subSectionClassName('artists')}>
                <p className='projectForm_subSection_title'>DISTRIBUTION</p>
                {renderSectionActions('artists')}
                <div className='projectForm_projectArtistsList'>
                    {artistsList.map((artist, index) => (
                        <div key={index} className='projectForm_projectArtistsList_line'>
                            <div className='projectForm_projectArtistsList_line_artistFunction'>
                                <label htmlFor={`inputProjectArtistFunction${index}`}>FONCTION</label>
                                <input
                                    type='text'
                                    id={`inputProjectArtistFunction${index}`}
                                    value={artist.artistFunction}
                                    onChange={(e) => {
                                        const updatedArtistsList = [...artistsList];
                                        updatedArtistsList[index].artistFunction = e.target.value;
                                        setArtistsList(updatedArtistsList);
                                    }}
                                ></input>
                            </div>
                            <div className='projectForm_projectArtistsList_line_artistName'>
                                <label htmlFor={`inputProjectArtistName${index}`}>NOMS</label>
                                <input
                                    type='text'
                                    id={`inputProjectArtistName${index}`}
                                    value={artist.artistName}
                                    onChange={(e) => {
                                        const updatedArtistsList = [...artistsList];
                                        updatedArtistsList[index].artistName = e.target.value;
                                        setArtistsList(updatedArtistsList);
                                    }}
                                ></input>
                            </div>
                            <button type='button' onClick={() => handleSupprArtist(index)}>SUPPRIMER</button>
                        </div>
                    ))}
                    <button className='projectForm_projectArtistsList_addButton' type='button' onClick={() =>handleAddArtist()} >+ AJOUTER UN ARTISTE</button>
                </div>
            </div>

            <div className={subSectionClassName('production')}>
                <p className='projectForm_subSection_title'>PRODUCTION</p>
                {renderSectionActions('production')}
                <div className='projectForm_projectProductionList'>
                    {productionList.map((production, index) => (
                        <div key={index} className='projectForm_projectProductionList_line'>
                            <div className='projectForm_projectProductionList_line_prodFunction'>
                                <label htmlFor={`inputProjectProductionFunction${index}`}>FONCTION</label>
                                <select value={production.productionFunction}
                                        onChange={(e) => {
                                            const updatedProductionList = [...productionList];
                                            updatedProductionList[index].productionFunction = e.target.value;
                                            setProductionList(updatedProductionList);
                                        }}>
                                    <option value=""></option>
                                    {productionFunctions.map((productionFunction) => (
                                        <option value={productionFunction}>{productionFunction}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='projectForm_projectProductionList_line_prodName'>
                                <label htmlFor={`inputProjectProductionName${index}`}>NOMS</label>
                                <input
                                    type='text'
                                    id={`inputProjectProductionName${index}`}
                                    value={production.productionName}
                                    onChange={(e) => {
                                        const updatedProductionList = [...productionList];
                                        updatedProductionList[index].productionName = e.target.value;
                                        setProductionList(updatedProductionList);
                                    }}
                                ></input>
                            </div>
                            <button type='button' onClick={() => handleSupprProduction(index)}>SUPPRIMER</button>
                        </div>
                    ))}
                    <button className='projectForm_projectProductionList_addButton' type='button' onClick={() =>handleAddProduction()} >+ AJOUTER PRODUCTION</button>
                </div>
            </div>

            <div className={subSectionClassName('press')}>
                <p className='projectForm_subSection_title'>PRESSE</p>
                {renderSectionActions('press')}
                <TitleAndParagraphInput
                    setList={setPressList}
                    topic="PRESSE"
                    paragraphTopic="EXTRAIT"
                    titleTopic="NOM DU MEDIA"
                    list={pressList}
                    paragraphProp="quote"
                    titleProp="mediaName"
                    trixRefs={pressRefs}
                    displayForm={handleDisplayProjectForm}
                />
            </div>

            <div className={subSectionClassName('links')}>
                <p className='projectForm_subSection_title'>LIEN DIVERS</p>
                {renderSectionActions('links')}
                <div className="projectForm_projectlinksList">
                    {linksList.map((link, index) => (
                        <div key={index} className="projectForm_projectlinksList_line">

                            <div>
                                <label htmlFor={`inputProjectLinkName${index}`}>
                                    NOM DU LIEN
                                </label>
                                <input
                                    type="text"
                                    id={`inputProjectLinkName${index}`}
                                    value={link.linkName}
                                    onChange={(e) => {
                                        setLinksList(prev =>
                                            prev.map((item, i) =>
                                                i === index
                                                    ? { ...item, linkName: e.target.value }
                                                    : item
                                            )
                                        );
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor={`inputProjectLinkUrl${index}`}>
                                    URL DU LIEN
                                </label>
                                <input
                                    type="text"
                                    id={`inputProjectLinkUrl${index}`}
                                    value={link.linkUrl}
                                    onChange={(e) => {
                                        setLinksList(prev =>
                                            prev.map((item, i) =>
                                                i === index
                                                    ? { ...item, linkUrl: e.target.value }
                                                    : item
                                            )
                                        );
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor={`inputProjectLinkType${index}`}>
                                    TYPE DE LIEN
                                </label>
                                <select
                                    id={`inputProjectLinkType${index}`}
                                    value={link.linkType || "website"}
                                    onChange={(e) => {
                                        setLinksList(prev =>
                                            prev.map((item, i) =>
                                                i === index
                                                    ? { ...item, linkType: e.target.value }
                                                    : item
                                            )
                                        );
                                    }}
                                >
                                    <option value="lien video">Lien vidéo</option>
                                    <option value="lien audio">Lien audio</option>
                                    <option value="website">Website</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleSupprLink(index)}
                            >
                                SUPPRIMER
                            </button>
                        </div>
                    ))}

                    <button
                        className="projectForm_projectlinksList_addButton"
                        type="button"
                        onClick={handleAddLink}
                    >
                        + AJOUTER LIEN
                    </button>
                </div>
            </div>

            <div className={subSectionClassName('residencies')}>
                <p className='projectForm_subSection_title'>RÉSIDENCES</p>
                {renderSectionActions('residencies')}
                <ResidenciesEditor
                    residenciesList={residenciesList}
                    setResidenciesList={setResidenciesList}
                    residencyTypes={residencyTypes}
                    resetSignal={residenciesResetSignal}
                />
            </div>

            <div className={subSectionClassName('shows')}>
                <p className='projectForm_subSection_title'>REPRÉSENTATIONS</p>
                {renderSectionActions('shows')}
                <ShowsEditor
                    showsList={showsList}
                    setShowsList={setShowsList}
                    resetSignal={showsResetSignal}
                />
            </div>

            <div className={subSectionClassName('pdfs')}>
                <p className='projectForm_subSection_title'>DOSSIERS</p>
                {renderSectionActions('pdfs')}
                <div className='projectForm_projectPdfFile'>
                    <div className='projectForm_projectPdfFile_pdfContainer'>
                    {pdfFiles?.map((pdf, index) => (
                        <div key={index}>
                            <p>{pdf.pdfName}</p>
                            <label htmlFor='inputProjectPdfName'>NOM DU PDF</label>
                            <input
                                type='text'
                                id='inputProjectPdfName'
                                name="pdfName"
                                value={pdf.pdfName || ''}
                                onChange={(e) => {
                                    const updatedChangedPdfFiles = [...pdfFiles];
                                    updatedChangedPdfFiles[index].pdfName = e.target.value;
                                    setPdfFiles(updatedChangedPdfFiles);
                                }}
                            />
                            <button type='button' onClick={() => handleSupprPdf(index)}>SUPPRIMER</button>
                        </div>
                    ))}
                    </div>
                    <label className='projectForm_projectPdfFile_addButton' htmlFor='inputProjectPdfFile'>+ AJOUTER DES FICHIERS</label>
                    <input
                        type='file'
                        id='inputProjectPdfFile'
                        name="pdfFiles"
                        multiple
                        accept='application/pdf,.pdf'
                        onChange={handleAddPdfFiles}
                    />
                    <p className='projectForm_fileHint'>PDF uniquement ; vous pouvez en sélectionner plusieurs à la fois.</p>
                    {pdfsNotice && <p className='projectForm_fileNotice' role='alert'>{pdfsNotice}</p>}
                </div>
            </div>

            <div className={subSectionClassName('logos')}>
                <p className='projectForm_subSection_title'>LOGOS</p>
                {renderSectionActions('logos')}
                <div className='projectForm_projectLogos'>
                    <p className='projectForm_projectLogos_tuto'>
                        Cochez les logos à afficher tout en bas de la page du projet. Ils apparaissent dans l'ordre où vous les cochez.
                        Les logos s'ajoutent et se modifient depuis l'onglet LOGOS du tableau de bord.
                    </p>
                    {logos.length === 0 ? (
                        <p className='projectForm_projectLogos_empty'>Aucun logo disponible pour le moment.</p>
                    ) : (
                        <ul className='projectForm_projectLogos_list'>
                            {logos.map((logo) => {
                                const position = projectLogos.indexOf(logo.name);
                                return (
                                    <li key={logo._id}>
                                        <label className={position >= 0 ? 'projectForm_projectLogos_item projectForm_projectLogos_item--selected' : 'projectForm_projectLogos_item'}>
                                            <input
                                                type='checkbox'
                                                checked={position >= 0}
                                                onChange={() => toggleProjectLogo(logo.name)}
                                            />
                                            <img src={logo.imageUrl} alt='' loading='lazy' />
                                            <span className='projectForm_projectLogos_item_name'>{logo.name}</span>
                                            {position >= 0 && (
                                                <span className='projectForm_projectLogos_item_position'>{position + 1}</span>
                                            )}
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            <div className={subSectionClassName('proSpace')}>
                <p className='projectForm_subSection_title'>GESTION ESPACE PRO</p>
                {renderSectionActions('proSpace')}
                <div className='projectForm_projectProSpace'>
                    {hasProDocuments && (
                        <label className='projectForm_projectProSpace_checkbox'>
                            <p>AFFICHER L'ESPACE PRO</p>
                            <input
                                type='checkbox'
                                checked={proSpace.enabled}
                                onChange={(e) =>
                                    setProSpace({
                                        ...proSpace,
                                        enabled: e.target.checked,
                                    })
                                }
                            />

                        </label>

                    )}
                    {hasProDocuments && (
                        <div className='projectForm_projectProSpace_password'>
                            <label htmlFor='inputProjectProSpacePassword'>
                                MOT DE PASSE ESPACE PRO
                            </label>

                            <input
                                type='text'
                                id='inputProjectProSpacePassword'
                                value={proSpace.password || ''}
                                onChange={(e) =>
                                    setProSpace({
                                        ...proSpace,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>
                    )}

                    <div className='projectForm_projectProSpace_documents'>
                        <p className='projectForm_projectProSpace_title'>DOCUMENTS À TÉLÉCHARGER</p>
                        <p className='projectForm_projectProSpace_hint'>
                            PDF, images, Word, Excel, PowerPoint, archives, audio, vidéo... (10 Mo maximum par document).
                            Les professionnels téléchargent chaque document séparément.
                        </p>

                        {proSpace.zipUrl && (
                            <div className='projectForm_projectProSpace_document'>
                                <FontAwesomeIcon icon={faFileZipper} className='projectForm_projectProSpace_document_icon' />
                                <div className='projectForm_projectProSpace_document_infos'>
                                    <span className='projectForm_projectProSpace_document_name'>Pack ZIP (ancien format)</span>
                                    <span className='projectForm_projectProSpace_document_meta'>
                                        <a href={proSpace.zipUrl} target='_blank' rel='noreferrer'>Voir le fichier</a>
                                    </span>
                                </div>
                                <button
                                    type='button'
                                    aria-label='Supprimer le ZIP'
                                    onClick={() => setProSpace({ ...proSpace, zipUrl: '' })}
                                >
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                            </div>
                        )}

                        {proSpace.documents.map((document, index) => (
                            <div key={document._id || document.url} className='projectForm_projectProSpace_document'>
                                <FontAwesomeIcon icon={getDocumentIcon(document.url)} className='projectForm_projectProSpace_document_icon' />
                                <div className='projectForm_projectProSpace_document_infos'>
                                    <input
                                        type='text'
                                        aria-label='Nom du document'
                                        value={document.name || ''}
                                        onChange={(e) => renameProDocument(index, e.target.value)}
                                    />
                                    <span className='projectForm_projectProSpace_document_meta'>
                                        {formatFileSize(document.size)}{document.size ? ' · ' : ''}
                                        <a href={document.url} target='_blank' rel='noreferrer'>Voir le fichier</a>
                                    </span>
                                </div>
                                <button
                                    type='button'
                                    aria-label={`Retirer ${document.name || 'ce document'}`}
                                    onClick={() => removeProDocument(index)}
                                >
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                            </div>
                        ))}

                        {proDocumentFiles.map(({ id, file, name }) => (
                            <div key={id} className='projectForm_projectProSpace_document projectForm_projectProSpace_document--new'>
                                <FontAwesomeIcon icon={getDocumentIcon(file.name)} className='projectForm_projectProSpace_document_icon' />
                                <div className='projectForm_projectProSpace_document_infos'>
                                    <input
                                        type='text'
                                        aria-label='Nom du document'
                                        value={name}
                                        onChange={(e) => renameNewProDocument(id, e.target.value)}
                                    />
                                    <span className='projectForm_projectProSpace_document_meta'>
                                        {formatFileSize(file.size)} · à enregistrer
                                    </span>
                                </div>
                                <button
                                    type='button'
                                    aria-label={`Retirer ${name}`}
                                    onClick={() => removeNewProDocument(id)}
                                >
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                            </div>
                        ))}

                        {!hasProDocuments && (
                            <p className='projectForm_projectProSpace_empty'>Aucun document pour l'instant.</p>
                        )}

                        {proDocumentsError && (
                            <p className='projectForm_projectProSpace_error' role='alert'>{proDocumentsError}</p>
                        )}

                        <label className='projectForm_projectProSpace_addButton' htmlFor='inputProjectProDocuments'>
                            + AJOUTER DES DOCUMENTS
                        </label>
                        <input
                            type='file'
                            id='inputProjectProDocuments'
                            multiple
                            accept={PRO_DOCUMENT_EXTENSIONS.map((extension) => `.${extension}`).join(',')}
                            onChange={handleProDocumentsChange}
                        />
                    </div>
                </div>
            </div>

            </div>
            </div>

            <ErrorText errorText={"Une erreur s'est produite"} state={displayServerError}/>
            <ErrorText errorText={"Tous les champs marqués d'une * doivent être remplis"} state={displayError}/>

            <ConfirmBox
                confirmBoxState={saveConfirmOpen}
                question='Enregistrer les modifications du projet ?'
                affirmativeChoice={() => saveProject()}
                negativeChoice={() => setSaveConfirmOpen(false)}
            />

            {leavePromptOpen && (
                <div className='projectForm_leavePrompt'>
                    <div className='projectForm_leavePrompt_container'>
                        <p className='projectForm_leavePrompt_container_question'>
                            Enregistrer les modifications avant de quitter ?
                        </p>
                        <div className='projectForm_leavePrompt_container_buttons'>
                            <button type='button' onClick={handleSaveAndLeave}>ENREGISTRER ET QUITTER</button>
                            <button type='button' onClick={handleDiscardAndLeave}>QUITTER SANS ENREGISTRER</button>
                            <button type='button' onClick={closeLeavePrompt}>ANNULER</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={loaderDisplay===true?'homePage_loader--displayOn':'homePage_loader--displayOff'}>
                <Loader className='loader--opaque' loaderDisplay={loaderDisplay}/>
            </div>
        </form>
    )
}

export default ProjectForm
