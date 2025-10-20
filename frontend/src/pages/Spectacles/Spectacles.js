import './Spectacles.scss'
import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext, useMemo } from 'react'
import { Context } from '../../utils/Context'
import { motion, AnimatePresence } from "framer-motion";

function Spectacles() {
  const { projects, projectTypes, projectStates, fullCurrentDate, isAuthenticated } = useContext(Context);

  const visibleProjects = useMemo(
    () => projects.filter((project) => (project.projectState !== "*non visible*") && (project.projectState !== "médiation")),
    [projects]
  );

  const [displayedProjects, setDisplayedProjects] = useState(visibleProjects);
  const [sortedProjects, setSortedProjects] = useState(displayedProjects);
  const [chronologicalSortedProjects, setChronologicalSortedProjects] = useState([]);
  const [sortedProjectsByState, setSortedProjectsByState] = useState(displayedProjects);
  const [sortedProjectsByType, setSortedProjectsByType] = useState(displayedProjects);
  const [displayStateFilter, setDisplayStateFilter] = useState('tous');
  const [displayTypeFilter, setDisplayTypeFilter] = useState('tous');

  const listVariants = {
    hidden: {}, // pas d'opacité ici pour éviter les doubles anims
    visible: {
      transition: { staggerChildren: 0.15, when: "beforeChildren" }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
    exit: { opacity: 0, y: -40, transition: { duration: 0.28 } }
  };

  // Reset animation quand les filtres changent
  const activeFiltersKey = useMemo(
    () => JSON.stringify({ displayStateFilter, displayTypeFilter }),
    [displayStateFilter, displayTypeFilter]
  );

  useEffect(() => {
    if (isAuthenticated === true) {
      setDisplayedProjects(projects);
    } else {
      setDisplayedProjects(visibleProjects);
    }
  }, [isAuthenticated, projects, visibleProjects]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSortedProjects(displayedProjects);
  }, [displayedProjects]);

  useEffect(() => {
    const updatedSortedProjects = displayedProjects.filter(
      (project) => (sortedProjectsByState.includes(project)) && (sortedProjectsByType.includes(project))
    );
    setSortedProjects(updatedSortedProjects);
  }, [sortedProjectsByState, sortedProjectsByType, displayedProjects]);

  useEffect(() => {
    // IMPORTANT: ne pas muter le state -> on clone avant de trier
    const sorted = [...sortedProjects].sort(
      (a, b) => new Date(b.creationDate || 0) - new Date(a.creationDate || 0)
    );
    setChronologicalSortedProjects(sorted);
  }, [sortedProjects]);

  function handleFilterProjectState(state) {
    const newSortedProjectsByState = displayedProjects.filter((project) => (project.projectState === state));
    setSortedProjectsByState(newSortedProjectsByState);
    setDisplayStateFilter(state);
    if (!newSortedProjectsByState.some((project) => project.projectType === displayTypeFilter)) {
      setDisplayTypeFilter('tous');
      displayAllProjectsTypes();
    }
  }

  function handleFilterProjectType(type) {
    const newSortedProjectsByType = displayedProjects.filter((project) => (project.projectType === type));
    setSortedProjectsByType(newSortedProjectsByType);
    setDisplayTypeFilter(type);
  }

  function displayAllProjectsStates() {
    setSortedProjectsByState(displayedProjects);
    setDisplayStateFilter("tous");
  }

  function displayAllProjectsTypes() {
    setSortedProjectsByType(displayedProjects);
    setDisplayTypeFilter("tous");
  }

  return (
    <section className='spectacles'>
      <div className='spectacles_filtersHandler'>
        <ul className='spectacles_filtersHandler_filtersStateContainer'>
          <li
            className={
              displayStateFilter === 'tous'
                ? 'spectacles_filtersHandler_filtersStateContainer_item spectacles_filtersHandler_filtersStateContainer_item--displayOn'
                : 'spectacles_filtersHandler_filtersStateContainer_item'
            }
          >
            <button type='button' onClick={() => displayAllProjectsStates()}>
              TOUS LES SPECTACLES
            </button>
          </li>

          {projectStates
            ?.filter(ps => projects.some(p => p.projectState === ps) && ps !== "*non visible*" && ps !== "médiation")
            .map((projectState) => (
              <li
                key={projectState}
                className={
                  displayStateFilter === projectState
                    ? 'spectacles_filtersHandler_filtersStateContainer_item spectacles_filtersHandler_filtersStateContainer_item--displayOn'
                    : 'spectacles_filtersHandler_filtersStateContainer_item'
                }
              >
                <button type='button' onClick={() => handleFilterProjectState(projectState)}>
                  {projectState}
                </button>
              </li>
            ))}

          {isAuthenticated === true && (
            <li
              className={
                displayStateFilter === '*non visible*'
                  ? 'spectacles_filtersHandler_filtersStateContainer_item spectacles_filtersHandler_filtersStateContainer_item--displayOn'
                  : 'spectacles_filtersHandler_filtersStateContainer_item'
              }
            >
              <button type='button' className='redColor' onClick={() => handleFilterProjectState('*non visible*')}>
                ** ADMIN ONLY **
              </button>
            </li>
          )}
        </ul>

        <ul className='spectacles_filtersHandler_filtersTypeContainer'>
          <li
            className={
              displayTypeFilter === 'tous'
                ? 'spectacles_filtersHandler_filtersTypeContainer_item spectacles_filtersHandler_filtersTypeContainer_item--displayOn'
                : 'spectacles_filtersHandler_filtersTypeContainer_item'
            }
          >
            <button type='button' onClick={() => displayAllProjectsTypes()}>
              TOUS LES PUBLICS
            </button>
          </li>

          {displayStateFilter !== 'tous'
            ? projectTypes
              ?.filter(pt => projects.some(p => p.projectType === pt && p.projectState === displayStateFilter))
              .map((projectType) => (
                <li
                  key={projectType}
                  className={
                    displayTypeFilter === projectType
                      ? 'spectacles_filtersHandler_filtersTypeContainer_item spectacles_filtersHandler_filtersTypeContainer_item--displayOn'
                      : 'spectacles_filtersHandler_filtersTypeContainer_item'
                  }
                >
                  <button type='button' onClick={() => handleFilterProjectType(projectType)}>
                    {projectType}
                  </button>
                </li>
              ))
            : projectTypes.map((projectType) => (
              <li
                key={projectType}
                className={
                  displayTypeFilter === projectType
                    ? 'spectacles_filtersHandler_filtersTypeContainer_item spectacles_filtersHandler_filtersTypeContainer_item--displayOn'
                    : 'spectacles_filtersHandler_filtersTypeContainer_item'
                }
              >
                <button type='button' onClick={() => handleFilterProjectType(projectType)}>
                  {projectType}
                </button>
              </li>
            ))
          }
        </ul>
      </div>

      {chronologicalSortedProjects.length === 0 && (
        <p className='spectacles_filtersHandler_errorText'>...</p>
      )}

      {/* Reset global de l'anim quand les filtres changent */}
      <motion.ul
        key={activeFiltersKey}
        className="spectacles_projectsList"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {chronologicalSortedProjects?.map((project) => (
            <motion.li
              key={project._id}
              className="spectacles_projectsList_projectItem"
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
            >
              <Link to={`/spectacles/${project._id}`}>
                <img
                  src={project.images[project.mainImageIndex]?.imageUrl}
                  alt={project.title}
                  className="spectacles_projectsList_projectItem_img"
                />
                <div className="spectacles_projectsList_projectItem_mainDatas">
                  <h3 className="spectacles_projectsList_projectItem_mainDatas_title">{project.title}</h3>
                  <p className="spectacles_projectsList_projectItem_mainDatas_subtitle">{project.subtitle ? project.subtitle : ""}</p>
                  <p className="spectacles_projectsList_projectItem_mainDatas_date">
                    {project.creationDate ? `${project.creationDate.split("-")[0]}` : ""}
                  </p>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  )
}

export default Spectacles
