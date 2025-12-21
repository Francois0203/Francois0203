import React, { useEffect, useRef, useState } from 'react';
import { FaReact, FaGithub, FaNpm, FaRocket, FaCogs, FaPalette, FaCode, FaPython, FaDocker } from 'react-icons/fa';
import { MdAutoAwesome, MdCached, MdRadio, MdScience, MdSpeed } from 'react-icons/md';
import { AiOutlineDeploymentUnit } from "react-icons/ai";
import { SiNumpy, SiPytest } from "react-icons/si";
import projectsData from '../data/projects.json';
import styles from './Projects.module.css';

const Projects = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Click ripple effect
  const lastRippleRef = useRef(0);
  const handleClick = (e) => {
    const now = Date.now();
    if (now - lastRippleRef.current < 80) return;
    lastRippleRef.current = now;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rippleEl = document.createElement('div');
    rippleEl.className = styles.ripple;
    rippleEl.style.left = `${x}px`;
    rippleEl.style.top = `${y}px`;
    containerRef.current.appendChild(rippleEl);
    const t = setTimeout(() => {
      rippleEl.remove();
      clearTimeout(t);
    }, 1200);
  };

  // Data imported from JSON; icons in JSON are string keys mapped to components below
  const projects = projectsData;

  // Map icon keys from JSON to actual components
  const IconMap = {
    FaReact,
    FaGithub,
    FaNpm,
    FaRocket,
    FaCogs,
    FaPalette,
    FaCode,
    FaPython,
    FaDocker,
    MdAutoAwesome,
    MdCached,
    MdRadio,
    MdScience,
    MdSpeed,
    AiOutlineDeploymentUnit,
    SiNumpy,
    SiPytest
  };

  // Track which project cards are expanded (default: all collapsed)
  const [expanded, setExpanded] = useState(() => projects.map(() => false));

  const toggleExpanded = (i) => {
    setExpanded(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  return (
    <div ref={containerRef} className={styles.projectsWrapper} onClick={handleClick}>
      <div className={styles.bgDecoration} />

      <div className={`${styles.projectsContainer} ${isVisible ? styles.visible : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>Featured Projects</h1>
          <p className={styles.subtitle}>Exploring Modern Web Technologies & Radio Astronomy</p>
        </div>

        {/* Project Cards */}
        {projects.map((project, projectIndex) => (
          <div key={projectIndex} className={`${styles.projectCard} ${expanded[projectIndex] ? '' : styles.collapsed}`}>
            <div className={styles.cardHeader}>
              <div className={styles.headerContent}>
                <button
                  className={styles.titleToggle}
                  onClick={(e) => { e.stopPropagation(); toggleExpanded(projectIndex); }}
                  aria-expanded={!!expanded[projectIndex]}
                  aria-label={expanded[projectIndex] ? 'Collapse project' : 'Expand project'}
                >
                  <div className={styles.titleText}>
                    <h2 className={styles.projectTitle}>{project.title}</h2>
                    <p className={styles.projectSubtitle}>{project.subtitle}</p>
                  </div>
                  <span className={styles.collapseToggleIcon}>▾</span>
                </button>
              </div>
              <div className={styles.projectLinks}>
                {project.links.map((link, index) => {
                  const LIcon = IconMap[link.icon];
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.projectLink}
                    >
                      {LIcon ? <LIcon /> : null}
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className={styles.cardBody}>
              {/* Description */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Overview</h3>
                <p className={styles.description}>{project.description}</p>
              </section>

              {/* Tech Stack */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Technology Stack</h3>
                <div className={styles.techGrid}>
                  {project.techStack.map((tech, index) => {
                    const Icon = IconMap[tech.icon];
                    return (
                      <div key={index} className={styles.techItem} style={{ '--tech-color': tech.color }}>
                        <div className={styles.techIcon}>{Icon ? <Icon /> : null}</div>
                        <span className={styles.techName}>{tech.name}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Key Features */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Key Features & Implementation</h3>
                <div className={styles.featuresGrid}>
                  {project.features.map((feature, index) => {
                    const FIcon = IconMap[feature.icon];
                    return (
                      <div key={index} className={styles.featureCard}>
                        <div className={styles.featureIcon}>{FIcon ? <FIcon /> : null}</div>
                        <h4 className={styles.featureTitle}>{feature.title}</h4>
                        <p className={styles.featureDescription}>{feature.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Architecture */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{project.architecture.title}</h3>
                <div className={styles.architectureFlow}>
                  {project.architecture.components.map((component, index) => (
                    <div key={index} className={styles.architectureLayer}>
                      <div className={styles.layerNumber}>{index + 1}</div>
                      <div className={styles.layerContent}>
                        <h4 className={styles.layerTitle}>{component.layer}</h4>
                        <p className={styles.layerDescription}>{component.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Development Highlights */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Development Highlights</h3>
                <div className={styles.highlightsList}>
                  {project.highlights.map((highlight, index) => (
                    <div key={index} className={styles.highlight}>
                      <span className={styles.highlightBullet}>•</span>
                      <p>{highlight}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ))}

        {/* Coming Soon Banner */}
        <div className={styles.comingSoonBanner}>
          <div className={styles.bannerIcon}>🚀</div>
          <h3>More Projects Coming Soon</h3>
          <p>Additional projects will be showcased here as they are completed</p>
        </div>
      </div>
    </div>
  );
};

export default Projects;
