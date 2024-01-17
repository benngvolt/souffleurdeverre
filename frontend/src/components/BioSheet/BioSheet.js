import './BioSheet.scss'
// import { Link } from 'react-router-dom'
// import React, {useEffect, useState} from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'


function BioSheet({biography, closeBioAside}) {

    return  (      
        <aside className='biosheetAside'>
            <button type='button' onClick={()=>closeBioAside()}>FERMER</button>
            <p className='biosheetAside_name'>{biography.name}{biography.surname}</p>
            <p className='biosheetAside_role'>{biography.role}</p>
            <img className='biosheetAside_image' src={biography.bioImageUrl} alt={biography.surname} /> 
            <p className='biosheetAside_bio'>{biography.biography}</p>
        </aside>
    )
}

export default BioSheet