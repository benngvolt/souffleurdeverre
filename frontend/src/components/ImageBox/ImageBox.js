import './ImageBox.scss'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXmark} from '@fortawesome/free-solid-svg-icons'

 
function ImageBox({imageUrl, setHandleDisplayImage}) {


    return  (      
        <div className='imageBox' >
            <div class="imageBox_imageWrapper">
                <img src={imageUrl} onClick={(e) => e.stopPropagation()}/>
                <FontAwesomeIcon icon={faXmark}/>
            </div>
        </div>
    )
}

export default ImageBox