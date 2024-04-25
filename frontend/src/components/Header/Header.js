import './Header.scss'
import { Link } from 'react-router-dom'
import React, { useState } from 'react'
import facebookLogo from '../../assets/facebook_black.png'
import xLogo from '../../assets/x_black.png'
import youtubeLogo from '../../assets/youtube_black.png'
import instagramLogo from '../../assets/instagram_black.png'
import ContactModal from '../ContactModal/ContactModal'
import { useLocation } from 'react-router-dom';


 
function Header() {

    const [displayMenu, setDisplayMenu] = useState (false);
    const [displayContactModal, setdisplayContactModal]= useState(false);
    const location = useLocation();

    function showMenu() {
        setDisplayMenu(true)
    }

    function hideMenu() {
        setDisplayMenu(false)
    }

    return  (      
        <header className={location.pathname!=='/'? (displayMenu===true ? 'header header--opened' : 'header header--closed') : 'header--displayOff'} onMouseOver={()=>showMenu()} onMouseLeave={()=>hideMenu()} >
            
            <svg id="hamburger" className={displayMenu===true? 'header_icon header_icon--opened':'header_icon header_icon--closed'} viewbox="0 0 60 30">
                <g stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path id="top-line" d="M10,10 L50,10 Z"></path>
                    <path id="middle-line" d="M10,20 L50,20 Z"></path>
                    <path id="bottom-line" d="M10,30 L50,30 Z"></path>
                </g>
            </svg>
            <nav className={displayMenu===false?'header_nav header_nav--displayOff':'header_nav header_nav--displayOn'}>
                <div className='header_nav_socials'>
                    <a href="https://www.facebook.com/souffleurdeverre" target="_blank" rel="noreferrer" className='header_nav_socials_item'>
                        <img src={facebookLogo} alt="lien facebook"/>
                    </a>
                    <a href="https://twitter.com/ciesouffleur" target="_blank" rel="noreferrer" className='header_nav_socials_item'>
                        <img src={xLogo} alt="lien x"/>
                    </a>
                    <a href="https://www.youtube.com/@compagnielesouffleurdeverr6312" target="_blank" rel="noreferrer" className='header_nav_socials_item'>
                        <img src={youtubeLogo} alt="lien youtube"/>
                    </a>
                    <a href="https://www.instagram.com/ciesouffleur" target="_blank" rel="noreferrer" className='header_nav_socials_item'>
                        <img src={instagramLogo} alt="lien instagram"/>
                    </a>
                </div>
                <div className='header_nav_menu'>
                    <Link to="/" className='header_nav_menu_item'><h2>ACCUEIL</h2></Link>
                    <Link to="/compagnie" className='header_nav_menu_item'><h2>COMPAGNIE</h2></Link>
                    <Link to="/actualite" className='header_nav_menu_item'><h2>ACTUALITÉ</h2></Link>
                    <Link to="/spectacles" className='header_nav_menu_item'><h2>SPECTACLES</h2></Link>
                    <button aria-label='Afficher la fenêtre Contact' type='button' className='header_nav_menu_item' onClick={()=>setdisplayContactModal(true)}>CONTACT</button>
                    <Link to="/edit" className='header_nav_menu_item'><p>EDIT</p></Link>
                </div>
            </nav>
            <article className={displayContactModal===true ? 'header_contactModal header_contactModal--open':' header_contactModal header_contactModal--close'}>
                <ContactModal setdisplayContactModal={setdisplayContactModal}/>
            </article>
        </header>
    )
}

export default Header