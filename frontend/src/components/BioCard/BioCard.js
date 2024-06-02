import './BioCard.scss'
import React, {useState} from 'react'
// import { Link } from 'react-router-dom'
// import React, {useEffect, useState} from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'


function BioCard({biography, setDisplayBioAside, setBioAside}) {

    function openBioAside () {
        setBioAside (biography);
        setDisplayBioAside(true);
    }

    return  (      
        <figure className='bioCard'>
            <button onClick={() => openBioAside()} className='bioCard_card'>
                <img src={biography.bioImageUrl} alt={biography.surname} className='bioCard_card_image'/>
                <figcaption className='bioCard_card_caption'>
                    <h2 className='bioCard_card_caption_name'>{biography.name} {biography.surname}</h2>
                    <p className='bioCard_card_caption_role'>{biography.role}</p>
                </figcaption>
            </button>
        </figure>
    )
}

export default BioCard