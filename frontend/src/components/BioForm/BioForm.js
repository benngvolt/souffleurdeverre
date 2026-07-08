import './BioForm.scss';
import { API_URL } from '../../utils/constants';
import { useRef, useEffect, useState, useContext, useMemo } from 'react';
import { Context } from '../../utils/Context';
import Loader from '../Loader/Loader';
import ErrorText from '../ErrorText/ErrorText';
import 'trix';
import '../../utils/trix.scss';

const initialFormState = {
    surname: '',
    name: '',
    role: '',
    field: '',
    linkUrl: '',
    biography: '',
    isPermanentTeam: false,
};

function BioForm({
    biographyEdit,
    bioFormMode,
    setHandleDisplayBioForm,
    handleDisplayBioForm,
}) {
    const {
        bioFields,
        handleLoadBiographies,
        loaderDisplay,
        displayLoader,
        hideLoader,
    } = useContext(Context);

    const inputBioRef = useRef(null);
    const inputBioImageFileRef = useRef(null);

    const [formData, setFormData] = useState(initialFormState);
    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [displayServerError, setDisplayServerError] = useState(false);
    const [displayError, setDisplayError] = useState(false);

    const trixInputId = useMemo(() => {
        return bioFormMode === 'edit' && biographyEdit?._id
            ? `trix-bio-${biographyEdit._id}`
            : 'trix-bio-new';
    }, [bioFormMode, biographyEdit?._id]);

    useEffect(() => {
        if (bioFormMode === 'edit' && biographyEdit) {
            setFormData({
                surname: biographyEdit.surname || '',
                name: biographyEdit.name || '',
                role: biographyEdit.role || '',
                field: biographyEdit.field || '',
                linkUrl: biographyEdit.linkUrl || '',
                biography: biographyEdit.biography || '',
                isPermanentTeam: Boolean(biographyEdit.isPermanentTeam),
            });

            setPreviewImageUrl(biographyEdit.bioImageUrl || '');
        } else {
            setFormData(initialFormState);
            setPreviewImageUrl('');
        }

        setIsImageLoaded(false);
        setDisplayError(false);
        setDisplayServerError(false);

        if (inputBioImageFileRef.current) {
            inputBioImageFileRef.current.value = '';
        }
    }, [bioFormMode, biographyEdit, handleDisplayBioForm]);

    useEffect(() => {
        const element = document.getElementById('inputBio');

        if (!element) return;

        const loadBiographyIntoTrix = () => {
            if (!element.editor) return;

            element.editor.setSelectedRange([0, 0]);
            element.editor.loadHTML(formData.biography || '');
        };

        if (element.editor) {
            loadBiographyIntoTrix();
        } else {
            element.addEventListener('trix-initialize', loadBiographyIntoTrix, { once: true });
        }

        return () => {
            element.removeEventListener('trix-initialize', loadBiographyIntoTrix);
        };
    }, [formData.biography, trixInputId, handleDisplayBioForm]);

    function updateField(field, value) {
        setFormData((previousData) => ({
            ...previousData,
            [field]: value,
        }));
    }

    function resetFileInput() {
        if (inputBioImageFileRef.current) {
            inputBioImageFileRef.current.value = '';
        }
    }

    function displaySample() {
        const file = inputBioImageFileRef.current?.files?.[0];

        if (!file) {
            setIsImageLoaded(false);
            setPreviewImageUrl(bioFormMode === 'edit' ? biographyEdit?.bioImageUrl || '' : '');
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setPreviewImageUrl(reader.result);
            setIsImageLoaded(true);
        };

        reader.readAsDataURL(file);
    }

    function closeForm() {
        setHandleDisplayBioForm(false);
        setDisplayError(false);
        setDisplayServerError(false);
        setIsImageLoaded(false);
        setPreviewImageUrl('');
        resetFileInput();
        hideLoader();

        // Important : ne pas vider Trix ici.
        // Sinon, si on rouvre la même bio, React peut ne pas relancer le remplissage.
    }

    async function bioFormSubmit(event) {
        event.preventDefault();

        setDisplayError(false);
        setDisplayServerError(false);

        if (
            !formData.surname.trim() ||
            !formData.name.trim() ||
            !formData.role.trim() ||
            !formData.field.trim()
        ) {
            setDisplayError(true);
            hideLoader();
            return;
        }

        displayLoader();

        const token = window.sessionStorage.getItem('1');
        const selectedImage = inputBioImageFileRef.current?.files?.[0];
        const biographyValue = inputBioRef.current?.value;

        const requestFormData = new FormData();

        if (selectedImage) {
            requestFormData.append('image', selectedImage);
        }

        requestFormData.append('surname', formData.surname.trim());
        requestFormData.append('name', formData.name.trim());
        requestFormData.append('role', formData.role.trim());
        requestFormData.append('field', formData.field.trim());
        requestFormData.append('linkUrl', formData.linkUrl.trim());
        requestFormData.append('isPermanentTeam', formData.isPermanentTeam ? 'true' : 'false');

        requestFormData.append(
            'biography',
            biographyValue || (bioFormMode === 'edit' ? biographyEdit?.biography || '' : '')
        );

        const url =
            bioFormMode === 'add'
                ? `${API_URL}/api/biographies`
                : `${API_URL}/api/biographies/${biographyEdit._id}`;

        const method = bioFormMode === 'add' ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: requestFormData,
            });

            if (!response.ok) {
                throw new Error('La requête a échoué');
            }

            await response.json().catch(() => null);

            handleLoadBiographies();
            closeForm();
        } catch (error) {
            console.error(error);
            hideLoader();
            setDisplayServerError(true);
        }
    }

    return (
        <form onSubmit={bioFormSubmit} method='post' className='bioForm'>
            <div className='bioForm_sampleContainer'>
                <img
                    id='imageSample'
                    src={previewImageUrl}
                    className={
                        previewImageUrl
                            ? 'bioForm_sampleContainer_img bioForm_sampleContainer_img--displayOn'
                            : 'bioForm_sampleContainer_img'
                    }
                    alt=''
                />
            </div>

            <div className='bioForm_bioImageFile'>
                <label htmlFor='inputBioImageFile'>
                    {isImageLoaded || previewImageUrl ? "MODIFIER L'IMAGE" : '+ AJOUTER UNE IMAGE'}
                </label>
                <input
                    type='file'
                    id='inputBioImageFile'
                    name='image'
                    accept='image/*'
                    ref={inputBioImageFileRef}
                    onChange={displaySample}
                />
            </div>

            <div className='bioForm_surname'>
                <label htmlFor='inputSurname'>NOM*</label>
                <input
                    type='text'
                    id='inputSurname'
                    value={formData.surname}
                    onChange={(e) => updateField('surname', e.target.value)}
                />
            </div>

            <div className='bioForm_name'>
                <label htmlFor='inputName'>PRENOM*</label>
                <input
                    type='text'
                    id='inputName'
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                />
            </div>

            <div className='bioForm_role'>
                <label htmlFor='inputRole'>ROLE*</label>
                <input
                    type='text'
                    id='inputRole'
                    value={formData.role}
                    onChange={(e) => updateField('role', e.target.value)}
                />
            </div>

            <div className='bioForm_field'>
                <label htmlFor='inputField'>CHAMPS*</label>
                <select
                    id='inputField'
                    name='field'
                    value={formData.field}
                    onChange={(e) => updateField('field', e.target.value)}
                >
                    <option value=''></option>
                    {bioFields.map((bioField) => (
                        <option key={bioField} value={bioField}>
                            {bioField}
                        </option>
                    ))}
                </select>
            </div>

            <div className='bioForm_permanentTeam'>
                <label htmlFor='inputPermanentTeam'>
                    <input
                        type='checkbox'
                        id='inputPermanentTeam'
                        checked={formData.isPermanentTeam}
                        onChange={(e) => updateField('isPermanentTeam', e.target.checked)}
                    />
                    Équipe permanente
                </label>
            </div>

            <div className='bioForm_linkUrl'>
                <label htmlFor='inputLinkUrl'>LIEN URL</label>
                <input
                    type='text'
                    id='inputLinkUrl'
                    value={formData.linkUrl}
                    onChange={(e) => updateField('linkUrl', e.target.value)}
                />
            </div>

            <div className='bioForm_bio'>
                <label htmlFor='inputBio'>BIOGRAPHIE</label>
                <input
                    key={`hidden-${trixInputId}`}
                    id={trixInputId}
                    type='hidden'
                    name='content'
                    ref={inputBioRef}
                />
                <trix-editor
                    key={trixInputId}
                    id='inputBio'
                    input={trixInputId}
                />
            </div>

            <ErrorText errorText={"Une erreur s'est produite"} state={displayServerError} />
            <ErrorText errorText={"Tous les champs marqués d'une * doivent être remplis"} state={displayError} />

            <div className='bioForm_buttons'>
                <button type='submit'>VALIDER</button>
                <button type='button' onClick={closeForm}>
                    ANNULER
                </button>
            </div>

            <div className={loaderDisplay ? 'homePage_loader--displayOn' : 'homePage_loader--displayOff'}>
                <Loader className='loader--opaque' loaderDisplay={loaderDisplay} />
            </div>
        </form>
    );
}

export default BioForm;