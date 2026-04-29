import React, { useState } from 'react';
import { FaReact, FaGithub, FaNpm, FaRocket, FaCogs, FaPalette, FaCode, FaPython, FaDocker } from 'react-icons/fa';
import { MdAutoAwesome, MdCached, MdRadio, MdScience, MdSpeed, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { AiOutlineDeploymentUnit } from 'react-icons/ai';
import { SiNumpy, SiPytest } from 'react-icons/si';
import styles from './Projects.module.css';

const projectsData = [
  {
    title: 'Francois0203 Portfolio Website',
    subtitle: 'Modern React-Based Personal Portfolio & Professional Showcase',
    description: 'A professionally designed personal portfolio website built with React, showcasing projects, skills, and experience through an interactive, responsive interface. Features a modern design system with theme switching, animated components, and optimized performance. The site demonstrates full-stack development capabilities, responsive design principles, and attention to user experience across all device types.',
    techStack: [
      { name: 'React',        icon: 'FaReact',                 color: '#61DAFB' },
      { name: 'JavaScript',   icon: 'FaCode',                  color: '#F7DF1E' },
      { name: 'CSS Modules',  icon: 'FaPalette',               color: '#1572B6' },
      { name: 'React Router', icon: 'FaCogs',                  color: '#CA4245' },
      { name: 'GitHub Pages', icon: 'AiOutlineDeploymentUnit', color: '#222222' },
    ],
    features: [
      { title: 'Responsive Design System',   icon: 'FaPalette',    description: 'Fully responsive layout that adapts seamlessly to desktop, tablet, and mobile devices. Features a comprehensive theme system with light/dark mode switching and CSS custom properties for consistent styling across all components.'                                                                                            },
      { title: 'Interactive Components',     icon: 'MdAutoAwesome', description: 'Custom-built reusable React components including navigation, modals, tooltips, toast notifications, and form elements. Features smooth animations, ripple effects, and particle systems that adapt to device capabilities and user preferences.'                                                                              },
      { title: 'Performance Optimized',      icon: 'MdSpeed',       description: 'Optimized for fast load times and smooth interactions with lazy loading, code splitting, and efficient rendering. Animations automatically reduce on mobile devices and respect user\'s motion preferences for accessibility.'                                                                                                },
      { title: 'GitHub Pages Deployment',    icon: 'FaRocket',      description: 'Automated deployment pipeline using GitHub Actions, enabling seamless updates and continuous delivery. Hosted on GitHub Pages with custom domain support and HTTPS enforcement.'                                                                                                                                            },
    ],
    summary: 'A modern, professionally-designed portfolio website showcasing technical skills, projects, and experience through an engaging, responsive interface.',
    highlights: [
      'Designed and implemented complete UI/UX with modern design principles and accessibility in mind',
      'Built reusable component library with consistent theming and responsive layouts',
      'Implemented performance optimizations including lazy loading and reduced animations for mobile devices',
      'Configured automated deployment pipeline for continuous delivery',
      'Created interactive animations and effects that enhance user experience without compromising performance',
    ],
    links: [{ label: 'View Repository', url: 'https://github.com/Francois0203', icon: 'FaGithub' }],
  },
  {
    title: 'Telescope Correlator',
    subtitle: 'Production-Ready FX Correlator for Radio Telescope Arrays',
    description: 'A professional-grade telescope correlator implementing the FX architecture for processing radio telescope data. This system processes voltage streams from radio telescope antenna arrays and produces visibility data suitable for astronomical image synthesis. Designed for both development (simulation) and production (real telescope) operation modes, it represents a complete signal processing pipeline for radio astronomy applications.',
    techStack: [
      { name: 'Python',            icon: 'FaPython', color: '#3776AB' },
      { name: 'NumPy',             icon: 'SiNumpy',  color: '#013243' },
      { name: 'Docker',            icon: 'FaDocker', color: '#2496ED' },
      { name: 'pytest',            icon: 'SiPytest', color: '#0A9EDC' },
      { name: 'Signal Processing', icon: 'MdRadio',  color: '#FF6B6B' },
      { name: 'Radio Astronomy',   icon: 'MdScience',color: '#4ECDC4' },
    ],
    features: [
      { title: 'FX Correlator Architecture', icon: 'MdRadio',   description: 'Implements the industry-standard FX correlation pipeline with F-Engine for channelization via windowed FFT (time to frequency domain conversion), X-Engine for cross-correlation and integration between antenna pairs, and geometric delay compensation accounting for array geometry and source position. Processes complex voltage data through the complete correlation pipeline.'                                                                                                                                                   },
      { title: 'Dual Operation Modes',        icon: 'MdSpeed',  description: 'Features separate development and production modes. Development mode provides simulated telescope data for algorithm testing, validation, and learning without hardware. Production mode handles live network streaming (TCP/UDP protocols) and file processing from real telescope arrays with comprehensive monitoring, quality checks, and calibration support.'                                                                                                                                                                   },
      { title: 'Network Data Streaming',      icon: 'MdCached', description: 'Real-time processing of telescope data streams via TCP/UDP protocols with configurable buffer management, timeout handling, and quality monitoring. Supports live correlation of data from antenna arrays with automatic stream recovery and comprehensive error handling for production astronomical observations.'                                                                                                                                                                                                              },
      { title: 'Comprehensive Testing',       icon: 'SiPytest', description: 'Includes 33 automated tests covering all components: F-Engine channelization accuracy, X-Engine correlation fidelity, geometric delay compensation precision, and end-to-end pipeline validation. Features accuracy validation against analytical solutions ensuring mathematical correctness without requiring physical telescope hardware.'                                                                                                                                                                                    },
    ],
    highlights: [
      'Implemented complete FX correlation pipeline with sub-picosecond delay precision and FFT accuracy validation against analytical solutions',
      'Designed dual-mode architecture separating development simulations from production telescope operations with safety features and validation',
      'Built containerized deployment using Docker for reproducible execution across Windows, Linux, and macOS platforms',
      'Developed comprehensive CLI with interactive shells for development and production modes, providing intuitive workflow management',
      'Created 33-test validation suite covering unit tests for each processing stage and integration tests for end-to-end pipeline verification',
      'Implemented real-time network streaming with TCP/UDP support, configurable buffering, and production-grade monitoring and logging',
    ],
    links: [{ label: 'View Repository', url: 'https://github.com/Francois0203/Telescope-Correlator', icon: 'FaGithub' }],
  },
];

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
  return (
    <div className={`${styles.container} ${styles.visible}`}>
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
