import './Home.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react'
import { Context } from '../../utils/Context'
import facebookLogo from '../../assets/facebook_black.png'
import xLogo from '../../assets/x_black.png'
import youtubeLogo from '../../assets/youtube_black.png'
import instagramLogo from '../../assets/instagram_black.png'
import ContactModal from '../../components/ContactModal/ContactModal'
import Loader from '../../components/Loader/Loader'
import logoSouffleur from '../../assets/logoSouffleur.svg'

function Home() {
    const {
        loaderDisplay,
        sortedEvents = []
    } = useContext(Context)

    const [displayContactModal, setdisplayContactModal] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    function slugify(text) {
        return text
          .toString()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

    /******************************************/
    /*     TRI DES PROJETS POUR ANNONCES      */
    /******************************************/

    const cleanText = (text) => {
        return text ? text.trim().replace(/\s+/g, ' ') : ''
    }

    const formatSingleDate = (dateString) => {
        if (!dateString) return ''

        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) return ''

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (startDate === endDate) {
            return `${formatSingleDate(startDate)}`
        }

        const sameMonth = start.getMonth() === end.getMonth()
        const sameYear = start.getFullYear() === end.getFullYear()

        if (sameMonth && sameYear) {
            const startDay = start.toLocaleDateString('fr-FR', {
                day: 'numeric'
            })

            const endFull = end.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })

            return `${startDay} au ${endFull}`
        }

        return `${formatSingleDate(startDate)} au ${formatSingleDate(endDate)}`
    }

    const getProjectImage = (project) => {
        if (!project?.images?.length) return null

        const imageIndex = project.mainImageIndex || 0
        return project.images[imageIndex]?.imageUrl || project.images[0]?.imageUrl
    }

    const getEventPlace = (event) => {
        if (event.type === 'show') {
            return {
                city: cleanText(event.show?.city),
                placeName: cleanText(event.show?.placeName)
            }
        }

        return {
            city: cleanText(event.residency?.city),
            placeName: cleanText(event.residency?.placeName)
        }
    }

    const getEventPlaceLabel = (event) => {
        const { city, placeName } = getEventPlace(event)

        if (city && placeName) return ` — ${city}, ${placeName}`
        if (city) return ` — ${city}`
        if (placeName) return ` — ${placeName}`

        return ''
    }

    const getUniqueEvents = (events) => {
        const uniqueEvents = []

        events.forEach((event) => {
            const { city, placeName } = getEventPlace(event)

            const key = [
                event.startDate,
                event.endDate,
                city.toLowerCase(),
                placeName.toLowerCase()
            ].join('_')

            const alreadyExists = uniqueEvents.some((uniqueEvent) => {
                const uniquePlace = getEventPlace(uniqueEvent)

                const uniqueKey = [
                    uniqueEvent.startDate,
                    uniqueEvent.endDate,
                    uniquePlace.city.toLowerCase(),
                    uniquePlace.placeName.toLowerCase()
                ].join('_')

                return uniqueKey === key
            })

            if (!alreadyExists) {
                uniqueEvents.push(event)
            }
        })

        return uniqueEvents
    }

    const groupEventsByProject = (events) => {
        return events.reduce((acc, event) => {
            const projectId = event.project?._id

            if (!projectId) return acc

            if (!acc[projectId]) {
                acc[projectId] = {
                    project: event.project,
                    events: []
                }
            }

            acc[projectId].events.push(event)

            return acc
        }, {})
    }

    const touringEvents = sortedEvents.filter((event) =>
        event.type === 'show' &&
        event.project?.projectState === 'en tournée'
    )

    const creationEvents = sortedEvents.filter((event) =>
        event.type === 'residency' &&
        event.project?.projectState === 'en création'
    )

    const touringProjects = Object.values(groupEventsByProject(touringEvents))
    const creationProjects = Object.values(groupEventsByProject(creationEvents))

    /******************************************/

    return (
        <main className='home'>
            <section>
                <div className='home_title'>
                    <div className='home_title'>
                        <img src={logoSouffleur} alt="logo souffleur de verre" />
                        <h1 className='home_title_text'>LE SOUFFLEUR DE VERRE</h1>
                    </div>
                </div>

                <nav className='home_nav'>
                    <ul className='home_nav_menu'>
                        <li>
                            <Link aria-label='Accéder à la page Compagnie' to="/compagnie" className='home_nav_menu_item'>
                                <h2>COMPAGNIE</h2>
                            </Link>
                        </li>
                        <span>-</span>
                        <li>
                            <Link aria-label='Accéder à la page Actualité' to="/actualite" className='home_nav_menu_item'>
                                <h2>CALENDRIER</h2>
                            </Link>
                        </li>
                        <span>-</span>
                        <li>
                            <Link aria-label='Accéder à la page Spectacles' to="/spectacles" className='home_nav_menu_item'>
                                <h2>SPECTACLES</h2>
                            </Link>
                        </li>
                        <span>-</span>
                        <li>
                            <Link aria-label='Accéder à la page Médiations' to="/mediations" className='home_nav_menu_item'>
                                <h2>MÉDIATIONS</h2>
                            </Link>
                        </li>
                        <span>-</span>
                        <li>
                            <button
                                aria-label='Afficher la fenêtre Contact'
                                type='button'
                                className='home_nav_menu_item'
                                onClick={() => setdisplayContactModal(true)}
                            >
                                <p>CONTACT</p>
                            </button>
                        </li>
                    </ul>

                    <ul className='home_nav_socials'>
                        <li>
                            <a aria-label='Accéder à la page Facebook de la compagnie' href="https://www.facebook.com/souffleurdeverre" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                                <img src={facebookLogo} alt="lien facebook" />
                            </a>
                        </li>
                        <li>
                            <a aria-label='Accéder à la page X de la compagnie' href="https://twitter.com/ciesouffleur" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                                <img src={xLogo} alt="lien x" />
                            </a>
                        </li>
                        <li>
                            <a aria-label='Accéder à la page Youtube de la compagnie' href="https://www.youtube.com/@compagnielesouffleurdeverr6312" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                                <img src={youtubeLogo} alt="lien youtube" />
                            </a>
                        </li>
                        <li>
                            <a aria-label='Accéder à la page Instagram de la compagnie' href="https://www.instagram.com/ciesouffleur" target="_blank" rel="noreferrer" className='home_nav_socials_item'>
                                <img src={instagramLogo} alt="lien instagram" />
                            </a>
                        </li>
                    </ul>
                </nav>

                <aside className={displayContactModal ? 'header_contactModal header_contactModal--open' : 'header_contactModal header_contactModal--close'}>
                    <ContactModal setdisplayContactModal={setdisplayContactModal} />
                </aside>

                <div className={loaderDisplay ? 'homePage_loader--displayOn' : 'homePage_loader--displayOff'}>
                    <Loader className='loader--opaque' loaderDisplay={loaderDisplay} />
                </div>
            </section>

            <section className='home_touring'>
                <h2>EN TOURNÉE</h2>

                <div className='home_touring_list'>
                    {touringProjects.map(({ project, events }, index) => {
                        const projectImage = getProjectImage(project)
                        const uniqueEvents = getUniqueEvents(events)

                        return (
                            <article key={project._id} className={`home_touring_card home_touring_card--${index}`}>
                                {projectImage && (
                                    <img
                                        src={projectImage}
                                        alt={project.title}
                                        className='home_touring_card_image'
                                    />
                                )}

                                <div className='home_touring_card_content'>
                                    <Link
                                        to={`/spectacles/${slugify(project.title)}`}
                                        className={`home_touring_card_title home_touring_card_title--${index}`}
                                    >
                                        <h3>{project.title}</h3>
                                    </Link>

                                    <ul className='home_touring_card_dates'>
                                        {uniqueEvents.map((event) => (
                                            <li key={event._eventKey}>
                                                {formatDateRange(event.startDate, event.endDate)}
                                                {getEventPlaceLabel(event)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </section>

            <section className='home_residencies'>
                <h2>EN CRÉATION</h2>

                <div className='home_residencies_list'>
                    {creationProjects.map(({ project, events }, index) => {
                        const projectImage = getProjectImage(project)
                        const uniqueEvents = getUniqueEvents(events)

                        return (
                            <article key={project._id} className='home_residencies_card'>
                                {projectImage && (
                                    <img
                                        src={projectImage}
                                        alt={project.title}
                                        className='home_residencies_card_image'
                                    />
                                )}

                                <div className='home_residencies_card_content'>
                                    <Link
                                        to={`/spectacles/${slugify(project.title)}`}
                                        className={`home_residencies_card_title home_residencies_card_title--${index}`}
                                    >
                                        <h3>{project.title}</h3>
                                    </Link>

                                    <ul className='home_residencies_card_dates'>
                                        {uniqueEvents.map((event) => (
                                            <li key={event._eventKey}>
                                                {formatDateRange(event.startDate, event.endDate)}
                                                {getEventPlaceLabel(event)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </section>
        </main>
    )
}

export default Home