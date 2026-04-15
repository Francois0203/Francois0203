import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
} from 'react';
import styles from './ImageCarousel.module.css';

// ─── COMPONENT ────────────────────────────────────────────────────────────────
// Liquid-glass coverflow carousel.
//
// Layout: active slide is centered at full size; adjacent slides (±1, ±2) are
// visible on the left and right — scaled down, dimmed, and angled in 3-D.
// Clicking a side slide navigates to it.  All slides transition smoothly via
// CSS transitions driven by inline transform/opacity/filter style props.
//
// Controls bar: pill dots + a play/pause toggle button.
// A thin accent progress bar animates along the bottom during auto-play.
//
// Props:
//   items           — Array<{ src, alt, title?, caption? }>
//   autoPlay        — boolean  initial auto-play state (default false)
//   autoPlayInterval— ms between auto-advance            (default 4000)
//   showArrows      — boolean                            (default true)
//   showDots        — boolean                            (default true)
//   aspectRatio     — CSS aspect-ratio string            (default "16/9")
//   className       — extra class on the root element

const ImageCarousel = ({
  items = [],
  autoPlay        = false,
  autoPlayInterval = 4000,
  showArrows = true,
  showDots   = true,
  aspectRatio = '16/9',
  className   = '',
}) => {
  const id = useId();
  const [current,   setCurrent]   = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPaused,  setIsPaused]  = useState(false); // hover-pause
  const lockRef = useRef(false);

  const total = items.length;

  // ─── NAVIGATION ─────────────────────────────────────────────────────────────
  const goTo = useCallback((nextIndex) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setCurrent(((nextIndex % total) + total) % total);
    setTimeout(() => { lockRef.current = false; }, 560);
  }, [total]);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // ─── AUTO-PLAY ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || isPaused || total <= 1) return;
    const timer = setInterval(goNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, isPaused, total, goNext, autoPlayInterval]);

  // ─── KEYBOARD ────────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev(); }
    if (e.key === ' ')          { e.preventDefault(); setIsPlaying(p => !p); }
  }, [goNext, goPrev]);

  // ─── TOUCH / SWIPE ───────────────────────────────────────────────────────────
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  if (!total) return null;

  // ─── OFFSET HELPERS ──────────────────────────────────────────────────────────
  // Normalize offset to the shortest wrap-around path: range ≈ [-N/2, N/2]
  const getOffset = (index) => {
    let off = ((index - current) % total + total) % total;
    if (off > Math.floor(total / 2)) off -= total;
    return off;
  };

  // Per-offset visual properties — drives the coverflow peek look.
  // Math: the slide is position:absolute, width:100% of stage.
  // translateX(T%) scale(S) about transform-origin:center means:
  //   visible_left_edge = S*(T% - 0.5)*stageW + 0.5*stageW
  // At T=68%, S=0.78 → left_edge ≈ 64% → 36% of the slide visible.
  const getSlideStyle = (offset) => {
    const abs  = Math.abs(offset);
    const sign = Math.sign(offset);

    if (abs > 1) return { opacity: 0, pointerEvents: 'none', zIndex: 0, visibility: 'hidden' };

    switch (abs) {
      case 0: return {
        transform:     'translateX(0%) scale(1) translateY(0%)',
        opacity:       1,
        zIndex:        3,
        filter:        'none',
        pointerEvents: 'auto',
      };
      case 1: return {
        // ~36% of the side slide is visible, peeking in from the edge.
        // Dropped 4% on Y so it reads as behind / recessed.
        transform:     `translateX(${sign * 68}%) scale(0.78) translateY(4%)`,
        opacity:       1,
        zIndex:        2,
        filter:        'blur(4px) brightness(0.50)',
        pointerEvents: 'auto',
        cursor:        'pointer',
      };
      default: return {};
    }
  };

  return (
    <section
      className={`${styles.carousel} ${className}`}
      aria-roledescription="carousel"
      aria-label="Image carousel"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* ── Stage wrapper — provides overflow clipping + edge vignette ── */}
      <div className={styles.stageWrapper}>

        {/* ── Stage — defines height + 3-D perspective ─────────────────── */}
        <div
          className={styles.stage}
          style={{ aspectRatio }}
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Slides */}
          {items.map((item, index) => {
            const offset   = getOffset(index);
            const isActive = offset === 0;
            return (
              <div
                key={index}
                className={`${styles.slide} ${isActive ? styles.slideActive : ''}`}
                style={getSlideStyle(offset)}
                onClick={() => !isActive && goTo(index)}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${total}`}
                aria-hidden={!isActive}
              >
                <img
                  src={item.src}
                  alt={item.alt ?? ''}
                  className={styles.image}
                  draggable={false}
                />

                {/* Caption — only rendered for the active slide */}
                {isActive && (item.title || item.caption) && (
                  <div className={styles.caption} key={current}>
                    {item.title   && <p className={styles.captionTitle}>{item.title}</p>}
                    {item.caption && <p className={styles.captionBody}>{item.caption}</p>}
                  </div>
                )}
              </div>
            );
          })}

          {/* Glass lens specular overlay */}
          <div className={styles.glassOverlay} aria-hidden="true" />

          {/* Arrow buttons */}
          {showArrows && total > 1 && (
            <>
              <button
                className={`${styles.arrow} ${styles.arrowPrev}`}
                onClick={goPrev}
                aria-label="Previous slide"
                tabIndex={-1}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className={`${styles.arrow} ${styles.arrowNext}`}
                onClick={goNext}
                aria-label="Next slide"
                tabIndex={-1}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Auto-play progress bar — remounts on slide/play change to restart animation */}
        <div
          key={`${current}-${isPlaying}`}
          className={`${styles.progressBar} ${
            isPlaying
              ? isPaused
                ? styles.progressBarPaused
                : styles.progressBarActive
              : ''
          }`}
          style={{ '--progress-duration': `${autoPlayInterval}ms` }}
          aria-hidden="true"
        />
      </div>

      {/* ── Controls: dots + play/pause toggle ──────────────────────────── */}
      {total > 1 && (
        <div className={styles.controls}>
          {/* Dots */}
          {showDots ? (
            <div className={styles.dots} role="tablist" aria-label="Slide indicators">
              {items.map((_, index) => (
                <button
                  key={index}
                  id={`${id}-dot-${index}`}
                  className={`${styles.dot} ${index === current ? styles.dotActive : ''}`}
                  role="tab"
                  aria-selected={index === current}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          ) : (
            <span />
          )}

          {/* Play / Pause toggle */}
          <button
            className={`${styles.playToggle} ${isPlaying ? styles.playTogglePlaying : ''}`}
            onClick={() => setIsPlaying(p => !p)}
            aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? (
              /* Pause */
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6"  y="4" width="4" height="16" rx="1.5" />
                <rect x="14" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              /* Play */
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default ImageCarousel;
