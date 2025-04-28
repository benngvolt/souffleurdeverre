import './ImagesGallery.scss'
import ImageBox from '../../components/ImageBox/ImageBox'
import React, { useState, useEffect} from 'react'

function ImagesGallery({project}) {

    const imagesGallery = project.images.filter((image, index) => index > 0)
    const [handleDisplayImage, setHandleDisplayImage] = useState(false);
    const [imageBoxUrl, setImageBoxUrl] = useState('');

    const handleImageDisplay = (imageUrl) => {
        if (handleDisplayImage===true) {
            setHandleDisplayImage(false);
        } else {
            setHandleDisplayImage(true);
        }
        setImageBoxUrl(imageUrl)
    };

    return  (         
        <section>
            <ul className={`oneSpectacle_imagesGrid oneSpectacle_imagesGrid_${imagesGallery?.length}`}>
                {imagesGallery?.map((image, index) => (
                    <li key={image._id} className={`oneSpectacle_imagesGrid_item oneSpectacle_imagesGrid_${imagesGallery?.length}_item_${index}`}>
                        <img alt={project.title + image._id} src={image.imageUrl} onClick={() => handleImageDisplay(image.imageUrl)}/>
                    </li>
                ))}
            </ul>
            {handleDisplayImage===true &&
            <div className='imageGallery_imageBox' onClick={() => setHandleDisplayImage(false)}>
                <ImageBox imageUrl={imageBoxUrl} setHandleDisplayImage={setHandleDisplayImage}/>
            </div>
            }
        </section>
    )
}

export default ImagesGallery