import './ImagesGallery.scss'
import ImageBox from '../../components/ImageBox/ImageBox'
import React, { useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

function ImagesGallery({ project }) {
  const imagesGallery = useMemo(
    () => (project?.images || []).filter((_, index) => index > 0),
    [project?.images]
  )

  const [handleDisplayImage, setHandleDisplayImage] = useState(false)
  const [imageBoxUrl, setImageBoxUrl] = useState('')
  const prefersReduced = useReducedMotion()

  const handleImageDisplay = (imageUrl) => {
    setHandleDisplayImage((prev) => !prev)
    setImageBoxUrl(imageUrl)
  }

  // Parent: déclenche la cascade
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, when: 'beforeChildren' }
    }
  }

  // Chaque item: noir -> image (+ léger slide si motion non réduit)
  const item = {
    hidden: {
      opacity: 1,               // on reste visible mais "éteint"
      filter: 'brightness(0)',  // image noire
      y: prefersReduced ? 0 : 80 // descend bien plus bas hors du flow visuel
    },
    visible: {
      opacity: 1,
      filter: 'brightness(1)',   // retour normal
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  }

  const viewport = { once: true, margin: '0px 0px -10% 0px' }

  return (
    <section>
      <motion.ul
        className={`oneSpectacle_imagesGrid oneSpectacle_imagesGrid_${imagesGallery?.length}`}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        {imagesGallery?.map((image, index) => (
          <motion.li
            key={image._id || image.imageUrl || index}
            className={`oneSpectacle_imagesGrid_item oneSpectacle_imagesGrid_${imagesGallery?.length}_item_${index}`}
            variants={item}
          >
            <img
              alt={`${project?.title || 'image'} ${image._id || ''}`}
              src={image.imageUrl}
              onClick={() => handleImageDisplay(image.imageUrl)}
            />
          </motion.li>
        ))}
      </motion.ul>

      {handleDisplayImage === true && (
        <div
          className="imageGallery_imageBox"
          onClick={() => setHandleDisplayImage(false)}
        >
          <ImageBox imageUrl={imageBoxUrl} setHandleDisplayImage={setHandleDisplayImage} />
        </div>
      )}
    </section>
  )
}

export default ImagesGallery
