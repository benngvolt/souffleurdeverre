import './Spectacles.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react'
import { Context } from '../../utils/Context'

 
function Spectacles() {

    const { projects, projectTypes, projectStates, fullCurrentDate } = useContext(Context);
    const [sortedProjects, setSortedProjects] = useState(projects);
    const [chronologicalSortedProjects, setChronologicalSortedProjects] = useState([]);
    const [sortedProjectsByState, setSortedProjectsByState] = useState(projects);
    const [sortedProjectsByType, setSortedProjectsByType] = useState(projects);
    const [displayStateFilter, setDisplayStateFilter] = useState('tous');
    const [displayTypeFilter, setDisplayTypeFilter] = useState('tous');
    
    const visibleProjects = projects.filter((project)=>(project.projectState !== "*non visible*"));

    useEffect(() => {
        window.scrollTo(0, 0);
        setSortedProjects(visibleProjects);
    },[]);

    useEffect(()=> {
        const updatedSortedProjects = visibleProjects.filter ((project) => (sortedProjectsByState.includes(project)) && (sortedProjectsByType.includes(project)))
        setSortedProjects (updatedSortedProjects);
    }, [sortedProjectsByState, sortedProjectsByType]);

    useEffect(()=> {
        setChronologicalSortedProjects (sortedProjects.sort((a, b) => new Date(b.creationDate ? b.creationDate : 0) - new Date(a.creationDate ? a.creationDate : 0) ))
    }, [sortedProjects]);

    function handleFilterProjectState (state) {
        const newSortedProjectsByState = visibleProjects.filter((project)=> (project.projectState === state));
        setSortedProjectsByState (newSortedProjectsByState);
        setDisplayStateFilter (state);
        if (!newSortedProjectsByState.some((project)=>project.projectType === displayTypeFilter)) {
            setDisplayTypeFilter ('tous');
            displayAllProjectsTypes();
        }
    }

    function handleFilterProjectType (type) {
        const newSortedProjectsByType = visibleProjects.filter((project)=> (project.projectType === type));
        setSortedProjectsByType (newSortedProjectsByType);
        setDisplayTypeFilter (type)
    }

    function displayAllProjectsStates () {
        setSortedProjectsByState (visibleProjects);
        setDisplayStateFilter ("tous");
    }

    function displayAllProjectsTypes () {
        setSortedProjectsByType (visibleProjects);
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
                        ?.filter(projectState => projects.some(project => project.projectState === projectState) && projectState!=="*non visible*")
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
                    {displayStateFilter !== 'tous'
                        ? 
                        projectTypes
                            ?.filter(projectType => projects.some(project => project.projectType === projectType && project.projectState === displayStateFilter))
                            .map((projectType)=>(
                            <li className={displayTypeFilter===`${projectType}`?'spectacles_filtersHandler_filtersTypeContainer_item spectacles_filtersHandler_filtersTypeContainer_item--displayOn':'spectacles_filtersHandler_filtersTypeContainer_item'}>
                                <button type='button' onClick={() => handleFilterProjectType(`${projectType}`)}>
                                {projectType}  
                                </button>
                            </li>
                    )) 
                    :   projectTypes
                            .map((projectType)=>(
                            <li className={displayTypeFilter===`${projectType}`?'spectacles_filtersHandler_filtersTypeContainer_item spectacles_filtersHandler_filtersTypeContainer_item--displayOn':'spectacles_filtersHandler_filtersTypeContainer_item'}>
                                <button type='button' onClick={() => handleFilterProjectType(`${projectType}`)}>
                                {projectType}  
                                </button>
                            </li>)) }
                </ul>
                
            </div>
            {chronologicalSortedProjects.length === 0 &&
            <p className='spectacles_filtersHandler_errorText'>...</p>
            }
            <ul className='spectacles_projectsList' >
                {chronologicalSortedProjects?.map((project) => (
                    <li>
                        <Link to={`/spectacles/${project._id}`} className='spectacles_projectsList_projectItem'>
                            <img src={project.images[project.mainImageIndex]?.imageUrl} alt={project.title} className='spectacles_projectsList_projectItem_img' />
                            <div className='spectacles_projectsList_projectItem_mainDatas'>
                                <h3 className='spectacles_projectsList_projectItem_mainDatas_title'>{project.title}</h3>
                                <p className='spectacles_projectsList_projectItem_mainDatas_date'>{project.creationDate ? `${project.creationDate.split('-')[0]}` : 'en chantier...'}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
            
            
        </section>
    )
}

export default Spectacles