import './Edit.scss'
import BioForm from '../../components/BioForm/BioForm'
import ConfirmBox from '../../components/ConfirmBox/ConfirmBox'
import ProjectForm from '../../components/ProjectForm/ProjectForm'
import { API_URL } from '../../utils/constants'
import React, { useEffect, useState } from 'react'

/*-----REFACT OK!-----*/

function Edit() {

    /*----- CONST CONFIRMBOX ----*/
    const [confirmBoxState, setConfirmBoxState] = useState(false);
    const [deleteMode, setDeleteMode] = useState('bio');
    const [projectToDelete, setProjectToDelete] = useState('');
    const [bioToDelete, setBioToDelete] = useState('');

    /*----- CONST BIOS ----*/
    const [biographies, setBiographies] = useState([]);
    const [bioFormMode, setBioFormMode] = useState('add');
    const [biographyEdit, setBiographyEdit] = useState(null);
    const [handleDisplayBioForm, setHandleDisplayBioForm] = useState(false);
    const [mainImageIndex, setMainImageIndex]= useState(0);

    /*----- CONST PROJECTS ----*/
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

    const [imageFiles, setImageFiles] = useState([]);
    const [pdfFiles, setPdfFiles]= useState([]);

    /*----------------------------------------------
    ---------- GET ----- BIO /PROJECT -------------
    ----------------------------------------------*/

    useEffect(() => {
        fetch(`${API_URL}/api/biographies`)
        .then((res) => res.json())
        .then((data) => setBiographies(data),
            console.log('biographies chargés'),
        )
        .catch((error)=>console.log(error.message))
    },[handleDisplayBioForm, confirmBoxState]);

    useEffect(() => {
        fetch(`${API_URL}/api/projects`)
        .then((res) => res.json())
        .then((data) => setProjects(data),
            console.log('travaux chargés'),
        )
        .catch((error)=>console.log(error.message))
    },[handleDisplayProjectForm, confirmBoxState]);

    /*-------------------------------------
    ---------- CONFIRMBOX -----------------
    -------------------------------------*/

    function closeConfirmBox () {
        setConfirmBoxState(false);
    }

    /*----------------------------------------------
    ---------- DELETE ----- BIO /PROJECT -----------
    ----------------------------------------------*/

    function handleBioDeleteMode (biography) {
        setConfirmBoxState(true);
        setDeleteMode('bio');
        setBioToDelete (biography._id)
    }

    function handleProjectDeleteMode (project) {
        setConfirmBoxState(true);
        setDeleteMode('project');
        setProjectToDelete (project)
    }

    function deleteBio() {
        fetch(`${API_URL}/api/biographies/${bioToDelete}`, {
            method: 'DELETE',
            headers: {
                // Authorization: `Bearer ${sessionStorage.getItem('1')}`,
            },
        })
        .then((response) => {
            if(response.ok) {
                console.log(response);
            }
            setHandleDisplayBioForm(false);
            setConfirmBoxState (false);
        })
        .catch((error) => console.log(error.message))
    }

    function deleteProject() {
        const project = projectToDelete
        fetch(`${API_URL}/api/projects/${project._id}`, {
            method: 'DELETE',
            headers: {
                // Authorization: `Bearer ${sessionStorage.getItem('1')}`,
              },
        })
        .then ((response) => {
            if(response.ok) {
                console.log(response);
            }
            setHandleDisplayProjectForm(false);
            setConfirmBoxState (false);
        })
        .catch ((error)=>console.log(error.message))
    }

    /*----------------------------------------------
    ---------- ADD ----- BIO /PROJECT --------------
    ----------------------------------------------*/
    
    function addBio() {
        setBioFormMode('add');
        setHandleDisplayBioForm(true);
    }

    function addProject() {
        console.log(projectFormMode)
        setArtistsList([]);
        setProductionList([]);
        setPressList([]);
        setVideoList([]);
        setResidenciesList([]);
        setShowsList([]);
        setImageFiles([]);
        setPdfFiles([]);
        setProjectFormMode('add');
        setHandleDisplayProjectForm(true);
    }

    /*----------------------------------------------
    ---------- EDIT ----- BIO /PROJECT -------------
    ----------------------------------------------*/

    function editBio(biography) {
        setBioFormMode('edit');
        setHandleDisplayBioForm(true);
        setBiographyEdit(biography);
    }

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
        setImageFiles(project.images);
        setPdfFiles(project.pdfList);
        setMainImageIndex(project.mainImageIndex);
    }
    
    return  (      
        <div className='editSection'>
            <div className='editSection_mainContainer'>
                <div className='editSection_mainContainer_projects'>
                    <p className='editSection_mainContainer_projects_title'>PROJETS</p>
                    <ul className='editSection_mainContainer_projects_projectsList'>
                        {projects.map((project)=>(
                            <li className='editSection_mainContainer_projects_projectsList_item'>
                                <p>{project.title}</p>
                                <button onClick={() => editProject(project)}>MODIFIER</button>
                                <button onClick={() => handleProjectDeleteMode (project)}>SUPPRIMER</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => addProject()}>+ AJOUTER UN PROJET</button>
                </div>
                <div className='editSection_mainContainer_bios'>
                    <p className='editSection_mainContainer_bios_title'>BIOGRAPHIES</p>
                    <ul className='editSection_mainContainer_bios_biosList'>
                        {biographies.map((biography)=>(
                            <li className='editSection_mainContainer_bios_biosList_item'>
                                <p> {biography.name}{biography.surname}</p>
                                <button onClick={() => editBio(biography)}>MODIFIER</button>
                                <button onClick={() => handleBioDeleteMode(biography)}>SUPPRIMER</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => addBio()} className='editSection_mainContainer_bios_addButton'>+ AJOUTER UN.E COLLABORA.TEUR.TRICE</button>
                </div>            
            </div>
            <div className={handleDisplayProjectForm===false ? "editSection_forms--displayOff" : "editSection_forms--displayOn"}>
                <ProjectForm 
                    projectEdit={projectEdit} 
                    projectFormMode={projectFormMode}
                    setHandleDisplayProjectForm = {setHandleDisplayProjectForm}
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
                    imageFiles = {imageFiles}
                    setImageFiles = {setImageFiles}
                    mainImageIndex = {mainImageIndex}
                    setMainImageIndex = {setMainImageIndex}
                    setPdfFiles = {setPdfFiles}
                    pdfFiles = {pdfFiles}
                />
            </div>
            <div className={handleDisplayBioForm===false ? "editSection_forms--displayOff" : "editSection_forms--displayOn"}>
                <BioForm 
                    biographyEdit={biographyEdit} 
                    bioFormMode={bioFormMode}
                    setHandleDisplayBioForm = {setHandleDisplayBioForm}
                />
            </div>
            <ConfirmBox 
                deleteMode = {deleteMode}
                deleteProject={deleteProject} 
                deleteBio={deleteBio} 
                confirmBoxState={confirmBoxState}
                closeConfirmBox={closeConfirmBox}
            />
        </div>
    )
}

export default Edit