import './Home.scss'
import { Link } from 'react-router-dom'
// import React, { useContext, useEffect } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Home() {

    return  (      
        <section className='home'>
            <img src="assets/logoSouffleur.svg" alt="logo souffleur de verre"/>
            <nav>
                <Link to="/compagnie"><h2>COMPAGNIE</h2></Link>
                <Link to="/actualite"><h2>ACTUALITE</h2></Link>
                <Link to="/spectacles"><h2>SPECTACLES</h2></Link>
                <Link to="/equipe"><h2>EQUIPE</h2></Link>
                <Link to="/mediation"><h2>MEDIATION</h2></Link>
                <button>CONTACT</button>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" >
                    <img src="assets/facebook_black.png" alt="logo souffleur de verre"/>
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noreferrer">
                    <img src="assets/x_black.png" alt="logo souffleur de verre"/>
                </a>
                <a href="https://www.youtube.com" target="_blank" rel="noreferrer">
                    <img src="assets/youtube_black.png" alt="logo souffleur de verre"/>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
                    <img src="assets/instagram_black.png" alt="logo souffleur de verre"/>
                </a>
            </nav>
        </section>
    )
}

export default Home