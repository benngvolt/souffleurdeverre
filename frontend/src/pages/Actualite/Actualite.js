import './Actualite.scss'
import { Link } from 'react-router-dom'
import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../../utils/Context'
import FullPeriodDate from '../../components/FullPeriodDate/FullPeriodDate';
import FullPonctualDates from '../../components/FullPonctualDates/FullPonctualDates';
import IsALink from '../../components/IsALink/IsALink';
 
function Actualite() {
    
    const numericMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    const numericYears = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    
    const { projects, fullCurrentDate } = useContext(Context);

    const currentDate = new Date(fullCurrentDate)

    const futureProjects = projects.filter(project => (
        project.showsList && project.showsList.length > 0 &&
        project.showsList.some(show => 
            show.dates && show.dates.length > 0 && 
            show.dates.some(date => new Date(date.day) > currentDate)
        )) 
        || (
        project.residenciesList && project.residenciesList.length > 0 &&
        project.residenciesList.some(residency => 
            residency.endDates && residency.endDates !== null && 
            new Date(residency.endDates) > currentDate)
        )
    );
    useEffect(() => {
        window.scrollTo(0, 0);
        console.log(sortedFutureProjects)
    },[]);

    const sortedFutureProjects = futureProjects.sort((a, b) => {
        // Trouver la date la plus proche pour le projet 'a'
        const closestDateA = getClosestDate(a);
        
        // Trouver la date la plus proche pour le projet 'b'
        const closestDateB = getClosestDate(b);
        
        // Comparer les deux dates pour effectuer le tri
        return closestDateA - closestDateB;
    });
    
    // Fonction pour obtenir la date la plus proche pour un projet donné
    function getClosestDate(project) {
        let dates = [];
    
        // Extraire les dates des shows, si elles existent
        if (project.showsList && project.showsList.length > 0) {
            project.showsList.forEach(show => {
                if (show.dates && show.dates.length > 0) {
                    show.dates.filter((date) => new Date(date.day) > currentDate)
                            .forEach(date => {
                        dates.push(new Date(date.day)); // Ajouter les dates des shows
                    });
                }
            });
        }
    
        // Extraire les dates des résidences, si elles existent
        if (project.residenciesList && project.residenciesList.length > 0) {
            project.residenciesList.filter(residency => new Date(residency.endDates) > currentDate)
                                .forEach(residency => {
                if (residency.startDates) {
                    dates.push(new Date(residency.startDates)); // Ajouter les dates des résidences
                }
            });
        }
    
        // Retourner la date la plus proche (c'est-à-dire la plus petite)
        return dates.length > 0 ? Math.min(...dates) : Infinity;
    }
    

    return  (      
        <section className='actualite'>
            <div className='actualite_container'>
                {numericYears.filter(year => 
                        sortedFutureProjects
                        .some(project => project.residenciesList
                        .some(residency => residency.startDates.split('-')[0]===year) 
                        || project.showsList
                        .some(show => show.dates
                        .some(date => date.day.split('-')[0]===year))
                    ) && year >= new Date().getFullYear()
                )
                    .map((year) => (
                <div key={year} className='actualite_container_yearContainer'>
                    <p className='actualite_container_yearContainer_year'>{year}</p>
                    {numericMonths.filter(month => sortedFutureProjects
                        .some(project => project.residenciesList
                        .some(residency => residency.startDates.split('-')[0]===year && residency.startDates.split('-')[1]===month)
                        || project.showsList
                        .some(show => show.dates
                        .some(date => date.day.split('-')[0]===year && date.day.split('-')[1]===month))
                        ) && (new Date(`${year}-${month}-01`) > new Date())
                    ) 
                    .map((month) => (
                    <div key={month} className='actualite_container_yearContainer_monthContainer'>
                        <p className='actualite_container_yearContainer_monthContainer_month'>{months[Number(month)-1]}</p>
                        {sortedFutureProjects.filter(project => 
                            (project.residenciesList && project.residenciesList.some(residency => 
                                residency.startDates && 
                                residency.startDates.split('-')[0] === year && 
                                residency.startDates.split('-')[1] === month
                            )) ||
                            (project.showsList && project.showsList.some(show => 
                                show.dates && 
                                show.dates.some(date => 
                                    date.day.split('-')[0] === year && 
                                    date.day.split('-')[1] === month       
                                )
                            ))
                        ).map((projectFiltered) => (
                            <div key={projectFiltered.id} className='actualite_container_yearContainer_monthContainer_month_eventContainer'>
                                <Link to={`/spectacles/${projectFiltered._id}`} >
                                <p className='actualite_container_yearContainer_monthContainer_month_eventContainer_showTitle'>{projectFiltered.title}</p>
                                </Link>
                                {projectFiltered.residenciesList &&
                                (projectFiltered.residenciesList.filter(residency => residency.startDates && residency.startDates.split('-')[0]===year && residency.startDates.split('-')[1]===month)
                                    .sort((a, b) =>{
                                        const dateA = new Date(a.startDates); // Convertit la chaîne en objet Date
                                        const dateB = new Date(b.startDates);
                                        return dateA - dateB; // Compare les dates
                                    })
                                    .map((residency) => (
                                        <div className='actualite_container_yearContainer_monthContainer_month_eventContainer_residenciesBox'>
                                            <p className='actualite_container_yearContainer_monthContainer_month_eventContainer_residenciesBox_type'>{residency.residencyType}</p>
                                            <p className='actualite_container_yearContainer_monthContainer_month_eventContainer_residenciesBox_dates'>DU {residency.startDates.split('-')[2]}.{residency.startDates.split('-')[1]} AU {residency.endDates.split('-')[2]}.{residency.endDates.split('-')[1]}</p>
                                            <IsALink className='actualite_container_yearContainer_monthContainer_month_eventContainer_residenciesBox_link' link={residency.placeLink} name={residency.placeName}/>
                                            <p className='actualite_container_yearContainer_monthContainer_month_eventContainer_residenciesBox_city'>{residency.city}</p>
                                        </div>
                                        )
                                    )
                                )}
                                {projectFiltered.showsList &&
                                (projectFiltered.showsList.filter(show => show.dates && show.dates.some(date => date.day.split('-')[0]===year && date.day.split('-')[1]===month))
                                    .map((show) => (
                                        <div className='actualite_container_yearContainer_monthContainer_month_eventContainer_showsBox'>
                                            {show.dates.length > 1 && 
                                            <p className='actualite_container_yearContainer_monthContainer_month_eventContainer_showsBox_type'>Représentations</p>
                                            }
                                            {show.dates.length === 1 && 
                                            <p className='actualite_container_yearContainer_monthContainer_month_eventContainer_showsBox_type'>Représentation</p>
                                            }
                                            <div className='actualite_container_yearContainer_monthContainer_month_eventContainer_showsBox_datesBox'>
                                                {show.dates
                                                .sort((a, b) =>{
                                                    const dateA = new Date(a.day); // Convertit la chaîne en objet Date
                                                    const dateB = new Date(b.day);
                                                    return dateA - dateB; // Compare les dates
                                                })
                                                .map(date => (
                                                    <p className='actualite_container_yearContainer_monthContainer_month_eventContainer_showsBox_dates'>{date.day.split('-')[2]}.{date.day.split('-')[1]} </p>
                                                ))}
                                            </div>
                                            <IsALink className='actualite_container_yearContainer_monthContainer_month_eventContainer_showsBox_link' link={show.placeLink} name={show.placeName}/>
                                            <p className='actualite_container_yearContainer_monthContainer_month_eventContainer_showsBox_city'>{show.city}</p>
                                        </div>
                                        )
                                    )
                                )}
                            </div>
                        ))}
                        </div>
                    ))}
                    </div>
                ))}
            </div>


            {/* {sortedFutureProjects.map((project)=>(
                <article className='actualite_show'>
                    <div className='actualite_show_titleContainer'>
                        <Link to={`/spectacles/${project._id}`}>
                            <p className='actualite_show_titleContainer_title'>{project.title}</p>
                        </Link>
                        <p className='actualite_show_titleContainer_type'>{project.projectType}</p>
                    </div>
                    { project.showsList && project.showsList.length > 0 &&
                        project.showsList.some(show => 
                        show.dates && show.dates.length > 0 && 
                        show.dates.some(date => new Date(date.day) > currentDate)) &&
                    <div>
                        <h4 className='actualite_show_precision'> représentations </h4>
                        <ul className='actualite_show_datesContainer'>
                            {project.showsList.filter(show => show.dates.some(date => new Date(date.day) > currentDate)).map(show => (
                            <li className='actualite_show_datesContainer_item'>
                                <IsALink className='actualite_show_datesContainer_item_placeName' link={show.placeLink} name={show.placeName}/>
                                <p className='actualite_show_datesContainer_item_showCity'>{show.city}</p>
                                <FullPonctualDates 
                                    className={'actualite_show_datesContainer_item'}
                                    key={show._id} 
                                    datesArray={show.dates.filter(date =>
                                        new Date(date.day) > currentDate
                                    )} 
                                />
                            </li>
                            ))}
                        </ul>
                    </div>
                    }
                    { project.residenciesList && project.residenciesList.length > 0 &&
                        project.residenciesList.some(residency => 
                        residency.endDates && residency.endDates !== null && 
                        new Date(residency.endDates) > currentDate) &&
                    <div>
                        <h4 className='actualite_residency_precision'> résidences </h4>
                        <ul className='actualite_residency_datesContainer'>
                            {project.residenciesList.filter(residency => new Date(residency.endDates) > currentDate).map(residency => (
                            <li className='actualite_residency_datesContainer_item'>
                                <IsALink className='actualite_residency_datesContainer_item_placeName' link={residency.placeLink} name={residency.placeName}/>
                                <FullPeriodDate
                                    className={'actualite_residency_datesContainer_item_dates_singleDate_residencyDay'}
                                    key={residency._id} 
                                    startISODate={residency.startDates}
                                    endISODate={residency.endDates}
                                />
                                <p className='actualite_residency_datesContainer_item_showCity'>{residency.city}</p>
                                <p className='actualite_residency_datesContainer_item_residencyType'>{residency.residencyType}</p>
                            </li>
                            ))}
                        </ul>
                    </div>
                    }
                    <img className='actualite_show_img' src={project.images[project.mainImageIndex]?.imageUrl} alt={project.title}/>
                </article>
            ))} */}
        </section>
    )
}

export default Actualite