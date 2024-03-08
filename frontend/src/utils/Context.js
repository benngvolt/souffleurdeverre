import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from './constants'

export const Context = createContext()

export const Provider = ({ children }) => {

    const [loadProjects, setLoadProjects] = useState(false);
    const [loadBiographies, setLoadBiographies] = useState(false);
    const [projects, setProjects] = useState([]);
    const [biographies, setBiographies] = useState([]);
    const [loaderDisplay, setLoaderDisplay] = useState(false);

    const bioFields = ['technique', 'artistique', 'administration'];
    const projectTypes = ['tout public', 'jeune public', 'public adolescent', 'lecture-spectacle', 'lecture', 'médiation'];
    const projectStates = ['en tournée', 'en création', 'archivé'];


    /*---------------------------------------------
    ----- Chargement des projets et stockage ------
    ---------------------------------------------*/
    useEffect(() => {
        displayLoader();
        fetch(`${API_URL}/api/projects`)
            .then((res) => res.json())
            .then((data) => {
                setProjects(data);
                hideLoader();
                console.log('Projets chargés');
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
            console.log('biographies chargés'),
        )
        .catch((error)=>console.log(error.message))
    },[loadBiographies]);

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

    
    return (
        <Context.Provider value={{ projects, setProjects, biographies, setBiographies, handleLoadProjects, handleLoadBiographies, loadProjects, loaderDisplay, setLoaderDisplay, bioFields, projectTypes, projectStates}}>
            {children}
        </Context.Provider>
    )
}