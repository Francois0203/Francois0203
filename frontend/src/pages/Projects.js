import React, { useEffect, useRef, useState } from 'react';
import { FaReact, FaGithub, FaNpm, FaRocket, FaCogs, FaPalette, FaCode } from 'react-icons/fa';
import { MdAutoAwesome, MdCached } from 'react-icons/md';
import { AiOutlineDeploymentUnit } from "react-icons/ai";
import styles from './Projects.module.css';

const Projects = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Parallax particles effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const particles = containerRef.current.querySelectorAll(`.${styles.particle}`);
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      particles.forEach((particle, i) => {
        const speed = (i + 1) * 0.02;
        const x = (clientX - centerX) * speed;
        const y = (clientY - centerY) * speed;
        particle.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const project = {
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

    links: [
      {
        label: "View Repository",
        url: "https://github.com/Francois0203",
        icon: <FaGithub />
      },
      {
        label: "View Live Site",
        url: "https://francois0203.github.io",
        icon: <FaRocket />
      }
    ]
  };

  return (
    <div ref={containerRef} className={styles.projectsWrapper}>
      {/* Animated background particles */}
      <div className={styles.particlesContainer}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.particle} style={{ '--index': i }} />
        ))}
      </div>

      {/* Background decoration */}
      <div className={styles.bgDecoration} />

      <div className={`${styles.projectsContainer} ${isVisible ? styles.visible : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>Featured Projects</h1>
          <p className={styles.subtitle}>Exploring Modern Web Technologies</p>
        </div>

        {/* Project Card */}
        <div className={styles.projectCard}>
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
                <div className={styles.highlight}>
                  <span className={styles.highlightBullet}>•</span>
                  <p>Designed and implemented a modular component architecture enabling code reusability and maintainability across multiple projects</p>
                </div>
                <div className={styles.highlight}>
                  <span className={styles.highlightBullet}>•</span>
                  <p>Configured GitHub Actions for automated testing, building, and deployment, reducing manual deployment time and eliminating human error</p>
                </div>
                <div className={styles.highlight}>
                  <span className={styles.highlightBullet}>•</span>
                  <p>Established NPM package publishing workflow to GitHub Package Registry with versioning and dependency management</p>
                </div>
                <div className={styles.highlight}>
                  <span className={styles.highlightBullet}>•</span>
                  <p>Optimized build process for production deployment including code splitting, asset optimization, and performance enhancements</p>
                </div>
                <div className={styles.highlight}>
                  <span className={styles.highlightBullet}>•</span>
                  <p>Implemented responsive design principles ensuring optimal user experience across desktop, tablet, and mobile devices</p>
                </div>
              </div>
            </section>
          </div>
        </div>

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