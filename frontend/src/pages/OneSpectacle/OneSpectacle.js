import './OneSpectacle.scss'
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { API_URL } from '../../utils/constants'
import { useParams } from 'react-router-dom'
import { Context } from '../../utils/Context'
import IsALink from '../../components/IsALink/IsALink'
import DOMPurify from 'dompurify'
import FullPeriodDate from '../../components/FullPeriodDate/FullPeriodDate'
import FullPonctualDates from '../../components/FullPonctualDates/FullPonctualDates'
import FullUniqueDate from '../../components/FullUniqueDate/FullUniqueDate'
import Collapse from '../../components/Collapse/Collapse'
import ImagesGallery from '../../components/ImagesGallery/ImagesGallery'
import ParallaxImage from '../../components/ParallaxImage/ParallaxImage'
import { motion, useReducedMotion } from 'framer-motion'

function OneSpectacle() {
  const [project, setProject] = useState([])
  const { id } = useParams()
  const { productionFunctions, residencyTypes, isAuthenticated } = useContext(Context)
  const cleanedDescription = DOMPurify.sanitize(project.description)

  const reduceMotion = useReducedMotion()

  // Variants
  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, when: 'beforeChildren' } },
  };
  

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' }
    }
  }

  const dataKey = useMemo(
    () => project?._id || project?.title || `loading-${id}`,
    [project?._id, project?.title, id]
  );

  useEffect(() => {
    fetch(`${API_URL}/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data)
      })
      .catch((error) => console.log(error.message))
  }, [id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const viewportOnce = { once: true, margin: '0px 0px -10% 0px' } // déclenche un peu avant le bas

  return (
    <section className='oneSpectacle'>
      {(project.projectState !== "*non visible*" || (project.projectState === "*non visible*" && isAuthenticated === true)) && (
        <div>

          {/* Titre + métadonnées */}
          <motion.div
            key={dataKey}                 // <-- remount ici quand le projet se charge
            className='oneSpectacle_mainDatas'
            variants={container}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          >
            <motion.h3 className='oneSpectacle_mainDatas_title' variants={fadeUp}>
              {project.title}
            </motion.h3>

            {project.subtitle && (
                <motion.p className='oneSpectacle_mainDatas_subtitle' variants={fadeUp}>
                {project.subtitle}
                </motion.p>
            )}

            {project.moreInfos && (
                <motion.p className='oneSpectacle_mainDatas_moreInfos' variants={fadeUp}>
                {project.moreInfos}
                </motion.p>
            )}

            {project.creationDate && (
                <motion.div variants={fadeUp}>
                <FullUniqueDate creationDate={project.creationDate} />
                </motion.div>
            )}

            {project.duration && (
                <motion.p className='oneSpectacle_mainDatas_duration' variants={fadeUp}>
                durée {project.duration}
                </motion.p>
            )}

            {project.description && (
                <motion.p
                className='oneSpectacle_mainDatas_description'
                variants={fadeUp}
                dangerouslySetInnerHTML={{ __html: cleanedDescription }}
                />
            )}

            {project.images && project.images?.length >= 1 && (
                <div>
                <ParallaxImage image={project.images[0]} />
                </div>
            )}

            {/* Équipe */}
            {project.artistsList && project.artistsList.length !== 0 && (
              <motion.div
                className='oneSpectacle_mainDatas_teamList'
                variants={container}
                initial='hidden'
                whileInView='visible'
                viewport={viewportOnce}
              >
                <motion.ul
                  className='oneSpectacle_mainDatas_teamList_artistsList'
                  variants={container}
                >
                  {project.artistsList?.map((artist) => (
                    <motion.li
                      key={artist._id}
                      className='oneSpectacle_mainDatas_teamList_artistsList_item'
                      variants={item}
                    >
                      <p className='oneSpectacle_mainDatas_teamList_artistsList_item_function'>{artist.artistFunction}</p>
                      <p className='oneSpectacle_mainDatas_teamList_artistsList_item_names'>{artist.artistName}</p>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}

            {/* Paragraphes + médias */}
            {project.paragraphList && project.paragraphList.length !== 0 && (
              <motion.div
                className='oneSpectacle_mainDatas_paragraphs'
                variants={container}
                initial='hidden'
                whileInView='visible'
                viewport={viewportOnce}
              >
                {project.paragraphList?.map((paragraph, idx) => (
                  <motion.div
                    key={idx}
                    className='oneSpectacle_mainDatas_paragraphs_paragraphContainer'
                    variants={item}
                  >
                    {paragraph.paragraphTitle && (
                      <p className='oneSpectacle_mainDatas_paragraphs_paragraphContainer_paragraphTitle'>
                        {paragraph.paragraphTitle}
                      </p>
                    )}
                    <p
                      className='oneSpectacle_mainDatas_paragraphs_paragraphContainer_paragraphText'
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paragraph.paragraphText) }}
                    />
                  </motion.div>
                ))}

                <motion.div className='oneSpectacle_mainDatas_mediaLinks' variants={fadeUp}>
                  <div className='oneSpectacle_mainDatas_mediaLinks_videosContainer'>
                    {project.videoList?.map((video) => (
                      <a
                        className='oneSpectacle_mainDatas_mediaLinks_videosContainer_video'
                        key={video._id}
                        href={video.videoLink ? video.videoLink : ''}
                        target='_blank'
                        rel='noreferrer'
                      >
                        {video.videoName}
                      </a>
                    ))}
                  </div>
                  <div className='oneSpectacle_mainDatas_mediaLinks_pdfsContainer'>
                    {project.pdfList?.map((pdf) => (
                      <a
                        className='oneSpectacle_mainDatas_mediaLinks_pdfsContainer_pdf'
                        key={pdf._id}
                        href={pdf.pdfLink ? pdf.pdfLink : ''}
                        target='_blank'
                        rel='noreferrer'
                      >
                        {pdf.pdfName}
                      </a>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Galerie (si > 1 image) */}
          {project.images && project.images?.length > 1 && (
            <motion.div variants={fadeUp} initial='hidden' whileInView='visible' viewport={viewportOnce}>
              <ImagesGallery project={project} />
            </motion.div>
          )}

          {/* Diffusion */}
          {project.showsList && project.showsList.length !== 0 && (
            <motion.div
              className='oneSpectacle_mainDatas_residenciesAndShows'
              variants={fadeUp}
              initial='hidden'
              whileInView='visible'
              viewport={viewportOnce}
            >
              <div className='oneSpectacle_mainDatas_residenciesAndShows_showsList'>
                <p className='oneSpectacle_mainDatas_residenciesAndShows_showsList_title'>DIFFUSION</p>
                <motion.ul
                  className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list'
                  variants={container}
                  initial='hidden'
                  whileInView='visible'
                  viewport={viewportOnce}
                >
                  {project.showsList?.map((show) => (
                    <motion.li
                      key={show.id}
                      className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item'
                      variants={item}
                    >
                      <FullPonctualDates datesArray={show.dates} className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item' />
                      <p className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item_places'>
                        <IsALink className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item_places' link={show.placeLink} name={show.placeName} />
                        {`/ ${show.city ? show.city : ''}`}
                      </p>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          )}

          {/* Production */}
          {project.productionList && project.productionList.length !== 0 && (
            <motion.div variants={fadeUp} initial='hidden' whileInView='visible' viewport={viewportOnce}>
              <Collapse title='PRODUCTION' style='light'>
                <div className='oneSpectacle_mainDatas_prodList'>
                  {productionFunctions.map((productionFunction) => (
                    project.productionList?.some(p => p.productionFunction === productionFunction) && (
                      <motion.div
                        key={productionFunction}
                        className='oneSpectacle_mainDatas_prodList_prodTypeContainer'
                        variants={container}
                        initial='hidden'
                        whileInView='visible'
                        viewport={viewportOnce}
                      >
                        <p className='oneSpectacle_mainDatas_prodList_prodTypeContainer_prodType'>{productionFunction}</p>
                        <motion.ul className='oneSpectacle_mainDatas_prodList_prodTypeContainer_list' variants={container}>
                          {project.productionList
                            ?.filter((prod) => prod.productionFunction === productionFunction)
                            .map((prod) => (
                              <motion.li
                                key={prod.id}
                                className='oneSpectacle_mainDatas_prodList_prodTypeContainer_list_item'
                                variants={item}
                              >
                                <p className='oneSpectacle_mainDatas_prodList_prodTypeContainer_list_item_name'>{prod.productionName}</p>
                              </motion.li>
                            ))}
                        </motion.ul>
                      </motion.div>
                    )
                  ))}
                </div>
              </Collapse>
            </motion.div>
          )}

          {/* Résidences */}
          {project.residenciesList && project.residenciesList.length !== 0 && (
            <motion.div variants={fadeUp} initial='hidden' whileInView='visible' viewport={viewportOnce}>
              <Collapse title='RÉSIDENCES' style='light'>
                <div className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList'>
                  {residencyTypes?.map((residencyType) => (
                    project.residenciesList?.some(r => r.residencyType === residencyType) && (
                      <motion.div
                        key={residencyType}
                        className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer'
                        variants={container}
                        initial='hidden'
                        whileInView='visible'
                        viewport={viewportOnce}
                      >
                        <p className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_title'>{residencyType}</p>
                        <motion.ul
                          className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list'
                          variants={container}
                        >
                          {project.residenciesList
                            ?.filter(residency => residency.residencyType === residencyType)
                            .map(residency => (
                              <motion.li
                                key={residency.id}
                                className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item'
                                variants={item}
                              >
                                <p className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text'>
                                  {residency.startDates && residency.endDates && (
                                    <FullPeriodDate startISODate={residency.startDates} endISODate={residency.endDates} className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text_date' />
                                  )}
                                  <IsALink className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text' link={residency.placeLink} name={residency.placeName} />
                                  {`/ ${residency.city ? residency.city : ''}`}
                                </p>
                              </motion.li>
                            ))}
                        </motion.ul>
                      </motion.div>
                    )
                  ))}
                </div>
              </Collapse>
            </motion.div>
          )}

          {/* Presse */}
          {project.pressList && project.pressList.length !== 0 && (
            <motion.div variants={fadeUp} initial='hidden' whileInView='visible' viewport={viewportOnce}>
              <Collapse title='PRESSE' style='light'>
                <div className='oneSpectacle_mainDatas_press'>
                  <div className='oneSpectacle_mainDatas_press_pressList'>
                    <div className='oneSpectacle_mainDatas_press_pressList_listContainer'>
                      <motion.ul
                        className='oneSpectacle_mainDatas_press_pressList_list'
                        variants={container}
                        initial='hidden'
                        whileInView='visible'
                        viewport={viewportOnce}
                      >
                        {project.pressList?.map((press) => (
                          <motion.li
                            key={press.id}
                            className='oneSpectacle_mainDatas_press_pressList_list_item'
                            variants={item}
                          >
                            <p className='oneSpectacle_mainDatas_press_pressList_list_item_mediaName'>
                              {press.mediaName}
                            </p>
                            <p
                              className='oneSpectacle_mainDatas_press_pressList_list_item_quote'
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(press.quote) }}
                            />
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  </div>
                </div>
              </Collapse>
            </motion.div>
          )}
        </div>
      )}

      {project.projectState === "*non visible*" && isAuthenticated === false && (
        <p className='oneSpectacle_invisible'>Ce projet n'est pas accessible pour l'instant...</p>
      )}
    </section>
  )
}

export default OneSpectacle
