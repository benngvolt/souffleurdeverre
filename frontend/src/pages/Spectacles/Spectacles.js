import './Spectacles.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { API_URL } from '../../utils/constants'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Spectacles() {

    const [projects, setProjects] = useState([]);
    const [sortedProjects, setSortedProjects] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/api/projects`)
            .then((res) => res.json())
            .then((data) => {
                setProjects(data);
                setSortedProjects(data); // Assurez-vous que sortedProjects est initialisé avec les données chargées
                console.log('Projets chargés');
            })
            .catch((error) => console.log(error.message));
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
            <p>Spectacles</p>
            <ul>
                <li>
                    <button type='button' onClick={() => displayAllProjects()}>
                    TOUS LES SPECTACLES
                    </button>
                </li>
                <li>
                    <button type='button' onClick={() => handleFilterProjects("en tournée")}>
                    EN TOURNEE    
                    </button>
                </li>
                <li>
                    <button type='button' onClick={() => handleFilterProjects("en création")}>
                    EN CRÉATION  
                    </button>
                </li>
                <li>
                    <button type='button' onClick={() => handleFilterProjects("archives")}>
                    ARCHIVES  
                    </button>
                </li>
            </ul>
            <ul>
                {sortedProjects.map((project) => (
                    <li>
                        <Link to={`/spectacles/${project._id}`}>
                            <img src={project.images[project.mainImageIndex].imageUrl} alt={project.title} />
                            <div>
                                <p>{project.title}</p>
                                <p>Création {project.creationDate}</p>
                                <p>{project.moreInfos}</p>
                                <p>{project.projectState}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
            
        </section>
    )
}

export default Spectacles