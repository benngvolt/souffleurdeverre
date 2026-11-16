import './BioForm.scss';
import { apiFetch } from '../../utils/api';
import { useRef, useEffect, useState, useContext, useMemo } from 'react';
import { Context } from '../../utils/Context';
import { DOSSIER_BIOGRAPHY_MAX_CHARS } from '../../utils/constants';
import { countPlainCharacters } from '../../utils/dossier/dossierData';
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
    dossierBiography: '',
    isPermanentTeam: false,
};

// Nombre de caractères du texte de l'éditeur (espaces compris, sans les retours à la ligne)
function countEditorCharacters(trixElement) {
    if (!trixElement || !trixElement.editor) return 0;
    return trixElement.editor.getDocument().toString().replace(/[\r\n]/g, '').length;
}

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
    const inputDossierBioRef = useRef(null);
    const inputBioImageFileRef = useRef(null);

    const [formData, setFormData] = useState(initialFormState);
    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [displayServerError, setDisplayServerError] = useState(false);
    const [displayError, setDisplayError] = useState(false);
    const [dossierBioCount, setDossierBioCount] = useState(0);

    const dossierBioExcess = dossierBioCount - DOSSIER_BIOGRAPHY_MAX_CHARS;
    const isDossierBioTooLong = dossierBioExcess > 0;

    const trixInputId = useMemo(() => {
        return bioFormMode === 'edit' && biographyEdit?._id
            ? `trix-bio-${biographyEdit._id}`
            : 'trix-bio-new';
    }, [bioFormMode, biographyEdit?._id]);

    const dossierTrixInputId = useMemo(() => {
        return bioFormMode === 'edit' && biographyEdit?._id
            ? `trix-dossier-bio-${biographyEdit._id}`
            : 'trix-dossier-bio-new';
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
                dossierBiography: biographyEdit.dossierBiography || '',
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

    useEffect(() => {
        const element = document.getElementById('inputDossierBio');

        if (!element) return;

        // Compteur de caractères en direct (espaces compris, sans les retours à la ligne)
        const updateCount = () => setDossierBioCount(countEditorCharacters(element));

        const loadDossierBiographyIntoTrix = () => {
            if (!element.editor) return;

            element.editor.setSelectedRange([0, 0]);
            element.editor.loadHTML(formData.dossierBiography || '');
            updateCount();
        };

        element.addEventListener('trix-change', updateCount);

        if (element.editor) {
            loadDossierBiographyIntoTrix();
        } else {
            element.addEventListener('trix-initialize', loadDossierBiographyIntoTrix, { once: true });
        }

        return () => {
            element.removeEventListener('trix-initialize', loadDossierBiographyIntoTrix);
            element.removeEventListener('trix-change', updateCount);
        };
    }, [formData.dossierBiography, dossierTrixInputId, handleDisplayBioForm]);

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

        // La biographie courte ne peut pas dépasser la limite (vérifiée aussi côté serveur)
        const submittedDossierBio = inputDossierBioRef.current?.value || '';
        const submittedCount = Math.max(
            countPlainCharacters(submittedDossierBio),
            countEditorCharacters(document.getElementById('inputDossierBio'))
        );
        if (submittedCount > DOSSIER_BIOGRAPHY_MAX_CHARS) {
            setDossierBioCount(submittedCount);
            return;
        }

        displayLoader();

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

        const dossierBiographyValue = inputDossierBioRef.current?.value;
        requestFormData.append(
            'dossierBiography',
            dossierBiographyValue || (bioFormMode === 'edit' ? biographyEdit?.dossierBiography || '' : '')
        );

        const url =
            bioFormMode === 'add'
                ? '/api/biographies'
                : `/api/biographies/${biographyEdit._id}`;

        const method = bioFormMode === 'add' ? 'POST' : 'PUT';

        try {
            await apiFetch(url, { method, auth: true, body: requestFormData });

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

            <div className='bioForm_bio'>
                <label htmlFor='inputDossierBio'>BIOGRAPHIE COURTE (DOSSIER ARTISTIQUE)</label>
                <p className='bioForm_hint'>
                    Facultatif : version courte utilisée dans les dossiers artistiques, limitée à {DOSSIER_BIOGRAPHY_MAX_CHARS.toLocaleString('fr-FR')} caractères
                    (espaces compris). Si ce champ est vide, aucune biographie n'apparaît dans le dossier (le portrait et le nom restent).
                </p>
                <input
                    key={`hidden-${dossierTrixInputId}`}
                    id={dossierTrixInputId}
                    type='hidden'
                    name='dossierContent'
                    ref={inputDossierBioRef}
                />
                <trix-editor
                    key={dossierTrixInputId}
                    id='inputDossierBio'
                    input={dossierTrixInputId}
                />
                <p
                    className={isDossierBioTooLong ? 'bioForm_counter bioForm_counter--over' : 'bioForm_counter'}
                    aria-live='polite'
                >
                    {dossierBioCount.toLocaleString('fr-FR')} / {DOSSIER_BIOGRAPHY_MAX_CHARS.toLocaleString('fr-FR')} caractères
                </p>
                {isDossierBioTooLong && (
                    <p className='bioForm_counterAlert' role='alert'>
                        Limite dépassée de {dossierBioExcess.toLocaleString('fr-FR')} caractère{dossierBioExcess > 1 ? 's' : ''} :
                        raccourcissez la biographie courte pour pouvoir enregistrer.
                    </p>
                )}
            </div>

            <ErrorText errorText={"Une erreur s'est produite"} state={displayServerError} />
            <ErrorText errorText={"Tous les champs marqués d'une * doivent être remplis"} state={displayError} />

            <div className='bioForm_buttons'>
                <button type='submit' disabled={isDossierBioTooLong}>VALIDER</button>
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