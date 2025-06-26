import React, { useState, useEffect, useMemo } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  useMediaQuery,
  CssBaseline,
} from "@mui/material";
import { ThemeContext, type ThemeMode, type ThemeContextType } from "./ThemeContext.tsx";

// Get initial theme mode from localStorage or default to system
const getInitialMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem("studio-theme-mode");
    if (stored && ["light", "dark", "system"].includes(stored)) {
      return stored as ThemeMode;
    }
  } catch (error) {
    console.warn("Failed to read theme from localStorage:", error);
  }
  return "system";
};

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);

  // Determine if dark mode should be active
  const isDark = mode === "dark" || (mode === "system" && systemPrefersDark);

  // Set mode with localStorage persistence
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem("studio-theme-mode", newMode);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  };

  // Toggle between light and dark (sets explicit mode, not system)
  const toggleMode = () => {
    const newMode = isDark ? "light" : "dark";
    setMode(newMode);
  };

  // Create MUI theme with brand colors and responsive mode
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          primary: {
            main: "#009688", // Teal color from styles.md
            dark: "#00695c",
            light: "#4db6ac",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#CDDC39", // Lime-yellow color from styles.md
            dark: "#9e9d24",
            light: "#dce775",
            contrastText: "#000000",
          },
          background: {
            default: isDark ? "#121212" : "#fafafa",
            paper: isDark ? "#1e1e1e" : "#ffffff",
          },
          // Custom colors for glassmorphism
          ...(isDark
            ? {
                // Dark mode custom colors
                customGlass: {
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "rgba(255, 255, 255, 0.1)",
                  blur: "12px",
                },
              }
            : {
                // Light mode custom colors
                customGlass: {
                  background: "rgba(255, 255, 255, 0.6)",
                  border: "rgba(255, 255, 255, 0.3)",
                  blur: "20px",
                },
              }),
        },
        typography: {
          // Reduce overall scale for a more compact interface
          fontSize: 10, // smaller default body font size (px)
          fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
            fontSize: '2rem',
          },
          h2: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
            fontSize: '1.4rem',
          },
          h3: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
          },
          h4: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
            fontSize: '1.1rem',
          },
          h5: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
            fontSize: '1.0rem',
          },
          h6: {
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
            fontSize: '0.8rem',
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
                textTransform: "none", // Preserve original case
                fontWeight: 400,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
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
          // Ensure navigation surfaces have square edges (no outside rounded corners)
          MuiAppBar: {
            styleOverrides: {
              root: {
                borderRadius: 0,
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                borderRadius: 0,
              },
            },
          },
        },
      }),
    [isDark]
  );

  // Update document data-theme attribute for CSS custom properties
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
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
