import React, { useEffect, useRef, useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdMessage } from 'react-icons/md';
import { FaLinkedin, FaGithub, FaInstagram, FaOrcid, FaHeart } from 'react-icons/fa';

/* Data */
import contactData from '../../data/contact.json';

/* Styling */
import styles from './Contact.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * CONTACT PAGE
 * ============================================================================
 * Engaging contact page with interactive elements
 * Full-page layout with interactive cards
 * ============================================================================
 */

const Contact = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // ========================================
  // REFS
  // ========================================
  const containerRef = useRef(null);

  // ========================================
  // EFFECTS - Page Mount
  // ========================================
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ========================================
  // ICON MAPS
  // ========================================
  const iconMap = {
    MdEmail,
    MdPhone,
    MdLocationOn,
    FaLinkedin,
    FaGithub,
    FaInstagram,
    FaOrcid,
    FaHeart
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${isVisible ? styles.visible : ''}`}
    >
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <MdMessage />
        </div>
        <h1 className={styles.pageTitle}>{contactData.heading.title}</h1>
        <p className={styles.pageSubtitle}>{contactData.heading.subtitle}</p>
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Contact Methods Section */}
        <section className={styles.contactSection}>
          <h2 className={styles.sectionTitle}>Direct Contact</h2>
          <div className={styles.contactCardsWrapper}>
            {contactData.contactMethods.map((method, index) => {
              const Icon = iconMap[method.icon];
              return (
                <div 
                  key={index}
                  className={`${styles.contactCard} ${method.primary ? styles.primary : ''}`}
                  onMouseEnter={() => setHoveredCard(`contact-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={styles.cardGlow} />
                  <div className={styles.contactIcon}>
                    {Icon && <Icon />}
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>{method.label}</span>
                    {method.link ? (
                      <a href={method.link} className={styles.contactValue}>
                        {method.value}
                      </a>
                    ) : (
                      <span className={styles.contactValue}>{method.value}</span>
                    )}
                  </div>
                  {hoveredCard === `contact-${index}` && (
                    <div className={styles.cardRipple} />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Social Links Section */}
        <section className={styles.socialSection}>
          <h2 className={styles.sectionTitle}>Social Connections</h2>
          <div className={styles.socialGrid}>
            {contactData.socialLinks.map((social, index) => {
              const Icon = iconMap[social.icon];
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialCard}
                  style={{ '--brand-color': social.color }}
                  onMouseEnter={() => setHoveredCard(`social-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={styles.socialBg} />
                  <div className={styles.socialIcon}>
                    {Icon && <Icon />}
                  </div>
                  <span className={styles.socialPlatform}>{social.platform}</span>
                  <div className={styles.socialHoverEffect} />
                </a>
              );
            })}
          </div>
        </section>
      </div>

      {/* Donation Section */}
      {contactData.donation && contactData.donation.enabled && (
        <section className={styles.donationSection}>
          <div className={styles.donationCard}>
            <div className={styles.donationIcon}>
              {iconMap[contactData.donation.icon] && 
                React.createElement(iconMap[contactData.donation.icon])}
            </div>
            <div className={styles.donationContent}>
              <h3 className={styles.donationTitle}>{contactData.donation.title}</h3>
              <p className={styles.donationMessage}>{contactData.donation.message}</p>
              <a 
                href={contactData.donation.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.donationButton}
              >
                {contactData.donation.buttonText}
              </a>
            </div>
            <div className={styles.donationGlow} />
          </div>
        </section>
      )}

      {/* Availability Banner */}
      {contactData.availability && (
        <div className={`${styles.availabilityBanner} ${styles[contactData.availability.status]}`}>
          <div className={styles.availabilityPulse}>
            <div className={styles.availabilityDot} />
          </div>
          <span className={styles.availabilityText}>{contactData.availability.message}</span>
        </div>
      )}
    </div>
  );
};

export default Contact;
