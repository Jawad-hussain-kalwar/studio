import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  useMediaQuery,
  CssBaseline,
} from '@mui/material';

// Theme mode type
type ThemeMode = 'light' | 'dark' | 'system';

// Theme context interface
interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Get initial theme mode from localStorage or default to system
const getInitialMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem('studio-theme-mode');
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as ThemeMode;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return 'system';
};

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);

  // Determine if dark mode should be active
  const isDark = mode === 'dark' || (mode === 'system' && systemPrefersDark);

  // Set mode with localStorage persistence
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('studio-theme-mode', newMode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  // Toggle between light and dark (sets explicit mode, not system)
  const toggleMode = () => {
    const newMode = isDark ? 'light' : 'dark';
    setMode(newMode);
  };

  // Create MUI theme with brand colors and responsive mode
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: {
            main: '#006d77',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#cddc39',
            contrastText: '#000000',
          },
          background: {
            default: isDark ? '#121212' : '#fafafa',
            paper: isDark ? '#1e1e1e' : '#ffffff',
          },
          // Custom colors for glassmorphism
          ...(isDark
            ? {
                // Dark mode custom colors
                customGlass: {
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'rgba(255, 255, 255, 0.1)',
                  blur: '12px',
                },
              }
            : {
                // Light mode custom colors
                customGlass: {
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: 'rgba(255, 255, 255, 0.3)',
                  blur: '20px',
                },
              }),
        },
        typography: {
          fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
          },
          h2: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
          },
          h3: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
          },
          h4: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
          },
          h5: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
          },
          h6: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12, // 12px universal border radius from styles.md
        },
        components: {
          // Global component overrides
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                textTransform: 'none', // Preserve original case
                fontWeight: 500,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
        },
      }),
    [isDark]
  );

  // Update document data-theme attribute for CSS custom properties
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const contextValue: ThemeContextType = {
    mode,
    setMode,
    toggleMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Helper hook to get theme-aware background image
export const useThemeBackground = (lightImage: string, darkImage: string) => {
  const { isDark } = useTheme();
  return isDark ? darkImage : lightImage;
};

// Helper hook to get glassmorphism styles
export const useGlassStyles = () => {
  const { isDark } = useTheme();
  return {
    backdropFilter: `blur(${isDark ? '12px' : '20px'})`,
    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'}`,
  };
}; 