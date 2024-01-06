import './ProjectForm.scss'
import { API_URL } from '../../utils/constants'
// import { Link } from 'react-router-dom'
import {useRef, useState } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function ProjectForm({ projectEdit, projectFormMode }) {

    const inputProjectTitleRef = useRef(null);
    const inputProjectSubtitleRef = useRef(null);
    const inputProjectStateRef = useRef(null);
    const inputProjectDurationRef = useRef(null);
    const inputProjectCreationDateRef = useRef(null);
    const inputProjectDescriptionRef = useRef(null);
    const inputProjectMoreInfosRef = useRef(null);
    const inputProjectArtistFunctionRef = useRef(null);
    const inputProjectArtistNameRef = useRef(null);
    const inputProjectArtistSurnameRef = useRef(null);


    // const [isImageLoaded, setIsImageLoaded] = useState(false);


    function projectFormSubmit(event) {
        console.log('youhou');
    //     event.preventDefault();
    //     // const token = window.sessionStorage.getItem('1');
    //     const bioFormData = new FormData();

    //     bioFormData.append('image', inputBioImageFileRef.current.files[0]);
    //     bioFormData.append('surname', inputSurnameRef.current.value);
    //     bioFormData.append('name', inputNameRef.current.value);
    //     bioFormData.append('role', inputRoleRef.current.value);
    //     bioFormData.append('biography', inputBioRef.current.value);
    //     bioFormData.append('field', inputFieldRef.current.value);
        
    //     if (bioFormMode==='add') {
    //         fetch(`${API_URL}/api/biographies`, {
    //             method: "POST",
    //             headers: {
    //                 // 'Content-Type': 'application/json',
    //                 // 'Authorization': 'Bearer ' + token,
    //             },
    //             body: bioFormData,
    //             })
    //             .then((response) => {
    //                 if (response.ok) {
    //                     return response;
    //                 } else {
    //                     throw new Error('La requête a échoué');
    //                 }
    //             })
    //             .then(()=> {
    //                 closeForm();
    //             })
    //             .catch((error) => console.error(error));
    //     } else if (bioFormMode==='edit') {
    //         fetch(`${API_URL}/api/biographies/${biographyEdit._id}`, {
    //             method: "PUT",
    //             headers: {
    //                 // 'Content-Type': 'application/json',
    //                 // 'Authorization': 'Bearer ' + token,
    //             },
    //             body: bioFormData,
    //             })
    //             .then((response) => {
    //                 if (response.ok) {
    //                     return response;
    //                 } else {
    //                     throw new Error('La requête a échoué');
    //                 }
    //             })
    //             .then(()=> {
    //                 closeForm();
    //             })
    //             .catch((error) => console.error(error));
    //     }
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

    

    return  (      
        <form onSubmit={(event) => projectFormSubmit(event)} method="post" className='projectForm'>
            {/* <div  className="projectForm_sampleContainer">
                <img id='imageSample' ref={projectImageSampleRef} src='' className="projectForm_sampleContainer_img" alt=''/>
            </div>
            <div className='projectForm_projectImageFile'>
                <label htmlFor='inputProjectImageFile'>{isImageLoaded ? 'MODIFIER L\'IMAGE' : '+ AJOUTER UNE IMAGE'}</label>
                <input type='file' id='inputProjectImageFile' name="image" ref={inputProjectImageFileRef} onChange={displaySample}></input>
            </div> */}

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
                <div className='projectForm_projectArtistsList_objectForm'>
                    <label htmlFor='inputProjectArtistFunction'>FONCTION</label>
                    <input type='text' id='inputProjectArtistFunction' ref={inputProjectArtistFunctionRef} defaultValue={projectFormMode==='edit'? projectEdit.artistList.artistFunction : null}></input>
                    <label htmlFor='inputProjectArtistName'>PRÉNOM</label>
                    <input type='text' id='inputProjectArtistName' ref={inputProjectArtistNameRef} defaultValue={projectFormMode==='edit'? projectEdit.artistList.artistName : null}></input>
                    <label htmlFor='inputProjectArtistSurname'>NOM</label>
                    <input type='text' id='inputProjectArtistSurname' ref={inputProjectArtistSurnameRef} defaultValue={projectFormMode==='edit'? projectEdit.artistList.artistSurname : null}></input>
                </div>
                <button>+ AJOUTER UN ARTISTE</button>
            </div>

            
            <div className='projectForm_buttons'>
                <button type='submit'>VALIDER</button>
                <button onClick={() => closeForm()}>ANNULER</button>
            </div>
        </form>
    )
}

export default ProjectForm