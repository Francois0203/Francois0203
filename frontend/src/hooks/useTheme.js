import { useState, useEffect } from 'react';

const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        // Check if there's a saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        // Update document attribute when theme changes
        document.documentElement.setAttribute('primary-theme', theme);
        // Save theme preference
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
};

export default useTheme;
