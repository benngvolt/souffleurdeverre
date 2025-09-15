import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from './constants'

export const Context = createContext()

export const Provider = ({ children }) => {

    const [loadProjects, setLoadProjects] = useState(false);
    const [loadBiographies, setLoadBiographies] = useState(false);
    const [projects, setProjects] = useState([]);
    const [biographies, setBiographies] = useState([]);
    const [loaderDisplay, setLoaderDisplay] = useState(false);
    const [fullCurrentDate, setFullCurrentDate] = useState ([]);

    const bioFields = ['technique', 'artistique', 'administration'];
    const projectTypes = ['tout public', 'jeune public', 'public adolescent'];
    const projectStates = ['en tournée', 'en création', 'archivé', 'lecture-spectacle', 'lecture', 'médiation', 'laboratoire','*non visible*'];
    const productionFunctions = ['Production','Co-production','Soutien','Remerciements', 'Aide à la création', 'Partenariat', 'Aide à la résidence d’écriture', 'Diffusion', 'Pré-achat'];
    const residencyTypes = ['Laboratoires','Résidences d\'écriture','Résidences de création', 'Répétitions', "Lectures et rencontres"];

    /*---------------------------------
    ----- MISE À JOUR ÉTAT D'AUTH -----
    ---------------------------------*/

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    function setLoggedIn () {
        setIsAuthenticated(true) ;
    };

    function setLoggedOut () {
        window.sessionStorage.removeItem('1');
        setIsAuthenticated(false) ;
    };    

    /*---------------------------------------------
    ----- Chargement des projets et stockage ------
    ---------------------------------------------*/
    useEffect(() => {
        displayLoader();
        setFullCurrentDate (formattedDate);
        fetch(`${API_URL}/api/projects`)
            .then((res) => res.json())
            .then((data) => {
                setProjects(data);
                hideLoader();
            })
            .catch((error) => {
                console.log(error.message);
                hideLoader(); // Appel à hideLoader() pour gérer les erreurs
            });
    }, [loadProjects]);

    useEffect(() => {
        fetch(`${API_URL}/api/biographies`)
        .then((res) => res.json())
        .then((data) => 
            setBiographies(data),
        )
        .catch((error)=>console.log(error.message))
    },[loadBiographies]);

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

    const handleLoadProjects = () => { 
        setLoadProjects(loadProjects === false ? true : false);
    };

    const handleLoadBiographies = () => { 
        setLoadBiographies(loadBiographies === false ? true : false);
    };

    /*----------------------------------------
    ----- Gestion d'affichage du loader ------
    ----------------------------------------*/

    function displayLoader() {
        setLoaderDisplay(true);
    }

    function hideLoader() {
        setLoaderDisplay(false);
    }

    /*-----------------------------------------
    ----- Récupération des évents futurs ------
    -----------------------------------------*/

    const currentDate = new Date(fullCurrentDate);
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const groupedEvents = {};
    
    projects.forEach(project => {
        if (project.showsList) {
            project.showsList.forEach(show => {
                if (show.dates) {
                    show.dates.forEach(date => {
                        let startDate = date.day || date.period?.startDate;
                        let endDate = date.period?.endDate || date.day;
                        let period = date.period?.startDate && date.period?.endDate ? true : false;
                        
                        if (startDate && endDate && new Date(endDate) >= today) {
                            const key = `${startDate}_${endDate}_${project._id}`;
                            if (!groupedEvents[key]) {
                                groupedEvents[key] = {
                                    type: 'show',
                                    project,
                                    show,
                                    times: date.times,
                                    startDate,
                                    endDate,
                                    period: period
                                };
                            }
                        }
                    });
                }
            });
        }
        if (project.residenciesList) {
            project.residenciesList.forEach(residency => {
                let startDate = residency.startDates;
                let endDate = residency.endDates;
                if (startDate && endDate && new Date(endDate) >= today) {
                    const key = `${startDate}_${endDate}_${project._id}_residency`;
                    if (!groupedEvents[key]) {
                        groupedEvents[key] = {
                            type: 'residency',
                            project,
                            residency,
                            startDate,
                            endDate
                        };
                    }
                }
            });
        }
    });

    const sortedEvents = Object.values(groupedEvents).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    return (
        <Context.Provider value={{ 
            projects, 
            setProjects, 
            biographies,
            sortedEvents, 
            setBiographies, 
            handleLoadProjects, 
            handleLoadBiographies, 
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
            isAuthenticated}}>
            {children}
        </Context.Provider>
    )
}