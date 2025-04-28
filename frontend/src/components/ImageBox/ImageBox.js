import './ImageBox.scss'
import React, { useState } from 'react'
 
function ImageBox({imageUrl, setHandleDisplayImage}) {


    return  (      
        <div className='imageBox' >
            <img src={imageUrl} onClick={(e) => e.stopPropagation()}/>
        </div>
    )
}

export default ImageBox