import './BioForm.scss'
import { API_URL } from '../../utils/constants'
import {useRef, useEffect, useState, useContext } from 'react'
import { Context } from '../../utils/Context'
import Loader from '../Loader/Loader'
import 'trix';
import '../../utils/trix.scss'
import ErrorText from '../ErrorText/ErrorText'

function BioForm({biographyEdit, bioFormMode, setHandleDisplayBioForm, handleDisplayBioForm}) {

    const { bioFields, handleLoadBiographies, loaderDisplay, displayLoader, hideLoader } = useContext(Context);

    const inputSurnameRef = useRef(null);
    const inputNameRef = useRef(null);
    const inputRoleRef = useRef(null);
    const inputLinkUrlRef = useRef(null);
    const inputBioRef = useRef(null);
    const inputBioImageFileRef = useRef(null);
    const inputFieldRef = useRef(null);
    const bioImageSampleRef = useRef (null);
    // let content = useRef();

    // const cleanedBiography = DOMPurify.sanitize(biographyEdit?.biography);

    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const [bioSurname, setBioSurname] = useState(bioFormMode === 'edit' ? biographyEdit.surname : '');
    const [bioName, setBioName] = useState(bioFormMode === 'edit' ? biographyEdit.name : '');
    const [bioRole, setBioRole] = useState(bioFormMode === 'edit' ? biographyEdit.role : '');
    const [bioField, setBioField] = useState(bioFormMode === 'edit' ? biographyEdit.field : '');
    const [bioLinkUrl, setBioLinkUrl] = useState(bioFormMode === 'edit' ? biographyEdit.linkUrl : '');
    const [bioBiography, setBioBiography] = useState(bioFormMode === 'edit' ? biographyEdit.biography : '');
    const [displayServerError, setDisplayServerError] = useState(false);
    const [displayError, setDisplayError] = useState(false);
    
    
    // Réinitialisation des valuers input lorsque le formulaire s'ouvre / se ferme.
    useEffect(() => {
        if (bioFormMode === 'edit') {
            setBioSurname(biographyEdit.surname);
            setBioName(biographyEdit.name);
            setBioRole(biographyEdit.role);
            setBioField(biographyEdit.field);
            setBioLinkUrl(biographyEdit.linkUrl);
            setBioBiography(biographyEdit.biography); // is a Trix.Editor instance
        } else {
            setBioSurname('');
            setBioName('');
            setBioRole('');
            setBioField('');
            setBioLinkUrl('');
            setBioBiography('');
            clearTrixEditor()
        }
    }, [bioFormMode, handleDisplayBioForm, bioBiography]);

    useEffect(() => {
        const element = document.getElementById("inputBio");
        if (element) {
            element.editor.setSelectedRange([0, 0]);
            element.editor.loadHTML(bioBiography); 
        }
    }, [bioBiography, handleDisplayBioForm]);

    function bioFormSubmit(event) {
        event.preventDefault();
        // const token = window.sessionStorage.getItem('1');
        displayLoader();
        const bioFormData = new FormData();

        bioFormData.append('image', inputBioImageFileRef.current.files[0]);
        bioFormData.append('surname', inputSurnameRef.current.value);
        bioFormData.append('name', inputNameRef.current.value);
        bioFormData.append('role', inputRoleRef.current.value);
        bioFormData.append('linkUrl', inputLinkUrlRef.current.value);
        bioFormData.append('biography', inputBioRef.current.value);
        bioFormData.append('field', inputFieldRef.current.value);

        if (
            !inputSurnameRef.current.value ||
            !inputNameRef.current.value ||
            !inputRoleRef.current.value ||
            !inputFieldRef.current.value
        ) {
            hideLoader();
            setDisplayError(true);
            return;
        } else {

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

    function clearTrixEditor() {
        const element = document.querySelector("trix-editor");
        element.editor.setSelectedRange([0, 0]);
        element.editor.loadHTML(''); 
    }

    function closeForm() {
        setHandleDisplayBioForm(false);
        handleLoadBiographies();
        clearTrixEditor();
        hideLoader();
    }

    return  (    
        <form onSubmit={(event) => bioFormSubmit(event)} method="post" className='bioForm'>
            <img id='biography image' src="" alt=''></img>
            <div className="bioForm_sampleContainer">
                <img id='imageSample' ref={bioImageSampleRef} src={bioFormMode === 'edit' ? biographyEdit.bioImageUrl : ''} className="bioForm_sampleContainer_img" alt=''/>
            </div>
            <div className='bioForm_bioImageFile'>
                <label htmlFor='inputBioImageFile'>{isImageLoaded ? 'MODIFIER L\'IMAGE' : '+ AJOUTER UNE IMAGE'}</label>
                <input type='file' id='inputBioImageFile' name="image" ref={inputBioImageFileRef} onChange={displaySample}></input>
            </div>
            <div className='bioForm_surname'>
                <label htmlFor='inputSurname'>NOM*</label>
                <input type='text' id='inputSurname' ref={inputSurnameRef} value={bioSurname} onChange={(e) =>setBioSurname(e.target.value)}></input>
            </div>
            <div className='bioForm_name'>
                <label htmlFor='inputName'>PRENOM*</label>
                <input type='text' id='inputName' ref={inputNameRef} value={bioName} onChange={(e) =>setBioName(e.target.value)}></input>
            </div>
            <div className='bioForm_role'>
                <label htmlFor='inputRole'>ROLE*</label>
                <input type='text' id='inputRole' ref={inputRoleRef} value={bioRole} onChange={(e) =>setBioRole(e.target.value)}></input>
            </div>
            <div className='bioForm_field'>
                <label htmlFor='inputField'>CHAMPS*</label>
                <select id='inputField' ref={inputFieldRef} name="field" value={bioField} onChange={(e) =>setBioField(e.target.value)}>
                    <option value=''></option>
                    {bioFields.map((bioField)=>(
                        <option value={bioField}>{bioField}</option>
                    ))}
                </select>
            </div>
            <div className='bioForm_linkUrl'>
                <label htmlFor='inputLinkUrl'>LIEN URL</label>
                <input type='text' id='inputLinkUrl' ref={inputLinkUrlRef} value={bioLinkUrl} onChange={(e) =>setBioLinkUrl(e.target.value)}></input>
            </div>
            <div className='bioForm_bio'>
                <label htmlFor='inputBio'>BIOGRAPHIE</label>
                <input id="trix" type="hidden" name="content" defaultValue={bioBiography} ref={inputBioRef}></input>
                <trix-editor id='inputBio' input="trix"/>
            </div>
            <ErrorText errorText={"Une erreur s\'est produite"} state={displayServerError}/>
            <ErrorText errorText={"Tous les champs marqués d'une * doivent être remplis"} state={displayError}/>
            <div className='bioForm_buttons'>
                <button type='submit'>VALIDER</button>
                <button onClick={() => closeForm()}>ANNULER</button>
            </div>
            <div className={loaderDisplay===true?'homePage_loader--displayOn':'homePage_loader--displayOff'}>
                <Loader className='loader--opaque' loaderDisplay={loaderDisplay}/>
            </div>
        </form>
    )
}

export default BioForm