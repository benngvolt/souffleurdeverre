import './Footer.scss'
// import { Link } from 'react-router-dom'
// import React, { useContext, useEffect } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import AuthModal from '../AuthModal/AuthModal'
  

 
function Footer() {

    /*-------------------------------------------------------
    ----- USE EFFECT POUR ECOUTER EVENEMENT KONAMI CODE -----
    -------------------------------------------------------*/

    useEffect(() => {
        document.addEventListener('keydown', keyHandler, false);
    
        return () => {
          document.removeEventListener('keydown', keyHandler, false);
        };
    }, []);

    /*--------------------------------------------------------
    ----- IMPLÉMENTATION DU KONAMI CODE POUR MODALE AUTH -----
    --------------------------------------------------------*/

    let konamiPattern = ['s', 'o', 'u', 'f', 'f', 'l', 'e', 'u', 'r'];
    let current = 0;
    const keyHandler = (event) => {
        if (konamiPattern.indexOf(event.key) < 0 || event.key !== konamiPattern[current])  {
            current = 0;
            return;
        }
        current++;
        if (konamiPattern.length === current) {
            current = 0;
            handleAuthModal();
        }
    }

    /*-------------------------------------------------------
    ----- GESTION OUVERTURE/FERMETURE DE LA MODALE AUTH -----
    -------------------------------------------------------*/

    const [authModalDisplay, setAuthModalDisplay] = useState(false);

    const handleAuthModal = () => {
        setAuthModalDisplay(authModalDisplay === false ? true : false );
    }

    return  (      
        <footer className='footer'>
            {/* <p>
            La Compagnie Le Souffleur de verre est conventionnée avec le Ministère de la Culture - DRAC Auvergne-Rhône-Alpes, La Région Auvergne-Rhône-Alpes et la Ville de Clermont-Ferrand. Elle est Artiste Associée au Caméléon à Pont-du-Château (63), scène labellisée pour l’émergence et la création en Auvergne-Rhône-Alpes.      
            </p> */}
            <AuthModal handleAuthModal={handleAuthModal} authModalDisplay={authModalDisplay}/>
        </footer>
    )
}

export default Footer