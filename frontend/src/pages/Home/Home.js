import './Home.scss'
import { Link } from 'react-router-dom'
// import React, { useContext, useEffect } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Home() {

    return  (      
        <section className='home'>
            <img src="assets/logoSouffleur.svg" alt="logo souffleur de verre"/>
            <h1> Le Souffleur de Verre</h1>
            <nav>
                <Link to="/compagnie"><h2>LA COMPAGNIE</h2></Link>
                <Link to="/actualite"><h2>ACTUALITE</h2></Link>
                <Link to="/spectacles"><h2>SPECTACLES</h2></Link>
                <Link to="/equipe"><h2>EQUIPE</h2></Link>
                <Link to="/mediation"><h2>MEDIATION</h2></Link>
                <Link to="/edit"><p>EDIT</p></Link>
                <button>CONTACT</button>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" >
                    <img src="assets/facebook_black.png" alt="lien facebook"/>
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noreferrer">
                    <img src="assets/x_black.png" alt="lien x"/>
                </a>
                <a href="https://www.youtube.com" target="_blank" rel="noreferrer">
                    <img src="assets/youtube_black.png" alt="lien youtube"/>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
                    <img src="assets/instagram_black.png" alt="lien instagram"/>
                </a>
            </nav>
        </section>
    )
}

export default Home