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
import Collapse from '../../components/Collapse/Collapse'

 
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
                {project.subtitle &&
                <p className='oneSpectacle_mainDatas_subtitle'>{project.subtitle}</p>
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
                {/* {project.images &&
                <div className={`oneSpectacle_imagesGrid_item oneSpectacle_imagesGrid_${project.images?.length}_item_0`}>
                    <img key={project.images[0]._id} alt={project.title + project.images[0]._id} src={project.images[0].imageUrl}/>
                </div>
                } */}
                {project.images && 
                <div
                    className={`oneSpectacle_imagesGrid_parallaxContainer oneSpectacle_imagesGrid_item oneSpectacle_imagesGrid_${project.images.length}_item_0`}
                >
                    <div 
                        className='oneSpectacle_imagesGrid_parallax'
                        style={{ backgroundImage: `url(${project.images[0].imageUrl})` }}>
                    </div>
                </div>
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
            {project.images?.length > 1 &&
            <ul className={`oneSpectacle_imagesGrid oneSpectacle_imagesGrid_${project.images?.length}`}>
                {project.images
                    ?.filter((image, index) => index > 0)
                    .map((image, index) => (
                    <li className={`oneSpectacle_imagesGrid_item oneSpectacle_imagesGrid_${project.images?.length}_item_${index + 1}`}>
                        <img key={image._id} alt={project.title + image._id} src={image.imageUrl}/>
                    </li>
                ))}
            </ul>
            }
            {project.showsList && project.showsList.length !== 0 &&
            <div className='oneSpectacle_mainDatas_residenciesAndShows'>
                <div>
                    <div className='oneSpectacle_mainDatas_residenciesAndShows_showsList'> 
                        <p className='oneSpectacle_mainDatas_residenciesAndShows_showsList_title'>DIFFUSION</p>
                        <div className='oneSpectacle_mainDatas_residenciesAndShows_showsList_listContainer'>
                            <ul className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list'>
                                {project.showsList?.map((show) => (
                                    <li key={show.id} className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item'>
                                        <p className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item_text'>
                                        <FullPonctualDates datesArray={show.dates} className='oneSpectacle_mainDatas_residenciesAndShows_showsList_list_item_text'/>
                                        <IsALink className="oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text" link={show.placeLink} name={show.placeName}/>   
                                        {`/ ${show.city ? show.city : ""}`}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
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
                                                <FullPeriodDate startISODate={residency.startDates} endISODate={residency.endDates}/>
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
        </section>
    )
}

export default OneSpectacle