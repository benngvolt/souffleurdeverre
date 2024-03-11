import './Spectacles.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react'

import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Spectacles() {

    // const [projects, setProjects] = useState([]);
    const [sortedProjects, setSortedProjects] = useState([]);
    const [sortedProjectsByState, setSortedProjectsByState] = useState([]);
    const [sortedProjectsByType, setSortedProjectsByType] = useState([]);
    const [displayStateFilter, setDisplayStateFilter] = useState("tous");
    const [displayTypeFilter, setDisplayTypeFilter] = useState("tous");
    const { projects, projectTypes, projectStates } = useContext(Context);

    useEffect(() => {
        setSortedProjects (projects);
        // Assurez-vous que sortedProjects est initialisé avec les données chargées           
    }, []);

    useEffect(()=> {
        const updatedSortedProjects = projects.filter ((project) => (sortedProjectsByState.includes(project)) && (sortedProjectsByType.includes(project)))
        setSortedProjects (updatedSortedProjects);
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
            <ul className='spectacles_filtersContainer'>
                <li className={displayStateFilter==='tous'? 'spectacles_filtersContainer_item spectacles_filtersContainer_item--displayOn':'spectacles_filtersContainer_item'}>
                    <button type='button' onClick={() => displayAllProjectsStates()}>
                    TOUS LES SPECTACLES
                    </button>
                </li>
                {projectStates.map((projectState)=>(
                    <li className={displayStateFilter===`${projectState}`?'spectacles_filtersContainer_item spectacles_filtersContainer_item--displayOn':'spectacles_filtersContainer_item'}>
                        <button type='button' onClick={() => handleFilterProjectState(`${projectState}`)}>
                        {projectState}  
                        </button>
                    </li>
                ))}
            </ul>
            <ul className='spectacles_filtersContainer'>
                <li className={displayTypeFilter==='tous'? 'spectacles_filtersContainer_item spectacles_filtersContainer_item--displayOn':'spectacles_filtersContainer_item'}>
                    <button type='button' onClick={() => displayAllProjectsTypes()}>
                    TOUS LES PUBLICS
                    </button>
                </li>
                {projectTypes.map((projectType)=>(
                    <li className={displayTypeFilter===`${projectType}`?'spectacles_filtersContainer_item spectacles_filtersContainer_item--displayOn':'spectacles_filtersContainer_item'}>
                        <button type='button' onClick={() => handleFilterProjectType(`${projectType}`)}>
                        {projectType}  
                        </button>
                    </li>
                ))}
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