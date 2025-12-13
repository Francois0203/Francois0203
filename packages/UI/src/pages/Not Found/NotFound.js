import React, { useEffect, useRef, useState } from 'react';
import styles from './NotFound.module.css';
import '../../styles/Theme.css';

const NotFound = () => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [foundButton, setFoundButton] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // Fill with black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set composite mode to cut out the torch area
      ctx.globalCompositeOperation = 'destination-out';

      // Create radial gradient for torch effect (this will create transparency)
      const gradient = ctx.createRadialGradient(
        mousePos.x, mousePos.y, 0,
        mousePos.x, mousePos.y, 200
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.9)');
      gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reset composite mode
      ctx.globalCompositeOperation = 'source-over';

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePos.x, mousePos.y]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const handleButtonHover = () => {
    if (!foundButton) {
      setFoundButton(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Floating orbs for atmosphere */}
        <div className={`${styles.orb} ${styles.orb1}`} aria-hidden="true" />
        <div className={`${styles.orb} ${styles.orb2}`} aria-hidden="true" />
        <div className={`${styles.orb} ${styles.orb3}`} aria-hidden="true" />
        <div className={`${styles.orb} ${styles.orb4}`} aria-hidden="true" />
        
        <div className={styles.topLeft}>
          <p className={styles.verseText}>
            "Even though I walk through the darkest valley,
          </p>
          <p className={styles.verseText}>I will fear no evil, for you are with me"</p>
          <p className={styles.reference}>— Psalm 23:4</p>
        </div>

        <div className={styles.mainMessage}>
          <div className={styles.errorCode}>404</div>
          <h1 className={styles.title}>Lost in the Dark</h1>
          <p className={styles.subtitle}>But His light remains</p>
        </div>

        <div className={styles.topRight}>
          <p className={styles.smallText}>Where are you going?</p>
        </div>

        <div className={styles.bottomLeft}>
          <p className={styles.smallText}>The path you seek no longer exists</p>
        </div>

        <button 
          className={`${styles.homeButton} ${foundButton ? styles.discovered : ''}`}
          onClick={handleGoBack}
          onMouseEnter={handleButtonHover}
          aria-label="Return home"
        >
          <span className={styles.buttonIcon}>✝</span>
          <span className={styles.buttonText}>Find Your Way Home</span>
        </button>

        <div className={styles.bottomRight}>
          <p className={styles.scripture}>
            "I am the light of the world.<br />
            Whoever follows me will never walk in darkness"
          </p>
          <p className={styles.reference}>— John 8:12</p>
        </div>
      </div>
      
      <canvas ref={canvasRef} className={styles.darkness} />
    </div>
  );
};

export default NotFound;