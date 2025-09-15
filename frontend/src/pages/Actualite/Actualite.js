import './Actualite.scss';
import { Link } from 'react-router-dom';
import React, { useContext } from 'react';
import { Context } from '../../utils/Context';
import IsALink from '../../components/IsALink/IsALink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCalendarPlus, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

function Actualite() {
    const numericMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const numericYears = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    const { sortedEvents, projects, fullCurrentDate } = useContext(Context);
    const currentDate = new Date(fullCurrentDate);

    const googleEventCalendarUrlMount = (eventData) => {
        const eventDate = eventData.startDate;
    
        const formatDate = (dateStr, timeStr) => {
            const date = dateStr.substring(0, 10).replace(/-/g, "");
            const time = timeStr ? timeStr.replace(':', '') : '1200'; // par défaut 12:00
            return `${date}T${time}00`;
        }
    
        let startTime = '12:00'; // Valeur par défaut si pas de time renseigné
        if (eventData.times && eventData.times[0] && eventData.times[0].time) {
            startTime = eventData.times[0].time;
        }
    
        const startDateFormatted = formatDate(eventDate, startTime);
    
        // On ajoute une durée : exemple 2 heures (en ms)
        const startDateObj = new Date(`${eventDate.substring(0, 10)}T${startTime}`);
        const endDateObj = new Date(startDateObj.getTime() + 2 * 60 * 60 * 1000); // +2 heures
    
        const endDateFormatted = formatDate(endDateObj.toISOString(), endDateObj.toISOString().substring(11,16));
    
        const googleEventCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=Le Souffleur de Verre - ${eventData.project.title}&dates=${startDateFormatted}/${endDateFormatted}&details=${eventData.project.description}&location=${eventData.show.placeName} - ${eventData.show.city}&trp=false&sprop=&sprop=name:`;
    
        return googleEventCalendarUrl;
    }
    
    const uniqueYears = [...new Set(sortedEvents.map(event => event.startDate.split('-')[0]))];

    return (      
        <section className='actualite'>
            <div className='actualite_container'>
                {uniqueYears.map(year => {
                    const yearEvents = sortedEvents.filter(event => event.startDate.startsWith(year));
                    if (yearEvents.length === 0) return null;

                    return (
                        <div key={year} className='actualite_container_yearContainer'>
                            <p className='actualite_container_yearContainer_year'>{year}</p>
                            {numericMonths.filter(month => 
                                yearEvents.some(event => event.startDate.startsWith(`${year}-${month}`))
                            ).map(month => (
                                <div key={month} className='actualite_container_yearContainer_monthContainer'>
                                    <p className='actualite_container_yearContainer_monthContainer_month'>{months[Number(month)-1]}</p>
                                    <div className='actualite_container_yearContainer_monthContainer_events'>
                                    {yearEvents.filter(event => event.startDate.startsWith(`${year}-${month}`)).map(event => (
                                        <div key={`${event.project._id}-${event.startDate}`} className='actualite_container_yearContainer_monthContainer_events_eventContainer'>
                                            {event.startDate != event.endDate &&
                                            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_dates'>
                                                {(event.startDate.split('-')[1] === event.endDate.split('-')[1]) ? (
                                                    `${event.startDate.split('-')[2]} au ${event.endDate.split('-')[2]} ${months[Number(event.endDate.split('-')[1]) - 1]}`
                                                ) : (
                                                    `${event.startDate.split('-')[2]} ${months[Number(event.startDate.split('-')[1]) - 1]} au ${event.endDate.split('-')[2]} ${months[Number(event.endDate.split('-')[1]) - 1]}`
                                                )}
                                            </p>
                                            }
                                            {event.startDate === event.endDate &&
                                            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_dates'>
                                                {event.startDate.split('-')[2]} {months[Number(event.startDate.split('-')[1]) - 1]}
                                            </p>
                                            }
                                            {event.type === 'show' ? (
                                                <div key={event.project._id} className='actualite_container_yearContainer_monthContainer_events_eventContainer_show'>
                                                    <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_type'>Représentation</p>
                                                    <Link to={`/spectacles/${event.project._id}`}>
                                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
                                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{event.project.subtitle}</p>
                                                    </Link>
                                                    {!event.period &&
                                                    <a className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_calendarLink' target="_blank" rel="noreferrer"
                                                        href={googleEventCalendarUrlMount(event)}>
                                                        <FontAwesomeIcon icon={faCalendarPlus}/>
                                                    </a>
                                                    }
                                                    <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox'>
                                                        {event.times.map(time => (
                                                            <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeContainer'>
                                                                <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_time'>{time.time}</p>
                                                                <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeInfos'>{time.timeInfos}</p>
                                                            </div>
                                                        ))}
                                                        <IsALink className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_link' link={event.show.placeLink} name={event.show.placeName}/>
                                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_city'>{event.show.city}</p>
                                                    </div>
                                                </div>
                                                
                                            ) : (
                                               
                                                <div key={event.project._id} className='actualite_container_yearContainer_monthContainer_events_eventContainer_residency'>
                                                    <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type'>{event.residency.residencyType.replace(/Résidences/g, 'Résidence')}</p>
                                                    <Link to={`/spectacles/${event.project._id}`}>
                                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
                                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{event.project.subtitle}</p>
                                                    </Link>
                                                    <IsALink className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_link' link={event.residency.placeLink} name={event.residency.placeName}/>
                                                    <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_city'>{event.residency.city}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default Actualite;
