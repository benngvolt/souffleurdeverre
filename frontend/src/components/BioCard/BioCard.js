import './BioCard.scss'
// import { Link } from 'react-router-dom'
// import React, {useEffect, useState} from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'


function BioCard({biography}) {

    return  (      
        <figure className='bioCard'>
            <img src={biography.bioImageUrl} alt={biography.surname} className='bioCard_image'/>
            <figcaption className='bioCard_caption'>
                <p className='bioCard_caption_name'>{biography.name}{biography.surname}</p>
                <p className='bioCard_caption_role'>{biography.role}</p>
            </figcaption>
        </figure>
    )
}

export default BioCard