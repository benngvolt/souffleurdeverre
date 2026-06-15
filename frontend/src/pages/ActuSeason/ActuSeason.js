import './ActuSeason.scss';
import React, { useContext, useMemo } from 'react';
import { Context } from '../../utils/Context';
import EventCard from '../../components/EventCard/EventCard';

function ActuSeason() {
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const { seasonBuckets } = useContext(Context);

  const googleEventCalendarUrlMount = (eventData) => {
    const eventDate = eventData.startDate;

    const formatDate = (dateStr, timeStr) => {
      const date = dateStr.substring(0, 10).replace(/-/g, '');
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

    const endDateFormatted = formatDate(
      endDateObj.toISOString(),
      endDateObj.toISOString().substring(11, 16)
    );

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=Le Souffleur de Verre - ${eventData.project.title}&dates=${startDateFormatted}/${endDateFormatted}&details=${eventData.project.description}&location=${eventData.show.placeName} - ${eventData.show.city}&trp=false&sprop=&sprop=name:`;
  };

  const groupEventsByMonth = (events) => {
    const map = new Map();

    for (const event of events) {
      const [y, m] = event.startDate.split('-');
      const key = `${y}-${m}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    }

    for (const [key, evts] of map.entries()) {
      evts.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      map.set(key, evts);
    }

    const monthKeysSorted = Array.from(map.keys()).sort(
      (a, b) => new Date(`${a}-01`) - new Date(`${b}-01`)
    );

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

  const seasonsWithMonths = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (seasonBuckets || []).map((season) => {
      const pastEvents = [];
      const upcomingEvents = [];

      (season.events || []).forEach((event) => {
        const eventDate = new Date(event.startDate);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate < today) {
          pastEvents.push(event);
        } else {
          upcomingEvents.push(event);
        }
      });

      return {
        ...season,
        groupedByMonth: groupEventsByMonth(upcomingEvents),
        pastGroupedByMonth: groupEventsByMonth(pastEvents),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonBuckets]);

  const renderMonthBlock = (season, monthBlock, isPast = false) => (
    <div
      key={`${season.seasonStartYear}-${isPast ? 'past-' : ''}${monthBlock.key}`}
      className={
        isPast
          ? 'actualite_container_yearContainer_monthContainer actualite_container_yearContainer_monthContainer--past'
          : 'actualite_container_yearContainer_monthContainer'
      }
    >
      <p className='actualite_container_yearContainer_monthContainer_month'>
        {monthBlock.monthName} {monthBlock.year}
      </p>

      <div className='actualite_container_yearContainer_monthContainer_events'>
        {monthBlock.events.map((event) => (
          <EventCard
            key={`${event.project._id}-${event.startDate}-${event.endDate}-${event.type}`}
            event={event}
            months={months}
            googleEventCalendarUrlMount={googleEventCalendarUrlMount}
          />
        ))}
      </div>
    </div>
  );

  return (
    <section className='actualite'>
      <div className='actualite_container'>
        {seasonsWithMonths.length === 0 && (
          <p style={{ marginTop: '1rem' }}>Aucune date programmée.</p>
        )}

        {seasonsWithMonths.map((season) => (
          <div
            key={season.seasonStartYear}
            className='actualite_container_yearContainer'
          >
            <p className='actualite_container_yearContainer_year'>
              {season.label}
            </p>

            {season.groupedByMonth.map((monthBlock) =>
              renderMonthBlock(season, monthBlock)
            )}

            {season.pastGroupedByMonth.length > 0 && (
              <details className='actualite_container_yearContainer_pastDates'>
                <summary className='actualite_container_yearContainer_pastDates_summary'>
                  Dates passées
                </summary>

                {season.pastGroupedByMonth.map((monthBlock) =>
                  renderMonthBlock(season, monthBlock, true)
                )}
              </details>
            )}

            {season.groupedByMonth.length === 0 &&
              season.pastGroupedByMonth.length === 0 && (
                <p style={{ marginTop: '1rem' }}>
                  Aucune date programmée sur cette saison.
                </p>
              )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ActuSeason;