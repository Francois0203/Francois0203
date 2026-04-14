import React, { useEffect, useRef, memo, useCallback } from "react";
import { LuCircleCheck, LuCircleX, LuTriangleAlert, LuInfo, LuX } from "react-icons/lu";
import styles from "./ToastNotification.module.css";

/* ============================================================================
 * TOAST NOTIFICATION COMPONENT
 * ============================================================================
 * Individual toast notification with auto-dismiss and manual close
 * ============================================================================
 */

/* React icons keyed to toast type */
const ICONS = {
  success: <LuCircleCheck    className={styles.icon} aria-hidden="true" />,
  error:   <LuCircleX        className={styles.icon} aria-hidden="true" />,
  warning: <LuTriangleAlert  className={styles.icon} aria-hidden="true" />,
  info:    <LuInfo           className={styles.icon} aria-hidden="true" />,
};

const ToastNotification = memo(({ id, type = "info", title, message, errorCode, onClose }) => {
  const wrapperRef = useRef(null);
  const closingRef = useRef(false);

  const startClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    const el = wrapperRef.current;
    if (!el) { onClose(id); return; }

    // 1. Add the closing class so the card fades + slides right
    el.classList.add(styles.closing);

    // 2. Lock the current height so the collapse transition has an explicit start value
    const height = el.offsetHeight;
    el.style.height = `${height}px`;
    el.style.overflow = 'hidden';

    // 3. On the next two frames (double-rAF guarantees browser has painted
    //    the locked height before we set 0), collapse to 0
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.height = '0';
        el.style.marginBottom = '0';
      });
    });

    // 4. Remove from React state after both transitions complete
    setTimeout(() => onClose(id), 480);
  }, [id, onClose]);

  useEffect(() => {
    const timer = setTimeout(startClose, 3000);
    return () => clearTimeout(timer);
  }, [startClose]);

  return (
    <div ref={wrapperRef} className={styles.toastWrapper}>
      <div className={`${styles.toastMessage} ${styles[type]}`} role="alert" aria-live="assertive">
        {ICONS[type]}
        <div className={styles.textBlock}>
          {title && <div className={styles.toastHeader}>{title}</div>}
          {message && <div className={styles.toastBody}>{message}</div>}
          {errorCode && <div className={styles.toastFooter}>Code: {errorCode}</div>}
        </div>
        <button className={styles.closeButton} onClick={startClose} aria-label="Close notification">
          <LuX />
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.type === nextProps.type &&
    prevProps.title === nextProps.title &&
    prevProps.message === nextProps.message &&
    prevProps.errorCode === nextProps.errorCode &&
    prevProps.onClose === nextProps.onClose
  );
});

ToastNotification.displayName = "ToastNotification";

export default ToastNotification;