import './OneSpectacle.scss'
// import { Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { API_URL } from '../../utils/constants'
// import { Context } from '../../utils/Context'
import { useParams } from 'react-router-dom'
import DOMPurify from 'dompurify';

 
function OneSpectacle() {

    const [project, setProject] = useState([]);
    // const [sortedProjects, setSortedProjects] = useState([]);
    const { id } = useParams();

    const cleanedDescription = DOMPurify.sanitize(project.description);
    
    useEffect(() => {
        fetch(`${API_URL}/api/projects/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setProject(data);
                console.log('Projet chargé');
            })
            .catch((error) => console.log(error.message));
    }, []);

    return  (      
        <section className='oneSpectacle'>
            <div className='oneSpectacle_mainDatas'>
                <p className='oneSpectacle_mainDatas_title'>{project.title}</p>
                <p className='oneSpectacle_mainDatas_subtitle'>{project.subtitle}</p>
                <p className='oneSpectacle_mainDatas_description' dangerouslySetInnerHTML={{__html:cleanedDescription}}></p>
                <p className='oneSpectacle_mainDatas_duration'>durée {project.duration}</p>
                <p className='oneSpectacle_mainDatas_creationDate'> date de création {project.creationDate}</p>
                <div className='oneSpectacle_mainDatas_teamList'>
                    <ul className='oneSpectacle_mainDatas_teamList_artistsList'>
                        {project.artistsList?.map((artist) => (
                            <li key={artist._id} className='oneSpectacle_mainDatas_teamList_artistsList_item'>
                                <p className='oneSpectacle_mainDatas_teamList_artistsList_item_names'> 
                                <span className='oneSpectacle_mainDatas_teamList_artistsList_item_function'>{artist.artistFunction}</span>
                                {artist.artistName}</p>
                            </li>
                        ))}
                    </ul>
                    <ul className='oneSpectacle_mainDatas_teamList_prodList'>
                        {project.productionList?.map((prod) => (
                            <li key={prod._id} className='oneSpectacle_mainDatas_teamList_prodList_item'> 
                                <p className='oneSpectacle_mainDatas_teamList_prodList_item_names'>
                                <span className='oneSpectacle_mainDatas_teamList_prodList_item_function'>{prod.productionFunction}</span> 
                                {prod.productionName}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <ul className={`oneSpectacle_imagesGrid oneSpectacle_imagesGrid_${project.images?.length}`}>
                {project.images?.map((image, index) => (
                    <li className={`oneSpectacle_imagesGrid_item oneSpectacle_imagesGrid_${project.images?.length}_item_${index}`}>
                        <img key={image._id} alt={project.title + image._id} src={image.imageUrl}/>
                    </li>
                ))}
            </ul>
            <div className='oneSpectacle_residenciesDatasContainer'>
                <div className='oneSpectacle_residenciesList'>
                    <div className='oneSpectacle_residenciesList_labos'>
                        <p className='oneSpectacle_residenciesList_labos_title'>LABORATOIRES</p>
                        <ul className='oneSpectacle_residenciesList_labos_list'>
                            {project.residenciesList
                            ?.filter((residency) => residency.residencyType === 'laboratoire')
                            .map((residency) => (
                                <li key={residency.id} className='oneSpectacle_residenciesList_labos_list_item'>
                                    <p className='oneSpectacle_residenciesList_labos_list_item_text'>
                                        <span className='oneSpectacle_residenciesList_labos_list_item_dates'>du {residency.startDates} au {residency.endDates}</span>
                                        <a href={`${residency.placeLink}`} target='_blank' rel='noreferrer' className='oneSpectacle_residenciesList_labos_list_item_link'>
                                            {residency.placeName}
                                        </a>{`/ ${residency.city ? residency.city : ""}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='oneSpectacle_residenciesList_writing'>
                        <p className='oneSpectacle_residenciesList_writing_title'>RÉSIDENCES D'ÉCRITURE</p>
                        <ul className='oneSpectacle_residenciesList_writing_list'>
                            {project.residenciesList
                            ?.filter((residency) => residency.residencyType === 'écriture')
                            .map((residency) => (
                                <li key={residency.id} className='oneSpectacle_residenciesList_writing_list_item'>
                                    <p className='oneSpectacle_residenciesList_writing_list_item_text'>
                                        <span className='oneSpectacle_residenciesList_writing_list_item_dates'>du {residency.startDates} au {residency.endDates}</span>
                                        <a href={`${residency.placeLink}`} target='_blank' rel='noreferrer' className='oneSpectacle_residenciesList_writing_list_item_link'>
                                            {residency.placeName}
                                        </a>{`/ ${residency.city ? residency.city : ""}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='oneSpectacle_residenciesList_creation'>
                        <p className='oneSpectacle_residenciesList_creation_title'>RÉSIDENCES DE CRÉATION</p>
                        <ul className='oneSpectacle_residenciesList_creation_list'>
                            {project.residenciesList
                            ?.filter((residency) => residency.residencyType === 'création')
                            .map((residency) => (
                                <li key={residency.id} className='oneSpectacle_residenciesList_creation_list_item'>
                                    <p className='oneSpectacle_residenciesList_creation_list_item_text'>
                                        <span className='oneSpectacle_residenciesList_creation_list_item_dates'>du {residency.startDates} au {residency.endDates}</span>
                                        <a href={`${residency.placeLink}`} target='_blank' rel='noreferrer' className='oneSpectacle_residenciesList_creation_list_item_link'>
                                            {residency.placeName}
                                        </a>
                                        {`/ ${residency.city ? residency.city : ""}`}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className='oneSpectacle_residenciesList'>
                    <div className='oneSpectacle_residenciesList_rehearsals'>
                        <p className='oneSpectacle_residenciesList_rehearsals_title'>RÉPÉTITIONS</p>
                        <ul className='oneSpectacle_residenciesList_rehearsals_list'>
                            {project.residenciesList
                            ?.filter((residency) => residency.residencyType === 'répétitions')
                            .map((residency) => (
                                <li key={residency.id} className='oneSpectacle_residenciesList_rehearsals_list_item'>
                                    <p className='oneSpectacle_residenciesList_rehearsals_list_item_text'>
                                        <span className='oneSpectacle_residenciesList_rehearsals_list_item_dates'>du {residency.startDates} au {residency.endDates}</span>
                                        <a href={residency.placeLink?residency.placeLink:""} target='_blank' rel='noreferrer' className='oneSpectacle_residenciesList_rehearsals_list_item_link'>
                                            {residency.placeName}
                                        </a>
                                   {`/ ${residency.city ? residency.city : ""}`}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='oneSpectacle_residenciesList_firstShows'>
                        <p className='oneSpectacle_residenciesList_firstShows_title'>PREMIÈRES REPRÉSENTATIONS</p>
                        <ul className='oneSpectacle_residenciesList_firstShows_list'>
                            {project.showsList?.map((show) => (
                                <li key={show.id} className='oneSpectacle_residenciesList_firstShows_list_item'>
                                    <p className='oneSpectacle_residenciesList_firstShows_list_item_text'>
                                        <span className='oneSpectacle_residenciesList_firstShows_list_item_dates'>{show.dates}</span>
                                        <a href={show.placeLink?show.placeLink:""} target='_blank' rel='noreferrer' className='oneSpectacle_residenciesList_firstShows_list_item_link'>
                                            {show.placeName}
                                        </a>
                                    {`/ ${show.city ? show.city : ""}`}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div>
                    {project.videoList?.map((video) => (
                        <a key={video._id} href={video.videoLink?video.videoLink:""} target='_blank' rel='noreferrer'>{video.videoName}</a>
                    ))}
                    {project.pdfList?.map((pdf) => (
                        <a key={pdf._id} href={pdf.pdfLink?pdf.pdfLink:""} target='_blank' rel='noreferrer'>{pdf.pdfName}</a>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default OneSpectacle