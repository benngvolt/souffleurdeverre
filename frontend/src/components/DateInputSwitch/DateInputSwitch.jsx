import { useState } from 'react';
import './DateInputSwitch.scss';

function DateInputSwitch({ dateIndex, index, date, showsList, setShowsList }) {
  const [dateInputMode, setDateInputMode] = useState(() =>
    date?.period ? 'period' : 'single'
  );

  // Wrapper immuable pour éviter les mutations directes
  const updateShows = (updater) => {
    setShowsList((prev) => {
      const next = structuredClone(prev);
      updater(next);
      return next;
    });
  };

  return (
    <div className='dateInputSwitch'>
      {dateInputMode === 'single' && (
        <div>
          <input
            className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_date'
            key={dateIndex}
            type='date'
            id={`inputProjectShowDates${index}`}
            value={date?.day || ''}
            onChange={(e) => {
              const value = e.target.value;
              updateShows((next) => {
                const d = next[index].dates[dateIndex];
                d.day = value;
                // Option "safe" : on ne touche pas à d.period ici.
                // Le nettoyage se fera au submit (FormData).
              });
            }}
          />
          <p
            className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_switchButton'
            onClick={() => {
              setDateInputMode('period');
              // On ne crée pas period ici ; il sera créé à la première saisie.
            }}
          >
            ** SWITCH TO<strong> PERIOD </strong>
          </p>
        </div>
      )}

      {dateInputMode === 'period' && (
        <div>
          <p className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_fromTo'>du</p>
          <input
            className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_date'
            key={`inputProjectShowPeriodStartDate${dateIndex}`}
            type='date'
            id={`inputProjectShowPeriodStartdate${index}`}
            value={date?.period?.startDate || ''}
            onChange={(e) => {
              const value = e.target.value;
              updateShows((next) => {
                const d = next[index].dates[dateIndex];
                // En mode période, on vide le "day" pour éviter l’ambiguïté d’UI.
                d.day = '';
                // Pas de clean : on garde period même partielle
                d.period = { ...(d.period || {}), startDate: value };
              });
            }}
          />
          <p className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_fromTo'>au</p>
          <input
            className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_date'
            key={`inputProjectShowPeriodEndDate${dateIndex}`}
            type='date'
            id={`inputProjectShowPeriodEnddate${index}`}
            value={date?.period?.endDate || ''}
            onChange={(e) => {
              const value = e.target.value;
              updateShows((next) => {
                const d = next[index].dates[dateIndex];
                d.day = '';
                d.period = { ...(d.period || {}), endDate: value };
              });
            }}
          />
          <p
            onClick={() => {
              setDateInputMode('single');
              // À la demande : on peut supprimer period ici,
              // car c’est une action explicite (pas pendant la saisie).
              updateShows((next) => {
                const d = next[index].dates[dateIndex];
                if (d.period) delete d.period;
              });
            }}
            className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_switchButton'
          >
            ** SWITCH TO<strong> SINGLE </strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default DateInputSwitch;
