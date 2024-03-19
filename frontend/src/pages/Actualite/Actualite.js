import './Actualite.scss'
// import { Link } from 'react-router-dom'
import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'
import FullPeriodDate from '../../components/FullPeriodDate/FullPeriodDate';
import FullPonctualDates from '../../components/FullPonctualDates/FullPonctualDates';
import IsALink from '../../components/IsALink/IsALink';
import DOMPurify from 'dompurify'

 
function Actualite() {
    
    const { projects, fullCurrentDate } = useContext(Context);

    const currentDate = new Date(fullCurrentDate)

    const futureProjects = projects.filter(project => 
        project.showsList && project.showsList.length > 0 &&
        project.showsList.some(show => 
            show.dates && show.dates.length > 0 && 
            show.dates.some(date => new Date(date.day) > currentDate)
        )
    );

    return  (      
        <section className='actualite'>
            {futureProjects.map((project)=>(
                <article className='actualite_show'>
                    <div className='actualite_show_titleContainer'>
                        <p className='actualite_show_titleContainer_title'>{project.title}</p>
                        <p className='actualite_show_titleContainer_type'>{project.projectType}</p>
                    </div>
                    <p className='actualite_show_precision'> représentations </p>
                    <ul className='actualite_show_datesContainer'>
                        {project.showsList.filter(show => show.dates.some(date => new Date(date.day) > currentDate)).map(show => (
                        <li className='actualite_show_datesContainer_item'>
                            <FullPonctualDates 
                                className={'actualite_show_datesContainer_item'}
                                key={show._id} 
                                datesArray={show.dates.filter(date =>
                                    new Date(date.day) > currentDate
                                )} 
                            />
                            <IsALink className='actualite_show_datesContainer_item_placeName' link={show.placeLink} name={show.placeName}/>
                            <p className='actualite_show_datesContainer_item_showCity'>{show.city}</p>
                        </li>
                        ))}
                    </ul>
                    {/* <p className='actualite_show_description' dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(project.description)}}></p> */}
                </article>
            ))}
        </section>
    )
}

export default Actualite