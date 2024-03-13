import './ProjectForm.scss'
import { API_URL } from '../../utils/constants'
import {useRef, useState, useEffect, useContext } from 'react'
import { Context } from '../../utils/Context'
import * as pdfjsLib from "pdfjs-dist/webpack"
import { v4 as uuidv4 } from 'uuid'
import DOMPurify from 'dompurify';
import DNDGallery from '../../components/DNDGallery/DNDGallery'

function ProjectForm({ 
        projectEdit, 
        projectFormMode, 
        setHandleDisplayProjectForm, 
        artistsList, 
        setArtistsList, 
        productionList, 
        setProductionList, 
        pressList, 
        setPressList, 
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

    const { projectStates, projectTypes, handleLoadProjects, productionFunctions, residencyTypes } = useContext(Context);

    console.log(projectEdit);

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

    useEffect(() => {
        if (projectFormMode === 'edit' && projectEdit) {
            setProjectTitle(projectEdit.title);
            setProjectSubtitle(projectEdit.subtitle);
            setProjectState(projectEdit.projectState);
            setProjectType(projectEdit.projectType);
            setProjectDuration(projectEdit.duration);
            setProjectCreationDate(projectEdit.creationDate);
            setProjectDescription(cleanedDescription);
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
    }, [projectFormMode, projectEdit]);

    const cleanedDescription = DOMPurify.sanitize(projectEdit?.description);

    const [projectTitle, setProjectTitle] = useState('')
    const [projectSubtitle, setProjectSubtitle] = useState('')
    const [projectState, setProjectState] = useState('')
    const [projectType, setProjectType] = useState('')
    const [projectDuration, setProjectDuration] = useState('')
    const [projectCreationDate, setProjectCreationDate] = useState('')
    const [projectDescription, setProjectDescription] = useState('')
    const [projectMoreInfos, setProjectMoreInfos] = useState('')

    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [newImage, setNewImage] = useState(null);

    const [isPdfLoaded, setIsPdfLoaded] = useState(false);
    const [newPdf, setNewPdf] = useState(null);

    const handleSelectChange = (index, value) => {
        const updatedResidenciesList = [...residenciesList];
        updatedResidenciesList[index].residencyType = value;
        setResidenciesList(updatedResidenciesList);
      };

    const handleSelectProductionFunctionChange = (index, value) => {
    const updatedProductionList = [...productionList];
    updatedProductionList[index].productionFunction = value;
    setProductionList(updatedProductionList);
    };

    /* ---------------------------
    ----- ARTISTS LIST -----------
    ----------------------------*/

    const handleAddArtist = () => {
        setArtistsList([...artistsList, { artistFunction: '', artistName: '' }]);
    };
    const handleSupprArtist = (index) => {
        setArtistsList (artistsList.filter((_, i) => i !== index));
    }
    
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
    ----- PRESS LIST -----------
    -------------------------*/

    const handleAddPress = () => {
        setPressList([...pressList, { quote: '', mediaName: ''}]);
    };
    const handleSupprPress = (index) => {
        setPressList (pressList.filter((_, i) => i !== index));
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
        setResidenciesList([...residenciesList, { residencyType: '', startDates: '', endDates: '', city: '', placeName: '', placeLink: ''}]);
    };
    const handleSupprResidency = (index) => {
        setResidenciesList (residenciesList.filter((_, i) => i !== index));
    }

    /* ------------------------
    ----- SHOWS LIST -----------
    -------------------------*/

    const handleAddShow = () => {
        setShowsList([...showsList, { dates: [''], city: '', placeName: '', placeLink: '', showsNumber:''}]);
    };
    const handleSupprShow = (index) => {
        setShowsList (showsList.filter((_, i) => i !== index));
    }

    const handleAddSameShowDate = (index) => {
        const updatedShowsList = [...showsList];
        if (!updatedShowsList[index].dates) {
            updatedShowsList[index].dates = ['']; // Si show.dates n'existe pas encore, créez-le comme un tableau avec une date vide
        } else {
            updatedShowsList[index].dates.push(''); // Sinon, ajoutez simplement une date vide
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

    /* ------------------------
    ----- FORM FUNCTIONS ------
    -------------------------*/

    function projectFormSubmit(event) {

        event.preventDefault();

        const sortedResidenciesList = residenciesList.sort((a, b) => {
            const dateA = new Date(a.startDates);
            const dateB = new Date(b.startDates);
            return dateA - dateB;
        });

        const cleanedShowsList = showsList.map(show => ({
            ...show,
            dates: show.dates.filter(date => date && date !== '')
        }));

        const sortedShowsList = cleanedShowsList.sort((a, b) => {
            const dateA = new Date(a.dates[0]);
            const dateB = new Date(b.dates[0]);
            return dateA - dateB;
         });

        // const token = window.sessionStorage.getItem('1');
        const projectFormData = new FormData();
        projectFormData.append('title', inputProjectTitleRef.current.value);
        projectFormData.append('subtitle', inputProjectSubtitleRef.current.value);
        projectFormData.append('projectState', inputProjectStateRef.current.value);
        projectFormData.append('projectType', inputProjectTypeRef.current.value);
        projectFormData.append('creationDate', inputProjectCreationDateRef.current.value);
        projectFormData.append('duration', inputProjectDurationRef.current.value);
        projectFormData.append('description', inputProjectDescriptionRef.current.value);
        projectFormData.append('moreInfos', inputProjectMoreInfosRef.current.value);
        projectFormData.append('mainImageIndex', mainImageIndex);
        projectFormData.append('artistsList', JSON.stringify(artistsList));
        projectFormData.append('productionList', JSON.stringify(productionList));
        projectFormData.append('pressList', JSON.stringify(pressList));
        projectFormData.append('videoList', JSON.stringify(videoList));
        projectFormData.append('residenciesList', JSON.stringify(sortedResidenciesList));
        projectFormData.append('showsList', JSON.stringify(sortedShowsList));
        
        const newImageFiles = Array.from(imageFiles);
        const newPdfFiles = Array.from(pdfFiles);
        const pdfWithIndex = newPdfFiles.map((pdf, index) => ({
            index,
            pdf,
        }));
        pdfWithIndex.forEach(({ index, pdf }) => {
            if (pdf instanceof File) {
                projectFormData.append('pdfFiles', pdf);
                projectFormData.append('pdfFileIndexes', index);
                projectFormData.append('pdfName', pdf.pdfName)
            } else {
                projectFormData.append(`existingPdf[${index}]`, JSON.stringify(pdf));
            }
        });
        const imagesWithIndex = newImageFiles.map((image, index) => ({
            index,
            image
        }));
        imagesWithIndex.forEach(({ index, image }) => {
            if (image instanceof File) {
                projectFormData.append('images', image);
                projectFormData.append('fileIndexes', index)
            } else {
                projectFormData.append(`existingImages[${index}]`, JSON.stringify(image));
            }
        });
        if (projectFormMode==='add') {
            fetch(`${API_URL}/api/projects`, {
                method: "POST",
                headers: {
                    // 'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ' + token,
                },
                body: projectFormData,
                })
                .then((response) => {
                    if (response.ok) {
                        return response;
                    } else {
                        throw new Error('La requête a échoué');
                    }
                })
                .then(()=> {
                    closeForm();
                })
                .catch((error) => console.error(error));
        } else if (projectFormMode==='edit') {
            fetch(`${API_URL}/api/projects/${projectEdit._id}`, {
                method: "PUT",
                headers: {
                    // 'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ' + token,
                },
                body: projectFormData,
                })
                .then((response) => {
                    if (response.ok) {
                        return response;
                    } else {
                        throw new Error('La requête a échoué');
                    }
                })
                .then(()=> {
                    closeForm();
                })
                .catch((error) => console.error(error));
        }
    }
    function closeForm() {
        setHandleDisplayProjectForm(false);
        handleLoadProjects();
    }

    /* -----------------------
    ----- IMAGES FIELDS ------
    ------------------------*/

    function displaySample() {
            const image = inputProjectImageFileRef.current.files[0];
            if (image) {
                setNewImage (image);
                const id = uuidv4(); // Générez un identifiant unique
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
        setIsImageLoaded(false);
        cancelAddImageFile();
    }

    /* --------------------
    ----- PDF FIELDS ------
    ---------------------*/

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

    
    async function displayPdfSample(event) {
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
        setIsImageLoaded(true);
        } else {
        setIsImageLoaded(false);
        }
    }

    function handleAddPdfFile() {
        if (newPdf) {
            const updatedPdfFiles = [...pdfFiles, newPdf];
            setPdfFiles(updatedPdfFiles);
        }
        setIsPdfLoaded(false);
        cancelAddPdfFile();
    }

    function handleSupprPdf(index) {
        console.log(pdfFiles.length);
        setPdfFiles(pdfFiles.splice(index, 1));
        console.log(index);
        console.log(pdfFiles);
    }  

    function cancelAddPdfFile() {
        setNewPdf (null);
        setIsPdfLoaded(false);
        projectPdfSampleRef.current.setAttribute("src", "");
        projectPdfSampleRef.current.setAttribute("alt", "");
    }

    return  (      
        <form onSubmit={(event) => projectFormSubmit(event)} method="post" className='projectForm'>

            <div className='projectForm_projectImageField'>
                <DNDGallery imageFiles={imageFiles} setImageFiles={setImageFiles} mainImageIndex={mainImageIndex} setMainImageIndex={setMainImageIndex} />
                <div className='projectForm_projectImageField_imageFile'>
                    <label htmlFor='inputProjectImageFile'>{isImageLoaded ? 'CHANGER D\'IMAGE' : '+ AJOUTER UNE IMAGE'}</label>
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
            <div className='projectForm_projectDescription'>
                <label htmlFor='inputProjectDescription'>DESCRIPTION</label>
                <textarea type='textarea' id='inputProjectDescription' ref={inputProjectDescriptionRef} value={projectDescription?.replace(/<br>/g, "\n")} onChange={(e) =>setProjectDescription(e.target.value)}></textarea>
            </div>
            <div className='projectForm_projectMoreInfos'>
                <label htmlFor='inputProjectMoreInfos'>PLUS D'INFOS</label>
                <input type='text' id='inputProjectMoreInfos' ref={inputProjectMoreInfosRef} value={projectMoreInfos} onChange={(e) =>setProjectMoreInfos(e.target.value)}></input>
            </div>
            
            {/* -----CRÉATION D'UN TABLEAU D'OBJETS  */}

            <div className='projectForm_projectArtistsList'>
                <p> ARTISTES </p>
                {artistsList.map((artist, index) => (
                    <div key={index} className='projectForm_projectArtistsList_line'>
                        <div>
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
                        <div>
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
                <button type='button' onClick={() =>handleAddArtist()} >+ AJOUTER UN ARTISTE</button>
            </div>

            <div className='projectForm_projectProductionList'>
                <p> PRODUCTION </p>
                {productionList.map((production, index) => (
                    <div key={index} className='projectForm_projectProductionList_line'>
                        <div>
                            <label htmlFor={`inputProjectProductionFunction${index}`}>FONCTION</label>
                            <select value={production.productionFunction}
                                    onChange={(e) => handleSelectProductionFunctionChange(index, e.target.value)}>
                                <option value=""></option>
                                {productionFunctions.map((productionFunction) => (
                                    <option value={productionFunction}>{productionFunction}</option>
                                ))}
                            </select>
                        </div>
                        <div>
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
                <button type='button' onClick={() =>handleAddProduction()} >+ AJOUTER UN MEMBRE DE L'EQUIPE DE PROD</button>
            </div>
            
            <div className='projectForm_projectPressList'>
                <p> PRESSE </p>
                {pressList.map((press, index) => (
                    <div key={index} className='projectForm_projectPressList_line'>
                        <div>
                            <label htmlFor={`inputProjectPressQuote${index}`}>EXTRAIT</label>
                            <input
                                type='textarea'
                                id={`inputProjectPressQuote${index}`}
                                value={press.quote}
                                onChange={(e) => {
                                    const updatedPressList = [...pressList];
                                    updatedPressList[index].quote = e.target.value;
                                    setPressList(updatedPressList);
                                }}
                            ></input>
                        </div>
                        <div>
                            <label htmlFor={`inputProjectPressMediaName${index}`}>NOM DU MEDIA</label>
                            <input
                                type='text'
                                id={`inputProjectPressMediaName${index}`}
                                value={press.mediaName}
                                onChange={(e) => {
                                    const updatedPressList = [...pressList];
                                    updatedPressList[index].mediaName = e.target.value;
                                    setPressList(updatedPressList);
                                }}
                            ></input>
                        </div>
                        <button type='button' onClick={() => handleSupprPress(index)}>SUPPRIMER</button>
                    </div>              
                ))}
                <button type='button' onClick={() =>handleAddPress()} >+ AJOUTER UN ARTICLE DE PRESSE</button>
            </div>

            <div className='projectForm_projectVideoList'>
                <p> EXTRAITS VIDEO </p>
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
                <button type='button' onClick={() =>handleAddVideo()} >+ AJOUTER UN EXTRAIT VIDEO</button>
            </div>

            <div className='projectForm_projectResidenciesList'>
                <p> RÉSIDENCES </p>
                {residenciesList.map((residency, index) => (
                    <div key={index} className='projectForm_projectResidenciesList_line'>
                        <div>
                            <label htmlFor={`inputProjectResidencyType${index}`}>TYPE DE RÉSIDENCE</label>
                            <select value={residency.residencyType}
                                    onChange={(e) => handleSelectChange(index, e.target.value)}>
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
                        <button type='button' onClick={() => handleSupprResidency(index)}>SUPPRIMER</button>
                    </div>              
                ))}
                <button type='button' onClick={() =>handleAddResidency()} >+ AJOUTER UNE RÉSIDENCE</button>
            </div>

            <div className='projectForm_projectResidenciesList'>
                <p> REPRÉSENTATIONS </p>
                {showsList?.map((show, index) => (
                    <div key={index} className='projectForm_projectResidenciesList_line'>
                        <div>
                            <label htmlFor={`inputProjectShowDates${index}`}>DATES DE REPRÉSENTATION</label>
                            {show.dates.map((date, dateIndex)=>(
                                <div> 
                                    <input
                                        key={dateIndex}
                                        type='datetime-local'
                                        id={`inputProjectShowDates${index}`}
                                        value={date}
                                        onChange={(e) => {
                                            const updatedShowsList = [...showsList];
                                            updatedShowsList[index].dates[dateIndex] = e.target.value;
                                            setShowsList(updatedShowsList);
                                        }}
                                    />
                                    <button type="button" onClick={() =>handleSupprSameShowDate(index, dateIndex)} >SUPPR</button>
                                </div>
                            ))}
                            <button type="button" onClick={() =>handleAddSameShowDate(index)} >+</button>
                        </div>
                        <div>
                            <label htmlFor={`inputProjectShowCity${index}`}>COMMUNE DE REPRÉSENTATION</label>
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
                        
                        <button type='button' onClick={() => handleSupprShow(index)}>SUPPRIMER</button>
                    </div>              
                ))}
                <button type='button' onClick={() =>handleAddShow()} >+ AJOUTER UNE REPRÉSENTATION</button>
            </div>

            <div className='projectForm_projectPdfFile'>
                <p>DOSSIERS</p>
                {pdfFiles.map((pdf, index) => ( 
                    <div className='projectForm_projectPdfFile'>
                        <img id='imageSample' src={pdf.pdfLink} alt=''/>
                        <label htmlFor='inputProjectPdfName'>NOM DU PDF</label>
                        <input 
                            type='text' 
                            id='inputProjectPdfName' 
                            name="pdfName" 
                            defaultValue={projectFormMode==='edit'? (projectEdit.pdfList[index]?.pdfName || null) : null} 
                            // onChange={(index) =>handleEditPdfFile(index)}
                            onChange={(e) => {
                                const updatedPdfFiles = [...pdfFiles];
                                updatedPdfFiles[index].pdfName = e.target.value;
                                setPdfFiles(updatedPdfFiles);
                            }}
                            >
                        </input>
                        <button type='button' onClick={() => handleSupprPdf(index)}>SUPPRIMER</button>
                    </div>
                ))}
                <label htmlFor='inputProjectPdfFile'>{isImageLoaded ? 'CHANGER DE FICHIER' : '+ AJOUTER UN FICHIER'}</label>
                <input type='file' id='inputProjectPdfFile' name="pdfFiles" ref={inputProjectPdfFileRef} onChange={displayPdfSample}></input>
                <div  className="projectForm_projectPdfFile_sampleContainer">
                    <img id='pdfSample' ref={projectPdfSampleRef} src='' alt=''/>
                    <div className={isPdfLoaded ? "projectForm_projectPdfFile_sampleContainer_buttonsSystem--displayOn" : "projectForm_projectPdfFile_sampleContainer_buttonsSystem--displayOff"}>
                        <button aria-label="Ajouter le PDF" onClick={handleAddPdfFile} type="button">AJOUTER</button>
                        <button aria-label="Annuler" onClick={cancelAddPdfFile} type="button">ANNULER</button>
                    </div>
                </div>
            </div>


            <div className='projectForm_buttons'>
                <button type='submit'>VALIDER</button>
                <button type='button' onClick={() => closeForm()}>ANNULER</button>
            </div>
        </form>
    )
}

export default ProjectForm