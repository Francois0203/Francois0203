import React, { useEffect, useRef, useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdWorkOutline, MdSchool, MdCode } from 'react-icons/md';
import { FaLinkedin, FaInstagram, FaGithub, FaOrcid } from 'react-icons/fa';

/* Data */
import bioData from '../../data/bio.json';

/* Styling */
import styles from './Bio.module.css';
import ProfileImg from '../../Images/Profile.jpeg';
import '../../styles/Theme.css';

/* ============================================================================
 * BIO PAGE
 * ============================================================================
 * Professional biography page with profile, experience, education, and skills
 * Features clean sections and responsive layout
 * ============================================================================
 */

const Bio = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [isVisible, setIsVisible] = useState(false);

  // ========================================
  // REFS
  // ========================================
  const containerRef = useRef(null);

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ========================================
  // ICON MAPS
  // ========================================
  const socialIcons = {
    linkedin: FaLinkedin,
    github: FaGithub,
    instagram: FaInstagram,
    orcid: FaOrcid
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${isVisible ? styles.visible : ''}`}
    >
      {/* Profile Section */}
      <section className={styles.profileSection}>
        <div className={styles.profileCard}>
          <div className={styles.imageWrapper}>
            <img 
              src={ProfileImg} 
              alt={bioData.personalInfo.name} 
              className={styles.profileImage}
            />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.name}>{bioData.personalInfo.name}</h1>
            <p className={styles.title}>{bioData.personalInfo.title}</p>
            
            {/* Contact Info */}
            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <MdEmail className={styles.contactIcon} />
                <a href={`mailto:${bioData.contact.email}`}>{bioData.contact.email}</a>
              </div>
              <div className={styles.contactItem}>
                <MdPhone className={styles.contactIcon} />
                <a href={`tel:${bioData.contact.phone.replace(/\s/g, '')}`}>{bioData.contact.phone}</a>
              </div>
              <div className={styles.contactItem}>
                <MdLocationOn className={styles.contactIcon} />
                <span>{bioData.personalInfo.location}</span>
              </div>
              <div className={styles.contactItem}>
                <MdCalendarToday className={styles.contactIcon} />
                <span>{bioData.personalInfo.dateOfBirth}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className={styles.socialLinks}>
              {Object.entries(bioData.socialLinks).map(([platform, url]) => {
                const Icon = socialIcons[platform];
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  >
                    {Icon && <Icon />}
                  </a>
                );
              })}
            </div>

            {/* Personal Info Grid */}
            <div className={styles.personalInfoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Languages:</span>
                <span className={styles.infoValue}>{bioData.personalInfo.languages.join(', ')}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>License:</span>
                <span className={styles.infoValue}>{bioData.personalInfo.driversLicense}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Faith:</span>
                <span className={styles.infoValue}>{bioData.personalInfo.faith}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <MdWorkOutline className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Professional Experience</h2>
        </div>
        <div className={styles.timelineContainer}>
          {bioData.experiences.map((exp, index) => (
            <div key={index} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <h3 className={styles.timelineTitle}>{exp.title}</h3>
                  <span className={styles.timelinePeriod}>{exp.period}</span>
                </div>
                <p className={styles.timelineCompany}>{exp.company}</p>
                {exp.location && (
                  <p className={styles.timelineLocation}>{exp.location}</p>
                )}
                <p className={styles.timelineDescription}>{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <MdSchool className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Education</h2>
        </div>
        <div className={styles.educationGrid}>
          {bioData.education.map((edu, index) => (
            <div key={index} className={styles.educationCard}>
              <h3 className={styles.educationDegree}>{edu.degree}</h3>
              <p className={styles.educationInstitution}>{edu.institution}</p>
              <p className={styles.educationPeriod}>{edu.period}</p>
              <p className={styles.educationDetails}>{edu.details}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <MdCode className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Skills & Technologies</h2>
        </div>
        <div className={styles.skillsGrid}>
          {Object.entries(bioData.skills).map(([category, skills]) => (
            <div key={category} className={styles.skillCategory}>
              <h3 className={styles.skillCategoryTitle}>{category}</h3>
              <div className={styles.skillTags}>
                {skills.map((skill, index) => (
                  <span key={index} className={styles.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hobbies Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Interests & Hobbies</h2>
        </div>
        <div className={styles.hobbiesContainer}>
          {bioData.hobbies.map((hobby, index) => (
            <span key={index} className={styles.hobbyTag}>{hobby}</span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Bio;
