import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';

// Import page components
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';

// Styled Components for App Layout
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => (props.theme.themeValue < 0.5 ? '#333' : '#f5f5f5')};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

// Navbar Styling
const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${(props) => props.theme.secondaryColor};
  font-size: 20px;
  transition: background-color 0.3s ease;
`;

const NavbarLink = styled(Link)`
  color: ${(props) => (props.theme.themeValue < 0.5 ? '#333' : '#f5f5f5')};
  text-decoration: none;
  margin: 0 15px;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Settings Button and Dropdown Panel
const SettingsButton = styled.button`
  position: absolute;
  top: 80px; 
  right: 20px;
  background-color: transparent;
  border: none;
  color: ${(props) => props.theme.secondaryColor};
  font-size: 24px;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const SettingsPanel = styled.div`
  position: absolute;
  top: 120px;
  right: 20px;
  background-color: ${(props) => props.theme.backgroundColor};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: ${(props) => (props.isVisible ? 'block' : 'none')};
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: ${(props) => (props.isVisible ? '1' : '0')};
  transform: ${(props) => (props.isVisible ? 'translateY(0)' : 'translateY(-20px)')};
`;

// Theme Controls Styling
const ThemeControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  font-size: 18px;
`;

const ThemeSlider = styled.input`
  width: 250px;
  height: 20px;
  border-radius: 10px;
  background: ${(props) => `linear-gradient(to right, #fff, #ccc, #333)`};
  appearance: none;
  outline: none;
  transition: background-color 0.1s ease;

  &:hover {
    transform: scale(1.05);
  }

  &::-webkit-slider-runnable-track {
    height: 10px;
    border-radius: 10px;
  }

  &::-webkit-slider-thumb {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: ${(props) => props.theme.secondaryColor}; /* Use the secondary color */
    border: 2px solid #fff;
    cursor: pointer;
    transition: background-color 0.1s ease, transform 0.1s ease;
  }

  &::-moz-range-track {
    height: 10px;
    border-radius: 10px;
  }

  &::-moz-range-thumb {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: ${(props) => props.theme.secondaryColor}; /* Use the secondary color */
    border: 2px solid #fff;
    cursor: pointer;
  }
`;

const ColorPicker = styled.input`
  width: 40px;
  height: 40px;
  border: none;
  background-color: ${(props) => props.theme.secondaryColor};
  cursor: pointer;
  transition: background-color 0.1s ease;
`;

const App = () => {
  const [themeValue, setThemeValue] = useState(0); 
  const [secondaryColor, setSecondaryColor] = useState('#800080'); 
  const [isSettingsVisible, setIsSettingsVisible] = useState(false); 

  useEffect(() => {
    const savedThemeValue = parseFloat(localStorage.getItem('themeValue'));
    const savedColor = localStorage.getItem('secondaryColor');
    if (savedThemeValue !== null) setThemeValue(savedThemeValue);
    if (savedColor) setSecondaryColor(savedColor);
  }, []);

  useEffect(() => {
    localStorage.setItem('themeValue', themeValue);
    localStorage.setItem('secondaryColor', secondaryColor);
  }, [themeValue, secondaryColor]);

  const getBackgroundColor = (value) => {
    const grayValue = Math.floor(255 - value * 255); 
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  };

  const theme = {
    themeValue: themeValue,
    secondaryColor: secondaryColor,
    backgroundColor: getBackgroundColor(themeValue),
  };

  const handleSliderChange = (event) => {
    setThemeValue(parseFloat(event.target.value));
  };

  const handleColorChange = (event) => {
    setSecondaryColor(event.target.value);
  };

  const toggleSettings = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContainer>
          {/* Navbar */}
          <NavbarContainer>
            <NavbarLink to="/">Home</NavbarLink>
            <NavbarLink to="/about">About</NavbarLink>
            <NavbarLink to="/projects">Projects</NavbarLink>
          </NavbarContainer>

          {/* Settings Button */}
          <SettingsButton onClick={toggleSettings}>⚙️</SettingsButton>

          {/* Settings Panel */}
          <SettingsPanel isVisible={isSettingsVisible}>
            <ThemeControls>
              <label>{themeValue < 0.5 ? 'Light Mode' : themeValue > 0.5 ? 'Dark Mode' : 'Gray Mode'}</label>
              <ThemeSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={themeValue}
                onChange={handleSliderChange}
              />
              <ColorPicker
                type="color"
                value={secondaryColor}
                onChange={handleColorChange}
              />
            </ThemeControls>
          </SettingsPanel>

          {/* Page Routing */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
          </Routes>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
};

export default App;