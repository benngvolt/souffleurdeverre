import './OneSpectacle.scss'
// import { Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { API_URL } from '../../utils/constants'
// import { Context } from '../../utils/Context'
import { useParams } from 'react-router-dom'

 
function OneSpectacle() {

    const [project, setProject] = useState([]);
    // const [sortedProjects, setSortedProjects] = useState([]);
    const { id } = useParams();
    
    useEffect(() => {
        fetch(`${API_URL}/api/projects/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setProject(data);
                console.log(data);
                console.log('Projet chargé');
            })
            .catch((error) => console.log(error.message));
    }, []);

    return  (      
        <section className='spectacles'>
            <p>{project.title}</p>
        </section>
    )
}

export default OneSpectacle