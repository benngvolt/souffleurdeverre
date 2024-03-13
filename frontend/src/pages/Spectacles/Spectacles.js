import './Spectacles.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react'

import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Spectacles() {

    // const [projects, setProjects] = useState([]);
    const { projects, projectTypes, projectStates, fullCurrentDate } = useContext(Context);
    const [sortedProjects, setSortedProjects] = useState(projects);
    const [sortedProjectsByState, setSortedProjectsByState] = useState(projects);
    const [sortedProjectsByType, setSortedProjectsByType] = useState(projects);
    const [displayStateFilter, setDisplayStateFilter] = useState('tous');
    const [displayTypeFilter, setDisplayTypeFilter] = useState('tous');
    
    useEffect(()=> {
        setSortedProjects(projects);
    }, []);

    useEffect(()=> {
        const updatedSortedProjects = projects.filter ((project) => (sortedProjectsByState.includes(project)) && (sortedProjectsByType.includes(project)))
        setSortedProjects (updatedSortedProjects);
        console.log(sortedProjects);
    }, [sortedProjectsByState, sortedProjectsByType]);

    function handleFilterProjectState (state) {
        const newSortedProjectsByState = projects.filter((project)=> (project.projectState === state));
        setSortedProjectsByState (newSortedProjectsByState);
        setDisplayStateFilter (state)
    }

    function handleFilterProjectType (type) {
        const newSortedProjectsByType = projects.filter((project)=> (project.projectType === type));
        setSortedProjectsByType (newSortedProjectsByType);
        setDisplayTypeFilter (type)
    }



    function displayAllProjectsStates () {
        setSortedProjectsByState (projects);
        setDisplayStateFilter ("tous");
    }

    function displayAllProjectsTypes () {
        setSortedProjectsByType (projects);
        setDisplayTypeFilter ("tous");
    }



    return  (      
        <section className='spectacles'>
            <div className='spectacles_filtersHandler'>
                <ul className='spectacles_filtersHandler_filtersStateContainer'>
                    <li className={displayStateFilter==='tous'? 'spectacles_filtersHandler_filtersStateContainer_item spectacles_filtersHandler_filtersStateContainer_item--displayOn':'spectacles_filtersHandler_filtersStateContainer_item'}>
                        <button type='button' onClick={() => displayAllProjectsStates()}>
                        TOUS LES SPECTACLES
                        </button>
                    </li>
                    {projectStates
                        .filter(projectState => projects.some(project => project.projectState === projectState))
                        .map((projectState)=>(
                        <li className={displayStateFilter===`${projectState}`?'spectacles_filtersHandler_filtersStateContainer_item spectacles_filtersHandler_filtersStateContainer_item--displayOn':'spectacles_filtersHandler_filtersStateContainer_item'}>
                            <button type='button' onClick={() => handleFilterProjectState(`${projectState}`)}>
                            {projectState}  
                            </button>
                        </li>
                    ))}
                </ul>
                <ul className='spectacles_filtersHandler_filtersTypeContainer'>
                    <li className={displayTypeFilter==='tous'? 'spectacles_filtersHandler_filtersTypeContainer_item spectacles_filtersHandler_filtersTypeContainer_item--displayOn':'spectacles_filtersHandler_filtersTypeContainer_item'}>
                        <button type='button' onClick={() => displayAllProjectsTypes()}>
                        TOUS LES PUBLICS
                        </button>
                    </li>
                    {projectTypes
                        .filter(projectType => projects.some(project => project.projectType === projectType))
                        .map((projectType)=>(
                        <li className={displayTypeFilter===`${projectType}`?'spectacles_filtersHandler_filtersTypeContainer_item spectacles_filtersHandler_filtersTypeContainer_item--displayOn':'spectacles_filtersHandler_filtersTypeContainer_item'}>
                            <button type='button' onClick={() => handleFilterProjectType(`${projectType}`)}>
                            {projectType}  
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {sortedProjects.length === 0 &&
                <p>Aucun projet à afficher</p>
            }
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