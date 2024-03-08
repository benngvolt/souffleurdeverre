import './Spectacles.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react'

import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Spectacles() {

    // const [projects, setProjects] = useState([]);
    const [sortedProjects, setSortedProjects] = useState([]);
    const { projects } = useContext(Context);

    useEffect(() => {
        
        setSortedProjects(projects); // Assurez-vous que sortedProjects est initialisé avec les données chargées
                
    }, []);

    function handleFilterProjects (state) {
        const newSortedPorjects = projects.filter((project)=> (project.projectState === state));
        setSortedProjects (newSortedPorjects);
    }

    function displayAllProjects () {
        setSortedProjects (projects);
    }



    return  (      
        <section className='spectacles'>
            <ul className='spectacles_filtersContainer'>
                <li className='spectacles_filtersContainer_item'>
                    <button type='button' onClick={() => displayAllProjects()}>
                    TOUS LES SPECTACLES
                    </button>
                </li>
                <li className='spectacles_filtersContainer_item'>
                    <button type='button' onClick={() => handleFilterProjects("en tournée")}>
                    EN TOURNEE    
                    </button>
                </li>
                <li className='spectacles_filtersContainer_item'>
                    <button type='button' onClick={() => handleFilterProjects("en création")}>
                    EN CREATION  
                    </button>
                </li>
                <li className='spectacles_filtersContainer_item'>
                    <button type='button' onClick={() => handleFilterProjects("archives")}>
                    ARCHIVES  
                    </button>
                </li>
            </ul>
            <ul className='spectacles_projectsList' >
                {sortedProjects.map((project) => (
                    <li>
                        <Link to={`/spectacles/${project._id}`} className='spectacles_projectsList_projectItem'>
                            <img src={project.images[project.mainImageIndex].imageUrl} alt={project.title} className='spectacles_projectsList_projectItem_img' />
                            <div className='spectacles_projectsList_projectItem_mainDatas'>
                                <p className='spectacles_projectsList_projectItem_mainDatas_title'>{project.title}</p>
                                <p className='spectacles_projectsList_projectItem_mainDatas_creationDate'>Création {project.creationDate}</p>
                                <p className='spectacles_projectsList_projectItem_mainDatas_state'>{project.projectState}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
            
        </section>
    )
}

export default Spectacles