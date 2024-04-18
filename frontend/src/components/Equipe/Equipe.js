import './Equipe.scss'
import '../../pages/Compagnie/Compagnie.scss'
import { API_URL } from '../../utils/constants'
import BioCard from '../BioCard/BioCard';
import BioSheet from '../BioSheet/BioSheet';
// import { Link } from 'react-router-dom'
import React, { useEffect, useState, useContext } from 'react'
import { Context } from '../../utils/Context'

// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

function Equipe({className}) {

    
    const [sortedBiographies, setSortedBiographies] = useState([]);
    const [bioAside, setBioAside] = useState([]);
    const [displayBioAside, setDisplayBioAside] = useState(false);
    const [selectedBioField, setSelectedBioField] = useState ('artistique');

    const { biographies, bioFields } = useContext(Context);

    useEffect(() => {
        const selectedBios = biographies.filter((biography) => biography.field===selectedBioField);
        setSortedBiographies(selectedBios);
      }, [biographies]);

    function closeBioAside () {
        setDisplayBioAside(false);
    }

    function displayBios(biographies, bioField) {
        const selectedBios = biographies.filter((biography) => biography.field===bioField);
        setSortedBiographies(selectedBios);
        setSelectedBioField (bioField);
    }
    

    return  (      
        <section className={`${className}_team`}>
            <div className={`${className}_team_buttons`}>
                {bioFields.map((bioField) => (
                    <button type='button' onClick={()=> {
                        displayBios(biographies, bioField);
                        setSelectedBioField (bioField);
                    }} className={selectedBioField===bioField? `${className}_team_buttons_button--selected` :`${className}_team_buttons_button--notSelected`}>{bioField}</button>
                ))}
            </div>
            <ul className={`${className}_team_biosList`}>
                {sortedBiographies
                    .filter(bio => bio.surname !=='Veschambre' && bio.surname !=='Rocha')
                    .sort((a, b) => {
                        // Comparaison des noms (ou prénoms) pour le tri
                        const nameA = a.surname.toLowerCase(); // Convertit en minuscules pour trier sans distinction de casse
                        const nameB = b.surname.toLowerCase(); // Convertit en minuscules pour trier sans distinction de casse
                        if (nameA < nameB) return -1;
                        if (nameA > nameB) return 1;
                        return 0; // Les noms sont égaux
                    })
                    .map((biography) => (
                    <li className={`${className}_team_biosList_item`}>
                        <img src={biography.bioImageUrl} alt={biography.surname} className={`${className}_team_biosList_item_img`}/> 
                        <p className={`${className}_team_biosList_item_name`}>{biography.name} {biography.surname}</p>
                        <p className={`${className}_team_biosList_item_role`}>{biography.role}</p>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default Equipe