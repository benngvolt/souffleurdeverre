// import './Actualite.scss';
// import { Link } from 'react-router-dom';
// import React, { useContext, useEffect, useState } from 'react';
// import { Context } from '../../utils/Context';
// import IsALink from '../../components/IsALink/IsALink';

// function Actualite() {
//     const numericMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
//     const numericYears = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
//     const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
//     const { projects, fullCurrentDate } = useContext(Context);
//     const currentDate = new Date(fullCurrentDate);

//     function getLastDateOfMonth(year, month) {
//         return new Date(year, month, 0);
//     }
    
//     const groupedEvents = {};
    
//     projects.forEach(project => {
//         if (project.showsList) {
//             project.showsList.forEach(show => {
//                 if (show.dates) {
//                     show.dates.forEach(date => {
//                         const eventDate = (date.day && date.day !== '') ? date.day : (date.period?.startDate || '');
//                         if (new Date(`${eventDate}T00:00:00`) >= currentDate) {
//                             if (!groupedEvents[eventDate]) {
//                                 groupedEvents[eventDate] = [];
//                             }
//                             groupedEvents[eventDate].push({
//                                 type: 'show',
//                                 project,
//                                 show,
//                                 times: date.times
//                             });
//                         }
//                     });
//                 }
//             });
//         }
//         if (project.residenciesList) {
//             project.residenciesList.forEach(residency => {
//                 const startDate = residency.startDates;
//                 if (new Date(`${startDate}T00:00:00`) >= currentDate) {
//                     if (!groupedEvents[startDate]) {
//                         groupedEvents[startDate] = [];
//                     }
//                     groupedEvents[startDate].push({
//                         type: 'residency',
//                         project,
//                         residency
//                     });
//                 }
//             });
//         }
//     });

    
//     const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a) - new Date(b));
//     console.log (groupedEvents)

//     return (      
//         <section className='actualite'>
//             <div className='actualite_container'>
//                 {numericYears.filter(year => 
//                     sortedDates.some(date => date.startsWith(year))
//                 ).map(year => (
//                     <div key={year} className='actualite_container_yearContainer'>
//                         <p className='actualite_container_yearContainer_year'>{year}</p>
//                         {numericMonths.filter(month => 
//                             sortedDates.some(date => date.startsWith(`${year}-${month}`))
//                         ).map(month => (
//                             <div key={month} className='actualite_container_yearContainer_monthContainer'>
//                                 <p className='actualite_container_yearContainer_monthContainer_month'>{months[Number(month)-1]}</p>
//                                 <div className='actualite_container_yearContainer_monthContainer_events'>
//                                 {sortedDates.filter(date => date.startsWith(`${year}-${month}`)).map(date => (
//                                     <div key={date} className='actualite_container_yearContainer_monthContainer_events_eventContainer'>
//                                         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_dates'>{date.split('-')[2]} {months[Number(month)-1]}</p>
                                       
//                                         {groupedEvents[date].map(event => (
//                                             event.type === 'show' ? (
//                                                 <div key={event.project._id} className='actualite_container_yearContainer_monthContainer_events_eventContainer_show'>
//                                                     <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_type'>Représentation</p>
//                                                     <Link to={`/spectacles/${event.project._id}`}>
//                                                         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
//                                                         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{event.project.subtitle}</p>
//                                                     </Link>
//                                                     <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox'>
//                                                         {event.times.map(time => (
//                                                             <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeContainer'>
//                                                                 <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_time'>{time.time}</p>
//                                                                 <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeInfos'>{time.timeInfos}</p>
//                                                             </div>
//                                                         ))}
//                                                         <IsALink className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_link' link={event.show.placeLink} name={event.show.placeName}/>
//                                                         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_city'>{event.show.city}</p>
//                                                     </div>
//                                                 </div>
//                                             ) : (
//                                                 <div key={event.project._id} className='actualite_container_yearContainer_monthContainer_events_eventContainer_residency'>
//                                                     <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_endDates'>
//                                                         {event.residency.startDates === event.residency.endDates
//                                                             ? `${event.residency.endDates.split('-')[2]} ${months[Number(event.residency.endDates.split('-')[1]) - 1]}` 
//                                                             : (event.residency.startDates.split('-')[1] === event.residency.endDates.split('-')[1] 
//                                                                 ? `au ${event.residency.endDates.split('-')[2]} ${months[Number(event.residency.endDates.split('-')[1]) - 1]}` 
//                                                                 : `au ${event.residency.endDates.split('-')[2]} ${months[Number(event.residency.endDates.split('-')[1]) - 1]}`)
//                                                         }
//                                                     </p>
//                                                     <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type'>{event.residency.residencyType.replace(/Résidences/g, 'Résidence')}</p>
//                                                     <Link to={`/spectacles/${event.project._id}`}>
//                                                         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
//                                                         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{event.project.subtitle}</p>
//                                                     </Link>
//                                                     <IsALink className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_link' link={event.residency.placeLink} name={event.residency.placeName}/>
//                                                     <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_city'>{event.residency.city}</p>
//                                                 </div>
//                                             )
//                                         ))}
//                                     </div>
//                                 ))}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ))}
//             </div>
//         </section>
//     );
// }

// export default Actualite;


import './Actualite.scss';
import { Link } from 'react-router-dom';
import React, { useContext } from 'react';
import { Context } from '../../utils/Context';
import IsALink from '../../components/IsALink/IsALink';

function Actualite() {
    const numericMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const numericYears = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const { projects, fullCurrentDate } = useContext(Context);
    const currentDate = new Date(fullCurrentDate);

    const groupedEvents = {};
    
    projects.forEach(project => {
        if (project.showsList) {
            project.showsList.forEach(show => {
                if (show.dates) {
                    show.dates.forEach(date => {
                        let startDate = date.day || date.period?.startDate;
                        let endDate = date.period?.endDate || date.day;
                        if (startDate && endDate && new Date(endDate) >= currentDate) {
                            const key = `${startDate}_${endDate}_${project._id}`;
                            if (!groupedEvents[key]) {
                                groupedEvents[key] = {
                                    type: 'show',
                                    project,
                                    show,
                                    times: date.times,
                                    startDate,
                                    endDate
                                };
                            }
                        }
                    });
                }
            });
        }
        if (project.residenciesList) {
            project.residenciesList.forEach(residency => {
                let startDate = residency.startDates;
                let endDate = residency.endDates;
                if (startDate && endDate && new Date(endDate) >= currentDate) {
                    const key = `${startDate}_${endDate}_${project._id}_residency`;
                    if (!groupedEvents[key]) {
                        groupedEvents[key] = {
                            type: 'residency',
                            project,
                            residency,
                            startDate,
                            endDate
                        };
                    }
                }
            });
        }
    });

    const sortedEvents = Object.values(groupedEvents).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
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
                                                // <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_show'>
                                                //     <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_type'>Représentation</p>
                                                //     <Link to={`/spectacles/${event.project._id}`}>
                                                //         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
                                                //         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{event.project.subtitle}</p>
                                                //     </Link>
                                                // </div>
                                                <div key={event.project._id} className='actualite_container_yearContainer_monthContainer_events_eventContainer_show'>
                                                    <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_type'>Représentation</p>
                                                    <Link to={`/spectacles/${event.project._id}`}>
                                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
                                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{event.project.subtitle}</p>
                                                    </Link>
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
                                                // <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_residency'>
                                                //     <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type'>{event.residency.residencyType}</p>
                                                //     <Link to={`/spectacles/${event.project._id}`}>
                                                //         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
                                                //     </Link>
                                                // </div>
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
