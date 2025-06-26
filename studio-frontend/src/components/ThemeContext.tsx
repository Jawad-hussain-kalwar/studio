import { createContext } from "react";

// Theme mode type
export type ThemeMode = "light" | "dark" | "system";

// Theme context interface
export interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
}

// Create theme context
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
