import './EventCard.scss'
import { Link } from 'react-router-dom';
import IsALink from '../../components/IsALink/IsALink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons';

function EventCard({ event, months, googleEventCalendarUrlMount }) {
  const eventKey = `${event.project._id}-${event.startDate}-${event.endDate}-${event.type}`;

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

  // Heure de la sortie de résidence ("2026-04-30T10:00" -> "10:00")
  const releaseTime = event.type === 'release' && (event.releaseDate || '').includes('T')
    ? event.releaseDate.split('T')[1].slice(0, 5)
    : '';

  return (
    <div
      key={eventKey}
      className='actualite_container_yearContainer_monthContainer_events_eventContainer'
    >
      {event.startDate !== event.endDate ? (
        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_dates'>
          {event.startDate.split('-')[1] === event.endDate.split('-')[1]
            ? `${event.startDate.split('-')[2]} au ${event.endDate.split('-')[2]} ${months[Number(event.endDate.split('-')[1]) - 1]}`
            : `${event.startDate.split('-')[2]} ${months[Number(event.startDate.split('-')[1]) - 1]} au ${event.endDate.split('-')[2]} ${months[Number(event.endDate.split('-')[1]) - 1]}`}
        </p>
      ) : (
        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_dates'>
          {event.startDate.split('-')[2]} {months[Number(event.startDate.split('-')[1]) - 1]}
        </p>
      )}

      {event.type === 'show' ? (
        <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_show'>
          <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_type'>
            Représentation
          </p>

          <Link to={`/spectacles/${slugify(event.project.title)}`}>
            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>
              {event.project.title}
            </p>
            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>
              {event.project.subtitle}
            </p>
          </Link>

          {!event.period && (
            <a
              className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_calendarLink'
              target='_blank'
              rel='noreferrer'
              href={googleEventCalendarUrlMount(event)}
            >
              <FontAwesomeIcon icon={faCalendarPlus} />
            </a>
          )}

          <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox'>
            {(event.times || []).map((time, idx) => (
              <div
                key={`${event.project._id}-${event.startDate}-time-${idx}`}
                className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeContainer'
              >
                <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_time'>
                  {time.time}
                </p>
                <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeInfos'>
                  {time.timeInfos}
                </p>
              </div>
            ))}

            <IsALink
              className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_link'
              link={event.show.placeLink}
              name={event.show.placeName}
            />
            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_city'>
              {event.show.city}
            </p>
          </div>
        </div>
      ) : event.type === 'release' ? (
        <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_residency'>
          <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type eventCard_releaseLabel'>
            Sortie de résidence
          </p>

          <Link to={`/spectacles/${slugify(event.project.title)}`}>
            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>
              {event.project.title}
            </p>
            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>
              {event.project.subtitle}
            </p>
          </Link>

          <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox'>
            {releaseTime && (
              <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeContainer'>
                <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_time'>
                  {releaseTime}
                </p>
              </div>
            )}

            <IsALink
              className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_link'
              link={event.residency.placeLink}
              name={event.residency.placeName}
            />
            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_city'>
              {event.residency.city}
            </p>
          </div>
        </div>
      ) : (
        <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_residency'>
          <p
            className={
              event.residency.residencyType === 'Médiation' ||
              event.residency.residencyType === 'Formation' ||
              event.residency.residencyType === 'Stage'
                ? 'actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type--mediation'
                : 'actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type--normal'
            }
          >
            {event.residency.residencyType.replace(/Résidences/g, 'Résidence')}
          </p>

          <Link to={`/spectacles/${slugify(event.project.title)}`}>
            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>
              {event.project.title}
            </p>
            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>
              {event.project.subtitle}
            </p>
          </Link>

          <IsALink
            className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_link'
            link={event.residency.placeLink}
            name={event.residency.placeName}
          />

          <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_city'>
            {event.residency.city}
          </p>
        </div>
      )}
    </div>
  );
}

export default EventCard;