import './Actualite.scss'
import { Link } from 'react-router-dom'
import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'
import FullPeriodDate from '../../components/FullPeriodDate/FullPeriodDate';
import FullPonctualDates from '../../components/FullPonctualDates/FullPonctualDates';
import IsALink from '../../components/IsALink/IsALink';
 
function Actualite() {
    
    
    const { projects, fullCurrentDate } = useContext(Context);

    const currentDate = new Date(fullCurrentDate)

    const futureProjects = projects.filter(project => 
        project.showsList && project.showsList.length > 0 &&
        project.showsList.some(show => 
            show.dates && show.dates.length > 0 && 
            show.dates.some(date => new Date(date.day) > currentDate)
        ) ||
        project.residenciesList && project.residenciesList.length > 0 &&
        project.residenciesList.some(residency => 
            residency.endDates && residency.endDates !== null && 
            new Date(residency.endDates) > currentDate)
    );
    useEffect(() => {
        window.scrollTo(0, 0);
    },[]);

    return  (      
        <section className='actualite'>
            {futureProjects.map((project)=>(
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
                    <img className='actualite_show_img' src={project.images[project.mainImageIndex].imageUrl} alt={project.title}/>
                </article>
            ))}
        </section>
    )
}

export default Actualite