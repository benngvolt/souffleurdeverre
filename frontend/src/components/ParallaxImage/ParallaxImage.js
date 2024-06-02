import './ParallaxImage.scss'
import React, { useRef } from 'react'

function ParallaxImage({image}) {

    const parallaxRef = useRef(null);
    
    return (
        <div className='oneSpectacle_parallaxContainer'>
            <div
                className='oneSpectacle_parallaxContainer_parallax'
                ref={parallaxRef}
                style={{ backgroundImage: image?.imageUrl ? `url(${image.imageUrl})` : 'none' }}
            >
            </div>
        </div>
    );
}

export default ParallaxImage