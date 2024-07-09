import './BioCard.scss'
import React, {useState} from 'react'


function BioCard({biography, setDisplayBioAside, setBioAside}) {

    function openBioAside () {
        setBioAside (biography);
        setDisplayBioAside(true);
    }

    return  (      
        <figure className='bioCard'>
            <button onClick={() => openBioAside()} className='bioCard_card' aria-label={`lien vers la biographie de ${biography.surname}`}>
                <img src={biography.bioImageUrl} alt={`photo de ${biography.surname}`} className='bioCard_card_image'/>
                <figcaption className='bioCard_card_caption'>
                    <h2 className='bioCard_card_caption_name'>{biography.name} {biography.surname}</h2>
                    <p className='bioCard_card_caption_role'>{biography.role}</p>
                </figcaption>
            </button>
        </figure>
    )
}

export default BioCard