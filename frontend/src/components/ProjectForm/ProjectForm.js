import './ProjectForm.scss'
import { API_URL } from '../../utils/constants'
import {useRef, useState, useEffect, useContext } from 'react'
import { Context } from '../../utils/Context'
import * as pdfjsLib from "pdfjs-dist/webpack"
import { v4 as uuidv4 } from 'uuid'
// import DOMPurify from 'dompurify';
import DNDGallery from '../../components/DNDGallery/DNDGallery'
import TitleAndParagraphInput from '../TitleAndParagraphInput/TitleAndParagraphInput'
import DateInputSwitch from '../DateInputSwitch/DateInputSwitch'
import ConfirmBox from '../ConfirmBox/ConfirmBox'
import Loader from '../Loader/Loader'
import Collapse from '../../components/Collapse/Collapse'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXmark} from '@fortawesome/free-solid-svg-icons'
import ErrorText from '../ErrorText/ErrorText'
import 'trix';
// import 'trix/dist/trix.css';
import '../../utils/trix.scss'

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
        videoList, 
        setVideoList, 
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
    const projectMainImageSampleRef = useRef (null);
    const inputProjectImageFileRef = useRef (null);
    const inputProjectPdfFileRef = useRef (null);
    const projectPdfSampleRef = useRef (null);

    const paragraphRefs = useRef([]);
    const pressRefs = useRef([]);
    const projectFormRef = useRef();
    
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
    const [confirmBoxState, setConfirmBoxState] = useState(false);
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
        } else if (projectFormMode === 'add') {
            setProjectTitle('');
            setProjectSubtitle('');
            setProjectState('');
            setProjectType('');
            setProjectDuration('');
            setProjectCreationDate('');
            setProjectDescription('');
            setProjectMoreInfos('');
        }
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
    ----- VIDEOS LIST -----------
    -------------------------*/
    const handleAddVideo = () => {
        setVideoList([...videoList, { videoName: '', videoLink: ''}]);
    };
    const handleSupprVideo = (index) => {
        setVideoList (videoList.filter((_, i) => i !== index));
    }

    /* ------------------------
    ----- RESIDENCIES LIST -----------
    -------------------------*/
    const handleAddResidency = () => {
        setResidenciesList([...residenciesList, { residencyType: '', startDates: '', endDates: '', city: '', placeName: '', placeLink: '', moreInfos:''}]);
    };
    const handleSupprResidency = (index) => {
        setResidenciesList (residenciesList.filter((_, i) => i !== index));
    }

    /* ------------------------
    ----- SHOWS LIST -----------
    -------------------------*/
    const handleAddShow = () => {
        setShowsList([...showsList, { dates: [{day:'', period:{startDate:'', endDate:''}, times:[{time: '', timeInfos: ''}] }], city: '', placeName: '', placeLink: '', showsNumber:'', moreInfos:''}]);
    };
    const handleSupprShow = (index) => {
        setShowsList (showsList.filter((_, i) => i !== index));
    }
    const handleAddSameShowDate = (index) => {
        const updatedShowsList = [...showsList];
        if (!updatedShowsList[index].dates) {
            updatedShowsList[index].dates = [{ day: '', period: {startDate:'', endDate:''}, times: [{ time: '', timeInfos: '' }] }]; // Créez un tableau contenant un objet vide avec les propriétés appropriées
        } else {
            updatedShowsList[index].dates.push({ day: '', period: {startDate:'', endDate:''}, times: [{ time: '', timeInfos: '' }] }); // Ajoutez un nouvel objet vide avec les propriétés appropriées
        }
        setShowsList(updatedShowsList);
    };

    const handleAddSameDateTime = (index, dateIndex) => {
        const updatedShowsList = [...showsList];
        if (!updatedShowsList[index].dates[dateIndex].times) {
            updatedShowsList[index].dates[dateIndex].times = ['']; // Si show.dates n'existe pas encore, créez-le comme un tableau avec une date vide
        } else {
            updatedShowsList[index].dates[dateIndex].times.push({ time: '', timeInfos: '' }); // Sinon, ajoutez simplement une date vide
        }
        setShowsList(updatedShowsList);
    };

    const handleSupprSameShowDate = (index, dateIndex) => {
        const updatedShowsList = [...showsList];
        if (updatedShowsList[index].dates) {
            updatedShowsList[index].dates = updatedShowsList[index].dates.filter((_, i) => i !== dateIndex);
        }
        setShowsList(updatedShowsList);
    };

    const handleSupprSameDateTime = (index, dateIndex, timeIndex) => {
        const updatedShowsList = [...showsList];
        if (updatedShowsList[index].dates[dateIndex].times) {
            updatedShowsList[index].dates[dateIndex].times = updatedShowsList[index].dates[dateIndex].times.filter((_, i) => i !== timeIndex);
        }
        setShowsList(updatedShowsList);
    };

    /* --------------------
    ----- PDF FIELDS ------
    ---------------------*/
    const [isPdfLoaded, setIsPdfLoaded] = useState(false);
    const [newPdf, setNewPdf] = useState(null);
    async function generatePdfPreview(pdf) {
        const pdfData = new Uint8Array(await pdf.arrayBuffer());
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdfDocument = await loadingTask.promise;
        // Charger la première page
        const pageNumber = 1;
        const page = await pdfDocument.getPage(pageNumber);
        // Définir la taille de l'aperçu (facultatif)
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        // Créer un élément canvas pour le rendu de l'aperçu
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // Rendu de la première page sur le canvas
        await page.render({ canvasContext: context, viewport }).promise;
        // Convertir le canvas en data URL (image au format base64)
        const dataUrl = canvas.toDataURL('image/jpeg');
        return dataUrl;
    }
    async function displayPdfSample() {
        const pdf = inputProjectPdfFileRef.current.files[0];
        if (pdf) {
        const id = uuidv4(); // Générez un identifiant unique
        pdf._id = id;
        setNewPdf(pdf);
        // Générer l'aperçu de la première page du PDF
        const previewUrl = await generatePdfPreview(pdf);
    
        // Afficher l'aperçu
        projectPdfSampleRef.current.setAttribute('src', previewUrl);
        projectPdfSampleRef.current.setAttribute('alt', '');
        setIsPdfLoaded(true);
        } else {
        setIsPdfLoaded(false);
        }
    }
    function handleAddPdfFile() {
        if (newPdf) {
            const updatedAddPdfFiles = [...pdfFiles, newPdf];
            setPdfFiles(updatedAddPdfFiles);
        }
        setIsPdfLoaded(false);
        cancelAddPdfFile();
    }

    function handleSupprPdf(index) {
        // Créer une copie du tableau pdfFiles sans l'élément à l'index spécifié
        const updatedSupprPdfFiles = pdfFiles.filter((_, i) => i !== index);
        // Mettre à jour l'état avec le nouveau tableau sans l'élément supprimé
        setPdfFiles(updatedSupprPdfFiles);
    }

    function cancelAddPdfFile() {
        setNewPdf (null);
        setIsPdfLoaded(false);
        // Réinitialiser l'élément input
        inputProjectPdfFileRef.current.value = '';
        // Réinitialiser les fichiers sélectionnés
        inputProjectPdfFileRef.current.files = null;
        projectPdfSampleRef.current.setAttribute("src", "");
        projectPdfSampleRef.current.setAttribute("alt", "");
    }

    const newPdfFiles = Array.from(pdfFiles);
    const pdfWithIndex = newPdfFiles.map((pdf, index) => ({
        index,
        pdf,
    }));
    

    /* -----------------------
    ----- IMAGES FIELDS ------
    ------------------------*/
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [newImage, setNewImage] = useState(null);
    
    //CHARGEMENT DE L'IMAGE
    function displaySample() {
            const image = inputProjectImageFileRef.current.files[0];
            if (image) {
                setNewImage (image);
                const id = uuidv4(); 
                // Générez un identifiant unique
                image._id = id;
                image.sampleImageUrl= URL.createObjectURL(image);
                projectMainImageSampleRef.current.setAttribute("src", image.sampleImageUrl);
                projectMainImageSampleRef.current.setAttribute("alt", "");
                setIsImageLoaded(true);
            } else {
                setIsImageLoaded(false);
            }
    }
    function cancelAddImageFile() {
        setNewImage (null);
        setIsImageLoaded(false);
        projectMainImageSampleRef.current.setAttribute("src", "");
        projectMainImageSampleRef.current.setAttribute("alt", "");
    }
    function handleAddImageFile() {
        if (newImage) {
            const updatedImageFiles = [...imageFiles, newImage];
            setImageFiles(updatedImageFiles);
        }
        //ON SE RETROUVE AVEC UN TABLEAU IMAGEFILES COMPRENANT DES IMAGES EN INSTANCES DE FILES ET DES IMAGES AVEC URL
        setIsImageLoaded(false);
        cancelAddImageFile();
    }

    //TRAITEMENT DU TABLEAU IMAGEFILES POUR ENVOI EN BACKEND
    // ON RÉCUPÈRE D'ABORD IMAGEFILES EN UN NOOUVEAU TABLEAU
    const newImageFiles = Array.from(imageFiles);
    // ON CRÉE UN NOUVEAU TABLEAU EN DONNANT À CHAQUE IMAGE UN INDEX
    const imagesWithIndex = newImageFiles.map((image, index) => ({
        index,
        image
    }));

    /* ------------------------
    ----- FORM FUNCTIONS ------
    -------------------------*/
    function projectFormSubmit(event) {
        event.preventDefault();
        //RÉORGANISATION DES ELEMENTS 'RESIDENCY' PAR ORDRE CHRONOLOGIQUE
        displayLoader();
        setDisplayServerError(false);
        setDisplayError(false);
       
        const sortedResidenciesList = residenciesList.sort((a, b) => {
            const dateA = new Date(a.startDates);
            const dateB = new Date(b.startDates);
            return dateA - dateB;
        });
        //NETTOYAGE DU TABLEAU DES DATES 'REPRÉSENTATIONS' POUR EVITER LES CHAMPS ""
        const cleanedShowsList = showsList.map(show => ({
            ...show,
            dates: show.dates.filter(date => date && date !== '')
        }));
        //RÉORGANISATION DES ELEMENTS REPRÉSENTATIONS' PAR ORDRE CHRONOLOGIQUE
        const sortedShowsList = cleanedShowsList.sort((a, b) => {
            const dateA = new Date(a.dates[0]?.day);
            const dateB = new Date(b.dates[0]?.day);
            return dateA - dateB;
         });
        const token = window.sessionStorage.getItem('1');
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
        projectFormData.append('videoList', JSON.stringify(videoList));
        projectFormData.append('residenciesList', JSON.stringify(sortedResidenciesList));
        projectFormData.append('showsList', JSON.stringify(sortedShowsList));
        
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
            return;
        } else {
            if (projectFormMode==='add') {
                fetch(`${API_URL}/api/projects`, {
                    method: "POST",
                    headers: {
                        // 'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token,
                    },
                    body: projectFormData,
                    })
                    .then((response) => {
                        if (response.ok) {
                            hideLoader();
                            return response;
                        } else {
                            hideLoader();
                            setDisplayServerError(true);
                            throw new Error('La requête a échoué');
                        }
                    })
                    .then(()=> {
                        closeForm();
                    })
                    .catch((error) => {
                        console.error(error);
                        hideLoader();
                        setDisplayServerError(true);
                    });

            } else if (projectFormMode==='edit') {
                fetch(`${API_URL}/api/projects/${projectEdit._id}`, {
                    method: "PUT",
                    headers: {
                        // 'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token,
                    },
                    body: projectFormData,
                    })
                    .then((response) => {
                        if (response.ok) {
                            hideLoader();
                            return response;
                        } else {
                            hideLoader();
                            setDisplayServerError(true);
                            throw new Error('La requête a échoué');
                        }
                    })
                    .then(()=> {
                        closeForm();
                    })
                    .catch((error) => {
                        console.error(error);
                        hideLoader();
                        setDisplayServerError(true);
                    });
            }
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
    }, [projectEdit, handleDisplayProjectForm  ]);
    
    function clearTrixEditor() {
        const elements = document.querySelectorAll("trix-editor");
        elements.forEach(element => {
            const editor = element.editor;
            editor.setSelectedRange([0, 0]);
            editor.loadHTML(''); 
        });
    }

    /* ------------------------
    ----- CONFIRMBOX ------
    -------------------------*/
    function closeConfirmBox () {
        setConfirmBoxState(false);
    }

    function openConfirmBox () {
        setConfirmBoxState(true);
    }

    return  (      
        <form onSubmit={(event) => projectFormSubmit(event)} method="post" className='projectForm' ref={projectFormRef}>
            <button type='button' className='projectForm_stickyCancelButton' onClick={() => openConfirmBox ()}>
                <FontAwesomeIcon icon={faXmark} className='projectForm_stickyCancelButton_icon'/>
            </button>
            <div className='projectForm_projectImageField'>
                <DNDGallery imageFiles={imageFiles} setImageFiles={setImageFiles} mainImageIndex={mainImageIndex} setMainImageIndex={setMainImageIndex} />
                <div className={imageFiles.length < 11 ? 'projectForm_projectImageField_imageFile' : 'projectForm_projectImageField_imageFile--displayOff'}>
                    <label htmlFor='inputProjectImageFile'>{ isImageLoaded ? 'CHANGER D\'IMAGE' : '+ AJOUTER UNE IMAGE' }</label>
                    <input type='file' id='inputProjectImageFile' name="images" ref={inputProjectImageFileRef} onChange={displaySample} style={{ display: 'none' }}></input>
                    <div  className="projectForm_projectImageField_imageFile_sampleContainer">
                        <img id='imageSample' ref={projectMainImageSampleRef} src='' alt=''/>
                        <div className={isImageLoaded ? "projectForm_projectImageField_imageFile_sampleContainer_buttonsSystem--displayOn" :  "projectForm_projectImageField_imageFile_sampleContainer_buttonsSystem--displayOff"}>
                            <button aria-label="Ajouter l'image" onClick={handleAddImageFile} type="button">AJOUTER</button>
                            <button aria-label="Annuler" onClick={cancelAddImageFile} type="button">ANNULER</button>
                        </div>
                    </div>
                </div>
            </div>
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
            <Collapse title="PARAGRAPHES" style='edit'>
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
            </Collapse>
            {/* -----CRÉATION D'UN TABLEAU D'OBJETS  */}
            <Collapse title="ARTISTES" style='edit'>
                <div className='projectForm_projectArtistsList'>
                    {/* <p className='projectForm_projectArtistsList_title'> ARTISTES </p> */}
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
            </Collapse>
            <Collapse title="PRODUCTION" style='edit'>
                <div className='projectForm_projectProductionList'>
                    {/* <p className='projectForm_projectProductionList_title'> PRODUCTION </p> */}
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
            </Collapse>
            <Collapse title="PRESSE" style='edit'>
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
            </Collapse>
            <Collapse title="EXTRAITS VIDEOS" style='edit'>
                <div className='projectForm_projectVideoList'>
                    {/* <p className='projectForm_projectVideoList_title'> EXTRAITS VIDEOS </p> */}
                    {videoList.map((video, index) => (
                        <div key={index} className='projectForm_projectVideoList_line'>
                            <div>
                                <label htmlFor={`inputProjectVideoName${index}`}>NOM DE LA VIDEO</label>
                                <input
                                    type='text'
                                    id={`inputProjectVideoName${index}`}
                                    value={video.videoName}
                                    onChange={(e) => {
                                        const updatedVideoList = [...videoList];
                                        updatedVideoList[index].videoName = e.target.value;
                                        setVideoList(updatedVideoList);
                                    }}
                                ></input>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectVideoLink${index}`}>LIEN VERS LA VIDEO</label>
                                <input
                                    type='text'
                                    id={`inputProjectVideoLink${index}`}
                                    value={video.videoLink}
                                    onChange={(e) => {
                                        const updatedVideoList = [...videoList];
                                        updatedVideoList[index].videoLink = e.target.value;
                                        setVideoList(updatedVideoList);
                                    }}
                                ></input>
                            </div>
                            <button type='button' onClick={() => handleSupprVideo(index)}>SUPPRIMER</button>
                        </div>              
                    ))}
                    <button className='projectForm_projectVideoList_addButton' type='button' onClick={() =>handleAddVideo()} >+ AJOUTER EXTRAIT VIDEO</button>
                </div>
            </Collapse>
            <Collapse title="RÉSIDENCES" style='edit'>
                <div className='projectForm_projectResidenciesList'>
                    {/* <p className='projectForm_projectResidenciesList_title'> RÉSIDENCES </p> */}
                    <div className='projectForm_projectResidenciesList_container'>
                    {residenciesList.map((residency, index) => (
                        <div key={index} className='projectForm_projectResidenciesList_line'>
                            <div>
                                <label htmlFor={`inputProjectResidencyType${index}`}>TYPE DE RÉSIDENCE</label>
                                <select value={residency.residencyType}
                                    onChange={(e) => {
                                        const updatedResidenciesList = [...residenciesList];
                                        updatedResidenciesList[index].residencyType = e.target.value;
                                        setResidenciesList(updatedResidenciesList);
                                    }}>
                                    <option value=""></option>
                                    {residencyTypes.map((residencyType)=>(
                                    <option value={residencyType}>{residencyType}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectResidencyStartDates${index}`}>DÉBUT RÉSIDENCE</label>
                                <input
                                    type='date'
                                    id={`inputProjectResidencyStartDates${index}`}
                                    value={residency.startDates}
                                    onChange={(e) => {
                                        const updatedResidenciesList = [...residenciesList];
                                        updatedResidenciesList[index].startDates = e.target.value;

                                        // Mettre à jour la date de fin de résidence avec le jour suivant
                                        const nextDay = new Date(e.target.value);
                                        nextDay.setDate(nextDay.getDate() + 1);
                                        updatedResidenciesList[index].endDates = nextDay.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
                                        setResidenciesList(updatedResidenciesList);
                                    }}
                                ></input>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectResidencyEndDates${index}`}>FIN RÉSIDENCE</label>
                                <input
                                    type='date'
                                    id={`inputProjectResidencyEndDates${index}`}
                                    value={residency.endDates}
                                    min={residency.startDates}
                                    onChange={(e) => {
                                        const updatedResidenciesList = [...residenciesList];
                                        updatedResidenciesList[index].endDates = e.target.value;
                                        setResidenciesList(updatedResidenciesList);
                                    }}
                                ></input>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectResidencyCity${index}`}>COMMUNE</label>
                                <input
                                    type='text'
                                    id={`inputProjectResidencyCity${index}`}
                                    value={residency.city}
                                    onChange={(e) => {
                                        const updatedResidenciesList = [...residenciesList];
                                        updatedResidenciesList[index].city = e.target.value;
                                        setResidenciesList(updatedResidenciesList);
                                    }}
                                ></input>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectResidencyInfos${index}`}>INFOS+</label>
                                <input
                                    type='text'
                                    id={`inputProjectResidencyInfos${index}`}
                                    value={residency.moreInfos}
                                    onChange={(e) => {
                                        const updatedResidenciesList = [...residenciesList];
                                        updatedResidenciesList[index].moreInfos = e.target.value;
                                        setResidenciesList(updatedResidenciesList);
                                    }}
                                ></input>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectResidencyPlaceName${index}`}>SALLE, LIEU</label>
                                <input
                                    type='text'
                                    id={`inputProjectResidencyPlaceName${index}`}
                                    value={residency.placeName}
                                    onChange={(e) => {
                                        const updatedResidenciesList = [...residenciesList];
                                        updatedResidenciesList[index].placeName = e.target.value;
                                        setResidenciesList(updatedResidenciesList);
                                    }}
                                ></input>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectResidencyPlaceLink${index}`}>LIEN DE LA SALLE, DU LIEU</label>
                                <input
                                    type='text'
                                    id={`inputProjectResidencyPlaceLink${index}`}
                                    value={residency.placeLink}
                                    onChange={(e) => {
                                        const updatedResidenciesList = [...residenciesList];
                                        updatedResidenciesList[index].placeLink = e.target.value;
                                        setResidenciesList(updatedResidenciesList);
                                    }}
                                ></input>
                            </div>
                            <button className='projectForm_projectResidenciesList_line_supprButton' type='button' onClick={() => handleSupprResidency(index)}>SUPPRIMER</button>
                        </div>              
                    ))}
                    </div>
                    <button className='projectForm_projectResidenciesList_addButton' type='button' onClick={() =>handleAddResidency()} >+ AJOUTER UNE RÉSIDENCE</button>
                </div>
            </Collapse>
            <Collapse title="REPRÉSENTATIONS" style='edit'>
                <div className='projectForm_projectShowsList'>
                    {/* <p className='projectForm_projectShowsList_title'> REPRÉSENTATIONS </p> */}
                    <div className='projectForm_projectShowsList_container'>
                    {showsList?.map((show, index) => (
                    <div key={index}>
                        <div className='projectForm_projectShowsList_container_infos'>
                            <div>
                                <label htmlFor={`inputProjectShowCity${index}`}>COMMUNE DE REPRÉSENTATION:</label>
                                <input
                                    type='text'
                                    id={`inputProjectShowCity${index}`}
                                    value={show.city}
                                    onChange={(e) => {
                                        const updatedShowsList = [...showsList];
                                        updatedShowsList[index].city = e.target.value;
                                        setShowsList(updatedShowsList);
                                    }}
                                ></input>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectShowPlaceName${index}`}>LIEU DE REPRÉSENTATION</label>
                                <input
                                    type='text'
                                    id={`inputProjectShowPlaceName${index}`}
                                    value={show.placeName}
                                    onChange={(e) => {
                                        const updatedShowsList = [...showsList];
                                        updatedShowsList[index].placeName = e.target.value;
                                        setShowsList(updatedShowsList);
                                    }}
                                ></input>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectShowPlaceLink${index}`}>LIEN VERS LE LIEU</label>
                                <input
                                    type='text'
                                    id={`inputProjectShowPlaceLink${index}`}
                                    value={show.placeLink}
                                    onChange={(e) => {
                                        const updatedShowsList = [...showsList];
                                        updatedShowsList[index].placeLink = e.target.value;
                                        setShowsList(updatedShowsList);
                                    }}
                                ></input>
                            </div>
                            <div>
                                <label htmlFor={`inputProjectShowInfos${index}`}>INFOS+</label>
                                <input
                                    type='text'
                                    id={`inputProjectShowInfos${index}`}
                                    value={show.moreInfos}
                                    onChange={(e) => {
                                        const updatedShowsList = [...showsList];
                                        updatedShowsList[index].moreInfos = e.target.value;
                                        setShowsList(updatedShowsList);
                                    }}
                                ></input>
                            </div>
                        </div>
                        <div className='projectForm_projectShowsList_container_dates'>
                            <label htmlFor={`inputProjectShowDates${index}`}>DATES DE REPRÉSENTATION:</label>
                            <div className='projectForm_projectShowsList_container_dates_gridDisplay'>
                                {show.dates?.map((date, dateIndex)=>(
                                <div className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay'> 
                                    {/* <input
                                        className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_date'
                                        key={dateIndex}
                                        type='date'
                                        id={`inputProjectShowDates${index}`}
                                        value={date.day}
                                        onChange={(e) => {
                                            const updatedShowsList = [...showsList];
                                            updatedShowsList[index].dates[dateIndex].day = e.target.value;
                                            setShowsList(updatedShowsList);
                                        }}
                                    />
                                    <div> 
                                        <input
                                            className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_date'
                                            key={`inputProjectShowPeriodStartDate${dateIndex}`}
                                            type='date'
                                            id={`inputProjectShowPeriodStartdate${index}`}
                                            value={date.period?.startDate || ''}
                                            onChange={(e) => {
                                                const updatedShowsList = [...showsList];
                                                if (!updatedShowsList[index].dates[dateIndex].period) {
                                                    updatedShowsList[index].dates[dateIndex].period = {};
                                                }
                                                updatedShowsList[index].dates[dateIndex].period.startDate = e.target.value;
                                                setShowsList(updatedShowsList);
                                            }}
                                        />
                                        <input
                                            className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_date'
                                            key={`inputProjectShowPeriodEndDate${dateIndex}`}
                                            type='date'
                                            id={`inputProjectShowPeriodEnddate${index}`}
                                            value={date.period?.endDate || ''}
                                            onChange={(e) => {
                                                const updatedShowsList = [...showsList];
                                                if (!updatedShowsList[index].dates[dateIndex].period) {
                                                    updatedShowsList[index].dates[dateIndex].period = {};
                                                }
                                                updatedShowsList[index].dates[dateIndex].period.endDate = e.target.value;
                                                setShowsList(updatedShowsList);
                                            }}
                                        />
                                    </div> */}
                                    <DateInputSwitch
                                        dateIndex={dateIndex}
                                        index={index}
                                        date={date}
                                        showsList={showsList}
                                        setShowsList={setShowsList}
                                    />
                                    
                                    <div className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times'>
                                        {date.times?.map((time, timeIndex) => (
                                        <div className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_timeContainer'>
                                            <input
                                                className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_timeContainer_singleTime'
                                                key={`inputProjectShowDatesTimesTime${timeIndex}`}
                                                type='time'
                                                id={`inputProjectShowDatesTimesTime${timeIndex}`}
                                                value={time.time}
                                                onChange={(e) => {
                                                    const updatedShowsList = [...showsList];
                                                    updatedShowsList[index].dates[dateIndex].times[timeIndex].time = e.target.value;
                                                    setShowsList(updatedShowsList);
                                                }}
                                            />
                                            <label>INFOS SUPP.:</label>
                                            <input
                                                className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_timeContainer_moreInfosInput'
                                                key={`inputProjectShowDatesTimesInfos${timeIndex}`}
                                                type='text'
                                                id={`inputProjectShowDatesTimesInfos${timeIndex}`}
                                                value={time.timeInfos}
                                                onChange={(e) => {
                                                    const updatedShowsList = [...showsList];
                                                    updatedShowsList[index].dates[dateIndex].times[timeIndex].timeInfos = e.target.value;
                                                    setShowsList(updatedShowsList);
                                                }}
                                            />
                                            <button className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_timeContainer_supprButton' type="button" onClick={() =>handleSupprSameDateTime(index, dateIndex, timeIndex)} >SUPPR HORAIRE</button>
                                        </div>
                                        ))}
                                        <button className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_addButton' type="button" onClick={() =>handleAddSameDateTime(index, dateIndex)} >+HORAIRE</button>
                                    </div>
                                    <button className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_supprButton' type="button" onClick={() =>handleSupprSameShowDate(index, dateIndex)} >SUPPRIMER DATE</button>
                                </div>
                                ))}
                                <button className='projectForm_projectShowsList_container_dates_gridDisplay_addButton' type="button" onClick={() =>handleAddSameShowDate(index)} >+AJOUTER UNE DATE</button>
                            </div>
                        </div>
                        <button className='projectForm_projectShowsList_container_supprButton' type='button' onClick={() => handleSupprShow(index)}>SUPPRIMER LIEU</button>
                    </div>              
                    ))}
                    </div>
                    <button className='projectForm_projectShowsList_addButton' type='button' onClick={() =>handleAddShow()} >+ AJOUTER UN LIEU</button>
                </div>
            </Collapse>
            <Collapse title="DOSSIERS" style='edit'>
                <div className='projectForm_projectPdfFile'>
                    {/* <p className='projectForm_projectPdfFile_title'>DOSSIERS</p> */}
                    <div className='projectForm_projectPdfFile_pdfContainer'>
                    {pdfFiles?.map((pdf, index) => (
                        <div key={index}>
                            <p>{pdf.pdfName}</p>
                            <label htmlFor='inputProjectPdfName'>NOM DU PDF</label>
                            <input 
                                type='text' 
                                id='inputProjectPdfName'
                                name="pdfName"
                                value={projectFormMode === 'edit' ? (pdf.pdfName || "") : ''} 
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
                    <div  className="projectForm_projectPdfFile_sampleContainer">
                        <img id='pdfSample' ref={projectPdfSampleRef} src='' alt=''/>
                        <div className={isPdfLoaded ? "projectForm_projectPdfFile_sampleContainer_buttonsSystem--displayOn" : "projectForm_projectPdfFile_sampleContainer_buttonsSystem--displayOff"}>
                            <button aria-label="Ajouter le PDF" onClick={handleAddPdfFile} type="button">AJOUTER</button>
                            <button aria-label="Annuler" onClick={cancelAddPdfFile} type="button">ANNULER</button>
                        </div>
                    </div>
                    <label className={isPdfLoaded ? 'projectForm_projectPdfFile_addButton--displayOff' : 'projectForm_projectPdfFile_addButton'} htmlFor='inputProjectPdfFile'>+ AJOUTER UN FICHIER</label>
                    <input type='file' id='inputProjectPdfFile' name="pdfFiles" ref={inputProjectPdfFileRef} onChange={displayPdfSample}></input>
                </div>
            </Collapse>
            <ErrorText errorText={"Une erreur s\'est produite"} state={displayServerError}/>
            <ErrorText errorText={"Tous les champs marqués d'une * doivent être remplis"} state={displayError}/>
            <div className='projectForm_buttons'>
                <button type='submit'>VALIDER</button>
                <button type='button' onClick={() => openConfirmBox ()}>ANNULER</button>
            </div>
            <ConfirmBox 
                affirmativeChoice={closeForm} 
                confirmBoxState={confirmBoxState}
                negativeChoice={closeConfirmBox}
            />
            <div className={loaderDisplay===true?'homePage_loader--displayOn':'homePage_loader--displayOff'}>
                <Loader className='loader--opaque' loaderDisplay={loaderDisplay}/>
            </div>
        </form>
    )
}

export default ProjectForm