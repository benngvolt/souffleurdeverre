import './Header.scss'
import { Link } from 'react-router-dom'
import React, { useState } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'


 
function Header() {

    const [displayMenu, setDisplayMenu] = useState (false)

    function showMenu() {
        setDisplayMenu(true)
    }

    function hideMenu() {
        setDisplayMenu(false)
}

    return  (      
        <header className={displayMenu===true ? 'header header--opened' : 'header header--closed'} onMouseOver={()=>showMenu()} onMouseLeave={()=>hideMenu()} >
            
            <svg id="hamburger" className={displayMenu===true? 'header_icon header_icon--opened':'header_icon header_icon--closed'} viewbox="0 0 60 30">
                <g stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path id="top-line" d="M10,10 L50,10 Z"></path>
                    <path id="middle-line" d="M10,20 L50,20 Z"></path>
                    <path id="bottom-line" d="M10,30 L50,30 Z"></path>
                </g>
            </svg>
            <nav className={displayMenu===false?'header_nav header_nav--displayOff':'header_nav header_nav--displayOn'}>
                <div className='header_nav_menu'>
                    <Link to="/" className='header_nav_menu_item'><h2>ACCUEIL</h2></Link>
                    <Link to="/compagnie" className='header_nav_menu_item'><h2>COMPAGNIE</h2></Link>
                    <Link to="/actualite" className='header_nav_menu_item'><h2>ACTUALITÉ</h2></Link>
                    <Link to="/spectacles" className='header_nav_menu_item'><h2>SPECTACLES</h2></Link>
                    <button className='header_nav_menu_item'>CONTACT</button>
                    <Link to="/edit" className='header_nav_menu_item'><p>EDIT</p></Link>
                </div>
            </nav>
        </header>
    )
}

export default Header