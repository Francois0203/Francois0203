import React, { useState } from 'react';
import { FaReact, FaGithub, FaNpm, FaRocket, FaCogs, FaPalette, FaCode, FaPython, FaDocker } from 'react-icons/fa';
import { MdAutoAwesome, MdCached, MdRadio, MdScience, MdSpeed, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { AiOutlineDeploymentUnit } from 'react-icons/ai';
import { SiNumpy, SiPytest } from 'react-icons/si';

/* Data */
import projectsData from '../../data/projects.json';

/* Styling */
import styles from './Projects.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * PROJECTS PAGE
 * ============================================================================
 * Displays portfolio projects in compact, expandable cards
 * Features summary view with "Read More" to expand full details
 * ============================================================================
 */

// ========================================
// ICON MAP
// ========================================
const IconMap = {
  FaReact,
  FaCode,
  FaPalette,
  FaCogs,
  AiOutlineDeploymentUnit,
  FaNpm,
  FaGithub,
  FaPython,
  SiNumpy,
  FaDocker,
  SiPytest,
  MdRadio,
  MdScience,
  MdAutoAwesome,
  MdCached,
  FaRocket,
  MdSpeed
};

/* ============================================================================
 * PROJECT CARD COMPONENT
 * ============================================================================
 */
const ProjectCard = React.memo(({ project, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className={`${styles.projectCard} ${isExpanded ? styles.expanded : ''}`}>
      {/* Card Header - Always Visible */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleSection}>
            <h2 className={styles.projectTitle}>{project.title}</h2>
            <p className={styles.projectSubtitle}>{project.subtitle}</p>
          </div>
          {project.links && project.links.length > 0 && (
            <div className={styles.projectLinks}>
              {project.links.map((link, idx) => {
                const LinkIcon = IconMap[link.icon];
                return (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectLink}
                    title={link.label}
                  >
                    {LinkIcon && <LinkIcon />}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary - Always Visible */}
        <p className={styles.summary}>
          {project.summary || project.description.slice(0, 150) + '...'}
        </p>

        {/* Tech Stack Preview */}
        <div className={styles.techPreview}>
          {project.techStack.slice(0, 5).map((tech, idx) => {
            const TechIcon = IconMap[tech.icon];
            return (
              <div key={idx} className={styles.techBadge} title={tech.name}>
                {TechIcon && <TechIcon style={{ color: tech.color }} />}
              </div>
            );
          })}
          {project.techStack.length > 5 && (
            <span className={styles.techMore}>+{project.techStack.length - 5}</span>
          )}
        </div>

        {/* Read More Button */}
        <button onClick={toggleExpanded} className={styles.readMoreButton}>
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <MdExpandLess />
            </>
          ) : (
            <>
              <span>Read More</span>
              <MdExpandMore />
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={styles.expandedContent}>
          {/* Full Description */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Overview</h3>
            <p className={styles.description}>{project.description}</p>
          </section>

          {/* Full Tech Stack */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Technology Stack</h3>
            <div className={styles.techGrid}>
              {project.techStack.map((tech, idx) => {
                const TechIcon = IconMap[tech.icon];
                return (
                  <div key={idx} className={styles.techItem}>
                    <div className={styles.techIcon} style={{ color: tech.color }}>
                      {TechIcon && <TechIcon />}
                    </div>
                    <span className={styles.techName}>{tech.name}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Key Features</h3>
              <div className={styles.featuresGrid}>
                {project.features.map((feature, idx) => {
                  const FeatureIcon = IconMap[feature.icon];
                  return (
                    <div key={idx} className={styles.featureCard}>
                      <div className={styles.featureHeader}>
                        {FeatureIcon && (
                          <div className={styles.featureIcon}>
                            <FeatureIcon />
                          </div>
                        )}
                        <h4 className={styles.featureTitle}>{feature.title}</h4>
                      </div>
                      <p className={styles.featureDescription}>{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Highlights</h3>
              <ul className={styles.highlightsList}>
                {project.highlights.map((highlight, idx) => (
                  <li key={idx} className={styles.highlightItem}>{highlight}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

/* ============================================================================
 * PROJECTS PAGE COMPONENT
 * ============================================================================
 */
const Projects = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Projects</h1>
        <p className={styles.pageSubtitle}>
          A collection of my work showcasing skills in full-stack development,
          data processing, and system architecture
        </p>
      </div>

      {/* Projects Grid */}
      <div className={styles.projectsGrid}>
        {projectsData.map((project, index) => (
          <ProjectCard key={index} project={project} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
