import './OneSpectacle.scss'
import React, { useState, useEffect, useContext, useRef } from 'react'
import { API_URL } from '../../utils/constants'
import { useParams } from 'react-router-dom'
import { Context } from '../../utils/Context'
import IsALink from '../../components/IsALink/IsALink'
import DOMPurify from 'dompurify'
import FullPeriodDate from '../../components/FullPeriodDate/FullPeriodDate'
import FullPonctualDates from '../../components/FullPonctualDates/FullPonctualDates'
import FullUniqueDate from '../../components/FullUniqueDate/FullUniqueDate'
import Collapse from '../../components/Collapse/Collapse'
import ImagesGallery from '../../components/ImagesGallery/ImagesGallery'
import ParallaxImage from '../../components/ParallaxImage/ParallaxImage'

 
function OneSpectacle() {

    const [project, setProject] = useState([]);
    const { id } = useParams();
    const { productionFunctions, residencyTypes, isAuthenticated } = useContext(Context);
    const cleanedDescription = DOMPurify.sanitize(project.description);
    
    useEffect(() => {
        fetch(`${API_URL}/api/projects/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setProject(data);
            })
            .catch((error) => console.log(error.message));
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    },[]);

    return  (      
        <section className='oneSpectacle'>
            {(project.projectState !== "*non visible*" ||  (project.projectState==="*non visible*" && isAuthenticated===true)) &&
            <div>
                <div className='oneSpectacle_mainDatas'>
                    <h3 className='oneSpectacle_mainDatas_title'>{project.title}</h3>
                    {project.subtitle &&
                    <p className='oneSpectacle_mainDatas_subtitle'>{project.subtitle}</p>
                    }
                    {project.moreInfos &&
                    <p className='oneSpectacle_mainDatas_moreInfos'>{project.moreInfos}</p>
                    }
                    {project.creationDate &&
                    <FullUniqueDate creationDate={project.creationDate}/>
                    }
                    {project.duration && 
                    <p className='oneSpectacle_mainDatas_duration'> durée {project.duration}</p>
                    }
                    {project.description &&        
                    <p className='oneSpectacle_mainDatas_description' dangerouslySetInnerHTML={{__html:cleanedDescription}}></p>
                    }
                    {project.images && project.images?.length >= 1 &&
                        <ParallaxImage image={project.images[0]}/>
                    }
                    {project.artistsList && project.artistsList.length !== 0 &&
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
                    }   
                    {project.paragraphList && project.paragraphList.length !== 0 &&
                    <div className='oneSpectacle_mainDatas_paragraphs'>
                        {project.paragraphList?.map((paragraph) => (
                            <div className='oneSpectacle_mainDatas_paragraphs_paragraphContainer'>
                                {paragraph.paragraphTitle &&
                                    <p className='oneSpectacle_mainDatas_paragraphs_paragraphContainer_paragraphTitle' >{paragraph.paragraphTitle}</p>
                                }
                                <p className='oneSpectacle_mainDatas_paragraphs_paragraphContainer_paragraphText' dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(paragraph.paragraphText)}}></p>
                            </div>
                        ))}
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
                    </div>
                    }       
                </div>
                { project.images && project.images?.length > 1 && 
                    <ImagesGallery project={project}/>
                }
                {project.showsList && project.showsList.length !== 0 &&
                <div className='oneSpectacle_mainDatas_residenciesAndShows'>
                    <div className='oneSpectacle_mainDatas_residenciesAndShows_showsList'> 
                        <p className='oneSpectacle_mainDatas_residenciesAndShows_showsList_title'>DIFFUSION</p>
                        <ul className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list'>
                            {project.showsList?.map((show) => (
                                <li key={show.id} className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item'>
                                    <FullPonctualDates datesArray={show.dates} className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item'/>
                                    {}
                                    <p className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item_places'>
                                        <IsALink className="oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item_places" link={show.placeLink} name={show.placeName}/>   
                                        {`/ ${show.city ? show.city : ""}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                }
                {project.productionList && project.productionList.length !== 0 &&
                <Collapse title="PRODUCTION" style='light'>
                    <div className='oneSpectacle_mainDatas_prodList'>
                        {productionFunctions.map((productionFunction) => (
                            project.productionList?.some(productionList => productionList.productionFunction===productionFunction) && (
                            <div className='oneSpectacle_mainDatas_prodList_prodTypeContainer'>
                                <p className='oneSpectacle_mainDatas_prodList_prodTypeContainer_prodType'>{productionFunction}</p>
                                <ul className='oneSpectacle_mainDatas_prodList_prodTypeContainer_list'>
                                    {project.productionList
                                    ?.filter((prod) => prod.productionFunction === productionFunction) 
                                    .map((prod) => (
                                        <li key={prod.id} className='oneSpectacle_mainDatas_prodList_prodTypeContainer_list_item'> 
                                            <p className='oneSpectacle_mainDatas_prodList_prodTypeContainer_list_item_name'>{prod.productionName}</p>
                                        </li>
                                    ))}
                                </ul>
                                </div>
                            )
                        ))}
                    </div>
                </Collapse>
                }
                {project.residenciesList && project.residenciesList.length !== 0 &&
                <Collapse title="RÉSIDENCES" style='light'>
                    <div className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList'>
                            {residencyTypes?.map((residencyType) => (
                            project.residenciesList?.some(residency => residency.residencyType === residencyType) && (
                                <div className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer' key={residencyType}>
                                    <p className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_title'>{residencyType}</p>
                                    <ul className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list'>
                                        {project.residenciesList
                                        ?.filter(residency => residency.residencyType === residencyType)
                                        .map(residency => (
                                            <li key={residency.id} className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item'>
                                                <p className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text'>
                                                    {residency.startDates && residency.endDates && (
                                                    <FullPeriodDate startISODate={residency.startDates} endISODate={residency.endDates} className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text_date'/>
                                                    )}
                                                    <IsALink className="oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text" link={residency.placeLink} name={residency.placeName}/>
                                                    {`/ ${residency.city ? residency.city : ""}`}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        ))}
                    </div>
                </Collapse>
                }
                {project.pressList && project.pressList.length !== 0 &&
                <Collapse title="PRESSE" style='light'>
                    <div className='oneSpectacle_mainDatas_press'>
                        <div className='oneSpectacle_mainDatas_press_pressList'> 
                            <div className='oneSpectacle_mainDatas_press_pressList_listContainer'>
                                <ul className='oneSpectacle_mainDatas_press_pressList_list'>
                                    {project.pressList?.map((press) => (
                                        <li key={press.id} className='oneSpectacle_mainDatas_press_pressList_list_item'>
                                            <p className='oneSpectacle_mainDatas_press_pressList_list_item_mediaName'>
                                                {press.mediaName}
                                            </p>
                                            <p className='oneSpectacle_mainDatas_press_pressList_list_item_quote' dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(press.quote)}}>
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Collapse>
                }
            </div>
            }
            {project.projectState === "*non visible*" && isAuthenticated===false &&
                <p className='oneSpectacle_invisible'>Ce projet n'est pas accessible pour l'instant...</p>
            }
        </section>
    )
}

export default OneSpectacle