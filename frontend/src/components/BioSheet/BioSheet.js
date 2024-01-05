import './BioSheet.scss'
// import { Link } from 'react-router-dom'
// import React, {useEffect, useState} from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'


function BioSheet({biography}) {

    return  (      
        <aside>
            <p>{biography.name}{biography.surname}</p>
            <p>{biography.role}</p>
            <img src={biography.bioImageUrl} alt={biography.surname} /> 
            <p>{biography.biography}</p>
        </aside>
    )
}

export default BioSheet