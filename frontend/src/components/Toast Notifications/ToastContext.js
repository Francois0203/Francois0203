import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ToastNotification from "./ToastNotification";

// ─── CONTEXT ────────────────────────────────────────────────────────────────
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

// ─── PROVIDER ───────────────────────────────────────────────────────────────
// Portals toast stack to a dedicated DOM node so z-index is never trapped.
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts]         = useState([]);
  const [portalRoot, setPortalRoot] = useState(null);
  const idCounterRef = useRef(0);

  // ─── PORTAL ROOT ─────────────────────────────────────────────────────────
  // Create (or reuse) a fixed overlay node at the top of <body>.
  useEffect(() => {
    let div = document.getElementById("toast-portal-root");
    if (!div) {
      div = document.createElement("div");
      div.id = "toast-portal-root";
      div.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999999999 !important;";
      document.body.appendChild(div);
    }
    setPortalRoot(div);
  }, []);

  // ─── TOAST CONTROLS ────────────────────────────────────────────────────────
  const showToast = useCallback((type, title, message, errorCode) => {
    const id = ++idCounterRef.current;
    setToasts((prev) => [...prev, { id, type, title, message, errorCode }]);
    // Auto-dismiss after 5 s visible + ~0.7 s fade
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5700);
  }, []);

  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  const toastContainer = (
    <div style={{
      position:      "fixed",
      top:           "var(--spacing-lg)",
      right:         "var(--spacing-lg)",
      display:       "flex",
      flexDirection: "column",
      alignItems:    "flex-end",
      pointerEvents: "auto",
      maxWidth:      "calc(100vw - 3rem)",
    }}>
      {toasts.map((t) => (
        <ToastNotification
          key={t.id}
          id={t.id}
          type={t.type}
          title={t.title}
          message={t.message}
          errorCode={t.errorCode}
          onClose={closeToast}
        />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {portalRoot && createPortal(toastContainer, portalRoot)}
    </ToastContext.Provider>
  );
};