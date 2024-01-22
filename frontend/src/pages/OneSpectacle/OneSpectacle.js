import './OneSpectacle.scss'
// import { Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { API_URL } from '../../utils/constants'
// import { Context } from '../../utils/Context'
import { useParams } from 'react-router-dom'

 
function OneSpectacle() {

    const [project, setProject] = useState([]);
    // const [sortedProjects, setSortedProjects] = useState([]);
    const { id } = useParams();
    
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
        <section className='spectacles'>
            <div>
                <p>{project.title}</p>
                <p>{project.description}</p>
                <p>durée {project.duration}</p>
                <p>date de création {project.creationDate}</p>
                <div>
                    <ul>
                        {project.artistsList?.map((artist) => (
                            <p key={artist._id}>{artist.artistFunction} {artist.artistName}</p>
                        ))}
                    </ul>
                    <ul>
                        {project.productionList?.map((prod) => (
                            <p key={prod._id}>{prod.productionFunction} {prod.productionName}</p>
                        ))}
                    </ul>
                </div>
            </div>
            <ul>
                {project.images?.map((image) => (
                    <li>
                        <img key={image._id} alt={project.title + image._id} src={image.imageUrl}/>
                    </li>
                ))}
            </ul>
            <div>
                <div>
                    <p>LABORATOIRES</p>
                    <ul>
                        {project.residenciesList
                        ?.filter((residency) => residency.residencyType === 'laboratoire')
                        .map((residency) => (
                            <li key={residency.id}>
                            <p>{residency.dates}</p>
                            <a href={`${residency.placeLink}`} target='_blank' rel='noreferrer'>
                                {residency.placeName}
                            </a>
                            <p>{`/ ${residency.city ? residency.city : ""}`}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p>RÉSIDENCES D'ÉCRITURE</p>
                    <ul>
                        {project.residenciesList
                        ?.filter((residency) => residency.residencyType === 'écriture')
                        .map((residency) => (
                            <li key={residency.id}>
                            <p>{residency.dates}</p>
                            <a href={`${residency.placeLink}`} target='_blank' rel='noreferrer'>
                                {residency.placeName}
                            </a>
                            <p>{`/ ${residency.city ? residency.city : ""}`}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p>RÉSIDENCES DE CRÉATION</p>
                    <ul>
                        {project.residenciesList
                        ?.filter((residency) => residency.residencyType === 'création')
                        .map((residency) => (
                            <li key={residency.id}>
                            <p>{residency.dates}</p>
                            <a href={`${residency.placeLink}`} target='_blank' rel='noreferrer'>
                                {residency.placeName}
                            </a>
                            <p>{`/ ${residency.city ? residency.city : ""}`}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div>
                <div>
                    <p>RÉPÉTITIONS</p>
                    <ul>
                        {project.residenciesList
                        ?.filter((residency) => residency.residencyType === 'répétitions')
                        .map((residency) => (
                            <li key={residency.id}>
                                <p>{residency.dates}</p>
                                <a href={residency.placeLink?residency.placeLink:""} target='_blank' rel='noreferrer'>
                                    {residency.placeName}
                                </a>
                                <p>{`/ ${residency.city ? residency.city : ""}`}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p>PREMIÈRES REPRÉSENTATIONS</p>
                    <ul>
                        {project.showsList?.map((show) => (
                            <li>
                                <p>{show.dates}</p>
                                <a href={show.placeLink?show.placeLink:""} target='_blank' rel='noreferrer'>
                                    {show.placeName}
                                </a>
                                <p>{`/ ${show.city ? show.city : ""}`}</p>
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
        </section>
    )
}

export default OneSpectacle