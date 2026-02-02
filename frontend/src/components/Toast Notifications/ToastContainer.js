import React, { useState, useCallback } from "react";
import ToastNotification from "./ToastNotification";

let idCounter = 0;

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // Function to trigger a new toast
  const showToast = useCallback((type, title, message, errorCode) => {
    const id = ++idCounter;
    setToasts((prev) => [
      ...prev,
      { id, type, title, message, errorCode },
    ]);

    // Remove toast automatically after 5s + fade time
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5700); // 5s visible + ~0.7s fade
  }, []);

  return (
    <>
      <div style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 100000000000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "0.75rem"
      }}>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onClose={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </div>

      {/* Example button to show how it works */}
      <button
        style={{ position: "fixed", bottom: "2rem", left: "2rem" }}
        onClick={() =>
          showToast("error", "Oops!", "Something went wrong again!", "ERR-500")
        }
      >
        Show Toast
      </button>
    </>
  );
};

export default ToastContainer;