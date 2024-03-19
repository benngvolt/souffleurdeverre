import './BioSheet.scss'
// import { Link } from 'react-router-dom'
// import React, {useEffect, useState} from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXmark } from '@fortawesome/free-solid-svg-icons'
import DOMPurify from 'dompurify';

function BioSheet({biography, closeBioAside, className}) {

    const cleanedBiography = DOMPurify.sanitize(biography.biography);

    return  (      
        <aside className={`${className}`}>
            <div className={`${className}_mainContainer`}>
                <img className={`${className}_mainContainer_image`} src={biography.bioImageUrl} alt={biography.surname} /> 
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