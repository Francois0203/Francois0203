import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import LoadingScreen from "./components/LoadingScreen";
import useBackend from "./utils/useBackend"; 

const App = () => {
  const { isBackendReady, loading } = useBackend(); // Destructure backend status and loading state

  // Pages that need to check backend readiness
  const renderPageWithBackendCheck = (PageComponent) => {
    if (loading) {
      return <LoadingScreen />;
    }
    return isBackendReady ? <PageComponent /> : <p>Backend is not ready. Please try again later.</p>;
  };

  return (
    <Router basename="/Francois0203">
      <NavBar />
      <Routes>
        <Route path="/" element={renderPageWithBackendCheck(Home)} />
        <Route path="/about" element={renderPageWithBackendCheck(About)} />
        <Route path="/projects" element={renderPageWithBackendCheck(Projects)} />
      </Routes>
    </Router>
  );
};

export default App;