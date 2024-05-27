import './BioSheet.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXmark } from '@fortawesome/free-solid-svg-icons'
import DOMPurify from 'dompurify';

function BioSheet({biography, closeBioAside, className}) {

    const cleanedBiography = DOMPurify.sanitize(biography.biography);

    return  (      
        <aside className={`${className}`}>
            <div className={`${className}_mainContainer`}>
                <div className={`${className}_mainContainer_imageContainer`}>
                    <img className={`${className}_mainContainer_imageContainer_image`} src={biography.bioImageUrl} alt={biography.surname} /> 
                </div>
                <div className={`${className}_mainContainer_texts`}>
                    <p className={`${className}_mainContainer_texts_name`}>{biography.name} {biography.surname}</p>
                    <p className={`${className}_mainContainer_texts_role`}>{biography.role}</p>
                    {cleanedBiography &&
                    <p className={`${className}_mainContainer_texts_bio`} dangerouslySetInnerHTML={{__html:cleanedBiography}}></p>
                    }
                </div>
            </div>  
            <button className={`${className}_button`} type='button' onClick={()=>closeBioAside()}>
                <FontAwesomeIcon className={`${className}_button_icon`} icon={faXmark}/>
            </button>
        </aside>
    )
}

export default BioSheet