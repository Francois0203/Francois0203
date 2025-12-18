import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdRocketLaunch, MdArrowForward } from 'react-icons/md';
import styles from './Home.module.css';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const heroCanvasRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Hero Canvas Animation - Geometric particles
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let animationId;

    const resizeCanvas = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create geometric particles
    const particles = [];
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const color = isDark ? '47, 243, 224' : '0, 139, 139';

      particles.forEach((p) => {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw geometric shape
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
        
        // Draw square
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        
        // Draw outline
        ctx.strokeStyle = `rgba(${color}, ${p.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
        
        ctx.restore();

        // Draw connections
        particles.forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${color}, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) cancelAnimationFrame(animationId);
    };
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

  // Spawn raindrops
  useEffect(() => {
    let mounted = true;
    let schedulerTimeout = null;
    const removalTimers = [];

    const spawnRaindrop = () => {
      if (!mounted || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const startX = Math.random() * rect.width;
      const endY = 200 + Math.random() * (rect.height - 200);
      const duration = 800 + Math.random() * 400;

      const dropEl = document.createElement('div');
      dropEl.className = styles.raindrop;
      dropEl.style.left = `${startX}px`;
      dropEl.style.top = `0px`;
      dropEl.style.setProperty('--end-y', `${endY}px`);
      dropEl.style.setProperty('--duration', `${duration}ms`);
      containerRef.current.appendChild(dropEl);

      const rippleTimer = setTimeout(() => {
        const rippleEl = document.createElement('div');
        rippleEl.className = styles.ripple;
        rippleEl.style.left = `${startX}px`;
        rippleEl.style.top = `${endY}px`;
        containerRef.current.appendChild(rippleEl);

        const rippleRemoveTimer = setTimeout(() => {
          try { rippleEl.remove(); } catch (e) {}
        }, 1200);
        removalTimers.push(rippleRemoveTimer);
      }, duration);

      removalTimers.push(rippleTimer);

      const removeTimer = setTimeout(() => {
        try { dropEl.remove(); } catch (e) {}
        const idx = removalTimers.indexOf(removeTimer);
        if (idx !== -1) removalTimers.splice(idx, 1);
      }, duration + 100);

      removalTimers.push(removeTimer);

      const nextDelay = 800 + Math.random() * 1200;
      schedulerTimeout = setTimeout(spawnRaindrop, nextDelay);
    };

    schedulerTimeout = setTimeout(spawnRaindrop, 1000);

    return () => {
      mounted = false;
      if (schedulerTimeout) clearTimeout(schedulerTimeout);
      removalTimers.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.homeWrapper} onClick={handleClick}>
      <div className={styles.bgDecoration} />

      <div className={`${styles.contentContainer} ${isVisible ? styles.visible : ''}`}>
        {/* Hero Section with Canvas */}
        <div className={styles.heroBox}>
          <canvas ref={heroCanvasRef} className={styles.heroCanvas} />
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroLabel}>DEVELOPER • RESEARCHER • INNOVATOR</div>
              <h1 className={styles.heroName}>
                FRANCOIS<br/>MEIRING
              </h1>
              <p className={styles.heroTagline}>
                Transforming ideas into elegant, scalable solutions
              </p>
            </div>
            <div className={styles.heroCta}>
              <Link to="/contact" className={styles.glowButton}>
                <span className={styles.glowButtonText}>Contact & Donations</span>
                <MdRocketLaunch className={styles.glowButtonIcon} size={20} />
                <div className={styles.glowButtonBg} />
              </Link>
            </div>
          </div>
        </div>

        {/* Mini Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>5+</span>
            <span className={styles.statText}>Technologies</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>MSc</span>
            <span className={styles.statText}>Computer Science</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>Full Stack Developer</span>
            <span className={styles.statText}>Current Position</span>
          </div>
        </div>

        {/* Tech Stack Minimal */}
        <div className={styles.techRow}>
          <span className={styles.techLabel}>Stack:</span>
          <div className={styles.techItems}>
            {['JavaScript', 'React', 'Node.js', 'Python', 'Docker', 'SQL'].map((tech, i) => (
              <span key={i} className={styles.techItem}>{tech}</span>
            ))}
          </div>
        </div>

        {/* Secondary CTA */}
        <div className={styles.secondaryCta}>
          <a href="#projects" className={styles.textLink}>
            Explore My Work
            <MdArrowForward className={styles.arrowIcon} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;