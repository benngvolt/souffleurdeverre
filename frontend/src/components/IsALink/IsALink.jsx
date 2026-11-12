import './IsALink.scss'
import '../../pages/OneSpectacle/OneSpectacle.scss'
import '../../pages/Actualite/Actualite.scss'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'


 
function IsALink({link, name, className}) {

    
    return  (      
        <div className={`${className}`}>
        {link && link !== "" ? (
            <div>
                <a
                    href={link}
                    target='_blank'
                    rel='noreferrer'
                    className={`${className}_link`}
                >
                    {name}
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={`${className}_link_icon`} />
                </a>
            </div>
        ) : (
            <p className={`${className}_noLink`}>
                {name}
            </p>
        )}
        </div>
    )}

export default IsALink