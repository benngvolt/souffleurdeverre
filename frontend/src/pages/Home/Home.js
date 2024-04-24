import './Home.scss'
import { Link } from 'react-router-dom'
import facebookLogo from '../../assets/facebook_black.png'
import xLogo from '../../assets/x_black.png'
import youtubeLogo from '../../assets/youtube_black.png'
import instagramLogo from '../../assets/instagram_black.png'
import logoSouffleur from '../../assets/logoSouffleur.svg'
import cedricVeschambre from '../../assets/Cedric_Veschambre_Julien_Bruhat.jpg'

 
function Home() {

    return  (      
        <section className='home'>
            <div className='home_title'>
                <div class="home_title_logoMask">
                    <img src={cedricVeschambre} alt="logo souffleur de verre"/>
                </div>
                {/* <img className='home_title_logo' src={logoSouffleur} alt="logo souffleur de verre"/> */}
                <h1 className='home_title_text'> LE SOUFFLEUR DE VERRE</h1>
            </div>
            <nav className='home_nav'>
                {/* <div className='home_nav_menu'>
                    <Link to="/compagnie" className='home_nav_menu_item'><h2>COMPAGNIE</h2></Link>
                    <Link to="/actualite" className='home_nav_menu_item'><h2>ACTUALITÉ</h2></Link>
                    <Link to="/spectacles" className='home_nav_menu_item'><h2>SPECTACLES</h2></Link>
                    <Link to="/equipe" className='home_nav_menu_item'><h2>ÉQUIPE</h2></Link>
                    <Link to="/mediation" className='home_nav_menu_item'><h2>MÉDIATION</h2></Link>
                    <button className='home_nav_menu_item'>CONTACT</button>
                    <Link to="/edit" className='home_nav_menu_item'><p>EDIT</p></Link>
                </div> */}
                <div className='home_nav_socials'>
                    <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src={facebookLogo} alt="lien facebook"/>
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src={xLogo} alt="lien x"/>
                    </a>
                    <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src={youtubeLogo} alt="lien youtube"/>
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                        <img src={instagramLogo} alt="lien instagram"/>
                    </a>
                </div>
            </nav>
        </section>
    )
}

export default Home