import React, { useState } from 'react';
import { AiOutlineHome, AiOutlineUser, AiOutlineProject, AiOutlineMail } from 'react-icons/ai';
import { RiMenuLine } from 'react-icons/ri';
import styles from './NavigationBar.module.css';

const NavigationBar = () => {
    const [isHovered, setIsHovered] = useState(false);

    const navItems = [
        { icon: <AiOutlineHome />, label: '', link: '/' },
        { icon: <AiOutlineUser />, label: 'About', link: '/about' },
        { icon: <AiOutlineProject />, label: 'Projects', link: '/projects' },
        { icon: <AiOutlineMail />, label: 'Contact', link: '/contact' }
    ];

    return (
        <nav 
            className={styles.navbar}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={styles.menuIcon}>
                <RiMenuLine />
            </div>
            <ul className={`${styles.navList} ${isHovered ? styles.expanded : ''}`}>
                {navItems.map((item, index) => (
                    <li 
                        key={index} 
                        className={styles.navItem}
                        style={{ 
                            transitionDelay: `${isHovered ? index * 0.1 : 0}s`
                        }}
                    >
                        <a href={item.link} className={styles.navLink}>
                            <span className={styles.icon}>{item.icon}</span>
                            {item.label && (
                                <span className={styles.label}>
                                    {item.label}
                                </span>
                            )}
                        </a>
                    </li>
                ))}
            </ul>
            <div className={`${styles.background} ${isHovered ? styles.expanded : ''}`} />
        </nav>
    );
};

export default NavigationBar;
