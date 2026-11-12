import './Edit.scss';
import { useDocumentMeta } from '../../utils/useDocumentMeta';
import BioForm from '../../components/BioForm/BioForm';
import LogoForm from '../../components/LogoForm/LogoForm';
import ConfirmBox from '../../components/ConfirmBox/ConfirmBox';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import Newsletter from '../../components/Newsletter/Newsletter';
import { apiFetch } from '../../utils/api';
import { Context } from '../../utils/Context';
import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

function Edit() {
    /*----- CONST NAVIGATION DASHBOARD ----*/
    const [activeSection, setActiveSection] = useState('projects');

    /*----- CONST CONFIRMBOX ----*/
    const [confirmBoxState, setConfirmBoxState] = useState(false);
    const [deleteMode, setDeleteMode] = useState('bio');
    const [projectToDelete, setProjectToDelete] = useState('');
    const [bioToDelete, setBioToDelete] = useState('');

    /*----- CONST BIOS ----*/
    const [bioFormMode, setBioFormMode] = useState('add');
    const [biographyEdit, setBiographyEdit] = useState(null);
    const [handleDisplayBioForm, setHandleDisplayBioForm] = useState(false);
    const [mainImageIndex, setMainImageIndex] = useState(0);

    /*----- CONST LOGOS ----*/
    const [logoFormMode, setLogoFormMode] = useState('add');
    const [logoEdit, setLogoEdit] = useState(null);
    const [handleDisplayLogoForm, setHandleDisplayLogoForm] = useState(false);
    const [logoToDelete, setLogoToDelete] = useState('');

    /*----- CONST PROJECTS ----*/
    const [projectFormMode, setProjectFormMode] = useState('add');
    const [projectEdit, setProjectEdit] = useState('');
    const [handleDisplayProjectForm, setHandleDisplayProjectForm] = useState(false);
    const [handleDisplayNewsletter, setHandleDisplayNewsletter] = useState(false);

    const [artistsList, setArtistsList] = useState([]);
    const [productionList, setProductionList] = useState([]);
    const [pressList, setPressList] = useState([]);
    const [paragraphList, setParagraphList] = useState([]);
    const [linksList, setLinksList] = useState([]);
    const [residenciesList, setResidenciesList] = useState([]);
    const [showsList, setShowsList] = useState([]);

    const [imageFiles, setImageFiles] = useState([]);
    const [pdfFiles, setPdfFiles] = useState([]);

    const [selectedNewsletterProjectIds, setSelectedNewsletterProjectIds] = useState([]);

    const { projects, biographies, logos, handleLoadBiographies, handleLoadLogos, handleLoadProjects, isAuthenticated, sortedEvents } = useContext(Context);

    /*----- RÉCUP PROJETS FUTURS POUR NEWSLETTER ----*/

    const defaultNewsletterProjectIds = React.useMemo(() => {
        if (!Array.isArray(sortedEvents)) return [];
      
        const today = new Date();
        today.setHours(0, 0, 0, 0);
      
        return [
          ...new Set(
            sortedEvents
              .filter((event) => {
                if (event.type === 'release') return false;
                const date = new Date(event.startDate);
                return date >= today;
              })
              .map((event) => event?.project?._id)
              .filter(Boolean)
          ),
        ];
      }, [sortedEvents]);
      
    useEffect(() => {
        setSelectedNewsletterProjectIds(defaultNewsletterProjectIds);
    }, [defaultNewsletterProjectIds]);
    
    function toggleNewsletterProject(projectId) {
        setSelectedNewsletterProjectIds((prev) =>
          prev.includes(projectId)
            ? prev.filter((id) => id !== projectId)
            : [...prev, projectId]
        );
      }

    /*----- AFFICHAGE ----*/

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    function closeConfirmBox() {
        setConfirmBoxState(false);
    }

    const sortedProjects = [...projects].sort((a, b) => {
        return a.title.localeCompare(b.title);
    });

    const sortedBiographies = [...biographies].sort((a, b) => {
        return a.surname.localeCompare(b.surname);
    });

    const sortedLogos = [...logos].sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    /*----------------------------------------------
    ---------- DELETE ----- BIO /PROJECT -----------
    ----------------------------------------------*/

    function handleBioDeleteMode(biography) {
        setConfirmBoxState(true);
        setDeleteMode('bio');
        setBioToDelete(biography._id);
    }

    function handleLogoDeleteMode(logo) {
        setConfirmBoxState(true);
        setDeleteMode('logo');
        setLogoToDelete(logo._id);
    }

    function handleProjectDeleteMode(project) {
        setConfirmBoxState(true);
        setDeleteMode('project');
        setProjectToDelete(project);
    }

    function deleteBio() {
        apiFetch(`/api/biographies/${bioToDelete}`, { method: 'DELETE', auth: true })
            .then(() => {
                setHandleDisplayBioForm(false);
                setConfirmBoxState(false);
                setBiographyEdit(null);
                handleLoadBiographies();
            })
            .catch((error) => console.error(error.message));
    }

    function deleteLogo() {
        apiFetch(`/api/logos/${logoToDelete}`, { method: 'DELETE', auth: true })
            .then(() => {
                setConfirmBoxState(false);
                handleLoadLogos();
                // Le serveur retire aussi ce logo des projets qui l'affichaient.
                handleLoadProjects();
            })
            .catch((error) => console.error(error.message));
    }

    function deleteProject() {
        const project = projectToDelete;

        apiFetch(`/api/projects/${project._id}`, { method: 'DELETE', auth: true })
            .then(() => {
                setHandleDisplayProjectForm(false);
                setConfirmBoxState(false);
                handleLoadProjects();
            })
            .catch((error) => console.error(error.message));
    }

    /*----------------------------------------------
    ---------- ADD ----- BIO /PROJECT --------------
    ----------------------------------------------*/

    function addBio() {
        setBiographyEdit(null);
        setBioFormMode('add');
        setHandleDisplayBioForm(true);
    }

    function addLogo() {
        setLogoEdit(null);
        setLogoFormMode('add');
        setHandleDisplayLogoForm(true);
    }

    function addProject() {
        setArtistsList([]);
        setProductionList([]);
        setPressList([]);
        setParagraphList([]);
        setLinksList([]);
        setResidenciesList([]);
        setShowsList([]);
        setImageFiles([]);
        setPdfFiles([]);
        setProjectFormMode('add');
        setProjectEdit('');
        setHandleDisplayProjectForm(true);
    }

    /*----------------------------------------------
    ---------- EDIT ----- BIO /PROJECT -------------
    ----------------------------------------------*/

    function editBio(biography) {
        setBiographyEdit(biography);
        setBioFormMode('edit');
        setHandleDisplayBioForm(true);
    }

    function editLogo(logo) {
        setLogoEdit(logo);
        setLogoFormMode('edit');
        setHandleDisplayLogoForm(true);
    }

    function editProject(project) {
        setProjectFormMode('edit');
        setProjectEdit(project);
        setArtistsList(project.artistsList || []);
        setProductionList(project.productionList || []);
        setPressList(project.pressList || []);
        setParagraphList(project.paragraphList || []);
        setLinksList(project.linksList || []);
        setResidenciesList(project.residenciesList || []);
        setShowsList(project.showsList || []);
        setHandleDisplayProjectForm(true);
        setImageFiles(project.images || []);
        setPdfFiles(project.pdfList || []);
        setMainImageIndex(project.mainImageIndex || 0);
    }

    const deleteHandlers = { bio: deleteBio, project: deleteProject, logo: deleteLogo };

    useDocumentMeta({ robots: 'noindex, nofollow' });

    return (
        <div>
            {isAuthenticated ? (
                <div className='editSection'>
                    <div className='editSection_dashboard'>
                        <nav className='editSection_sidebar' aria-label='Navigation du dashboard'>
                            <button
                                type='button'
                                className={activeSection === 'projects' ? 'editSection_sidebar_item editSection_sidebar_item--active' : 'editSection_sidebar_item'}
                                onClick={() => setActiveSection('projects')}
                            >
                                PROJETS
                            </button>
                            <button
                                type='button'
                                className={activeSection === 'biographies' ? 'editSection_sidebar_item editSection_sidebar_item--active' : 'editSection_sidebar_item'}
                                onClick={() => setActiveSection('biographies')}
                            >
                                BIOGRAPHIES
                            </button>
                            <button
                                type='button'
                                className={activeSection === 'logos' ? 'editSection_sidebar_item editSection_sidebar_item--active' : 'editSection_sidebar_item'}
                                onClick={() => setActiveSection('logos')}
                            >
                                LOGOS
                            </button>
                            <button
                                type='button'
                                className={activeSection === 'newsletter' ? 'editSection_sidebar_item editSection_sidebar_item--active' : 'editSection_sidebar_item'}
                                onClick={() => setActiveSection('newsletter')}
                            >
                                NEWSLETTER
                            </button>
                        </nav>

                        <div className='editSection_content'>
                            {activeSection === 'projects' && (
                                handleDisplayProjectForm ? (
                                    <ProjectForm
                                        projectEdit={projectEdit}
                                        projectFormMode={projectFormMode}
                                        setHandleDisplayProjectForm={setHandleDisplayProjectForm}
                                        handleDisplayProjectForm={handleDisplayProjectForm}
                                        artistsList={artistsList}
                                        setArtistsList={setArtistsList}
                                        productionList={productionList}
                                        setProductionList={setProductionList}
                                        pressList={pressList}
                                        setPressList={setPressList}
                                        paragraphList={paragraphList}
                                        setParagraphList={setParagraphList}
                                        linksList={linksList}
                                        setLinksList={setLinksList}
                                        residenciesList={residenciesList}
                                        setResidenciesList={setResidenciesList}
                                        showsList={showsList}
                                        setShowsList={setShowsList}
                                        imageFiles={imageFiles}
                                        setImageFiles={setImageFiles}
                                        mainImageIndex={mainImageIndex}
                                        setMainImageIndex={setMainImageIndex}
                                        setPdfFiles={setPdfFiles}
                                        pdfFiles={pdfFiles}
                                        editProject={editProject}
                                        addProject={addProject}
                                    />
                                ) : (
                                    <div className='editSection_content_projects'>
                                        <p className='editSection_content_projects_title'>PROJETS</p>
                                        <button
                                            className='editSection_content_projects_addButton'
                                            onClick={addProject}
                                        >
                                            + AJOUTER UN PROJET
                                        </button>
                                        <ul className='editSection_content_projects_projectsList'>
                                            {sortedProjects.map((project) => (
                                                <li
                                                    key={project._id}
                                                    className='editSection_content_projects_projectsList_item'
                                                >
                                                    <p
                                                        className={
                                                            project.projectState === '*non visible*'
                                                                ? 'editSection_content_projects_projectsList_item_name editSection_content_projects_projectsList_item_name--invisible'
                                                                : 'editSection_content_projects_projectsList_item_name editSection_content_projects_projectsList_item_name--visible'
                                                        }
                                                    >
                                                        {project.title}
                                                        {project.projectState === '*non visible*' && (
                                                            <span className="editSection_content_projects_projectsList_item_unpublished">
                                                                *non-publié
                                                            </span>
                                                        )}
                                                    </p>

                                                    <div className='editSection_content_projects_projectsList_item_buttons'>
                                                        <button aria-label='Modifier ce projet' onClick={() => editProject(project)}>
                                                            <FontAwesomeIcon icon={faPenToSquare} />
                                                        </button>
                                                        <button aria-label='Supprimer ce projet' onClick={() => handleProjectDeleteMode(project)}>
                                                            <FontAwesomeIcon icon={faTrashCan} />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            )}

                            {activeSection === 'logos' && (
                                <div className='editSection_content_logos'>
                                    <p className='editSection_content_logos_title'>LOGOS</p>
                                    <button
                                        onClick={addLogo}
                                        className='editSection_content_logos_addButton'
                                    >
                                        + AJOUTER UN LOGO
                                    </button>
                                    <p className='editSection_content_logos_tuto'>
                                        Les logos ajoutés ici peuvent ensuite être choisis, par leur nom, dans l'onglet LOGOS de chaque projet pour s'afficher en bas de sa page.
                                    </p>
                                    {sortedLogos.length === 0 && (
                                        <p className='editSection_content_logos_empty'>Aucun logo pour le moment.</p>
                                    )}
                                    <ul className='editSection_content_logos_logosList'>
                                        {sortedLogos.map((logo) => (
                                            <li
                                                key={logo._id}
                                                className='editSection_content_logos_logosList_item'
                                            >
                                                <div className='editSection_content_logos_logosList_item_info'>
                                                    <img
                                                        className='editSection_content_logos_logosList_item_info_image'
                                                        src={logo.imageUrl}
                                                        alt=''
                                                        loading='lazy'
                                                    />
                                                    <p className='editSection_content_logos_logosList_item_name'>
                                                        {logo.name}
                                                        {logo.isOnCompanyPage && (
                                                            <span className='editSection_content_logos_logosList_item_badge'>
                                                                page Compagnie
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className='editSection_content_logos_logosList_item_buttons'>
                                                    <button aria-label='Modifier ce logo' onClick={() => editLogo(logo)}>
                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                    </button>
                                                    <button aria-label='Supprimer ce logo' onClick={() => handleLogoDeleteMode(logo)}>
                                                        <FontAwesomeIcon icon={faTrashCan} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {activeSection === 'newsletter' && (
                                <div className='editSection_content_newsletter'>
                                    <p className='editSection_content_newsletter_title'>NEWSLETTER</p>
                                    <button
                                        className='editSection_content_newsletter_addButton'
                                        onClick={() => setHandleDisplayNewsletter(true)}
                                    >
                                        GÉNÉRER UNE NEWSLETTER
                                    </button>
                                    <p className='editSection_content_newsletter_tuto'>
                                        <strong>Important!</strong> Avant de générer une newsletter, assurez-vous bien d'avoir coché les projets que vous souhaitez voir apparaitre à l'intérieur.<br/>
                                        Les projets déjà cochés sont ceux qui contiennent des évènements futurs. Ils peuvent être décochés.<br/>
                                    </p>
                                    <ul className='editSection_content_newsletter_projectsList'>
                                        {sortedProjects.map((project) => (
                                        <li key={project._id}>
                                            <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedNewsletterProjectIds.includes(project._id)}
                                                onChange={() => toggleNewsletterProject(project._id)}
                                            />
                                            {project.title}
                                            </label>
                                        </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {activeSection === 'biographies' && (
                                <div className='editSection_content_bios'>
                                    <p className='editSection_content_bios_title'>BIOGRAPHIES</p>
                                    <button
                                        onClick={addBio}
                                        className='editSection_content_bios_addButton'
                                    >
                                        AJOUTER UN.E COLLABORA.TEUR.TRICE
                                    </button>
                                    <ul className='editSection_content_bios_biosList'>
                                        {sortedBiographies.map((biography) => (
                                            <li
                                                key={biography._id}
                                                className='editSection_content_bios_biosList_item'
                                            >
                                                <p className='editSection_content_bios_biosList_item_name'>
                                                    {biography.name} {biography.surname}
                                                </p>
                                                <div className='editSection_content_bios_biosList_item_buttons'>
                                                    <button aria-label='Modifier cette biographie' onClick={() => editBio(biography)}>
                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                    </button>
                                                    <button aria-label='Supprimer cette biographie' onClick={() => handleBioDeleteMode(biography)}>
                                                        <FontAwesomeIcon icon={faTrashCan} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={handleDisplayBioForm === false ? 'editSection_forms--displayOff' : 'editSection_forms--displayOn'}>
                        <BioForm
                            key={bioFormMode === 'edit' ? biographyEdit?._id : 'add-bio'}
                            biographyEdit={biographyEdit}
                            bioFormMode={bioFormMode}
                            setHandleDisplayBioForm={setHandleDisplayBioForm}
                            handleDisplayBioForm={handleDisplayBioForm}
                        />
                    </div>

                    {handleDisplayLogoForm && (
                        <div className='editSection_forms--displayOn'>
                            <LogoForm
                                logoEdit={logoEdit}
                                logoFormMode={logoFormMode}
                                closeLogoForm={() => setHandleDisplayLogoForm(false)}
                            />
                        </div>
                    )}

                    <div className={handleDisplayNewsletter === false ? 'editSection_newsletter--displayOff' : 'editSection_newsletter--displayOn'}>
                        <Newsletter
                            setHandleDisplayNewsletter={setHandleDisplayNewsletter}
                            handleDisplayNewsletter={handleDisplayNewsletter}
                            selectedNewsletterProjectIds={selectedNewsletterProjectIds}
                        />
                    </div>

                    <ConfirmBox
                        affirmativeChoice={deleteHandlers[deleteMode]}
                        confirmBoxState={confirmBoxState}
                        negativeChoice={closeConfirmBox}
                    />
                </div>
            ) : (
                <p className='editSection_unauthText'>Accès non-autorisé</p>
            )}
        </div>
    );
}

export default Edit;