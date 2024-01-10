import './ProjectForm.scss'
import { API_URL } from '../../utils/constants'
// import { Link } from 'react-router-dom'
import {useRef, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import DNDGallery from '../../components/DNDGallery/DNDGallery'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

function ProjectForm({ projectEdit, projectFormMode, artistsList, setArtistsList, productionList, setProductionList, pressList, setPressList, videoList, setVideoList, residenciesList, setResidenciesList, showsList, setShowsList }) {

    const inputProjectTitleRef = useRef(null);
    const inputProjectSubtitleRef = useRef(null);
    const inputProjectStateRef = useRef(null);
    const inputProjectDurationRef = useRef(null);
    const inputProjectCreationDateRef = useRef(null);
    const inputProjectDescriptionRef = useRef(null);
    const inputProjectMoreInfosRef = useRef(null);

    const projectMainImageSampleRef = useRef (null);
    const inputProjectMainImageFileRef = useRef (null);

    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [mainImageIndex, setMainImageIndex]=  useState(0);
     
    // const [isImageLoaded, setIsImageLoaded] = useState(false);
    
    /* ---------------------------
    ----- ARTISTS LIST -----------
    ----------------------------*/

    const handleAddArtist = () => {
        setArtistsList([...artistsList, { artistFunction: '', artistName: '', artistSurname: '' }]);
    };
    const handleSupprArtist = (index) => {
        setArtistsList (artistsList.filter((_, i) => i !== index));
    }


    /* ------------------------
    ----- PROD LIST -----------
    -------------------------*/

    const handleAddProduction = () => {
        setProductionList([...productionList, { productionFunction: '', productionName: '', productionSurname: '' }]);
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
        setResidenciesList([...residenciesList, { residencyType: '', dates: '', city: '', placeName: '', placeLink: ''}]);
    };
    const handleSupprResidency = (index) => {
        setResidenciesList (residenciesList.filter((_, i) => i !== index));
    }

    /* ------------------------
    ----- SHOWS LIST -----------
    -------------------------*/

    const handleAddShow = () => {
        setShowsList([...showsList, { dates: '', city: '', placeName: '', placeLink: '', showsNumber:''}]);
    };
    const handleSupprShow = (index) => {
        setShowsList (showsList.filter((_, i) => i !== index));
    }


    /* ------------------------
    ----- FORM FUNCTIONS ------
    -------------------------*/


    function projectFormSubmit(event) {
        event.preventDefault();
        // const token = window.sessionStorage.getItem('1');
        const projectFormData = new FormData();

        
        projectFormData.append('title', inputProjectTitleRef.current.value);
        projectFormData.append('subtitle', inputProjectSubtitleRef.current.value);
        projectFormData.append('state', inputProjectStateRef.current.value);
        projectFormData.append('duration', inputProjectDurationRef.current.value);
        projectFormData.append('description', inputProjectDescriptionRef.current.value);
        projectFormData.append('moreInfos', inputProjectMoreInfosRef.current.value);
        projectFormData.append('artistsList', JSON.stringify(artistsList));
        projectFormData.append('productionList', JSON.stringify(productionList));
        projectFormData.append('pressList', JSON.stringify(pressList));
        projectFormData.append('videoList', JSON.stringify(videoList));
        projectFormData.append('residenciesList', JSON.stringify(residenciesList));
        projectFormData.append('showsList', JSON.stringify(showsList));
        const newImageFiles = Array.from(imageFiles);
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
            console.log('edit');
            fetch(`${API_URL}/api/biographies/${projectEdit._id}`, {
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


    // function displaySample() {
    //     if(!inputBioImageFileRef.current.files || inputBioImageFileRef.current.files.length === 0) {
    //         setIsImageLoaded(false);
    //         return
    //     } else {
    //         const file = inputBioImageFileRef.current.files[0]; // récupération du fichier image dans le formulaire
    //         const reader = new FileReader(); // un objet FileReader est créé pour lire le contenu du fichier image sélectionné.
    //         reader.readAsDataURL(file); // lecture du fichier image récupéré comme adresse url
    //         reader.onload = function() { // création des attributs de l'image (src, alt, class)
    //             bioImageSampleRef.current.setAttribute("src", reader.result);
    //             bioImageSampleRef.current.setAttribute("alt", "");
    //             bioImageSampleRef.current.setAttribute("class", "bioForm_sampleContainer_img--displayOn");
    //         }
    //         setIsImageLoaded(true);
    //     }
    // }

    // function resetFields() {
    //     inputBioImageFileRef.current.value = null;
    //     inputSurnameRef.current.value = null;
    //     inputNameRef.current.value = null;
    //     inputRoleRef.current.value = null;
    //     inputBioRef.current.value = null;
    //     inputFieldRef.current.value = null;
    //     bioImageSampleRef.current.setAttribute("src", "");
    //     bioImageSampleRef.current.setAttribute("alt", "");
    //     bioImageSampleRef.current.setAttribute("class", "bioForm_sampleContainer_img--displayOff");
    // }

    function closeForm() {
        
    }


    function displaySample(event) {

            const image = inputProjectMainImageFileRef.current.files[0];
            
            if (image) {
                setNewImage (image);
                const id = uuidv4(); // Générez un identifiant unique
                image._id = id;
                image.sampleImageUrl= URL.createObjectURL(image);
                projectMainImageSampleRef.current.setAttribute("src", image.sampleImageUrl);
                projectMainImageSampleRef.current.setAttribute("alt", "");
                // projectMainImageSampleRef.current.setAttribute("class", "");
                setIsImageLoaded(true);
                if (newImage) {
                    console.log('new')
                } else {
                    console.log('null')
                }
                
            } else {
                setIsImageLoaded(false);
            }    
    }

    function handleAddFile() {

        if (newImage) {
            const updatedImageFiles = [...imageFiles, newImage];
            setImageFiles(updatedImageFiles);
            // setSerieObject({
            //     ...serieObject,
            //     images: updatedImageFiles
            // });
        }
        setIsImageLoaded(false);
        cancelAddFile();
        
    }

    function cancelAddFile() {
        setNewImage (null);
        setIsImageLoaded(false);
        projectMainImageSampleRef.current.setAttribute("src", "");
        projectMainImageSampleRef.current.setAttribute("alt", "");
    }
    

    return  (      
        <form onSubmit={(event) => projectFormSubmit(event)} method="post" className='projectForm'>


            <DNDGallery imageFiles={imageFiles} setImageFiles={setImageFiles} mainImageIndex={mainImageIndex} setMainImageIndex={setMainImageIndex} />
            <div className='projectForm_projectImageFile'>
                <label htmlFor='inputProjectImageFile'>{isImageLoaded ? 'CHANGER D\'IMAGE' : '+ AJOUTER UNE IMAGE'}</label>
                <input type='file' id='inputProjectImageFile' name="images" ref={inputProjectMainImageFileRef} onChange={displaySample}></input>
                <div  className="projectForm_sampleContainer">
                    <img id='imageSample' ref={projectMainImageSampleRef} src='' className="projectForm_sampleContainer_img" alt=''/>
                    <div>
                        <button aria-label="Ajouter l'image" onClick={handleAddFile} type="button">AJOUTER</button>
                        <button aria-label="Annuler" onClick={cancelAddFile} type="button">ANNULER</button>
                    </div>
                </div>
            </div>



            <div className='projectForm_projectTitle'>
                <label htmlFor='inputProjectTitle'>TITRE*</label>
                <input type='text' id='inputProjectTitle' ref={inputProjectTitleRef} defaultValue={projectFormMode==='edit'? projectEdit.title : null}></input>
            </div>
            <div className='projectForm_projectSubtitle'>
                <label htmlFor='inputProjectSubtitle'>SOUS-TITRE</label>
                <input type='text' id='inputProjectSubtitle' ref={inputProjectSubtitleRef} defaultValue={projectFormMode==='edit'? projectEdit.subtitle : null}></input>
            </div>
            <div className='projectForm_projectState'>
                <label htmlFor='inputProjectState'>ÉTAT*</label>
                <select id='inputProjectState' ref={inputProjectStateRef} name="projectState" defaultValue={projectFormMode==='edit'? projectEdit.projectState : 'en création'} >
                    <option value="en création">En création</option>
                    <option value="en tournée">En tournée</option>
                    <option value="archivé">Archivé</option>
                </select>
            </div>
            <div className='projectForm_projectDuration'>
                <label htmlFor='inputProjectDuration'>DURÉE</label>
                <input type='text' id='inputProjectDuration' ref={inputProjectDurationRef} defaultValue={projectFormMode==='edit'? projectEdit.duration : null}></input>
            </div>
            <div className='projectForm_projectCreationDate'>
                <label htmlFor='inputProjectCreationDate'>DATE DE CRÉATION</label>
                <input type='text' id='inputProjectCreationDate' ref={inputProjectCreationDateRef} defaultValue={projectFormMode==='edit'? projectEdit.creationDate : null}></input>
            </div>
            <div className='projectForm_projectDescription'>
                <label htmlFor='inputProjectDescription'>DESCRIPTION</label>
                <input type='textarea' id='inputProjectDescription' ref={inputProjectDescriptionRef} defaultValue={projectFormMode==='edit'? projectEdit.description : null}></input>
            </div>
            <div className='projectForm_projectMoreInfos'>
                <label htmlFor='inputProjectMoreInfos'>PLUS D'INFOS</label>
                <input type='text' id='inputProjectMoreInfos' ref={inputProjectMoreInfosRef} defaultValue={projectFormMode==='edit'? projectEdit.moreInfos : null}></input>
            </div>

            {/* -----CRÉATION D'UN TABLEAU D'OBJETS  */}

            <div className='projectForm_projectArtistsList'>
                <p> ARTISTES </p>
                {artistsList.map((artist, index) => (
                    <div key={index}>
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
                            <label htmlFor={`inputProjectArtistSurname${index}`}>NOM</label>
                            <input
                                type='text'
                                id={`inputProjectArtistSurname${index}`}
                                value={artist.artistSurname}
                                onChange={(e) => {
                                    const updatedArtistsList = [...artistsList];
                                    updatedArtistsList[index].artistSurname = e.target.value;
                                    setArtistsList(updatedArtistsList);
                                }}
                            ></input>
                        </div>
                        <div>
                            <label htmlFor={`inputProjectArtistName${index}`}>PRÉNOM</label>
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
                    <div key={index}>
                        <div>
                            <label htmlFor={`inputProjectProductionFunction${index}`}>FONCTION</label>
                            <input
                                type='text'
                                id={`inputProjectProductionFunction${index}`}
                                value={production.productionFunction}
                                onChange={(e) => {
                                    const updatedProductionList = [...productionList];
                                    updatedProductionList[index].productionFunction = e.target.value;
                                    setProductionList(updatedProductionList);
                                }}
                            ></input>
                        </div>
                        <div>
                            <label htmlFor={`inputProjectProductionSurname${index}`}>NOM</label>
                            <input
                                type='text'
                                id={`inputProjectProductionSurname${index}`}
                                value={production.productionSurname}
                                onChange={(e) => {
                                    const updatedProductionList = [...productionList];
                                    updatedProductionList[index].productionSurname = e.target.value;
                                    setProductionList(updatedProductionList);
                                }}
                            ></input>
                        </div>
                        <div>
                            <label htmlFor={`inputProjectProductionName${index}`}>PRÉNOM</label>
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
                    <div key={index}>
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
                    <div key={index}>
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
                    <div key={index}>
                        <div>
                            <label htmlFor={`inputProjectResidencyType${index}`}>TYPE DE RÉSIDENCE</label>
                            <input
                                type='text'
                                id={`inputProjectResidencyType${index}`}
                                value={residency.residencyType}
                                onChange={(e) => {
                                    const updatedResidenciesList = [...residenciesList];
                                    updatedResidenciesList[index].residencyType = e.target.value;
                                    setResidenciesList(updatedResidenciesList);
                                }}
                            ></input>
                        </div>
                        <div>
                            <label htmlFor={`inputProjectResidencyDates${index}`}>DATES DE LA RÉSIDENCE</label>
                            <input
                                type='text'
                                id={`inputProjectResidencyDates${index}`}
                                value={residency.dates}
                                onChange={(e) => {
                                    const updatedResidenciesList = [...residenciesList];
                                    updatedResidenciesList[index].dates = e.target.value;
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
                {showsList.map((show, index) => (
                    <div key={index}>
                        <div>
                            <label htmlFor={`inputProjectShowDates${index}`}>DATES DE REPRÉSENTATION</label>
                            <input
                                type='text'
                                id={`inputProjectShowDates${index}`}
                                value={show.dates}
                                onChange={(e) => {
                                    const updatedShowsList = [...showsList];
                                    updatedShowsList[index].dates = e.target.value;
                                    setShowsList(updatedShowsList);
                                }}
                            ></input>
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


            <div className='projectForm_buttons'>
                <button type='submit'>VALIDER</button>
                <button type='button' onClick={() => closeForm()}>ANNULER</button>
            </div>
        </form>
    )
}

export default ProjectForm