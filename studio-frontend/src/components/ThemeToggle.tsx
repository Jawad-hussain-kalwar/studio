import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  /**
   * Size of the icon button
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Custom styling via sx prop
   */
  sx?: any;
  /**
   * Color of the icon
   */
  color?: 'inherit' | 'default' | 'primary' | 'secondary';
  /**
   * Whether to show system mode option (cycles through light -> dark -> system)
   */
  includeSystemMode?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  sx = {},
  color = 'inherit',
  includeSystemMode = false,
}) => {
  const { mode, setMode, toggleMode, isDark } = useTheme();

  const handleClick = () => {
    if (includeSystemMode) {
      // Cycle through: light -> dark -> system -> light
      if (mode === 'light') {
        setMode('dark');
      } else if (mode === 'dark') {
        setMode('system');
      } else {
        setMode('light');
      }
    } else {
      // Simple toggle between light and dark
      toggleMode();
    }
  };

  const getIcon = () => {
    if (includeSystemMode && mode === 'system') {
      return <SettingsBrightnessIcon />;
    }
    return isDark ? <LightModeIcon /> : <DarkModeIcon />;
  };

  const getTooltip = () => {
    if (includeSystemMode) {
      if (mode === 'light') return 'Switch to dark mode';
      if (mode === 'dark') return 'Switch to system mode';
      return 'Switch to light mode';
    }
    return isDark ? 'Switch to light mode' : 'Switch to dark mode';
  };

  return (
    <Tooltip title={getTooltip()}>
      <IconButton
        onClick={handleClick}
        size={size}
        color={color}
        sx={{
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          ...sx,
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
}; 