import './OneSpectacle.scss'
import React, { useState, useEffect, useContext, useMemo } from 'react'
import { apiFetch } from '../../utils/api'
import { useParams } from 'react-router-dom'
import { Context } from '../../utils/Context'
import IsALink from '../../components/IsALink/IsALink'
import DOMPurify from 'dompurify'
import BioSheet from '../../components/BioSheet/BioSheet'
import FullPeriodDate from '../../components/FullPeriodDate/FullPeriodDate'
import FullPonctualDates from '../../components/FullPonctualDates/FullPonctualDates'
import FullUniqueDate from '../../components/FullUniqueDate/FullUniqueDate'
import Collapse from '../../components/Collapse/Collapse'
import ImagesGallery from '../../components/ImagesGallery/ImagesGallery'
import ParallaxImage from '../../components/ParallaxImage/ParallaxImage'
import { motion, useReducedMotion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo, faMusic, faGlobe, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useDocumentMeta } from '../../utils/useDocumentMeta';
import { SITE_URL } from '../../utils/constants';
import LogosList from '../../components/LogosList/LogosList';
import { formatFileSize, getDocumentIcon } from '../../utils/proDocuments';

function OneSpectacle() {
  // ⚠️ objet, pas tableau (sinon plein de checks bizarres)
  const [project, setProject] = useState(null)
  const [handleProSpace, setHandleProSpace] = useState(false)
  const [handleAuthPro, setHandleAuthPro] = useState(false)
  const [proPasswordInput, setProPasswordInput] = useState('')
  const [proPasswordError, setProPasswordError] = useState(false)

  const [displayBioAside, setDisplayBioAside] = useState(false);
  const [bioAside, setBioAside] = useState([]);

  const { slug } = useParams()
  const { productionFunctions, residencyTypes, isAuthenticated, biographies, logos } = useContext(Context)
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

  function openBioAside (bio) {
    setBioAside (bio);
    setDisplayBioAside(true);
  }
  function closeBioAside () {
    setDisplayBioAside(false);
    console.log('coucou')
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

  const normalizeName = (str = '') => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
  }
  
  const splitArtistNames = (str = '') => {
    return str
      .replace(/\s+(?:et|&)\s+/gi, ',')
      .split(/\s*,\s*/)
      .map((name) => name.trim())
      .filter(Boolean)
  }
  
  const findMatchingBiography = (artistName) => {
    return biographies?.find(
      (biography) =>
        normalizeName(`${biography.name}${biography.surname}`) ===
        normalizeName(artistName)
    )
  }

  // Groupe les résidences par type connu ; celles dont le type est vide/inconnu
  // (résidence créée sans type sélectionné) sont quand même affichées, sous un
  // groupe sans intitulé, plutôt que d'être silencieusement omises.
  const getResidencyGroups = (residenciesList) => {
    const list = residenciesList || []
    const knownTypesPresent = residencyTypes.filter((type) =>
      list.some((r) => r.residencyType === type)
    )
    const groups = knownTypesPresent.map((type) => ({
      type,
      items: list.filter((r) => r.residencyType === type),
    }))
    const otherResidencies = list.filter(
      (r) => !residencyTypes.includes(r.residencyType)
    )
    if (otherResidencies.length > 0) {
      groups.push({ type: null, items: otherResidencies })
    }
    return groups
  }

  const item = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    }),
    [reduceMotion]
  )

  const viewportOnce = { once: true, margin: '0px 0px -10% 0px' }

  const dataKey = useMemo(
    () => project?._id || project?.title || `loading-${slug}`,
    [project?._id, project?.title, slug]
  )

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
    apiFetch(`/api/projects/${slug}`)
      .then((data) => setProject(data))
      .catch((error) => console.error(error.message))
  }, [slug])

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

  useDocumentMeta({
    title: project ? `${project.title} | Compagnie Le Souffleur de Verre` : undefined,
    description: project?.subtitle || 'Spectacle de la Compagnie Le Souffleur de Verre.',
    canonical: `${SITE_URL}/spectacles/${slug}`,
    ogTitle: project ? `${project.title} | Compagnie Le Souffleur de Verre` : undefined,
    ogDescription: project?.subtitle || 'Spectacle de la Compagnie Le Souffleur de Verre.',
    ogUrl: `${SITE_URL}/spectacles/${slug}`,
    ogImage: project?.images?.[project.mainImageIndex]?.imageUrl,
  })

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

  // Documents de l'espace pro (+ ancien ZIP des projets créés avant le passage aux documents multiples)
  const proDocuments = [
    ...(project.proSpace?.documents || []),
    ...(project.proSpace?.zipUrl ? [{ name: 'Pack pro (ZIP)', url: project.proSpace.zipUrl }] : []),
  ]

  // Jointure projet.logos (noms) -> modèle Logo (image + lien), dans l'ordre choisi dans l'éditeur
  const projectLogos = (project.logos || [])
    .map((logoName) => logos?.find((logo) => logo.name === logoName))
    .filter(Boolean)

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
            {project.proSpace?.enabled && proDocuments.length > 0 && (
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
                        <ul className='oneSpectacle_mainDatas_proSpace_modal_formContainer--proSpaceModal_datas_documents'>
                          {proDocuments.map((document) => (
                            <li key={document._id || document.url}>
                              <a href={document.url} download rel='noreferrer'>
                                <FontAwesomeIcon icon={getDocumentIcon(document.url)} />
                                <span className='oneSpectacle_mainDatas_proSpace_modal_formContainer--proSpaceModal_datas_documents_name'>
                                  {document.name}
                                </span>
                                {document.size > 0 && (
                                  <span className='oneSpectacle_mainDatas_proSpace_modal_formContainer--proSpaceModal_datas_documents_size'>
                                    {formatFileSize(document.size)}
                                  </span>
                                )}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Dossier(s) téléchargeable(s) : sous le bouton espace pro, avec le même style */}
            {project.pdfList?.length > 0 && (
              <motion.div className='oneSpectacle_mainDatas_pdfs' variants={fadeUp}>
                {project.pdfList.map((pdf) => (
                  <a
                    key={pdf._id || pdf.pdfLink}
                    href={pdf.pdfLink || ''}
                    target='_blank'
                    rel='noreferrer'
                    className='oneSpectacle_mainDatas_pdfs_button'
                  >
                    {pdf.pdfName}
                  </a>
                ))}
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
                <motion.ul 
                  className='oneSpectacle_mainDatas_teamList_artistsList' 
                  variants={container}
                >
                  {project.artistsList.map((artist) => {
                    const artistNames = splitArtistNames(artist.artistName)

                    return (
                      <motion.li
                        key={artist._id}
                        className='oneSpectacle_mainDatas_teamList_artistsList_item'
                        variants={item}
                      >
                        <p className='oneSpectacle_mainDatas_teamList_artistsList_item_function'>
                          {artist.artistFunction}
                        </p>

                        <p className='oneSpectacle_mainDatas_teamList_artistsList_item_names'>
                          {artistNames.map((artistName, index) => {
                            const matchingBiography = findMatchingBiography(artistName)
                            const separator = index < artistNames.length - 1 ? ', ' : ''

                            return (
                              <React.Fragment key={`${artist._id}-${artistName}`}>
                                {matchingBiography ? (
                                  <button
                                    type='button'
                                    className='oneSpectacle_mainDatas_teamList_artistsList_item_names_button'
                                    onClick={() => openBioAside(matchingBiography)}
                                  >
                                    {artistName}
                                  </button>
                                ) : (
                                  <span>{artistName}</span>
                                )}
                                {separator}
                              </React.Fragment>
                            )
                          })}
                        </p>
                      </motion.li>
                    )
                  })}
                </motion.ul>
                <div className={displayBioAside=== true ? 'compagnieSection_bioSheetContainer compagnieSection_bioSheetContainer--displayOn' : 'compagnieSection_bioSheetContainer compagnieSection_bioSheetContainer--displayOff'}>
                  <BioSheet biography={bioAside} closeBioAside={closeBioAside} className='compagnieSection_bioSheetContainer'/>
              </div>
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
            {project.linksList?.length > 0 && (
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
              <Collapse title='RÉSIDENCES' style='light' defaultOpen={true}>
                <div className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList'>
                  {getResidencyGroups(project.residenciesList).map(({ type, items }) => (
                      <motion.div
                        key={type ?? '__other__'}
                        className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer'
                        variants={container}
                        initial='hidden'
                        whileInView='visible'
                        viewport={viewportOnce}
                      >
                        {type && <p className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_title'>{type}</p>}
                        <motion.ul className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list' variants={container}>
                          {items
                            .map((residency) => (
                              <motion.li
                                key={residency._id || residency.id}
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

          {/* Logos (partenaires, soutiens...) : tout en bas de la page, comme sur la page Compagnie */}
          {projectLogos.length > 0 && (
            <motion.div
              className='oneSpectacle_logos'
              variants={fadeUp}
              initial='hidden'
              whileInView='visible'
              viewport={viewportOnce}
            >
              <LogosList logos={projectLogos} />
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