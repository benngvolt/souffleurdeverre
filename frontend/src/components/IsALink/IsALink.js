import './IsALink.scss'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'


 
function IsALink({link, name}) {

    
    return  (      
        <div>
        {link && link !== "" ? (
            <div>
                <a
                    href={link}
                    target='_blank'
                    rel='noreferrer'
                    className='oneSpectacle_residenciesList_firstShows_list_item_link'
                >
                    {name}
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='oneSpectacle_residenciesList_firstShows_list_item_link_icon' />
                </a>
            </div>
        ) : (
            <p className='oneSpectacle_residenciesList_firstShows_list_item_noLink'>
                {name}
            </p>
        )}
        </div>
    )}

export default IsALink