// import './Actualite.scss'
// import { Link } from 'react-router-dom'
// import React, { useContext, useEffect, useState } from 'react'
// import { Context } from '../../utils/Context'
// import FullPeriodDate from '../../components/FullPeriodDate/FullPeriodDate';
// import FullPonctualDates from '../../components/FullPonctualDates/FullPonctualDates';
// import IsALink from '../../components/IsALink/IsALink';
 
// function Actualite() {
    
//     const numericMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
//     const numericYears = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
//     const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    
//     const { projects, fullCurrentDate } = useContext(Context);

//     const currentDate = new Date(fullCurrentDate)

//     function getLastDateOfMonth(year, month) {
//         return new Date(year, month, 0); // Retourne le dernier jour du mois (0 = dernier jour du mois précédent)
//     }
    
   
//     const futureProjects = projects.filter(project => (
//         project.showsList && project.showsList.length > 0 &&
//         project.showsList.some(show => 
//             show.dates && show.dates.length > 0 && 
//             show.dates.some(date => new Date(date.day) > currentDate)
//         )) 
//         || (
//         project.residenciesList && project.residenciesList.length > 0 &&
//         project.residenciesList.some(residency => 
//             residency.endDates && residency.endDates !== null && 
//             new Date(residency.endDates) >= currentDate)
//         )
//     );
//     useEffect(() => {
//         window.scrollTo(0, 0);
//         console.log(sortedFutureProjects)
//     },[]);

//     const sortedFutureProjects = futureProjects.sort((a, b) => {
//         // Trouver la date la plus proche pour le projet 'a'
//         const closestDateA = getClosestDate(a);
        
//         // Trouver la date la plus proche pour le projet 'b'
//         const closestDateB = getClosestDate(b);
        
//         // Comparer les deux dates pour effectuer le tri
//         return closestDateA - closestDateB;
//     });
    
//     // Fonction pour obtenir la date la plus proche pour un projet donné
//     function getClosestDate(project) {
//         let dates = [];
        
//         if (project.showsList && project.showsList.length > 0) {
//             project.showsList.forEach(show => {
//                 if (show.dates && show.dates.length > 0) {
//                     show.dates
//                         .filter(date => new Date(`${date.day}T00:00:00`) >= currentDate)
//                         .forEach(date => {
//                             dates.push(new Date(`${date.day}T00:00:00`));
//                         });
//                 }
//             });
//         }
    
//         if (project.residenciesList && project.residenciesList.length > 0) {
//             project.residenciesList
//                 .filter(residency => new Date(`${residency.endDates}T00:00:00`) >= currentDate)
//                 .forEach(residency => {
//                     if (residency.startDates) {
//                         dates.push(new Date(`${residency.startDates}T00:00:00`));
//                     }
//                 });
//         }
    
//         return dates.length > 0 ? Math.min(...dates.map(date => new Date(date))) : Infinity;
//     }

    
    

//     return  (      
//         <section className='actualite'>
//             <div className='actualite_container'>
//                 {numericYears.filter(year => 
//                         sortedFutureProjects
//                         .some(project => project.residenciesList
//                         .some(residency => residency.startDates.split('-')[0]===year) 
//                         || project.showsList
//                         .some(show => show.dates
//                         .some(date => date.day.split('-')[0]===year))
//                     ) && year >= new Date().getFullYear()
//                 )
//                     .map((year) => (
//                 <div key={year} className='actualite_container_yearContainer'>
//                     <p className='actualite_container_yearContainer_year'>{year}</p>
//                     {numericMonths
//                     .filter(month => {
//                         const lastDateOfMonth = getLastDateOfMonth(year, month);
//                         return sortedFutureProjects.some(project =>
//                             project.residenciesList?.some(residency =>
//                                 residency.startDates.split('-')[0] === year &&
//                                 residency.startDates.split('-')[1] === month
//                             ) || project.showsList?.some(show =>
//                                 show.dates?.some(date =>
//                                     date.day.split('-')[0] === year &&
//                                     date.day.split('-')[1] === month
//                                 )
//                             )
//                         ) && (lastDateOfMonth >= currentDate);
//                     })
//                     .map((month) => (
                    
//                     <div key={month} className='actualite_container_yearContainer_monthContainer'>
//                         <p className='actualite_container_yearContainer_monthContainer_month'>{months[Number(month)-1]}</p>
//                         <div className='actualite_container_yearContainer_monthContainer_events'> 
//                             {sortedFutureProjects.filter(project => 
//                                 (project.residenciesList && project.residenciesList.some(residency => 
//                                     residency.startDates &&
//                                     residency.endDates && 
//                                     residency.startDates.split('-')[0] === year && 
//                                     (residency.startDates.split('-')[1] === month || residency.endDates.split('-')[1] === month) 
//                                 )) ||
//                                 (project.showsList && project.showsList.some(show => 
//                                     show.dates && 
//                                     show.dates.some(date => 
//                                         date.day.split('-')[0] === year && 
//                                         date.day.split('-')[1] === month       
//                                     )
//                                 ))
//                             ).map((projectFiltered) => (
//                                 <div key={projectFiltered.id} className='actualite_container_yearContainer_monthContainer_events_eventContainer'>
//                                     <Link to={`/spectacles/${projectFiltered._id}`} >
//                                         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{projectFiltered.title}</p>
//                                         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{projectFiltered.subtitle}</p>
//                                         <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_moreInfos'>{projectFiltered.moreInfos}</p>
//                                     </Link>
//                                     {projectFiltered.residenciesList &&
//                                     // (projectFiltered.residenciesList.filter(residency => residency.startDates && residency.startDates.split('-')[0]===year && residency.startDates.split('-')[1]===month)
//                                     //     .sort((a, b) =>{
//                                     //         const dateA = new Date(a.startDates); // Convertit la chaîne en objet Date
//                                     //         const dateB = new Date(b.startDates);
//                                     //         return dateA - dateB; // Compare les dates
//                                     //     })
//                                         (projectFiltered.residenciesList.filter(residency => {
//                                             const residencyYear = residency.startDates && residency.startDates.split('-')[0];
//                                             const residencyMonth = residency.startDates && residency.startDates.split('-')[1];
//                                             const residencyEndMonth = residency.endDates && residency.endDates.split('-')[1];
                                    
                                            
//                                             // Appliquer la logique de vérification du mois suivant uniquement si le mois de départ est dans le mois imparti
//                                             return residencyYear === year && 
//                                                    (residencyMonth === month || residencyEndMonth === month);
//                                         })
//                                         .sort((a, b) => {
//                                             const dateA = new Date(a.startDates); // Convertit la chaîne en objet Date
//                                             const dateB = new Date(b.startDates);
//                                             return dateA - dateB; // Compare les dates
//                                         })
//                                         .map((residency) => (
//                                             <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox'>
//                                                 <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type'>{residency.residencyType.replace(/Résidences/g, 'Résidence')}</p>
//                                                 <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_dates'>
//                                                     {residency.startDates === residency.endDates 
//                                                         ? `${residency.endDates.split('-')[2]} ${months[Number(residency.endDates.split('-')[1]) - 1]}` 
//                                                         : (residency.startDates.split('-')[1] === residency.endDates.split('-')[1] 
//                                                             ? `${residency.startDates.split('-')[2]} au ${residency.endDates.split('-')[2]} ${months[Number(residency.endDates.split('-')[1]) - 1]}` 
//                                                             : `${residency.startDates.split('-')[2]} ${months[Number(residency.startDates.split('-')[1]) - 1]} au ${residency.endDates.split('-')[2]} ${months[Number(residency.endDates.split('-')[1]) - 1]}`)
//                                                     }
//                                                 </p>
//                                                 <IsALink className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_link' link={residency.placeLink} name={residency.placeName}/>
//                                                 <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_city'>{residency.city}</p>
//                                             </div>
//                                             )
//                                         )
//                                     )}
//                                     {projectFiltered.showsList &&
//                                     (projectFiltered.showsList.filter(show => show.dates && show.dates.some(date => date.day.split('-')[0]===year && date.day.split('-')[1]===month))
//                                         .map((show) => (
//                                             <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox'>
//                                                 {show.dates.length > 1 && 
//                                                 <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_type'>Représentations</p>
//                                                 }
//                                                 {show.dates.length === 1 && 
//                                                 <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_type'>Représentation</p>
//                                                 }
//                                                 <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_datesBox'>
//                                                     {show.dates
//                                                     .filter(date => date.day.split('-')[1]===month)
//                                                     .sort((a, b) =>{
//                                                         const dateA = new Date(a.day); // Convertit la chaîne en objet Date
//                                                         const dateB = new Date(b.day);
//                                                         return dateA - dateB; // Compare les dates
//                                                     })
//                                                     .map(date => (
//                                                         <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_datesContainer'>
//                                                             <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_dates'>{date.day.split('-')[2]} {months[Number(month)-1]} </p>
//                                                             {date.times.map(time=>(
//                                                                 <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeContainer'>
//                                                                     <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_time'>{time.time} </p>
//                                                                     <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeInfos'>{time.timeInfos} </p>
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                                 <IsALink className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_link' link={show.placeLink} name={show.placeName}/>
//                                                 <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_city'>{show.city}</p>
//                                             </div>
//                                             )
//                                         )
//                                     )}
//                                 </div>
//                             ))}
//                             </div>
//                         </div>
//                     ))}
//                     </div>
//                 ))}
//             </div>
//         </section>
//     )
// }


/* ---------------------------------------------
--- CODE QUI REGROUPE LES DATES ----------------
----------------------------------------------*/

import './Actualite.scss';
import { Link } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../../utils/Context';
import IsALink from '../../components/IsALink/IsALink';

function Actualite() {
    const numericMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const numericYears = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const { projects, fullCurrentDate } = useContext(Context);
    const currentDate = new Date(fullCurrentDate);

    function getLastDateOfMonth(year, month) {
        return new Date(year, month, 0);
    }
    
    const groupedEvents = {};
    
    projects.forEach(project => {
        if (project.showsList) {
            project.showsList.forEach(show => {
                if (show.dates) {
                    show.dates.forEach(date => {
                        const eventDate = date.day;
                        if (new Date(`${eventDate}T00:00:00`) >= currentDate) {
                            if (!groupedEvents[eventDate]) {
                                groupedEvents[eventDate] = [];
                            }
                            groupedEvents[eventDate].push({
                                type: 'show',
                                project,
                                show,
                                times: date.times
                            });
                        }
                    });
                }
            });
        }
        if (project.residenciesList) {
            project.residenciesList.forEach(residency => {
                const startDate = residency.startDates;
                if (new Date(`${startDate}T00:00:00`) >= currentDate) {
                    if (!groupedEvents[startDate]) {
                        groupedEvents[startDate] = [];
                    }
                    groupedEvents[startDate].push({
                        type: 'residency',
                        project,
                        residency
                    });
                }
            });
        }
    });

    
    const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a) - new Date(b));
    console.log (groupedEvents)

    return (      
        <section className='actualite'>
            <div className='actualite_container'>
                {numericYears.filter(year => 
                    sortedDates.some(date => date.startsWith(year))
                ).map(year => (
                    <div key={year} className='actualite_container_yearContainer'>
                        <p className='actualite_container_yearContainer_year'>{year}</p>
                        {numericMonths.filter(month => 
                            sortedDates.some(date => date.startsWith(`${year}-${month}`))
                        ).map(month => (
                            <div key={month} className='actualite_container_yearContainer_monthContainer'>
                                <p className='actualite_container_yearContainer_monthContainer_month'>{months[Number(month)-1]}</p>
                                <div className='actualite_container_yearContainer_monthContainer_events'>
                                {sortedDates.filter(date => date.startsWith(`${year}-${month}`)).map(date => (
                                    <div key={date} className='actualite_container_yearContainer_monthContainer_events_eventContainer'>
                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_dates'>{date.split('-')[2]} {months[Number(month)-1]}</p>
                                       
                                        {groupedEvents[date].map(event => (
                                            event.type === 'show' ? (
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
                                                <div key={event.project._id} className='actualite_container_yearContainer_monthContainer_events_eventContainer_residency'>
                                                    <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_endDates'>
                                                        {event.residency.startDates === event.residency.endDates
                                                            ? `${event.residency.endDates.split('-')[2]} ${months[Number(event.residency.endDates.split('-')[1]) - 1]}` 
                                                            : (event.residency.startDates.split('-')[1] === event.residency.endDates.split('-')[1] 
                                                                ? `au ${event.residency.endDates.split('-')[2]} ${months[Number(event.residency.endDates.split('-')[1]) - 1]}` 
                                                                : `au ${event.residency.endDates.split('-')[2]} ${months[Number(event.residency.endDates.split('-')[1]) - 1]}`)
                                                        }
                                                    </p>
                                                    <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type'>{event.residency.residencyType.replace(/Résidences/g, 'Résidence')}</p>
                                                    <Link to={`/spectacles/${event.project._id}`}>
                                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
                                                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{event.project.subtitle}</p>
                                                    </Link>
                                                    <IsALink className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_link' link={event.residency.placeLink} name={event.residency.placeName}/>
                                                    <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_city'>{event.residency.city}</p>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Actualite;
