import './Home.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext, useRef } from 'react'
import { Context } from '../../utils/Context'
import facebookLogo from '../../assets/facebook_black.png'
import xLogo from '../../assets/x_black.png'
import youtubeLogo from '../../assets/youtube_black.png'
import instagramLogo from '../../assets/instagram_black.png'
import logoSouffleur from '../../assets/logoSouffleur.svg'
import cedricVeschambre from '../../assets/Cedric_Veschambre_Julien_Bruhat.webp'
import ContactModal from '../../components/ContactModal/ContactModal'
import Loader from '../../components/Loader/Loader'


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

    // useEffect(() => {
    //     displayLoader();
    //     const timeout = setTimeout(() => {
    //         hideLoader();
    //     }, 3000);
    //     return () => clearTimeout(timeout);
    // }, []);

    return  (      
        <section className='home'>
            <div className='home_title'>
                <div ref={imageLogoRef} class="home_title_logoMask">
                    <img src={cedricVeschambre} alt="logo souffleur de verre"/>
                </div>
                <h1 className='home_title_text'> LE SOUFFLEUR DE VERRE</h1>
            </div>
            <nav className='home_nav'>
                <div className='home_nav_menu'>
                    <Link to="/compagnie" className='home_nav_menu_item'><h2>COMPAGNIE</h2></Link>
                    <Link to="/actualite" className='home_nav_menu_item'><h2>ACTUALITÉ</h2></Link>
                    <Link to="/spectacles" className='home_nav_menu_item'><h2>SPECTACLES</h2></Link>
                    <button aria-label='Afficher la fenêtre Contact' type='button' className='home_nav_menu_item' onClick={()=>setdisplayContactModal(true)}>CONTACT</button>
                    <Link to="/edit" className='home_nav_menu_item'><p>EDIT</p></Link>
                </div>
                <div className='home_nav_socials'>
                    <a href="https://www.facebook.com/souffleurdeverre" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src={facebookLogo} alt="lien facebook"/>
                    </a>
                    <a href="https://twitter.com/ciesouffleur" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src={xLogo} alt="lien x"/>
                    </a>
                    <a href="https://www.youtube.com/@compagnielesouffleurdeverr6312" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src={youtubeLogo} alt="lien youtube"/>
                    </a>
                    <a href="https://www.instagram.com/ciesouffleur" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src={instagramLogo} alt="lien instagram"/>
                    </a>
                </div>
            </nav>
            <article className={displayContactModal===true ? 'header_contactModal header_contactModal--open':' header_contactModal header_contactModal--close'}>
                <ContactModal setdisplayContactModal={setdisplayContactModal}/>
            </article>
            <div className={loaderDisplay===true?'homePage_loader--displayOn':'homePage_loader--displayOff'}>
                <Loader className='loader--opaque' loaderDisplay={loaderDisplay}/>
            </div>
        </section>
    )
}

export default Home