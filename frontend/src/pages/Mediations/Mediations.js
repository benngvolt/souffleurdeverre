import './Mediations.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react'
import { Context } from '../../utils/Context'

 
function Mediations() {

    const { projects, projectTypes, projectStates, fullCurrentDate, isAuthenticated } = useContext(Context);
    const visibleProjects = projects.filter((project)=>(project.projectState === "médiation"));
    const [displayedProjects, setDisplayedProjects] = useState(visibleProjects);
    const [sortedProjects, setSortedProjects] = useState(displayedProjects);
    const [chronologicalSortedProjects, setChronologicalSortedProjects] = useState([]);
    const [sortedProjectsByState, setSortedProjectsByState] = useState(displayedProjects);
    const [sortedProjectsByType, setSortedProjectsByType] = useState(displayedProjects);
    const [displayStateFilter, setDisplayStateFilter] = useState('tous');
    const [displayTypeFilter, setDisplayTypeFilter] = useState('tous');
    
    
    
    
    useEffect(() => {
            setDisplayedProjects(visibleProjects)
            console.log(visibleProjects)
    },[]);


    useEffect(() => {
        window.scrollTo(0, 0);
        setSortedProjects(visibleProjects);
    },[displayedProjects]);

    useEffect(()=> {
        const updatedSortedProjects = displayedProjects.filter ((project) => (sortedProjectsByState.includes(project)) && (sortedProjectsByType.includes(project)))
        setSortedProjects (updatedSortedProjects);
    }, [sortedProjectsByState, sortedProjectsByType, displayedProjects]);

    useEffect(()=> {
        setChronologicalSortedProjects (sortedProjects.sort((a, b) => new Date(b.creationDate ? b.creationDate : 0) - new Date(a.creationDate ? a.creationDate : 0) ))
    }, [sortedProjects]);

    function handleFilterProjectState (state) {
        const newSortedProjectsByState = displayedProjects.filter((project)=> (project.projectState === state));
        setSortedProjectsByState (newSortedProjectsByState);
        setDisplayStateFilter (state);
        if (!newSortedProjectsByState.some((project)=>project.projectType === displayTypeFilter)) {
            setDisplayTypeFilter ('tous');
            displayAllProjectsTypes();
        }
    }

    function handleFilterProjectType (type) {
        const newSortedProjectsByType = displayedProjects.filter((project)=> (project.projectType === type));
        setSortedProjectsByType (newSortedProjectsByType);
        setDisplayTypeFilter (type)
    }

    function displayAllProjectsStates () {
        setSortedProjectsByState (displayedProjects);
        setDisplayStateFilter ("tous");
    }

    function displayAllProjectsTypes () {
        setSortedProjectsByType (displayedProjects);
        setDisplayTypeFilter ("tous");
    }


    return  (      
        <section className='spectacles'>
            
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
                                <p className='spectacles_projectsList_projectItem_mainDatas_subtitle'>{project.subtitle ? project.subtitle : ''}</p>
                                <p className='spectacles_projectsList_projectItem_mainDatas_date'>{project.creationDate ? `${project.creationDate.split('-')[0]}` : ''}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
            
            <p className='spectacles_filtersHandler_mediationText'>La Compagnie Le Souffleur de Verre a toujours eu à cœur de lier la création artistique, exigeante, et la médiation en direction de tous les publics.<br/><br/>
                En résidence sur le territoire de Cournon-d’Auvergne dans l’agglomération clermontoise pendant huit ans, elle a su développer, au-delà des objectifs induits à la résidence, ce lien continu avec le public, en créant des passerelles entre la création et la médiation, mettant en avant une réelle et nécessaire interaction entre les artistes et les publics. Ce travail s’est prolongé sur le territoire de Monistrol-sur-Loire, où la compagnie était en résidence triennale, puis sur le territoire du département de la Loire, en lien avec La Comédie de Saint-Étienne – CDN, à laquelle la Compagnie Le Souffleur de verre a été associée pendant trois ans. Actuellement, elle œuvre largement en Région Auvergne-Rhône-Alpes et au-delà, voire hors hexagone, avec des projets originaux et d’envergure sollicitant de multiples et divers partenaires.<br/><br/>
                En plus de la mise en place de nombreuses lectures publiques, en lien avec les acteurs de terrain (médiathèques notamment), la compagnie met en place de nombreux ateliers de pratique théâtrale (Conservatoire de Clermont-Ferrand, Service Université Culture de Clermont-Ferrand, Centre de détention de Riom, Centre d’Action Municipale de Cournon-d’Auvergne, Conservatoire à Rayonnement régional Massenet de Saint-Étienne, Université Jean Monnet de Saint-Étienne…), mais également des interventions en milieu scolaire (ateliers, classes culturelles, options théâtre), des rencontres avec des personnes âgées (ateliers, rencontres autour des spectacles…), et des stages de théâtre. Elle s’implique aussi dans le secteur associatif (associations d’aide à l’enfance, compagnies de théâtre amateurs…).<br/><br/>
                <strong>Jeune Public</strong><br/><br/> 
                La Compagnie Le Souffleur de verre engage plus particulièrement, depuis plusieurs créations, un travail de médiation à destination du Jeune Public : aller à la rencontre des enfants et adolescents en les impliquant dans le processus de création, leur offrir des thématiques fortes pour offrir au public la possibilité de pousser les portes des théâtres où se permet le questionnement citoyen et le dialogue.<br/><br/>
                Les droits de l’enfant sont un élément central dans le travail de la compagnie avec le Jeune Public. Au travers de la création, il lui importe d’accompagner les enfants dans le développement de leur citoyenneté, dans l’approfondissement d’une sensibilité humaniste, et dans leur capacité à réfléchir et à agir sur le monde en devenir. Prise de conscience de l’existence de leurs droits, ou lutte contre les discriminations et les inégalités sont autant d’axes de réflexion qui accompagnent les enfants dans la construction de leurs identités, singulières comme collectives. il est essentiel à la compagnie de continuer son travail d’éveil avec les plus jeunes autour de leurs droits, en intervenant directement dans les classes.<br/>
            </p>
            
            
            
        </section>
    )
}

export default Mediations