import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setThemeForScreen: (screen: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with dark theme for auth pages
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Function to apply theme immediately to DOM
  const applyThemeToDOM = (newTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove both theme classes
    root.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');
    
    // Add the new theme class immediately
    root.classList.add(newTheme);
    root.setAttribute('data-theme', newTheme);
    body.classList.add(newTheme);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = () => {
    // Keep toggle function for compatibility, but it won't be used
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const setThemeForScreen = (screen: string) => {
    // Force light mode for spreadsheet, dark mode for all other screens
    const newTheme = screen === 'app' ? 'light' : 'dark';
    
    // Apply theme immediately to DOM before state update
    applyThemeToDOM(newTheme);
    
    // Then update state
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeForScreen }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
