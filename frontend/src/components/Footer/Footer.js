import './Footer.scss'
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
            <AuthModal handleAuthModal={handleAuthModal} authModalDisplay={authModalDisplay}/>
        </footer>
    )
}

export default Footer