import './Actualite.scss'
// import { Link } from 'react-router-dom'
import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Actualite() {
    
    const { projects, fullCurrentDate } = useContext(Context);
    const [ futureShowDates, setFutureShowDates ] = useState ([]);
    const [ futureResidencyDates, setFutureResidencyDates ] = useState ([]);

    const allShows = projects.flatMap(project =>
        project.showsList.map(show => ({
          ...show,
          title: project.title,
          type: "représentation",
          imageUrl: project.images[project.mainImageIndex].imageUrl
        }))
    );

    const allResidencies = projects.flatMap(project =>
        project.residenciesList.map(residency => ({
          ...residency,
          title: project.title,
          type: "résidence",
          imageUrl: project.images[project.mainImageIndex].imageUrl
        }))
    );
    
    const upcomingShows = allShows.filter(show => new Date(show.dates) > new Date(fullCurrentDate));
    const upcomingResidencies = allResidencies.filter(residency => new Date(residency.startDates) > new Date(fullCurrentDate));
    
    const sortedUpcomingShows = upcomingShows.sort((a, b) => new Date(b.dates) - new Date(a.dates));
    const sortedUpcomingResidencies = upcomingResidencies.sort((a, b) => new Date(b.dates) - new Date(a.dates));
    
    function selectFutureDates() {
        setFutureShowDates(sortedUpcomingShows);
        setFutureResidencyDates(sortedUpcomingResidencies);
    };

    useEffect(()=> {
        selectFutureDates();
    }, []);

    return  (      
        <section className='actualite'>
            {futureShowDates?.map((futureShowDate)=>(
                <div>
                    <p>{futureShowDate.title}</p>
                    <p>{futureShowDate.type}</p>
                    <p>{futureShowDate.dates}</p>
                    <p>{futureShowDate.city}</p>
                    <p>{futureShowDate.placeName}</p>
                    <p>{futureShowDate.placeLink}</p>
                    <img src={futureShowDate.imageUrl}/>
                </div>
            ))}
            {futureResidencyDates?.map((futureResidencyDate)=>(
                <div>
                    <p>{futureResidencyDate.title}</p>
                    <p>{futureResidencyDate.residencyType}</p>
                    <p>{futureResidencyDate.startDates}</p>
                    <p>{futureResidencyDate.city}</p>
                    <p>{futureResidencyDate.placeName}</p>
                    <p>{futureResidencyDate.placeLink}</p>
                    <img src={futureResidencyDate.imageUrl}/>
                </div>
            ))}
        </section>
    )
}

export default Actualite