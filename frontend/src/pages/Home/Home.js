import './Home.scss'
import { Link } from 'react-router-dom'
// import React, { useContext, useEffect } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Home() {

    return  (      
        <section className='home'>
            <div className='home_title'>
                <img className='home_title_logo' src="assets/logoSouffleur.svg" alt="logo souffleur de verre"/>
                <h1 className='home_title_text'> LE SOUFFLEUR DE VERRE</h1>
            </div>
            <nav className='home_nav'>
                <div className='home_nav_menu'>
                    <Link to="/compagnie" className='home_nav_menu_item'><h2>COMPAGNIE</h2></Link>
                    <Link to="/actualite" className='home_nav_menu_item'><h2>ACTUALITÉ</h2></Link>
                    <Link to="/spectacles" className='home_nav_menu_item'><h2>SPECTACLES</h2></Link>
                    <Link to="/equipe" className='home_nav_menu_item'><h2>ÉQUIPE</h2></Link>
                    <Link to="/mediation" className='home_nav_menu_item'><h2>MÉDIATION</h2></Link>
                    <button className='home_nav_menu_item'>CONTACT</button>
                    <Link to="/edit" className='home_nav_menu_item'><p>EDIT</p></Link>
                </div>
                <div className='home_nav_socials'>
                    <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src="assets/facebook_black.png" alt="lien facebook"/>
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src="assets/x_black.png" alt="lien x"/>
                    </a>
                    <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src="assets/youtube_black.png" alt="lien youtube"/>
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src="assets/instagram_black.png" alt="lien instagram"/>
                    </a>
                </div>
            </nav>
        </section>
    )
}

export default Home