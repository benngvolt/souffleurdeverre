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
    const [sortedBiographies, setSortedBiographies] = useState([]);
    const [bioAside, setBioAside] = useState([]);
    const [displayBioAside, setDisplayBioAside] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/biographies`)
            .then((res) => res.json())
            .then((data) => {
                setBiographies(data);
                setSortedBiographies(data); // Assurez-vous que sortedBiographies est initialisé avec les données chargées
                console.log('Bios chargées');
            })
            .catch((error) => console.log(error.message));
    }, []);

    function closeBioAside () {
        setDisplayBioAside(false);
    }

    function displayEveryBios() {
        setSortedBiographies(biographies);
    }

    function displayArtistsBios(biographies) {
        const artistsBios = biographies.filter((biography) => biography.field === 'artiste');
        console.log(artistsBios);    
    }

    function displayAdminBios(biographies) {
        const adminBios = biographies.filter((biography) => biography.field==='administration')
        setSortedBiographies(adminBios);
    }

    return  (      
        <section className='equipe'>
            <div className='equipe_buttons'>
                <button type='button' onClick={()=>displayEveryBios(biographies)}className='equipe_buttons_all'>TOU.TE.S</button>
                <button type='button' onClick={()=>displayArtistsBios(biographies)} className='equipe_buttons_artists'>ARTISTES</button>
                <button type='button' onClick={()=>displayAdminBios(biographies)} className='equipe_buttons_admin'>ADMINISTRATION</button>
            </div>
            <ul className='equipe_biosList'>
                {sortedBiographies.map((biography) => (
                    <li>
                        <BioCard biography={biography} setDisplayBioAside={setDisplayBioAside} setBioAside={setBioAside}/>
                    </li>
                ))}
            </ul>
            <div className={displayBioAside=== true ? 'equipe_bioSheetContainer--displayOn' : 'equipe_bioSheetContainer--displayOff'}>
                <BioSheet biography={bioAside} closeBioAside={closeBioAside}/>
            </div>
        </section>
    )
}

export default Equipe