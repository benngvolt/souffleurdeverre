import React, { createContext, useState, useEffect, useMemo } from 'react';
import { apiFetch, isLoggedIn, clearAuthToken } from './api';

export const Context = createContext();

export const Provider = ({ children }) => {
  const [loadProjects, setLoadProjects] = useState(false);
  const [loadBiographies, setLoadBiographies] = useState(false);
  const [loadLogos, setLoadLogos] = useState(false);
  const [projects, setProjects] = useState([]);
  const [biographies, setBiographies] = useState([]);
  const [logos, setLogos] = useState([]);
  const [loaderDisplay, setLoaderDisplay] = useState(false);
  const [fullCurrentDate, setFullCurrentDate] = useState([]);

  const bioFields = ['technique', 'artistique', 'administration'];
  const projectTypes = ['tout public', 'jeune public', 'public adolescent'];
  const projectStates = ['en tournée', 'en création', 'archivé', 'lecture-spectacle', 'lecture', 'médiation', 'laboratoire','*non visible*'];
  const productionFunctions = ['Production','Co-production','Soutien','Remerciements', 'Aide à la création', 'Partenariat', 'Aide à la résidence d’écriture', 'Diffusion', 'Pré-achat'];
  const residencyTypes = ['Laboratoires','Résidences d\'écriture','Résidences de création', 'Répétitions', "Lectures et rencontres", "Médiation", "Formation", "Stage"];

  /*---------------------------------
  ----- MISE À JOUR ÉTAT D'AUTH -----
  ---------------------------------*/
  // Initialisé depuis le token en session pour ne pas déconnecter l'utilisateur au refresh.
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn());

  function setLoggedIn () {
    setIsAuthenticated(true);
  }

  function setLoggedOut () {
    clearAuthToken();
    setIsAuthenticated(false);
  }

  /*----------------------------------------
  ----- Gestion d'affichage du loader ------
  ----------------------------------------*/
  function displayLoader() {
    setLoaderDisplay(true);
  }

  function hideLoader() {
    setLoaderDisplay(false);
  }

  const handleLoadProjects = () => {
    setLoadProjects(loadProjects === false ? true : false);
  };

  const handleLoadBiographies = () => {
    setLoadBiographies(loadBiographies === false ? true : false);
  };

  const handleLoadLogos = () => {
    setLoadLogos(loadLogos === false ? true : false);
  };

  /*---------------------------------------------
  ----- Chargement des projets et stockage ------
  ---------------------------------------------*/
  useEffect(() => {
    displayLoader();

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

    setFullCurrentDate(formattedDate);

    apiFetch('/api/projects')
      .then((data) => {
        setProjects(data || []);
        hideLoader();
      })
      .catch((error) => {
        console.error(error.message);
        hideLoader();
      });
  }, [loadProjects]);

  useEffect(() => {
    apiFetch('/api/biographies')
      .then((data) => setBiographies(data || []))
      .catch((error) => console.error(error.message));
  }, [loadBiographies]);

  useEffect(() => {
    apiFetch('/api/logos')
      .then((data) => setLogos(data || []))
      .catch((error) => console.error(error.message));
  }, [loadLogos]);

  /*-----------------------------------------
  ----- Dates "aujourd'hui" (00:00) ---------
  -----------------------------------------*/
  const currentDate = useMemo(() => new Date(fullCurrentDate), [fullCurrentDate]);

  const today = useMemo(() => {
    if (Number.isNaN(currentDate.getTime())) return new Date();
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  }, [currentDate]);

  /*-----------------------------------------
  ----- Helper : construire les events -------
  -----------------------------------------*/
  const buildEventsFromProjects = (onlyFuture = false) => {
    const events = [];
  
    projects.forEach((project) => {
      // SHOWS
      if (project.showsList) {
        project.showsList.forEach((show, showIndex) => {
          if (show.dates) {
            show.dates.forEach((d, dateIndex) => {
              const startDate = d.day || d.period?.startDate;
              const endDate = d.period?.endDate || d.day;
              const period = !!(d.period?.startDate && d.period?.endDate);
  
              if (!startDate || !endDate) return;
              if (onlyFuture && new Date(endDate) < today) return;
  
              events.push({
                _eventKey: [
                  'show',
                  project._id,
                  show._id || showIndex,
                  startDate,
                  endDate,
                  dateIndex
                ].join('_'),
                type: 'show',
                project,
                show,
                times: d.times || [],
                startDate,
                endDate,
                period
              });
            });
          }
        });
      }
  
      // RESIDENCIES
      if (project.residenciesList) {
        project.residenciesList.forEach((residency, residencyIndex) => {
          const startDate = residency.startDates;
          const endDate = residency.endDates;
          const releaseDate = residency.releaseDate;
  
          if (!startDate || !endDate) return;
          if (onlyFuture && new Date(endDate) < today) return;
  
          events.push({
            _eventKey: [
              'residency',
              project._id,
              residency._id || residencyIndex,
              startDate,
              endDate
            ].join('_'),
            type: 'residency',
            project,
            residency,
            startDate,
            endDate,
            releaseDate
          });
        });

        // SORTIES DE RÉSIDENCE : un événement à part entière (ni "résidence", ni "représentation"),
        // daté du jour de sortie, avec les mêmes règles de tri/affichage que les autres.
        project.residenciesList.forEach((residency, residencyIndex) => {
          const releaseDay = (residency.releaseDate || '').slice(0, 10);

          if (!releaseDay) return;
          if (onlyFuture && new Date(releaseDay) < today) return;

          events.push({
            _eventKey: [
              'release',
              project._id,
              residency._id || residencyIndex,
              releaseDay
            ].join('_'),
            type: 'release',
            project,
            residency,
            startDate: releaseDay,
            endDate: releaseDay,
            releaseDate: residency.releaseDate
          });
        });
      }
    });
  
    return events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  /*-----------------------------------------
  ----- 1) Events futurs (comme avant) ------
  -----------------------------------------*/
  const sortedEvents = useMemo(() => {
    return buildEventsFromProjects(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, today]);

  /*-----------------------------------------
  ----- 2) Events complets (pour saisons) ---
  -----------------------------------------*/
  const seasonEvents = useMemo(() => {
    return buildEventsFromProjects(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  /*-----------------------------------------
  ----- Helpers saisons (Août -> Juillet) ---
  -----------------------------------------*/
  const getSeasonStartYearFromDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth(); // 0-11
    return m >= 7 ? y : y - 1; // août (7) -> décembre => saison = année en cours, sinon année précédente
  };

  const getSeasonBounds = (seasonStartYear) => {
    const start = new Date(seasonStartYear, 7, 1, 0, 0, 0, 0); // 1 août
    const end = new Date(seasonStartYear + 1, 6, 31, 23, 59, 59, 999); // 31 juillet
    return { start, end };
  };

  /*-----------------------------------------
  ----- 3) Saisons en cours + futures -------
  ----- (uniquement celles qui ont des dates)
  -----------------------------------------*/
  const seasonBuckets = useMemo(() => {
    if (!seasonEvents || seasonEvents.length === 0) return [];

    const currentSeasonStartYear = getSeasonStartYearFromDate(today);
    const currentSeasonStart = getSeasonBounds(currentSeasonStartYear).start;

    // On ne garde que les events qui ne sont pas entièrement "avant" la saison en cours
    // (donc qui chevauchent la saison en cours OU sont dans le futur)
    const relevant = seasonEvents.filter(ev => new Date(ev.endDate) >= currentSeasonStart);

    // Candidats de saisons : on part de la date de début de l'event (simple et robuste)
    const seasonYears = new Set(
      relevant.map(ev => getSeasonStartYearFromDate(new Date(ev.startDate)))
    );

    // On ne veut que saison en cours + futures
    const sortedSeasonYears = Array.from(seasonYears)
      .filter(y => y >= currentSeasonStartYear)
      .sort((a, b) => a - b);

    // Pour chaque saison, on met les events qui CHEVAUCHENT la fenêtre de saison
    const buckets = sortedSeasonYears.map(seasonStartYear => {
      const { start, end } = getSeasonBounds(seasonStartYear);
      const events = relevant
        .filter(ev => {
          const s = new Date(ev.startDate);
          const e = new Date(ev.endDate);
          return s <= end && e >= start; // chevauchement
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      return {
        seasonStartYear,
        label: `SAISON ${seasonStartYear}/${seasonStartYear + 1}`,
        start,
        end,
        events,
      };
    });

    // On enlève les saisons vides (au cas où)
    return buckets.filter(b => b.events.length > 0);
  }, [seasonEvents, today]);

  return (
    <Context.Provider value={{
      projects,
      setProjects,
      biographies,
      setBiographies,
      logos,
      setLogos,

      // ✅ futur only (inchangé)
      sortedEvents,

      // ✅ complet (passé + futur)
      seasonEvents,

      // ✅ saisons en cours + futures non vides
      seasonBuckets,

      handleLoadProjects,
      handleLoadBiographies,
      handleLoadLogos,
      loadProjects,
      loaderDisplay,
      displayLoader,
      hideLoader,

      bioFields,
      projectTypes,
      projectStates,
      fullCurrentDate,
      productionFunctions,
      residencyTypes,

      setLoggedIn,
      setLoggedOut,
      isAuthenticated
    }}>
      {children}
    </Context.Provider>
  );
};
