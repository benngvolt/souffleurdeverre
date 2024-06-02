import './ImagesGallery.scss'
 
function ImagesGallery({project}) {

    const imagesGallery = project.images.filter((image, index) => index > 0)
    
    return  (         
        <section>
            <ul className={`oneSpectacle_imagesGrid oneSpectacle_imagesGrid_${imagesGallery?.length}`}>
                {imagesGallery?.map((image, index) => (
                    <li className={`oneSpectacle_imagesGrid_item oneSpectacle_imagesGrid_${imagesGallery?.length}_item_${index}`}>
                        <img key={image._id} alt={project.title + image._id} src={image.imageUrl}/>
                    </li>
                
                ))}
            </ul>
        </section>
    )
}

export default ImagesGallery