import './ActuSeason.scss';
import { Link } from 'react-router-dom';
import React, { useContext, useMemo } from 'react';
import { Context } from '../../utils/Context';
import IsALink from '../../components/IsALink/IsALink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons';

function ActuSeason() {
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  // ✅ on récupère les saisons prêtes depuis le context
  const { seasonBuckets } = useContext(Context);

  const googleEventCalendarUrlMount = (eventData) => {
    const eventDate = eventData.startDate;

    const formatDate = (dateStr, timeStr) => {
      const date = dateStr.substring(0, 10).replace(/-/g, "");
      const time = timeStr ? timeStr.replace(':', '') : '1200';
      return `${date}T${time}00`;
    };

    let startTime = '12:00';
    if (eventData.times && eventData.times[0] && eventData.times[0].time) {
      startTime = eventData.times[0].time;
    }

    const startDateFormatted = formatDate(eventDate, startTime);

    const startDateObj = new Date(`${eventDate.substring(0, 10)}T${startTime}`);
    const endDateObj = new Date(startDateObj.getTime() + 2 * 60 * 60 * 1000);
    const endDateFormatted = formatDate(endDateObj.toISOString(), endDateObj.toISOString().substring(11, 16));

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=Le Souffleur de Verre - ${eventData.project.title}&dates=${startDateFormatted}/${endDateFormatted}&details=${eventData.project.description}&location=${eventData.show.placeName} - ${eventData.show.city}&trp=false&sprop=&sprop=name:`;
  };

  // Helper: group par mois (YYYY-MM) depuis une liste d'events
  const groupEventsByMonth = (events) => {
    const map = new Map();

    for (const event of events) {
      const [y, m] = event.startDate.split('-'); // "YYYY", "MM"
      const key = `${y}-${m}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    }

    // Tri des events dans le mois
    for (const [key, evts] of map.entries()) {
      evts.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      map.set(key, evts);
    }

    // Tri des mois
    const monthKeysSorted = Array.from(map.keys()).sort((a, b) => new Date(`${a}-01`) - new Date(`${b}-01`));

    return monthKeysSorted.map((key) => {
      const [yearStr, monthStr] = key.split('-');
      const monthIndex = Number(monthStr) - 1;
      return {
        key,
        year: yearStr,
        monthIndex,
        monthName: months[monthIndex],
        events: map.get(key),
      };
    });
  };

  // Pré-calcule : pour chaque saison, on prépare son grouping par mois
  const seasonsWithMonths = useMemo(() => {
    return (seasonBuckets || []).map((season) => ({
      ...season,
      groupedByMonth: groupEventsByMonth(season.events || []),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonBuckets]);

  return (
    <section className='actualite'>
      <div className='actualite_container'>

        {(seasonsWithMonths.length === 0) && (
          <p style={{ marginTop: '1rem' }}>Aucune date programmée.</p>
        )}

        {seasonsWithMonths.map((season) => (
          <div key={season.seasonStartYear} className='actualite_container_yearContainer'>
            {/* ✅ Titre de saison */}
            <p className='actualite_container_yearContainer_year'>{season.label}</p>

            {/* ✅ Mois non vides */}
            {season.groupedByMonth.map((monthBlock) => (
              <div key={`${season.seasonStartYear}-${monthBlock.key}`} className='actualite_container_yearContainer_monthContainer'>
                <p className='actualite_container_yearContainer_monthContainer_month'>
                  {monthBlock.monthName} {monthBlock.year}
                </p>

                <div className='actualite_container_yearContainer_monthContainer_events'>
                  {monthBlock.events.map((event) => (
                    <div
                      key={`${event.project._id}-${event.startDate}-${event.endDate}-${event.type}`}
                      className='actualite_container_yearContainer_monthContainer_events_eventContainer'
                    >
                      {event.startDate !== event.endDate && (
                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_dates'>
                          {(event.startDate.split('-')[1] === event.endDate.split('-')[1]) ? (
                            `${event.startDate.split('-')[2]} au ${event.endDate.split('-')[2]} ${months[Number(event.endDate.split('-')[1]) - 1]}`
                          ) : (
                            `${event.startDate.split('-')[2]} ${months[Number(event.startDate.split('-')[1]) - 1]} au ${event.endDate.split('-')[2]} ${months[Number(event.endDate.split('-')[1]) - 1]}`
                          )}
                        </p>
                      )}

                      {event.startDate === event.endDate && (
                        <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_dates'>
                          {event.startDate.split('-')[2]} {months[Number(event.startDate.split('-')[1]) - 1]}
                        </p>
                      )}

                      {event.type === 'show' ? (
                        <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_show'>
                          <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_type'>Représentation</p>

                          <Link to={`/spectacles/${event.project._id}`}>
                            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
                            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{event.project.subtitle}</p>
                          </Link>

                          {!event.period && (
                            <a
                              className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_calendarLink'
                              target="_blank"
                              rel="noreferrer"
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
                                <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_time'>{time.time}</p>
                                <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_timeInfos'>{time.timeInfos}</p>
                              </div>
                            ))}

                            <IsALink
                              className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_link'
                              link={event.show.placeLink}
                              name={event.show.placeName}
                            />
                            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showsBox_city'>{event.show.city}</p>
                          </div>
                        </div>
                      ) : (
                        <div className='actualite_container_yearContainer_monthContainer_events_eventContainer_residency'>
                          <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_type'>
                            {event.residency.residencyType.replace(/Résidences/g, 'Résidence')}
                          </p>

                          <Link to={`/spectacles/${event.project._id}`}>
                            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showTitle'>{event.project.title}</p>
                            <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_showSubtitle'>{event.project.subtitle}</p>
                          </Link>

                          <IsALink
                            className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_link'
                            link={event.residency.placeLink}
                            name={event.residency.placeName}
                          />
                          <p className='actualite_container_yearContainer_monthContainer_events_eventContainer_residenciesBox_city'>{event.residency.city}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Optionnel : si une saison (théoriquement) vide */}
            {season.groupedByMonth.length === 0 && (
              <p style={{ marginTop: '1rem' }}>Aucune date programmée sur cette saison.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ActuSeason;
