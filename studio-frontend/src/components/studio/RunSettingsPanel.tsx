import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useStudioStore } from '../../stores/studioStore';

interface RunSettingsPanelProps {
  // Remove open and onClose props since it's now permanent
}

const PANEL_WIDTH = 360;

// Mock model data
const availableModels = [
  {
    id: 'gemini-2.5-flash-preview-04-17',
    name: 'Gemini 2.5 Flash Preview 04-17',
    description: 'Latest preview model with enhanced capabilities',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Advanced reasoning and long context',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient for most tasks',
  },
];

const toolDefinitions = [
  { key: 'url-context', label: 'URL context', description: 'Fetch information from web links' },
  { key: 'speech-generation', label: 'Native speech generation', description: 'Text to speech conversion' },
  { key: 'audio-dialog', label: 'Live audio-to-audio dialog', description: 'Real-time audio conversations' },
  { key: 'image-generation', label: 'Native image generation', description: 'Text to image creation' },
  { key: 'grounding-google-search', label: 'Grounding with Google Search', description: 'Enhanced responses with search' },
  { key: 'function-calling', label: 'Function calling', description: 'Execute custom functions' },
  { key: 'code-execution', label: 'Code execution', description: 'Run and execute code' },
];

const RunSettingsPanel: React.FC<RunSettingsPanelProps> = () => {
  const {
    currentModel,
    temperature,
    topP,
    tools,
    tokenCount,
    setCurrentModel,
    setTemperature,
    setTopP,
    toggleTool,
  } = useStudioStore();

  const enabledToolsCount = Object.values(tools).filter(Boolean).length;

  return (
    <Box
      sx={{
        width: PANEL_WIDTH,
        height: '100%',
        bgcolor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: { xs: 'none', md: 'flex' }, // Hide on mobile, show on desktop
        flexDirection: 'column',
        flexShrink: 0, // Prevent shrinking
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <SettingsIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Run settings
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {/* Model Selection */}
          <Box sx={{ mb: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={currentModel}
                onChange={(e) => setCurrentModel(e.target.value)}
                label="Model"
              >
                {availableModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {model.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {model.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Token Count Display */}
          <Box
            sx={{
              mb: 4,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: alpha('#009688', 0.02),
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Token count
            </Typography>
            <Typography variant="h6" color="primary">
              {tokenCount.total.toLocaleString()} / 1,048,576
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Prompt: {tokenCount.prompt.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Response: {tokenCount.completion.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Temperature */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Temperature
            </Typography>
            <Slider
              value={temperature}
              onChange={(_, value) => setTemperature(value as number)}
              min={0}
              max={2}
              step={0.1}
              marks={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' },
              ]}
              valueLabelDisplay="auto"
              sx={{
                '& .MuiSlider-thumb': {
                  bgcolor: 'primary.main',
                },
                '& .MuiSlider-track': {
                  bgcolor: 'primary.main',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Controls randomness. Lower values are more focused and deterministic.
            </Typography>
          </Box>

          {/* Tools Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle2">
                Tools
              </Typography>
              {enabledToolsCount > 0 && (
                <Chip
                  label={enabledToolsCount}
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {toolDefinitions.map((tool) => (
                <FormControlLabel
                  key={tool.key}
                  control={
                    <Switch
                      checked={tools[tool.key] || false}
                      onChange={() => toggleTool(tool.key)}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'primary.main',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {tool.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tool.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', m: 0 }}
                />
              ))}
            </Box>
          </Box>

          {/* Advanced Settings */}
          <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Advanced settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Top P */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Top P
                </Typography>
                <Slider
                  value={topP}
                  onChange={(_, value) => setTopP(value as number)}
                  min={0}
                  max={1}
                  step={0.05}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 0.5, label: '0.5' },
                    { value: 1, label: '1' },
                  ]}
                  valueLabelDisplay="auto"
                  sx={{
                    '& .MuiSlider-thumb': {
                      bgcolor: 'primary.main',
                    },
                    '& .MuiSlider-track': {
                      bgcolor: 'primary.main',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Controls nucleus sampling. Lower values are more focused.
                </Typography>
              </Box>

              {/* Safety Settings */}
              <Accordion elevation={0} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">Safety settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary">
                    Safety settings configuration will be available soon.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
};

export default RunSettingsPanel; 