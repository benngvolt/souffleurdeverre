import './Edit.scss'
import BioForm from '../../components/BioForm/BioForm'
// import DNDGallery from '../../components/DNDGallery/DNDGallery'
import ProjectForm from '../../components/ProjectForm/ProjectForm'
import { API_URL } from '../../utils/constants'
// import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
// import { Context } from '../../utils/Context'
// import { useNavigate } from 'react-router-dom'

 
function Edit() {

    /*-------------------------------------
    ---------- BIOGRAPHIES ----------------
    -------------------------------------*/

    const [biographies, setBiographies] = useState([]);
    const [bioFormMode, setBioFormMode] = useState('add');
    const [biographyEdit, setBiographyEdit] = useState(null);
    const [handleDisplayBioForm, setHandleDisplayBioForm] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/biographies`)
        .then((res) => res.json())
        .then((data) => setBiographies(data),
            console.log('biographies chargés'),
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

    /*----------------------------------
    ---------- PROJECTS ----------------
    ----------------------------------*/
    const [projects, setProjects] = useState([]);
    const [projectFormMode, setProjectFormMode] = useState('add');
    const [projectEdit, setProjectEdit] = useState('');
    const [handleDisplayProjectForm, setHandleDisplayProjectForm] = useState(false);

    const [artistsList, setArtistsList] = useState([]);
    const [productionList, setProductionList] = useState([]);
    const [pressList, setPressList] = useState([]);
    const [videoList, setVideoList] = useState([]);
    const [residenciesList, setResidenciesList] = useState([]);
    const [showsList, setShowsList] = useState([]);

    // const [imageFiles, setImageFiles] = useState([]);
    // const [mainImageIndex, setMainImageIndex] = useState (0);

    useEffect(() => {
        fetch(`${API_URL}/api/projects`)
        .then((res) => res.json())
        .then((data) => setProjects(data),
            console.log('travaux chargés'),
        )
        .catch((error)=>console.log(error.message))
    },[]);

    async function editProject(project) {
        // await setImageFiles(project.images);
        setArtistsList(project.artistsList);
        setProductionList(project.productionList);
        setPressList(project.pressList);
        setVideoList(project.videoList)
        setResidenciesList(project.residenciesList);
        setShowsList(project.showsList);
        setProjectEdit(project);
        setProjectFormMode('edit');
        setHandleDisplayProjectForm(true);
    }

    function deleteProject() {
        
    }

    function addProject() {
        setProjectFormMode('add');
        setHandleDisplayProjectForm(true);
        setArtistsList([]);
        setProductionList([]);
        setPressList([]);
        setVideoList([]);
        setResidenciesList([]);
        setShowsList([]);
        // setMainImageIndex(0);
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
                </div>
            </div>
            <div>
                <ul>
                    {projects.map((project)=>(
                        <li>
                            <p>{project.title}</p>
                            <button onClick={() => editProject(project)}>MODIFIER</button>
                            <button onClick={() => deleteProject(project)}>SUPPRIMER</button>
                        </li>
                    ))}
                </ul>
                <button onClick={() => addProject()}>+ AJOUTER UN PROJET</button>
                <div className={handleDisplayProjectForm===false ? "--displayOff" : "--displayOn"}>
                    {/* <DNDGallery  
                    /> */}
                    <ProjectForm 
                        projectEdit={projectEdit} 
                        projectFormMode={projectFormMode} 
                        artistsList={artistsList} 
                        setArtistsList={setArtistsList} 
                        productionList={productionList} 
                        setProductionList={setProductionList} 
                        pressList={pressList} 
                        setPressList={setPressList} 
                        videoList={videoList} 
                        setVideoList={setVideoList} 
                        residenciesList={residenciesList} 
                        setResidenciesList={setResidenciesList}
                        showsList={showsList} 
                        setShowsList={setShowsList}
                    />
                </div>
            </div>
        </div>
    )
}

export default Edit