import './HomeSpecial.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react'
import { Context } from '../../utils/Context'
import facebookLogo from '../../assets/facebook_black.png'
import xLogo from '../../assets/x_black.png'
import youtubeLogo from '../../assets/youtube_black.png'
import instagramLogo from '../../assets/instagram_black.png'
import logoSouffleur from '../../assets/logoSouffleur.svg'
import ContactModal from '../../components/ContactModal/ContactModal'
import Loader from '../../components/Loader/Loader'
import { useDocumentMeta } from '../../utils/useDocumentMeta'
import { SITE_URL } from '../../utils/constants'


function HomeSpecial() {

     /* ---------------------------
    ----- RÉCUPÉRATION CONTEXT ---
    ----------------------------*/
    const { loaderDisplay } = useContext(Context);

    const [displayContactModal, setdisplayContactModal]= useState(false);

    useDocumentMeta({
        title: 'Compagnie Le Souffleur de Verre',
        description: 'Compagnie de théâtre Le Souffleur de Verre : spectacles, actualités et médiations.',
        canonical: SITE_URL,
        ogTitle: 'Compagnie Le Souffleur de Verre',
        ogUrl: SITE_URL,
    })

    useEffect(() => {
        window.scrollTo(0, 0);
    },[]);

    return  (  
        <main>
            <section className='homeSpecial'>
                <div className='homeSpecial_title'>
                    <img src={logoSouffleur} alt="logo souffleur de verre"/>
                    <h1 className='homeSpecial_title_text'>LE SOUFFLEUR DE VERRE</h1>
                </div>
                <nav className='homeSpecial_nav'>
                    <ul className='homeSpecial_nav_menu'>
                        <li>
                            <Link aria-label='Accéder à la page Compagnie' to="/compagnie" className='homeSpecial_nav_menu_item'><h2>COMPAGNIE</h2></Link>
                        </li>
                        <span>-</span>
                        <li>
                            <Link aria-label='Accéder à la page Actualité' to="/actualite" className='homeSpecial_nav_menu_item'><h2>CALENDRIER</h2></Link>
                        </li>
                        <span>-</span>
                        <li>
                            <Link aria-label='Accéder à la page Spectacles' to="/spectacles" className='homeSpecial_nav_menu_item'><h2>SPECTACLES</h2></Link>
                        </li>
                        <span>-</span>
                        <li>
                            <Link aria-label='Accéder à la page Spectacles' to="/mediations" className='homeSpecial_nav_menu_item'><h2>MÉDIATIONS</h2></Link>
                        </li>
                        <span>-</span>
                        <li>
                            <button aria-label='Afficher la fenêtre Contact' type='button' className='homeSpecial_nav_menu_item' onClick={()=>setdisplayContactModal(true)}><p>CONTACT</p></button>
                        </li>
                    </ul>
                    <ul className='homeSpecial_nav_socials'>
                        <li>
                            <a aria-label='Accéder à la page Facebook de la compagnie' href="https://www.facebook.com/souffleurdeverre" target="_blank" rel="noreferrer" className='homeSpecial_nav_socials_item'>
                                <img src={facebookLogo} alt="lien facebook"/>
                            </a>
                        </li>
                        <li>
                            <a aria-label='Accéder à la page X (Twitter) de la compagnie' href="https://twitter.com/ciesouffleur" target="_blank" rel="noreferrer" className='homeSpecial_nav_socials_item'>
                                <img src={xLogo} alt="lien x"/>
                            </a>
                        </li>
                        <li>
                            <a aria-label='Accéder à la page Youtube de la compagnie' href="https://www.youtube.com/@compagnielesouffleurdeverr6312" target="_blank" rel="noreferrer" className='homeSpecial_nav_socials_item'>
                                <img src={youtubeLogo} alt="lien youtube"/>
                            </a>
                        </li>
                        <li>
                            <a aria-label='Accéder à la page Instagram de la compagnie' href="https://www.instagram.com/ciesouffleur" target="_blank" rel="noreferrer" className='homeSpecial_nav_socials_item'>
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

export default HomeSpecial