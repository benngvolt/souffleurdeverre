import './Equipe.scss'
import { API_URL } from '../../utils/constants'
import BioCard from '../BioCard/BioCard';
import BioSheet from '../BioSheet/BioSheet';
// import { Link } from 'react-router-dom'
import React, { useEffect, useState, useContext } from 'react'
import { Context } from '../../utils/Context'

// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

function Equipe() {

    
    const [sortedBiographies, setSortedBiographies] = useState([]);
    const [bioAside, setBioAside] = useState([]);
    const [displayBioAside, setDisplayBioAside] = useState(false);
    const [categoryBios, setCategoryBios] = useState ('tous');

    const { biographies, bioFields } = useContext(Context);

    function closeBioAside () {
        setDisplayBioAside(false);
    }

    function displayBios(biographies, bioField) {
        const selectedBios = biographies.filter((biography) => biography.field===bioField);
        console.log(selectedBios);
        setSortedBiographies(selectedBios);
        setCategoryBios (bioField);
    }

    return  (      
        <section className='equipe'>
            <div className='equipe_buttons'>
                {bioFields.map((bioField) => (
                    <button type='button' onClick={()=>displayBios(biographies, bioField)} className={categoryBios==={bioField}?'equipe_buttons_button--selected':'equipe_buttons_button--notSelected'}>{bioField}</button>
                ))}
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