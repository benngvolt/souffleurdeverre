import './OneSpectacle.scss'
import React, { useState, useEffect, useContext, useMemo } from 'react'
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo, faMusic, faGlobe, faFilePdf, faXmark, faFileZipper } from '@fortawesome/free-solid-svg-icons'

function OneSpectacle() {
  // ⚠️ objet, pas tableau (sinon plein de checks bizarres)
  const [project, setProject] = useState(null)
  const [handleProSpace, setHandleProSpace] = useState(false)
  const [handleAuthPro, setHandleAuthPro] = useState(false)
  const [proPasswordInput, setProPasswordInput] = useState('')
  const [proPasswordError, setProPasswordError] = useState(false)

  const { id } = useParams()
  const { productionFunctions, residencyTypes, isAuthenticated } = useContext(Context)
  const reduceMotion = useReducedMotion()

  // Gestion accès espace pro
  function handleProSpaceSubmit(e) {
    e.preventDefault()
  
    if (proPasswordInput === project.proSpace.password) {
      setHandleProSpace(true)
      setHandleAuthPro(false)
      setProPasswordError(false)
    } else {
      setHandleProSpace(false)
      setProPasswordError(true)
    }
  }

  // Variants
  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    }),
    [reduceMotion]
  )

  const container = useMemo(
    () => ({
      hidden: {},
      visible: { transition: { staggerChildren: 0.12, when: 'beforeChildren' } },
    }),
    []
  )

  const item = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    }),
    [reduceMotion]
  )

  const viewportOnce = { once: true, margin: '0px 0px -10% 0px' }

  const dataKey = useMemo(() => project?._id || project?.title || `loading-${id}`, [project?._id, project?.title, id])

  const cleanedDescription = useMemo(
    () => DOMPurify.sanitize(project?.description || ''),
    [project?.description]
  )

  // Group links once
  const groupedLinks = useMemo(() => {
    const grouped = { video: [], audio: [], website: [] }
    ;(project?.linksList || []).forEach((l) => {
      if (l?.linkType === 'lien video') grouped.video.push(l)
      else if (l?.linkType === 'lien audio') grouped.audio.push(l)
      else if (l?.linkType === 'website') grouped.website.push(l)
    })
    return grouped
  }, [project?.linksList])

  useEffect(() => {
    fetch(`${API_URL}/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => setProject(data))
      .catch((error) => console.log(error.message))
  }, [id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (handleAuthPro || handleProSpace) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [handleAuthPro, handleProSpace])

  // Loading guard (évite des comportements bizarres au premier render)
  if (!project) {
    return (
      <section className='oneSpectacle'>
        <div className='oneSpectacle_mainDatas'>Chargement…</div>
      </section>
    )
  }

  const canSee =
    project.projectState !== '*non visible*' ||
    (project.projectState === '*non visible*' && isAuthenticated === true)

  return (
    <section className='oneSpectacle'>
      {canSee && (
        <div>
          {/* Titre + métadonnées */}
          <motion.div
            key={dataKey}
            className='oneSpectacle_mainDatas'
            variants={container}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
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
              <motion.div
                className='oneSpectacle_mainDatas_creationDateContainer oneSpectacle_mainDatas_creationDate'
                variants={fadeUp}
              >
                <p className='oneSpectacle_mainDatas_creationDate'>création</p>
                <FullUniqueDate creationDate={project.creationDate} />
              </motion.div>
            )}

            {project.duration && (
              <motion.p className='oneSpectacle_mainDatas_duration' variants={fadeUp}>
                durée {project.duration}
              </motion.p>
            )}
            {project.proSpace?.enabled && project.proSpace?.zipUrl && (
              <motion.div className='oneSpectacle_mainDatas_proSpace' variants={fadeUp}>
                <button 
                  className='oneSpectacle_mainDatas_proSpace_button' 
                  onClick={() => setHandleAuthPro((prev) => !prev)}>
                  ESPACE PRO
                </button>
                {handleAuthPro === true && (
                  <div className='oneSpectacle_mainDatas_proSpace_modal'>
                    <div className='oneSpectacle_mainDatas_proSpace_modal_formContainer oneSpectacle_mainDatas_proSpace_modal_formContainer--authModal'>
                      <button
                        className='oneSpectacle_mainDatas_proSpace_modal_formContainer_closeButton'
                        type='button'
                        onClick={() => setHandleAuthPro(false)}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>

                      <form onSubmit={handleProSpaceSubmit}>
                        <label htmlFor='proSpacePassword'>
                          Veuillez entrer le code d'accès
                        </label>

                        <input
                          id='proSpacePassword'
                          type='text'
                          value={proPasswordInput}
                          onChange={(e) => {
                            setProPasswordInput(e.target.value)
                            setProPasswordError(false)
                          }}
                        />

                        <button type='submit'>
                          ENVOYER
                        </button>

                        {proPasswordError && (
                          <p>Code incorrect</p>
                        )}
                      </form>
                    </div>
                  </div>
                )}

                {handleProSpace === true && (
                  
                  <div className='oneSpectacle_mainDatas_proSpace_modal'>
                    <div className='oneSpectacle_mainDatas_proSpace_modal_formContainer oneSpectacle_mainDatas_proSpace_modal_formContainer--proSpaceModal'>
                      <button
                        className='oneSpectacle_mainDatas_proSpace_modal_formContainer_closeButton'
                        type='button'
                        onClick={() => {
                          setHandleProSpace(false)
                          setProPasswordInput('')
                        }}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                      <img src={project.images[project.mainImageIndex].imageUrl}/>
                      <div className='oneSpectacle_mainDatas_proSpace_modal_formContainer--proSpaceModal_datas'>
                        <p className='oneSpectacle_mainDatas_proSpace_modal_formContainer--proSpaceModal_datas_title'>{project.title}</p>
                        <a
                          href={project.proSpace.zipUrl}
                          target='_blank'
                          rel='noreferrer'
                          download
                        >
                          <FontAwesomeIcon icon={faFileZipper} />
                          Télécharger le pack pro
                        </a>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            )}

            {project.description && (
              <motion.p
                className='oneSpectacle_mainDatas_description'
                variants={fadeUp}
                dangerouslySetInnerHTML={{ __html: cleanedDescription }}
              />
            )}

            {project.images?.length >= 1 && (
              <motion.div variants={fadeUp}>
                <ParallaxImage image={project.images[0]} />
              </motion.div>
            )}

            {/* Équipe */}
            {project.artistsList?.length > 0 && (
              <motion.div
                className='oneSpectacle_mainDatas_teamList'
                variants={container}
                initial='hidden'
                whileInView='visible'
                viewport={viewportOnce}
              >
                <motion.ul className='oneSpectacle_mainDatas_teamList_artistsList' variants={container}>
                  {project.artistsList.map((artist) => (
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

            {/* Paragraphes (animés) */}
            {project.paragraphList?.length > 0 && (
              <motion.div
                className='oneSpectacle_mainDatas_paragraphs'
                variants={container}
                initial='hidden'
                whileInView='visible'
                viewport={viewportOnce}
              >
                {project.paragraphList.map((paragraph, idx) => (
                  <motion.div
                    key={paragraph._id || idx}
                    className='oneSpectacle_mainDatas_paragraphs_paragraphContainer'
                    variants={item}
                  >
                    {paragraph.paragraphTitle && (
                      <motion.p
                        className='oneSpectacle_mainDatas_paragraphs_paragraphContainer_paragraphTitle'
                        variants={item}
                      >
                        {paragraph.paragraphTitle}
                      </motion.p>
                    )}

                    {paragraph.paragraphText && (
                      <motion.p
                        className='oneSpectacle_mainDatas_paragraphs_paragraphContainer_paragraphText'
                        variants={item}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(paragraph.paragraphText),
                        }}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Media links (animés + groupés par type) */}
            {(project.linksList?.length > 0 || project.pdfList?.length > 0) && (
              <motion.div
                className='oneSpectacle_mainDatas_mediaLinks'
                variants={container}
                initial='hidden'
                whileInView='visible'
                viewport={viewportOnce}
              >
                {/* VIDEOS */}
                {groupedLinks.video.length > 0 && (
                  <motion.div className='oneSpectacle_mainDatas_mediaLinks_linksContainer' variants={container}>
                    {groupedLinks.video.map((link) => (
                      <motion.a
                        key={link._id}
                        href={link.linkUrl || ''}
                        target='_blank'
                        rel='noreferrer'
                        className='oneSpectacle_mainDatas_mediaLinks_linksContainer_link oneSpectacle_mainDatas_mediaLinks_linksContainer_link--video'
                        variants={item}
                      >
                        <FontAwesomeIcon icon={faVideo} />
                        {link.linkName}
                      </motion.a>
                    ))}
                  </motion.div>
                )}

                {/* AUDIOS */}
                {groupedLinks.audio.length > 0 && (
                  <motion.div className='oneSpectacle_mainDatas_mediaLinks_linksContainer' variants={container}>
                    {groupedLinks.audio.map((link) => (
                      <motion.a
                        key={link._id}
                        href={link.linkUrl || ''}
                        target='_blank'
                        rel='noreferrer'
                        className='oneSpectacle_mainDatas_mediaLinks_linksContainer_link oneSpectacle_mainDatas_mediaLinks_linksContainer_link--audio'
                        variants={item}
                      >
                        <FontAwesomeIcon icon={faMusic} />
                        {link.linkName}
                      </motion.a>
                    ))}
                  </motion.div>
                )}

                {/* WEBSITES */}
                {groupedLinks.website.length > 0 && (
                  <motion.div className='oneSpectacle_mainDatas_mediaLinks_linksContainer' variants={container}>
                    {groupedLinks.website.map((link) => (
                      <motion.a
                        key={link._id}
                        href={link.linkUrl || ''}
                        target='_blank'
                        rel='noreferrer'
                        className='oneSpectacle_mainDatas_mediaLinks_linksContainer_link oneSpectacle_mainDatas_mediaLinks_linksContainer_link--website'
                        variants={item}
                      >
                        <FontAwesomeIcon icon={faGlobe} />
                        {link.linkName}
                      </motion.a>
                    ))}
                  </motion.div>
                )}

                {/* PDFS */}
                {project.pdfList?.length > 0 && (
                  <motion.div className='oneSpectacle_mainDatas_mediaLinks_pdfsContainer' variants={container}>
                    {project.pdfList.map((pdf) => (
                      <motion.a
                        key={pdf._id}
                        href={pdf.pdfLink || ''}
                        target='_blank'
                        rel='noreferrer'
                        className='oneSpectacle_mainDatas_mediaLinks_pdfsContainer_pdf'
                        variants={item}
                      >
                        <FontAwesomeIcon icon={faFilePdf} />
                        {pdf.pdfName}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Galerie (si > 1 image) */}
          {project.images?.length > 1 && (
            <motion.div variants={fadeUp} initial='hidden' whileInView='visible' viewport={viewportOnce}>
              <ImagesGallery project={project} />
            </motion.div>
          )}

          {/* Diffusion */}
          {project.showsList?.length > 0 && (
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
                  {project.showsList.map((show) => (
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
          {project.productionList?.length > 0 && (
            <motion.div variants={fadeUp} initial='hidden' whileInView='visible' viewport={viewportOnce}>
              <Collapse title='PRODUCTION' style='light'>
                <div className='oneSpectacle_mainDatas_prodList'>
                  {productionFunctions.map((productionFunction) => (
                    project.productionList.some((p) => p.productionFunction === productionFunction) && (
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
                            .filter((prod) => prod.productionFunction === productionFunction)
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
          {project.residenciesList?.length > 0 && (
            <motion.div variants={fadeUp} initial='hidden' whileInView='visible' viewport={viewportOnce}>
              <Collapse title='RÉSIDENCES' style='light'>
                <div className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList'>
                  {residencyTypes.map((residencyType) => (
                    project.residenciesList.some((r) => r.residencyType === residencyType) && (
                      <motion.div
                        key={residencyType}
                        className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer'
                        variants={container}
                        initial='hidden'
                        whileInView='visible'
                        viewport={viewportOnce}
                      >
                        <p className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_title'>{residencyType}</p>
                        <motion.ul className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list' variants={container}>
                          {project.residenciesList
                            .filter((r) => r.residencyType === residencyType)
                            .map((residency) => (
                              <motion.li
                                key={residency.id}
                                className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item'
                                variants={item}
                              >
                                <p className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text'>
                                  {residency.startDates && residency.endDates && (
                                    <FullPeriodDate
                                      startISODate={residency.startDates}
                                      endISODate={residency.endDates}
                                      className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text_date'
                                    />
                                  )}
                                  <IsALink
                                    className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text'
                                    link={residency.placeLink}
                                    name={residency.placeName}
                                  />
                                  {`/ ${residency.city ? residency.city : ''}`}
                                </p>

                                {residency.releaseDate && (
                                  <div className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_textContainer'>
                                    <p className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text'>
                                      Sortie de résidence :
                                    </p>
                                    <FullUniqueDate creationDate={residency.releaseDate} className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item' />
                                  </div>
                                )}
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
          {project.pressList?.length > 0 && (
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
                        {project.pressList.map((press) => (
                          <motion.li
                            key={press.id}
                            className='oneSpectacle_mainDatas_press_pressList_list_item'
                            variants={item}
                          >
                            <p className='oneSpectacle_mainDatas_press_pressList_list_item_mediaName'>{press.mediaName}</p>
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

      {!canSee && (
        <p className='oneSpectacle_invisible'>Ce projet n&apos;est pas accessible pour l&apos;instant...</p>
      )}
    </section>
  )
}

export default OneSpectacle