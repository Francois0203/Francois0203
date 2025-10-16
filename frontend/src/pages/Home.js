import React from 'react';
import styles from './Home.module.css';

const Home = () => {
    return (
        <div className={styles.container}>
            <section className={styles.hero}>
                <h1 className={styles.title}>Welcome to My Portfolio</h1>
                <p className={styles.subtitle}>
                    Exploring the intersection of design and technology
                </p>
                <div className={styles.content}>
                    <p>
                        This is a modern, responsive website built with React,
                        featuring a dynamic theme system that adapts to your preferences.
                        Feel free to toggle between light and dark modes using the switch
                        in the top-right corner!
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Home;
