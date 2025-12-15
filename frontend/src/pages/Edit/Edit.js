import './Edit.scss'
import BioForm from '../../components/BioForm/BioForm'
import ConfirmBox from '../../components/ConfirmBox/ConfirmBox'
import ProjectForm from '../../components/ProjectForm/ProjectForm'
import Newsletter from '../../components/Newsletter/Newsletter'
import { API_URL } from '../../utils/constants'
import { Context } from '../../utils/Context'
import React, { useEffect, useState, useContext } from 'react'
import noelImg from '../../assets/noel.webp'
import snowflakes from '../../assets/snowflakes.svg'


function Edit() {

    /*----- CONST CONFIRMBOX ----*/
    const [confirmBoxState, setConfirmBoxState] = useState(false);
    const [deleteMode, setDeleteMode] = useState('bio');
    const [projectToDelete, setProjectToDelete] = useState('');
    const [bioToDelete, setBioToDelete] = useState('');

    /*----- CONST BIOS ----*/
    const [bioFormMode, setBioFormMode] = useState('add');
    const [biographyEdit, setBiographyEdit] = useState(null);
    const [handleDisplayBioForm, setHandleDisplayBioForm] = useState(false);
    const [mainImageIndex, setMainImageIndex]= useState(0);

    /*----- CONST PROJECTS ----*/
    const [projectFormMode, setProjectFormMode] = useState('add');
    const [projectEdit, setProjectEdit] = useState('');
    const [handleDisplayProjectForm, setHandleDisplayProjectForm] = useState(false);
    const [handleDisplayNewsletter, setHandleDisplayNewsletter] = useState(false);

    const [artistsList, setArtistsList] = useState([]);
    const [productionList, setProductionList] = useState([]);
    const [pressList, setPressList] = useState([]);
    const [paragraphList, setParagraphList] = useState([]);
    const [videoList, setVideoList] = useState([]);
    const [residenciesList, setResidenciesList] = useState([]);
    const [showsList, setShowsList] = useState([]);

    const [imageFiles, setImageFiles] = useState([]);
    const [pdfFiles, setPdfFiles]= useState([]);

    const { projects, biographies, handleLoadBiographies, handleLoadProjects, isAuthenticated } = useContext(Context);

    useEffect(() => {
        window.scrollTo(0, 0);
    },[]);
    
    /*-------------------------------------
    ---------- CONFIRMBOX -----------------
    -------------------------------------*/

    function closeConfirmBox () {
        setConfirmBoxState(false);
    }

    const sortedProjects = projects.sort((a, b) => {
        return a.title.localeCompare(b.title);
    });

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
                Authorization: `Bearer ${sessionStorage.getItem('1')}`,
            },
        })
        .then((response) => {
            if(response.ok) {
                console.log(response);
            }
            setHandleDisplayBioForm(false);
            setConfirmBoxState (false);
            handleLoadBiographies();
        })
        .catch((error) => console.log(error.message))
    }

    function deleteProject() {
        const project = projectToDelete
        fetch(`${API_URL}/api/projects/${project._id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('1')}`,
              },
        })
        .then ((response) => {
            if(response.ok) {
                console.log(response);
            }
            setHandleDisplayProjectForm(false);
            setConfirmBoxState (false);
            handleLoadProjects();
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
        setArtistsList([]);
        setProductionList([]);
        setPressList([]);
        setParagraphList([]);
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
        setProjectFormMode('edit');
        setProjectEdit(project);
        setArtistsList(project.artistsList);
        setProductionList(project.productionList);
        setPressList(project.pressList);
        setParagraphList(project.paragraphList);
        setVideoList(project.videoList)
        setResidenciesList(project.residenciesList);
        setShowsList(project.showsList);
        setHandleDisplayProjectForm(true);
        setImageFiles(project.images);
        setPdfFiles(project.pdfList);
        setMainImageIndex(project.mainImageIndex);
    }
    
    return  (
        <div>
            {isAuthenticated ? (
                
            <div className='editSection'>
                <img src={noelImg} className='editSection_specialImg'/>
                <div className='editSection_snowflakesContainer'>
                    <img className='editSection_snowflakesContainer_snowflakes' src={snowflakes}/>
                </div>
                <div className='editSection_mainContainer'>
                    <div className='editSection_mainContainer_projects'>
                        <p className='editSection_mainContainer_projects_title'>PROJETS</p>
                        <ul className='editSection_mainContainer_projects_projectsList'>
                            {sortedProjects.map((project)=>(
                                <li className='editSection_mainContainer_projects_projectsList_item'>
                                    <p className={project.projectState==="*non visible*"?'editSection_mainContainer_projects_projectsList_item_name editSection_mainContainer_projects_projectsList_item_name--invisible':'editSection_mainContainer_projects_projectsList_item_name editSection_mainContainer_projects_projectsList_item_name--visible'}>{project.title}{project.projectState==="*non visible*" && 
                                    <span className="editSection_mainContainer_projects_projectsList_item_unpublished">*non-publié</span>
                                    }</p>
                                    
                                    <div className='editSection_mainContainer_projects_projectsList_item_buttons'>
                                        <button onClick={() => editProject(project)}>MODIFIER</button>
                                        <button onClick={() => handleProjectDeleteMode (project)}>SUPPRIMER</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button className='editSection_mainContainer_projects_addButton' onClick={() => addProject()}>+ AJOUTER UN PROJET</button>
                    </div>
                    <div className='editSection_mainContainer_newsletter'>
                        <p className='editSection_mainContainer_newsletter_title'>NEWSLETTER</p>
                        <button className='editSection_mainContainer_newsletter_addButton' onClick={() => setHandleDisplayNewsletter(true)}>GÉNÉRER UNE NEWSLETTER</button>
                    </div>    
                    <div className='editSection_mainContainer_bios'>
                        <p className='editSection_mainContainer_bios_title'>BIOGRAPHIES</p>
                        <ul className='editSection_mainContainer_bios_biosList'>
                            {biographies.map((biography)=>(
                                <li className='editSection_mainContainer_bios_biosList_item'>
                                    <p className='editSection_mainContainer_bios_biosList_item_name'> {biography.name} {biography.surname}</p>
                                    <div className='editSection_mainContainer_bios_biosList_item_buttons'>
                                        <button onClick={() => editBio(biography)}>MODIFIER</button>
                                        <button onClick={() => handleBioDeleteMode(biography)}>SUPPRIMER</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => addBio()} className='editSection_mainContainer_bios_addButton'>AJOUTER UN.E COLLABORA.TEUR.TRICE</button>
                    </div>           
                </div>
                <div className={handleDisplayProjectForm===false ? "editSection_forms--displayOff" : "editSection_forms--displayOn"}>
                    <ProjectForm 
                        projectEdit={projectEdit} 
                        projectFormMode={projectFormMode}
                        setHandleDisplayProjectForm = {setHandleDisplayProjectForm}
                        handleDisplayProjectForm = {handleDisplayProjectForm}
                        artistsList={artistsList} 
                        setArtistsList={setArtistsList} 
                        productionList={productionList} 
                        setProductionList={setProductionList} 
                        pressList={pressList} 
                        setPressList={setPressList} 
                        paragraphList={paragraphList}
                        setParagraphList={setParagraphList}
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
                        editProject = {editProject}
                        addProject = {addProject}
                    />
                </div>
                <div className={handleDisplayBioForm===false ? "editSection_forms--displayOff" : "editSection_forms--displayOn"}>
                    <BioForm 
                        biographyEdit={biographyEdit} 
                        bioFormMode={bioFormMode}
                        setHandleDisplayBioForm = {setHandleDisplayBioForm}
                        handleDisplayBioForm={handleDisplayBioForm}
                    />
                </div>
                <div className={handleDisplayNewsletter===false ? "editSection_newsletter--displayOff" : "editSection_newsletter--displayOn"}>
                    <Newsletter 
                        setHandleDisplayNewsletter = {setHandleDisplayNewsletter}
                        handleDisplayNewsletter={handleDisplayNewsletter}
                    />
                </div>
                <ConfirmBox 
                    affirmativeChoice={deleteMode==='bio' ? deleteBio : deleteProject} 
                    confirmBoxState={confirmBoxState}
                    negativeChoice={closeConfirmBox}
                />
                
            </div>
            ):(
            <p className='editSection_unauthText'>Accès non-autorisé</p>
            )
            }
        </div>
    )
}

export default Edit