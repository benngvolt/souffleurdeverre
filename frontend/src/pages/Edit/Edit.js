import './Edit.scss'
import BioForm from '../../components/BioForm/BioForm'
import ProjectForm from '../../components/ProjectForm/ProjectForm'
import { API_URL } from '../../utils/constants'
// import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Edit() {

    const [biographies, setBiographies] = useState([]);
    const [bioFormMode, setBioFormMode] = useState('add');
    const [biographyEdit, setBiographyEdit] = useState(null);
    const [handleDisplayBioForm, setHandleDisplayBioForm] = useState(false);

    const [projects, setProjects] = useState([]);
    const [projectFormMode, setProjectFormMode] = useState('add');
    const [projectEdit, setProjectEdit] = useState(null);
    const [handleDisplayProjectForm, setHandleDisplayProjectForm] = useState(false);


    /*-------------------------------------
    ---------- BIOGRAPHIES ----------------
    -------------------------------------*/

    useEffect(() => {
        fetch(`${API_URL}/api/biographies`)
        .then((res) => res.json())
        .then((data) => setBiographies(data),
            console.log('travaux chargés'),
        )
        .catch((error)=>console.log(error.message))
    },[]);

    function editBio(biography) {
        setBioFormMode('edit');
        setHandleDisplayBioForm(true);
        setBiographyEdit(biography);
    }

    function deleteBio() {
        
    }

    function addBio() {
        setBioFormMode('add');
        setHandleDisplayBioForm(true);
    }

    return  (      
        <div className='edit'>
            <div>
                <ul>
                    {biographies.map((biography)=>(
                        <li>
                            <p>{biography.name}{biography.surname}</p>
                            <button onClick={() => editBio(biography)}>MODIFIER</button>
                            <button onClick={() => deleteBio(biography)}>SUPPRIMER</button>
                        </li>
                    ))}
                </ul>
                <button onClick={() => addBio()}>+ AJOUTER UN.E COLLABORA.TEUR.TRICE</button>
                <div className={handleDisplayBioForm===false ? "--displayOff" : "--displayOn"}>
                    <BioForm biographyEdit={biographyEdit} bioFormMode={bioFormMode} />
                    <ProjectForm projectEdit={projectEdit} projectFormMode={projectFormMode} />
                </div>
            </div>
        </div>
    )
}

export default Edit