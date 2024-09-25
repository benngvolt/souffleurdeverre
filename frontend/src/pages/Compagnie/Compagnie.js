import './Compagnie.scss'
import { API_URL } from '../../utils/constants'
import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import BioCard from '../../components/BioCard/BioCard'
import BioSheet from '../../components/BioSheet/BioSheet'
import Equipe from '../../components/Equipe/Equipe'
import Collapse from '../../components/Collapse/Collapse'
import julienRocha from '../../assets/Julien_Rocha_Julien_Bruhat.webp'
import cedricVeschambre from '../../assets/Cedric_Veschambre_Julien_Bruhat.webp'
import logoAra from '../../assets/logo_region_Auvergne_Rhone-Alpes.png'
import logoClermont from '../../assets/logo_clermont.png'
import logoMinistere from '../../assets/logo_ministere.png'
 
function Compagnie() {

    const [bioRocha, setBioRocha] = useState([]);
    const [bioVeschambre, setBioVeschambre] = useState([]);
    const [displayBioAside, setDisplayBioAside] = useState(false);
    const [bioAside, setBioAside] = useState([]);
    const partners = [
        {
            'name':'Préfète de la Région Auvergne Rhône-Alpes',
            'logo': `${logoMinistere}`,
            'class':'min',
            'website':'https://www.culture.gouv.fr/regions/drac-auvergne-rhone-alpes'
        },
        {
            'name':'Région Auvergne Rhône-Alpes',
            'logo': `${logoAra}`,
            'class':'ara',
            'website':'https://www.auvergnerhonealpes.fr/'
        },
        {
            'name':'Ville de Clermont-Ferrand',
            'logo': `${logoClermont}`,
            'class':'cle',
            'website':'https://clermont-ferrand.fr/'
        },
    ]

    useEffect(() => {
        fetch(`${API_URL}/api/biographies/Veschambre`)
        .then((res) => res.json())
        .then((data) => setBioVeschambre(data)
        )
        .catch((error)=>console.log(error.message))
    },[]);

    useEffect(() => {
        fetch(`${API_URL}/api/biographies/Rocha`)
        .then((res) => res.json())
        .then((data) => setBioRocha(data),
            console.log('travaux chargés'),
        )
        .catch((error)=>console.log(error.message))
    },[]);

    useEffect(() => {
        window.scrollTo(0, 0);
    },[]);

    function closeBioAside () {
        setDisplayBioAside(false);
    }
    

    return  (      
        <section className='compagnieSection'>
            <h2 className='compagnieSection_title'>La Compagnie</h2>
            <div className='compagnieSection_intro'>
                <p className='compagnieSection_intro_leftbloc'>La Compagnie Le Souffleur de Verre a vu le jour en Auvergne en juillet 2003. Sa responsabilité artistique est assumée par Julien Rocha et Cédric Veschambre, à la fois metteurs en scène et acteurs.En résidence à Cournon d’Auvergne 2004/11, à Monistrol sur Loire 2012/15, associée à la Comédie de Saint-Étienne 2013/16, Artiste Associée et responsable de l’École du jeune spectateur au Caméléon, scène labellisée pour l’émergence et la création en Auvergne-Rhône-Alpes 2020/23.<br/><br/>
                    Avec leurs univers complémentaires, ils donnent une place centrale dans leur démarche au travail de l’Acteur.« Le théâtre nous parle du monde et de nous-mêmes d’un peu de côté. C’est par cet un peu de côté qui met de la distance entre nous-mêmes et notre actualité que nous pouvons redonner épaisseur et perspective à notre présent. Et commencer à y voir clair à nouveau.Avoir un rapport certain à l’Histoire. S’y référer, offrir des points de vue. S’impliquer dans une certaine exigence. Sans hermétisme, cette cohérence éthique tend vers un théâtre citoyen.<br/><br/>
                    Déployer ainsi des problématiques qui appartiennent au monde et faire du plateau, un lieu de l’écrit, un lieu de parole et un lieu de plaisir qui s’adresse à tous.<br/><br/>
                    Vers un théâtre de l’anomalie ?<br/><br/>
                    « Anomalie » : nous avons cru que le mot signifiait un poisson hors de l’eau. Alors qu’il signifie quelque chose qui n’est pas soumis à une analogie ou à une règle, ou quelque chose de curieux, ou d’étrange ou d’exceptionnel. L’exception à la règle. Nous sommes tous victimes de la forme particulière qui est la nôtre. Mais tant pis, ayons les ressorts pour résister.
                </p>
                <p className='compagnieSection_intro_rightbloc'>Ainsi, c’est un théâtre épique que nous défendons qui cultive l’étrangeté, convoque d’autres univers, nouveaux projecteurs qui illuminent différemment notre réalité. Le récit dramaturgique, ainsi projeté dans d’autres mondes, échappe à la linéarité et à l’interprétation univoque.<br/><br/>
                Ce théâtre de l’anomalie se construit aussi dans une rupture de ton (panaché d’humour, de paroles crues, inserts théoriques, politiques, chansons populaires, textes personnels d’acteurs ou de spectateurs). L’anomalie permet d’aborder notre monde avec la plus grande complexité possible où jeux et paroles sont parfois tirés jusqu’au risque de la cassure, pour dire la vérité de l’excès. La proposition théâtrale cherche générosité et jubilation.<br/><br/>
                Le spectateur doit être chahuté : l’anomalie, petit pois sous les sept matelas qui nuit à l’assoupissement, cherche l’étonnement, l’émotion la plus vraie possible. L’audace est dans la distorsion du temps normatif de la représentation, la résistance à la tentation du traitement direct des thèmes d’actualité, le dépouillement des moyens techniques. Ce théâtre se donne la liberté de proposer de nouvelles règles, mais aussi le luxe de les contredire. Sans vouloir inquiéter, ce théâtre ne se satisfait jamais de rassurer le public. Il l’amène à faire front !<br/><br/>
                « Essayons de reprendre notre temps quand tout va trop vite et devient illisible.Essayons de préserver l’espace de la recherche, de la rêverie, du détour.Creusons la complexité des hommes, cherchons à comprendre, sans juger, enfermer, ni mépriser.L’important est cette capacité à préserver en chaque chose l’espace de jeu qui lui permet de devenir le théâtre. »<br/><br/>
                Julien Rocha & Cédric Veschambre
                </p>
            </div>
            <img src={julienRocha} alt="photo de Julien Rocha par Julien Bruhat" className='compagnieSection_image'/>
            <ul className='compagnieSection_biosList' >
                <li className='compagnieSection_biosList_bioItem'>
                    <BioCard biography={bioRocha} setDisplayBioAside={setDisplayBioAside} setBioAside={setBioAside}/>
                </li>
                <li className='compagnieSection_biosList_bioItem'>
                    <BioCard biography={bioVeschambre} setDisplayBioAside={setDisplayBioAside} setBioAside={setBioAside}/>
                </li>
            </ul>
            <img src={cedricVeschambre} alt="photo de Cédric Veschambre par Julien Bruhat" className='compagnieSection_image'/>
            <div className={displayBioAside=== true ? 'compagnieSection_bioSheetContainer compagnieSection_bioSheetContainer--displayOn' : 'compagnieSection_bioSheetContainer compagnieSection_bioSheetContainer--displayOff'}>
                <BioSheet biography={bioAside} closeBioAside={closeBioAside} className='compagnieSection_bioSheetContainer'/>
            </div>
            <Collapse title="COLLABORATIONS" style='white'>
                <div className='compagnieSection_teamCollapse'>
                    <Equipe className='compagnieSection_teamCollapse'/>
                </div>
            </Collapse>
            <div className='compagnieSection_AA'>
                <h3 className='compagnieSection_AA_title'>Artiste Associé</h3>
                <p className='compagnieSection_AA_text'> La compagnie Le Souffleur de Verre a vu le jour en 2003 en Auvergne et est implantée à Clermont-Ferrand. Ces projets artistiques et ces envies de travail sur les territoires que compte la région Auvergne-Rhône-Alpes l’ont amenée à s’impliquer dans le Puy-de-Dôme (8 ans de résidence dite « association », menant à la fois créations et projets de médiation artistique, en vue du développement des publics à Cournon d’Auvergne), en Haute-Loire (3 ans de résidence de territoire avec la municipalité et les établissements scolaires et associatifs de Monistrol-sur-Loire), et dans la Loire (3 ans en tant que compagnie associée au projet d’Arnaud Meunier, directeur de La Comédie de Saint-Étienne – Centre Dramatique National et 5 ans comme membres de l’ensemble artistique).<br/>
                    Elle a été Artiste Associée au Caméléon, scène labellisée pour l’émergence et la création en Auvergne-Rhône-Alpes pour 4 ans (2020-2023).
                </p>
            </div>
            <div className='compagnieSection_partners'>
                <p className='compagnieSection_partners_text'>La Compagnie Le Souffleur de Verre est conventionnée <br/>
                avec le Ministère de la Culture/Drac Auvergne-Rhône-Alpes, <br/>
                la Région Auvergne-Rhône-Alpes, et la Ville de Clermont-Ferrand.
                </p>
                <ul className='compagnieSection_partners_list'>
                    {partners.map((partner)=> (
                        <li className='compagnieSection_partners_list_item'>
                            <a href={partner.website} target='_blank' rel='noreferrer'>
                                <img className={`compagnieSection_partners_list_item_${partner.class}`} src={partner.logo} alt={`logo ${partner.logo}`}/>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <Footer/>
        </section>
    )
}

export default Compagnie