import './Actualite.scss'
// import { Link } from 'react-router-dom'
import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'
import FullPeriodDate from '../../components/FullPeriodDate/FullPeriodDate';
import FullPonctualDates from '../../components/FullPonctualDates/FullPonctualDates';

 
function Actualite() {
    
    const { projects, fullCurrentDate } = useContext(Context);

    const currentDate = new Date(fullCurrentDate)

    const futureProjects = projects.filter(project => 
        project.showsList && project.showsList.length > 0 &&
        project.showsList.some(show => 
            show.dates && show.dates.length > 0 && 
            show.dates.some(date => new Date(date) > currentDate)
        )
    );

    return  (      
        <section className='actualite'>
            {futureProjects.map((project)=>(
                <article>
                    <p>{project.title}</p>
                    <p>{project.projectType}</p>
                    {project.showsList.map(show => (
                        <div>
                            <FullPonctualDates 
                                key={show._id} 
                                datesArray={show.dates.filter(date =>
                                    new Date(date) > currentDate
                                )} 
                            />
                            <p>{show.placeName}</p>
                            <p>{show.city}</p>
                        </div>
                    ))}
                    <p>{project.description}</p>
                </article>
            ))}
        </section>
    )
}

export default Actualite