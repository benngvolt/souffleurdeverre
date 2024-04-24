import './ContactModal.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXmark} from '@fortawesome/free-solid-svg-icons'
import logoSouffleur from '../../assets/logoSouffleur.svg'


function ContactModal({setdisplayContactModal}) {

    
    return  (      
        <section className='contactModal'>
            <button 
                type='button' 
                className='contactModal_closeButton' 
                aria-label="Fermer la modale Contact"
                onClick={()=>setdisplayContactModal(false)}>
                <FontAwesomeIcon 
                    icon={faXmark} 
                    className='contactModal_closeButton_icon'/>
            </button>

            <div className='contactModal_container'>
                <div className='home_title'>
                    <img className='home_title_logo' src={logoSouffleur} alt="logo souffleur de verre"/>
                    <h1 className='home_title_text'> LE SOUFFLEUR DE VERRE</h1>
                </div>
                <div className='contactModal_container_datas'>
                    <div className='contactModal_container_datas_block'>
                        <p className='contactModal_container_datas_block_title'>Responsables artistiques</p>
                        <p className='contactModal_container_datas_block_text--bold'>Julien Rocha</p>
                        <p className='contactModal_container_datas_block_text--light'>
                        06 61 19 39 35 <br/> 
                        julien.rocha63@gmail.com </p>
                        <p className='contactModal_container_datas_block_text--bold'>Cédric Veschambre</p>
                        <p className='contactModal_container_datas_block_text--light'>
                        06 63 07 46 44 <br/> 
                        cedric.veschambre@gmail.com </p>
                    </div>
                    <div className='contactModal_container_datas_block_block'>
                        <p className='contactModal_container_datas_block_title'>Administration de production</p>
                        <p className='contactModal_container_datas_block_text--bold'>Cédric Veschambre et Marion Galon</p>
                        <p className='contactModal_container_datas_block_text--light'>
                        07 86 55 81 26<br/> 
                        marion.souffleur@gmail.com
                        </p>
                    </div>
                    <div className='contactModal_container_datas_block'>
                        <p className='contactModal_container_datas_block_title'>Fiche technique et administration</p>
                        <p className='contactModal_container_datas_block_text--light'>ciesouffleur@hotmail.com
                        </p> 
                        <p className='contactModal_container_datas_block_text--light'>
                        Compagnie Le Souffleur de Verre <br/> 
                        36 rue de Blanzat<br/> 
                        63100 Clermont-Ferrand
                        </p>
                    </div>
                    <div className='contactModal_container_datas_block_block'>
                        <p className='contactModal_container_datas_block_title'>Crédit</p>
                        <p className='contactModal_container_datas_block_text--light'>Identité visuelle et logo Compagnie Souffleur de Verre © Ben Gibert <br/>
                        www.bengibert.com
                        </p> 
                    </div>
                    <div className='contactModal_container_datas_block'>
                        <p className='contactModal_container_datas_block_text--light'>La Compagnie Le Souffleur de Verre est conventionnée <br/>
                        avec le Ministère de la Culture/Drac Auvergne-Rhône-Alpes, <br/>
                        la Région Auvergne-Rhône-Alpes, et la Ville de Clermont-Ferrand.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactModal