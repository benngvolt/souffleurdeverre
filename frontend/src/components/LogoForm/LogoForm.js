import './LogoForm.scss';
import { useContext, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { Context } from '../../utils/Context';
import Loader from '../Loader/Loader';
import ErrorText from '../ErrorText/ErrorText';

function LogoForm({ logoEdit, logoFormMode, closeLogoForm }) {
    const { handleLoadLogos, handleLoadProjects, loaderDisplay, displayLoader, hideLoader } = useContext(Context);

    const fileInputRef = useRef(null);

    const [name, setName] = useState(logoEdit?.name || '');
    const [altText, setAltText] = useState(logoEdit?.altText || logoEdit?.name || '');
    // Le texte alternatif suit le nom tant qu'il n'a pas été modifié à la main
    const [altTextTouched, setAltTextTouched] = useState(
        Boolean(logoEdit?.altText) && logoEdit.altText !== logoEdit.name
    );
    const [isOnCompanyPage, setIsOnCompanyPage] = useState(Boolean(logoEdit?.isOnCompanyPage));
    const [linkUrl, setLinkUrl] = useState(logoEdit?.linkUrl || '');
    const [previewUrl, setPreviewUrl] = useState(logoEdit?.imageUrl || '');
    const [hasNewImage, setHasNewImage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    function displaySample() {
        const file = fileInputRef.current?.files?.[0];

        if (!file) {
            setHasNewImage(false);
            setPreviewUrl(logoEdit?.imageUrl || '');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setPreviewUrl(reader.result);
            setHasNewImage(true);
        };
        reader.readAsDataURL(file);
    }

    async function logoFormSubmit(event) {
        event.preventDefault();
        setErrorMessage('');

        const selectedImage = fileInputRef.current?.files?.[0];

        if (!name.trim() || (logoFormMode === 'add' && !selectedImage)) {
            setErrorMessage('Le nom et l’image sont obligatoires.');
            return;
        }

        displayLoader();

        const requestFormData = new FormData();
        requestFormData.append('name', name.trim());
        requestFormData.append('altText', altText.trim() || name.trim());
        requestFormData.append('isOnCompanyPage', isOnCompanyPage ? 'true' : 'false');
        requestFormData.append('linkUrl', linkUrl.trim());
        if (selectedImage) {
            requestFormData.append('logoImage', selectedImage);
        }

        const url = logoFormMode === 'add' ? '/api/logos' : `/api/logos/${logoEdit._id}`;
        const method = logoFormMode === 'add' ? 'POST' : 'PUT';

        try {
            await apiFetch(url, { method, auth: true, body: requestFormData });

            handleLoadLogos();
            // Un renommage est répercuté côté serveur sur les projets qui utilisent ce logo.
            handleLoadProjects();
            hideLoader();
            closeLogoForm();
        } catch (error) {
            console.error(error);
            hideLoader();
            setErrorMessage(
                error.status === 409
                    ? 'Un logo porte déjà ce nom.'
                    : "Une erreur s'est produite"
            );
        }
    }

    return (
        <form onSubmit={logoFormSubmit} method='post' className='logoForm'>
            <p className='logoForm_title'>
                {logoFormMode === 'add' ? 'NOUVEAU LOGO' : 'MODIFIER LE LOGO'}
            </p>

            <div className='logoForm_sampleContainer'>
                {previewUrl && <img src={previewUrl} alt='' />}
            </div>

            <div className='logoForm_imageFile'>
                <label htmlFor='inputLogoImage'>
                    {previewUrl ? "MODIFIER L'IMAGE" : '+ AJOUTER UNE IMAGE*'}
                </label>
                <input
                    type='file'
                    id='inputLogoImage'
                    accept='image/*'
                    ref={fileInputRef}
                    onChange={displaySample}
                />
                {hasNewImage && logoFormMode === 'edit' && (
                    <p className='logoForm_imageFile_hint'>La nouvelle image remplacera l’ancienne à la validation.</p>
                )}
            </div>

            <div className='logoForm_field'>
                <label htmlFor='inputLogoName'>NOM*</label>
                <input
                    type='text'
                    id='inputLogoName'
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        if (!altTextTouched) setAltText(event.target.value);
                    }}
                />
            </div>

            <div className='logoForm_field'>
                <label htmlFor='inputLogoAltText'>TEXTE ALTERNATIF (attribut alt de l'image)</label>
                <input
                    type='text'
                    id='inputLogoAltText'
                    value={altText}
                    onChange={(event) => {
                        setAltText(event.target.value);
                        setAltTextTouched(true);
                    }}
                />
            </div>

            <div className='logoForm_field'>
                <label htmlFor='inputLogoUrl'>LIEN URL (facultatif)</label>
                <input
                    type='text'
                    id='inputLogoUrl'
                    placeholder='https://'
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                />
            </div>

            <div className='logoForm_checkbox'>
                <label htmlFor='inputLogoOnCompanyPage'>
                    <input
                        type='checkbox'
                        id='inputLogoOnCompanyPage'
                        checked={isOnCompanyPage}
                        onChange={(event) => setIsOnCompanyPage(event.target.checked)}
                    />
                    Faire figurer sur la page Compagnie
                </label>
            </div>

            <ErrorText errorText={errorMessage} state={errorMessage !== ''} />

            <div className='logoForm_buttons'>
                <button type='submit'>VALIDER</button>
                <button type='button' onClick={closeLogoForm}>ANNULER</button>
            </div>

            <Loader className='loader--opaque' loaderDisplay={loaderDisplay} />
        </form>
    );
}

export default LogoForm;
