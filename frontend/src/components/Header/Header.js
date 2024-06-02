import './Header.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext, useRef } from 'react'
import { Context } from '../../utils/Context'
import facebookLogo from '../../assets/facebook_black.png'
import xLogo from '../../assets/x_black.png'
import youtubeLogo from '../../assets/youtube_black.png'
import instagramLogo from '../../assets/instagram_black.png'
import ContactModal from '../ContactModal/ContactModal'
import { useLocation, useNavigate } from 'react-router-dom';

 
function Header() {

    const [displayMenu, setDisplayMenu] = useState (false);
    const [displayContactModal, setdisplayContactModal]= useState(false);
    const location = useLocation();
    const { setLoggedIn, setLoggedOut, isAuthenticated } = useContext(Context);
    const navigate = useNavigate();

    /*-------------------------------------------------------------
    ----- SYSTEME DE SUIVI / OUVERTURE ET FERMETURE DU HEADER -----
    -------------------------------------------------------------*/
    const [isMouseOverHeader, setIsMouseOverHeader] = useState(false); // État pour suivre si la souris est sur le Header
    const scrollMargin = 10;
    const screenWidth = window.innerWidth;
    
    useEffect(() => {
        // Définissez la marge de défilement ici, par exemple 10 pixels
        const handleScroll = () => {
            
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (!isMouseOverHeader) { // Vérifier si la souris n'est pas sur le Header
                    setDisplayMenu(scrollTop <= scrollMargin);
                }
            
        }
        
        const throttleScroll = () => {
            
                let isThrottled = false;
                return () => {
                    if (!isThrottled) {
                        isThrottled = true;
                        requestAnimationFrame(() => {
                            handleScroll();
                            isThrottled = false;
                        })
                    }
                }
            
        }

        const throttledScroll = throttleScroll();

        window.addEventListener('scroll', throttledScroll);

        return () => {      
            window.removeEventListener('scroll', throttledScroll);
        }

    }, [isMouseOverHeader, location.pathname]); // Ajoutez isMouseOverHeader comme dépendance

    const handleMouseOver = () => {  
        if (screenWidth > 991) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop <= scrollMargin) {
                    return;
                }
                setIsMouseOverHeader(true); // La souris est sur le Header
                setDisplayMenu(true); // Toujours afficher le Header lorsque survolé
            } else  {
                setDisplayMenu(true);
            }
    };

    const handleMouseLeave = () => {
        if (screenWidth > 991) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop <= scrollMargin) {
                setDisplayMenu(true);
                return;
            }
            setIsMouseOverHeader(false);// La souris n'est plus sur le Header
            setDisplayMenu(false);
        } else {
            setIsMouseOverHeader(false);
            setDisplayMenu(false);
        }
    };


    return  (      
        <header className={location.pathname!=='/'? (displayMenu===true? 'header header--opened' : 'header header--closed') : 'header--displayOff'} 
        onMouseLeave={()=>{
            handleMouseLeave()
        }}
        onMouseOver={()=>{
            handleMouseOver()
        }} >
            
            <svg id="hamburger" className={displayMenu===true? 'header_icon header_icon--opened':'header_icon header_icon--closed'} viewbox="0 0 60 30">
                <g stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path id="top-line" d="M10,10 L50,10 Z"></path>
                    <path id="middle-line" d="M10,20 L50,20 Z"></path>
                    <path id="bottom-line" d="M10,30 L50,30 Z"></path>
                </g>
            </svg>
            <nav className={displayMenu===false?'header_nav header_nav--displayOff':'header_nav header_nav--displayOn'}>
                <ul className='header_nav_socials'>
                    <li className='header_nav_socials_item'>
                        <a href="https://www.facebook.com/souffleurdeverre" target="_blank" rel="noreferrer">
                            <img src={facebookLogo} alt="lien facebook"/>
                        </a>
                    </li>
                    <li className='header_nav_socials_item'>
                        <a href="https://twitter.com/ciesouffleur" target="_blank" rel="noreferrer">
                            <img src={xLogo} alt="lien x"/>
                        </a>
                    </li>
                    <li className='header_nav_socials_item'>
                        <a href="https://www.youtube.com/@compagnielesouffleurdeverr6312" target="_blank" rel="noreferrer">
                            <img src={youtubeLogo} alt="lien youtube"/>
                        </a>
                    </li>
                    <li className='header_nav_socials_item'>
                        <a href="https://www.instagram.com/ciesouffleur" target="_blank" rel="noreferrer">
                            <img src={instagramLogo} alt="lien instagram"/>
                        </a>
                    </li>
                </ul>
                <ul className='header_nav_menu'>
                    <li className='header_nav_menu_item header_nav_menu_item--light'>
                        <Link to="/"><p>ACCUEIL</p></Link>
                    </li>
                    <li className={location.pathname!=='/compagnie'?'header_nav_menu_item header_nav_menu_item--light':'header_nav_menu_item header_nav_menu_item--bold'}>
                        <Link to="/compagnie"><h2>COMPAGNIE</h2></Link>
                    </li>
                    <li className={location.pathname!=='/actualite'?'header_nav_menu_item header_nav_menu_item--light':'header_nav_menu_item header_nav_menu_item--bold'}>
                        <Link to="/actualite"><h2>ACTUALITÉ</h2></Link>
                    </li>
                    <li className={location.pathname!=='/spectacles'?'header_nav_menu_item header_nav_menu_item--light':'header_nav_menu_item header_nav_menu_item--bold'}>
                        <Link to="/spectacles"><h2>SPECTACLES</h2></Link>
                    </li>
                    <li className='header_nav_menu_item header_nav_menu_item--light'>
                        <button aria-label='Afficher la fenêtre Contact' type='button' onClick={()=>setdisplayContactModal(true)}>CONTACT</button>
                    </li>
                    <li className={isAuthenticated===true?(location.pathname!=='/edit'?'header_nav_menu_item header_nav_menu_item--edit header_nav_menu_item--light':'header_nav_menu_item header_nav_menu_item--edit header_nav_menu_item--bold'):'header_nav_menu_item--displayOff'}>
                        <Link to="/edit"><p>EDIT</p></Link>
                    </li>
                    <li className={isAuthenticated===true?'header_nav_menu_item':'header_nav_menu_item--displayOff'}>
                        <button aria-label='Se déconnecter' type='button' 
                        onClick={()=> {
                            setLoggedOut();
                            navigate('/spectacles');
                            }
                        }>LOGOUT</button>
                    </li>
                </ul>
            </nav>
            <aside className={displayContactModal===true ? 'header_contactModal header_contactModal--open':' header_contactModal header_contactModal--close'}>
                <ContactModal setdisplayContactModal={setdisplayContactModal}/>
            </aside>
            
        </header>
    )
}

export default Header