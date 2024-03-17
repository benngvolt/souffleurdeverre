import './IsALink.scss'
import '../../pages/OneSpectacle/OneSpectacle.scss'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'


 
function IsALink({link, name}) {

    
    return  (      
        <div className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text'>
        {link && link !== "" ? (
            <div>
                <a
                    href={link}
                    target='_blank'
                    rel='noreferrer'
                    className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text_link'
                >
                    {name}
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text_link_icon' />
                </a>
            </div>
        ) : (
            <p className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text_noLink'>
                {name}
            </p>
        )}
        </div>
    )}

export default IsALink