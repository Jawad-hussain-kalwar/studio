import { useTheme } from "./useTheme.tsx";

// Helper hook to get theme-aware background image
export const useThemeBackground = (lightImage: string, darkImage: string) => {
  const { isDark } = useTheme();
  return isDark ? darkImage : lightImage;
};

// Helper hook to get glassmorphism styles
export const useGlassStyles = () => {
  const { isDark } = useTheme();
  return {
    backdropFilter: `blur(${isDark ? "12px" : "20px"})`,
    background: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.6)",
    border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.3)"}`,
  };
};
