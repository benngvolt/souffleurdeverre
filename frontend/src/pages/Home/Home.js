import './Home.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext, useRef } from 'react'
import { Context } from '../../utils/Context'
import facebookLogo from '../../assets/facebook_black.png'
import xLogo from '../../assets/x_black.png'
import youtubeLogo from '../../assets/youtube_black.png'
import instagramLogo from '../../assets/instagram_black.png'
import cedricVeschambre from '../../assets/Cedric_Veschambre_Julien_Bruhat.webp'
import ContactModal from '../../components/ContactModal/ContactModal'
import Loader from '../../components/Loader/Loader'
import ActualiteCarousel from '../../components/ActualiteCarousel/ActualiteCarousel'


function Home() {

     /* ---------------------------
    ----- RÉCUPÉRATION CONTEXT ---
    ----------------------------*/
    const {
        loaderDisplay,
        displayLoader,
        hideLoader
        } 
        = useContext(Context);

    const [displayContactModal, setdisplayContactModal]= useState(false);

    const imageLogoRef = useRef(null);
    
    useEffect(() => {
        window.scrollTo(0, 0);
    },[]);

    return  (  
        <main>
            <section className='home'>
                <div className='home_title'>
                    <div ref={imageLogoRef} class="home_title_logoMask">
                        <img src={cedricVeschambre} alt="logo souffleur de verre"/>
                    </div>
                    <h1 className='home_title_text'>COMPAGNIE LE SOUFFLEUR DE VERRE</h1>
                </div>
                <ActualiteCarousel />
                <nav className='home_nav'>
                    <ul className='home_nav_menu'>
                        <li>
                            <Link aria-label='Accéder à la page Compagnie' to="/compagnie" className='home_nav_menu_item'><h2>COMPAGNIE</h2></Link>
                        </li>
                        <li>
                            <Link aria-label='Accéder à la page Actualité' to="/actualite" className='home_nav_menu_item'><h2>CALENDRIER</h2></Link>
                        </li>
                        <li>
                            <Link aria-label='Accéder à la page Spectacles' to="/spectacles" className='home_nav_menu_item'><h2>SPECTACLES</h2></Link>
                        </li>
                        <li>
                            <button aria-label='Afficher la fenêtre Contact' type='button' className='home_nav_menu_item' onClick={()=>setdisplayContactModal(true)}><p>CONTACT</p></button>
                        </li>
                    </ul>
                    <ul className='home_nav_socials'>
                        <li>
                            <a aria-label='Accéder à la page Facebook de la compagnie' href="https://www.facebook.com/souffleurdeverre" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                                <img src={facebookLogo} alt="lien facebook"/>
                            </a>
                        </li>
                        <li>
                            <a aria-label='Accéder à la page X (Twitter) de la compagnie' href="https://twitter.com/ciesouffleur" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                                <img src={xLogo} alt="lien x"/>
                            </a>
                        </li>
                        <li>
                            <a aria-label='Accéder à la page Youtube de la compagnie' href="https://www.youtube.com/@compagnielesouffleurdeverr6312" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                                <img src={youtubeLogo} alt="lien youtube"/>
                            </a>
                        </li>
                        <li>
                            <a aria-label='Accéder à la page Instagram de la compagnie' href="https://www.instagram.com/ciesouffleur" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                                <img src={instagramLogo} alt="lien instagram"/>
                            </a>
                        </li>
                    </ul>
                </nav>
                <aside className={displayContactModal===true ? 'header_contactModal header_contactModal--open':' header_contactModal header_contactModal--close'}>
                    <ContactModal setdisplayContactModal={setdisplayContactModal}/>
                </aside>
                <div className={loaderDisplay===true?'homePage_loader--displayOn':'homePage_loader--displayOff'}>
                    <Loader className='loader--opaque' loaderDisplay={loaderDisplay}/>
                </div>
            </section>
        </main>
    )
}

export default Home