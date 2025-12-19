import React, { useEffect, useRef, useState } from 'react';
import { FaReact, FaGithub, FaNpm, FaRocket, FaCogs, FaPalette, FaCode, FaPython, FaDocker } from 'react-icons/fa';
import { MdAutoAwesome, MdCached, MdRadio, MdScience, MdSpeed } from 'react-icons/md';
import { AiOutlineDeploymentUnit } from "react-icons/ai";
import { SiNumpy, SiPytest } from "react-icons/si";
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

  const projects = [
    {
      title: "Personal Portfolio Website",
      subtitle: "A Modern, Component-Based React Application",
      description: "This personal portfolio website represents a comprehensive full-stack web development project, showcasing modern web technologies, architectural design patterns, and automated deployment workflows. Built entirely from scratch, the project demonstrates proficiency in React development, package management, CI/CD implementation, and production deployment strategies.",
      
      techStack: [
        { name: "React", icon: <FaReact />, color: "#61DAFB" },
        { name: "JavaScript", icon: <FaCode />, color: "#F7DF1E" },
        { name: "CSS Modules", icon: <FaPalette />, color: "#1572B6" },
        { name: "GitHub Actions", icon: <FaCogs />, color: "#2088FF" },
        { name: "GitHub Pages", icon: <AiOutlineDeploymentUnit />, color: "#222222" },
        { name: "NPM Registry", icon: <FaNpm />, color: "#CB3837" }
      ],

      features: [
        {
          title: "Component Package Architecture",
          description: "Developed a custom NPM package published to GitHub Package Registry containing reusable React components, global theme system, typography definitions, and styling utilities. This modular architecture enables consistent design language across the application and facilitates future scalability.",
          icon: <MdAutoAwesome />
        },
        {
          title: "Automated CI/CD Pipeline",
          description: "Implemented dual GitHub Actions workflows for continuous integration and deployment. The first pipeline builds and publishes the component package to GitHub Package Registry upon changes. The second pipeline builds the frontend application, consuming the package, and deploys the production build to GitHub Pages with zero-downtime deployment.",
          icon: <MdCached />
        },
        {
          title: "Production Deployment",
          description: "Configured automated deployment to GitHub Pages using the Francois0203 repository, enabling public access to the portfolio website. The deployment process includes build optimization, asset compression, and proper routing configuration for single-page application functionality.",
          icon: <FaRocket />
        },
        {
          title: "Modern Design System",
          description: "Created a comprehensive design system with glassmorphism effects, fluid animations, responsive layouts, and interactive visual elements. The UI features water-themed particle effects, click ripple animations, and smooth transitions that enhance user engagement while maintaining performance.",
          icon: <FaPalette />
        }
      ],

      architecture: {
        title: "Technical Architecture",
        components: [
          {
            layer: "Component Package",
            description: "Shared React components, theme variables, global styles, typography system, and utility functions published as an NPM package to GitHub Package Registry."
          },
          {
            layer: "Frontend Application",
            description: "React-based single-page application consuming the component package, implementing routing, state management, and page-specific components."
          },
          {
            layer: "CI/CD Pipeline",
            description: "Automated workflows for package publishing and frontend deployment triggered by repository commits, ensuring consistent build processes and deployment reliability."
          },
          {
            layer: "Production Hosting",
            description: "Static site hosting on GitHub Pages with custom domain support, HTTPS enforcement, and optimized asset delivery."
          }
        ]
      },

      highlights: [
        "Designed and implemented a modular component architecture enabling code reusability and maintainability across multiple projects",
        "Configured GitHub Actions for automated testing, building, and deployment, reducing manual deployment time and eliminating human error",
        "Established NPM package publishing workflow to GitHub Package Registry with versioning and dependency management",
        "Optimized build process for production deployment including code splitting, asset optimization, and performance enhancements",
        "Implemented responsive design principles ensuring optimal user experience across desktop, tablet, and mobile devices"
      ],

      links: [
        {
          label: "View Repository",
          url: "https://github.com/Francois0203",
          icon: <FaGithub />
        }
      ]
    },
    {
      title: "Telescope Correlator",
      subtitle: "Production-Ready FX Correlator for Radio Telescope Arrays",
      description: "A professional-grade telescope correlator implementing the FX architecture for processing radio telescope data. This system processes voltage streams from radio telescope antenna arrays and produces visibility data suitable for astronomical image synthesis. Designed for both development (simulation) and production (real telescope) operation modes, it represents a complete signal processing pipeline for radio astronomy applications.",
      
      techStack: [
        { name: "Python", icon: <FaPython />, color: "#3776AB" },
        { name: "NumPy", icon: <SiNumpy />, color: "#013243" },
        { name: "Docker", icon: <FaDocker />, color: "#2496ED" },
        { name: "pytest", icon: <SiPytest />, color: "#0A9EDC" },
        { name: "Signal Processing", icon: <MdRadio />, color: "#FF6B6B" },
        { name: "Radio Astronomy", icon: <MdScience />, color: "#4ECDC4" }
      ],

      features: [
        {
          title: "FX Correlator Architecture",
          description: "Implements the industry-standard FX correlation pipeline with F-Engine for channelization via windowed FFT (time to frequency domain conversion), X-Engine for cross-correlation and integration between antenna pairs, and geometric delay compensation accounting for array geometry and source position. Processes complex voltage data through the complete correlation pipeline.",
          icon: <MdRadio />
        },
        {
          title: "Dual Operation Modes",
          description: "Features separate development and production modes. Development mode provides simulated telescope data for algorithm testing, validation, and learning without hardware. Production mode handles live network streaming (TCP/UDP protocols) and file processing from real telescope arrays with comprehensive monitoring, quality checks, and calibration support.",
          icon: <MdSpeed />
        },
        {
          title: "Network Data Streaming",
          description: "Real-time processing of telescope data streams via TCP/UDP protocols with configurable buffer management, timeout handling, and quality monitoring. Supports live correlation of data from antenna arrays with automatic stream recovery and comprehensive error handling for production astronomical observations.",
          icon: <MdCached />
        },
        {
          title: "Comprehensive Testing",
          description: "Includes 33 automated tests covering all components: F-Engine channelization accuracy, X-Engine correlation fidelity, geometric delay compensation precision, and end-to-end pipeline validation. Features accuracy validation against analytical solutions ensuring mathematical correctness without requiring physical telescope hardware.",
          icon: <SiPytest />
        }
      ],

      architecture: {
        title: "System Architecture",
        components: [
          {
            layer: "Data Ingestion",
            description: "Frontend module handling simulated data generation for development, network streaming (TCP/UDP) for live observations, and file processing for recorded data. Includes protocol handlers and buffer management."
          },
          {
            layer: "F-Engine (Channelization)",
            description: "Applies window functions (Hanning, Hamming, Blackman) and performs FFT to convert time-domain signals to frequency domain. Supports optional quantization for bandwidth reduction and configurable overlap for improved spectral response."
          },
          {
            layer: "Delay Compensation",
            description: "Calculates geometric delays based on antenna positions and source direction. Applies phase corrections to align signals accounting for baseline geometry, enabling coherent cross-correlation of signals from distributed antennas."
          },
          {
            layer: "X-Engine (Correlation)",
            description: "Cross-correlates all antenna pairs to produce complex visibilities for each frequency channel. Accumulates correlations over integration time and validates physical properties (Hermitian symmetry, real autocorrelations)."
          }
        ]
      },

      highlights: [
        "Implemented complete FX correlation pipeline with sub-picosecond delay precision and FFT accuracy validation against analytical solutions",
        "Designed dual-mode architecture separating development simulations from production telescope operations with safety features and validation",
        "Built containerized deployment using Docker for reproducible execution across Windows, Linux, and macOS platforms",
        "Developed comprehensive CLI with interactive shells for development and production modes, providing intuitive workflow management",
        "Created 33-test validation suite covering unit tests for each processing stage and integration tests for end-to-end pipeline verification",
        "Implemented real-time network streaming with TCP/UDP support, configurable buffering, and production-grade monitoring and logging"
      ],

      links: [
        {
          label: "View Repository",
          url: "https://github.com/Francois0203/Telescope-Correlator",
          icon: <FaGithub />
        }
      ]
    }
  ];

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
          <div key={projectIndex} className={styles.projectCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerContent}>
                <h2 className={styles.projectTitle}>{project.title}</h2>
                <p className={styles.projectSubtitle}>{project.subtitle}</p>
              </div>
              <div className={styles.projectLinks}>
                {project.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectLink}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                ))}
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
                  {project.techStack.map((tech, index) => (
                    <div key={index} className={styles.techItem} style={{ '--tech-color': tech.color }}>
                      <div className={styles.techIcon}>{tech.icon}</div>
                      <span className={styles.techName}>{tech.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Key Features */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Key Features & Implementation</h3>
                <div className={styles.featuresGrid}>
                  {project.features.map((feature, index) => (
                    <div key={index} className={styles.featureCard}>
                      <div className={styles.featureIcon}>{feature.icon}</div>
                      <h4 className={styles.featureTitle}>{feature.title}</h4>
                      <p className={styles.featureDescription}>{feature.description}</p>
                    </div>
                  ))}
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
