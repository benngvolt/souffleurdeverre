import './BioSheet.scss'
// import { Link } from 'react-router-dom'
// import React, {useEffect, useState} from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXmark } from '@fortawesome/free-solid-svg-icons'

function BioSheet({biography, closeBioAside}) {

    return  (      
        <aside className='biosheetAside'>
            <div className='biosheetAside_mainContainer'>
                <img className='biosheetAside_mainContainer_image' src={biography.bioImageUrl} alt={biography.surname} /> 
                <div className='biosheetAside_mainContainer_texts'>
                    <p className='biosheetAside_mainContainer_texts_name'>{biography.name} {biography.surname}</p>
                    <p className='biosheetAside_mainContainer_texts_role'>{biography.role}</p>
                    <p className='biosheetAside_mainContainer_texts_bio'>{biography.biography}</p>
                </div>
            </div>  
            <button className='biosheetAside_button' type='button' onClick={()=>closeBioAside()}>
                <FontAwesomeIcon className='biosheetAside_button_icon' icon={faXmark}/>
            </button>
        </aside>
    )
}

export default BioSheet