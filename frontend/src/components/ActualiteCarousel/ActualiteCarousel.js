import { useContext, useState, useEffect } from 'react';
import { Context } from '../../utils/Context'
import { Link } from 'react-router-dom'
import './ActualiteCarousel.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import FullPonctualDates from '../FullPonctualDates/FullPonctualDates';
import IsALink from '../IsALink/IsALink';

function ActualiteCarousel({}) {


    const monthNames = [
        "jan", "fév", "mars", "avr", "mai", "juin",
        "juil", "août", "sept", "oct", "nov", "déc"
      ];
    
    const [nextThreeEvents, setNextThreeEvents]=useState([])
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

    // Étape 1 : Filtrer et extraire toutes les dates des spectacles
    // Étape 1 : Créer un tableau pour stocker les informations des spectacles
    const showsWithDates = [];

    // Étape 2 : Filtrer et extraire toutes les dates des spectacles avec les infos du spectacle
    futureProjects.forEach(project => {
        project.showsList?.forEach(show => {
            show.dates?.forEach(date => {
                const showDate = new Date(date.day);
                // Vérifie si la date est dans le futur
                if (showDate > currentDate) {
                    showsWithDates.push({ title: project.title, _id: project._id, projectType: project.projectType, city: show.city, placeName: show.placeName, placeLink: show.placeLink, date: showDate.toLocaleDateString('fr-FR') });
                }
            });
        });
    });

    // Étape 3 : Trier les spectacles par date
    const sortedShowsWithDates = showsWithDates.sort((a, b) => a.date - b.date);

    // Étape 4 : Limiter à trois prochaines dates et récupérer les infos des spectacles
    const nextThreeShowsWithDates = sortedShowsWithDates.slice(0, 3);


    useEffect(() => {
        setNextThreeEvents(nextThreeShowsWithDates)
    },[projects]);


    return (     
        <div className="actualiteCarousel"> 
            {nextThreeEvents.map((item) => (
                <Link to={`/spectacles/${item._id}`} className="actualiteCarousel_item" key={item._id} >
                    <p className="actualiteCarousel_item_date">{item.date.split('/')[0]} {monthNames[item.date.split('/')[1]-1]} {item.date.split('/')[2]}</p> {/* Utilise 'fr-FR' pour le format français */}
                    <p className="actualiteCarousel_item_title">***{item.title}***</p>
                    <p className="actualiteCarousel_item_city">{item.city}</p>
                    <IsALink link={item.placeLink} name={item.placeName} className={'actualiteCarousel_item_link'}/>
                </Link>
            ))}
        </div>
    )   
}

export default ActualiteCarousel