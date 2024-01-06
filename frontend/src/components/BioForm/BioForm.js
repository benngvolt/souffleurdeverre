import './BioForm.scss'
import { API_URL } from '../../utils/constants'
// import { Link } from 'react-router-dom'
import {useRef, useState } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function BioForm({biographyEdit, bioFormMode}) {

    const inputSurnameRef = useRef(null);
    const inputNameRef = useRef(null);
    const inputRoleRef = useRef(null);
    const inputBioRef = useRef(null);
    const inputBioImageFileRef = useRef(null);
    const inputFieldRef = useRef(null);
    const bioImageSampleRef = useRef (null);

    const [isImageLoaded, setIsImageLoaded] = useState(false);


    function bioFormSubmit(event) {
        event.preventDefault();
        // const token = window.sessionStorage.getItem('1');
        const bioFormData = new FormData();

        bioFormData.append('image', inputBioImageFileRef.current.files[0]);
        bioFormData.append('surname', inputSurnameRef.current.value);
        bioFormData.append('name', inputNameRef.current.value);
        bioFormData.append('role', inputRoleRef.current.value);
        bioFormData.append('biography', inputBioRef.current.value);
        bioFormData.append('field', inputFieldRef.current.value);
        
        if (bioFormMode==='add') {
            fetch(`${API_URL}/api/biographies`, {
                method: "POST",
                headers: {
                    // 'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ' + token,
                },
                body: bioFormData,
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
        } else if (bioFormMode==='edit') {
            fetch(`${API_URL}/api/biographies/${biographyEdit._id}`, {
                method: "PUT",
                headers: {
                    // 'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ' + token,
                },
                body: bioFormData,
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


    function displaySample() {
        if(!inputBioImageFileRef.current.files || inputBioImageFileRef.current.files.length === 0) {
            setIsImageLoaded(false);
            return
        } else {
            const file = inputBioImageFileRef.current.files[0]; // récupération du fichier image dans le formulaire
            const reader = new FileReader(); // un objet FileReader est créé pour lire le contenu du fichier image sélectionné.
            reader.readAsDataURL(file); // lecture du fichier image récupéré comme adresse url
            reader.onload = function() { // création des attributs de l'image (src, alt, class)
                bioImageSampleRef.current.setAttribute("src", reader.result);
                bioImageSampleRef.current.setAttribute("alt", "");
                bioImageSampleRef.current.setAttribute("class", "bioForm_sampleContainer_img--displayOn");
            }
            setIsImageLoaded(true);
        }
    }

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
        <form onSubmit={(event) => bioFormSubmit(event)} method="post" className='bioForm'>
            <div  className="bioForm_sampleContainer">
                <img id='imageSample' ref={bioImageSampleRef} src='' className="bioForm_sampleContainer_img" alt=''/>
            </div>
            <div className='bioForm_bioImageFile'>
                <label htmlFor='inputBioImageFile'>{isImageLoaded ? 'MODIFIER L\'IMAGE' : '+ AJOUTER UNE IMAGE'}</label>
                <input type='file' id='inputBioImageFile' name="image" ref={inputBioImageFileRef} onChange={displaySample}></input>
            </div>
            <div className='bioForm_surname'>
                <label htmlFor='inputSurname'>NOM</label>
                <input type='text' id='inputSurname' ref={inputSurnameRef} defaultValue={bioFormMode==='edit'? biographyEdit.surname : null}></input>
            </div>
            <div className='bioForm_name'>
                <label htmlFor='inputName'>PRENOM</label>
                <input type='text' id='inputName' ref={inputNameRef} defaultValue={bioFormMode==='edit'? biographyEdit.name : null}></input>
            </div>
            <div className='bioForm_role'>
                <label htmlFor='inputRole'>ROLE</label>
                <input type='text' id='inputRole' ref={inputRoleRef} defaultValue={bioFormMode==='edit'? biographyEdit.role : null}></input>
            </div>
            <div className='bioForm_field'>
                <label htmlFor='inputField'>CHAMPS</label>
                <select id='inputField' ref={inputFieldRef} name="field" defaultValue={bioFormMode==='edit'? biographyEdit.field : 'artiste'} >
                    <option value="artiste">Artiste</option>
                    <option value="administration">Administration</option>
                </select>
            </div>
            <div className='bioForm_bio'>
                <label htmlFor='inputBio'>BIOGRAPHIE</label>
                <input type='textarea' id='inputBio' ref={inputBioRef} defaultValue={bioFormMode==='edit'? biographyEdit.biography : null}></input>
            </div>
            <div className='bioForm_buttons'>
                <button type='submit'>VALIDER</button>
                <button onClick={() => closeForm()}>ANNULER</button>
            </div>
        </form>
    )
}

export default BioForm