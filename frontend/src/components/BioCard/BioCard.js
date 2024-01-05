import './BioCard.scss'
// import { Link } from 'react-router-dom'
// import React, {useEffect, useState} from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'


function BioCard({biography}) {

    return  (      
        <div>
            <img src={biography.bioImageUrl} alt={biography.surname} />
            <p>{biography.name}{biography.surname}</p>
            <p>{biography.role}</p>
        </div>
    )
}

export default BioCard