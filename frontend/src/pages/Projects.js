import React from 'react';
import styles from './Projects.module.css';

const Projects = () => {
  return (
    <div className={styles.projectsContainer}>
      <div className={styles.comingSoon}>
        <h1>Projects</h1>
        <p>Coming Soon</p>
      </div>
    </div>
  );
};

export default Projects;