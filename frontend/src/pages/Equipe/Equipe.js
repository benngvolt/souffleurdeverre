import './Equipe.scss'
import { API_URL } from '../../utils/constants'
import BioCard from '../../components/BioCard/BioCard';
import BioSheet from '../../components/BioSheet/BioSheet';
// import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

function Equipe() {

    const [biographies, setBiographies] = useState([]);
    const [bioAside, setBioAside] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/api/biographies`)
        .then((res) => res.json())
        .then((data) => setBiographies(data),
            console.log('travaux chargés'),
        )
        .catch((error)=>console.log(error.message))
    },[]);

    return  (      
        <section className='equipe'>
            <p className='equipe_title'>Equipe</p>
            <div className='equipe_buttons'>
                <button className='equipe_buttons_all'>TOU.TE.S</button>
                <button className='equipe_buttons_artists'>ARTISTES</button>
                <button className='equipe_buttons_admin'>ADMINISTRATION</button>
            </div>
            <ul>
                {biographies.map((biography) => (
                    <li>
                        <button onClick={() => setBioAside(biography)}>
                            <BioCard biography={biography}/>
                        </button>
                    </li>
                ))}
            </ul>
            <BioSheet biography={bioAside}/>
        </section>
    )
}

export default Equipe