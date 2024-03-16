import './OneSpectacle.scss'
import React, { useState, useEffect, useContext } from 'react'
import { API_URL } from '../../utils/constants'
import { useParams } from 'react-router-dom'
import { Context } from '../../utils/Context'
import IsALink from '../../components/IsALink/IsALink'
import DOMPurify from 'dompurify'
import FullPeriodDate from '../../components/FullPeriodDate/FullPeriodDate'
import FullPonctualDates from '../../components/FullPonctualDates/FullPonctualDates'
import FullUniqueDate from '../../components/FullUniqueDate/FullUniqueDate'

 
function OneSpectacle() {

    const [project, setProject] = useState([]);
    const { id } = useParams();
    const { productionFunctions, residencyTypes } = useContext(Context);
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
                <FullUniqueDate creationDate={project.creationDate}/>
                <p className='oneSpectacle_mainDatas_duration'> durée {project.duration}</p>
                <p className='oneSpectacle_mainDatas_description' dangerouslySetInnerHTML={{__html:cleanedDescription}}></p>
                <div className='oneSpectacle_mainDatas_paragraphs'>
                    {project.paragraphList?.map((paragraph) => (
                        <div className='oneSpectacle_mainDatas_paragraphs_paragraphContainer'>
                            {paragraph.paragraphTitle &&
                                <p className='oneSpectacle_mainDatas_paragraphs_paragraphContainer_paragraphTitle' >{paragraph.paragraphTitle}</p>
                            }
                            <p className='oneSpectacle_mainDatas_paragraphs_paragraphContainer_paragraphText' dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(paragraph.paragraphText)}}></p>
                        </div>
                    ))}
                </div>
                <div className='oneSpectacle_mainDatas_mediaLinks'>
                    <div className='oneSpectacle_mainDatas_mediaLinks_videosContainer'>
                        {project.videoList?.map((video) => (
                            <a className='oneSpectacle_mainDatas_mediaLinks_videosContainer_video' key={video._id} href={video.videoLink?video.videoLink:""} target='_blank' rel='noreferrer'>{video.videoName}</a>
                        ))}
                    </div>
                    <div className='oneSpectacle_mainDatas_mediaLinks_pdfsContainer'>
                        {project.pdfList?.map((pdf) => (
                            <a className='oneSpectacle_mainDatas_mediaLinks_pdfsContainer_pdf' key={pdf._id} href={pdf.pdfLink?pdf.pdfLink:""} target='_blank' rel='noreferrer'>{pdf.pdfName}</a>
                        ))}
                    </div>
                </div>
                <div className='oneSpectacle_mainDatas_teamList'>
                    <ul className='oneSpectacle_mainDatas_teamList_artistsList'>
                        {project.artistsList?.map((artist) => (
                            <li key={artist._id} className='oneSpectacle_mainDatas_teamList_artistsList_item'>
                                <p className='oneSpectacle_mainDatas_teamList_artistsList_item_function'> {artist.artistFunction} </p>
                                <p className='oneSpectacle_mainDatas_teamList_artistsList_item_names'>{artist.artistName} </p>
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
            <div className='oneSpectacle_mainDatas_teamList_prodListContainer'>
                {productionFunctions.map((productionFunction) => (
                    project.productionList?.some(productionList => productionList.productionFunction===productionFunction) && (
                    <div className='oneSpectacle_mainDatas_teamList_prodListContainer_prodTypeContainer'>
                        <p className='oneSpectacle_mainDatas_teamList_prodListContainer_prodTypeContainer_prodType'>{productionFunction}</p>
                        <ul className='oneSpectacle_mainDatas_teamList_prodListContainer_prodTypeContainer_list'>
                            {project.productionList
                            ?.filter((prod) => prod.productionFunction === productionFunction) 
                            .map((prod) => (
                                <li key={prod.id} className='oneSpectacle_mainDatas_teamList_prodListContainer_prodTypeContainer_list_item'> 
                                    <p className='oneSpectacle_mainDatas_teamList_prodListContainer_prodTypeContainer_list_item_name'>{prod.productionName}</p>
                                </li>
                            ))}
                        </ul>
                        </div>
                    )
                ))}
            </div>
            <div className='oneSpectacle_residenciesDatasContainer'>
                <div className='oneSpectacle_residenciesList'>
                    {residencyTypes?.map((residencyType) => (
                    project.residenciesList?.some(residency => residency.residencyType === residencyType) && (
                        <div className='oneSpectacle_residenciesList_labos' key={residencyType}>
                            <p className='oneSpectacle_residenciesList_labos_title'>{residencyType}</p>
                            <ul className='oneSpectacle_residenciesList_labos_list'>
                                {project.residenciesList
                                ?.filter(residency => residency.residencyType === residencyType)
                                .map(residency => (
                                    <li key={residency.id} className='oneSpectacle_residenciesList_labos_list_item'>
                                        <p className='oneSpectacle_residenciesList_labos_list_item_text'>
                                            {residency.startDates && residency.endDates && (
                                                <FullPeriodDate startISODate={residency.startDates} endISODate={residency.endDates}/>
                                            )}
                                            <IsALink link={residency.placeLink} name={residency.placeName}/>
                                            {`/ ${residency.city ? residency.city : ""}`}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                    ))}
                    <div className='oneSpectacle_residenciesList_firstShows'>
                        <p className='oneSpectacle_residenciesList_firstShows_title'>PREMIÈRES REPRÉSENTATIONS</p>
                        <ul className='oneSpectacle_residenciesList_firstShows_list'>
                            {project.showsList?.map((show) => (
                                <li key={show.id} className='oneSpectacle_residenciesList_firstShows_list_item'>
                                    <p className='oneSpectacle_residenciesList_firstShows_list_item_text'>
                                    <FullPonctualDates datesArray={show.dates}/>
                                    <IsALink link={show.placeLink} name={show.placeName}/>   
                                    {`/ ${show.city ? show.city : ""}`}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OneSpectacle