import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  //IconButton,
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
  TextField,
} from '@mui/material';
// import CloseIcon if needed later using direct path
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreOutlined';
import ScienceIcon from '@mui/icons-material/ScienceOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { Suspense, lazy } from 'react';
import { useStudioStore } from '../../stores/studioStore';
import { useModels } from '../../hooks/useChatApi';

type RunSettingsPanelProps = Record<string, never>;

const PANEL_WIDTH = 320;

// Core tool definitions (non-placeholder)
const BASE_TOOL_DEFS = [
  { key: 'url-context', label: 'URL context', description: 'Fetch information from web links', requiresToolsCapability: true },
  { key: 'grounding-google-search', label: 'Grounding with Google Search', description: 'Enhanced responses with search', requiresToolsCapability: true },
  { key: 'function-calling', label: 'Function calling', description: 'Execute custom functions', requiresToolsCapability: true },
  { key: 'code-execution', label: 'Code execution', description: 'Run and execute code', requiresToolsCapability: true },
];

const LazyModelDialog = lazy(() => import('./ModelMetadataDialog'));

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
    setTools,
    setContextLength,
  } = useStudioStore();

  // Fetch available models from backend
  const { data: availableModels = [], isLoading: modelsLoading } = useModels();

  // Resolve the currently selected model object for capability checks
  const selectedModel = availableModels.find((m) => m.id === currentModel);

  // Derived: does the model support generic "tools" capability?
  const toolsCapable = selectedModel?.capabilities?.includes('tools') ?? false;

  // Build runtime tool definition list, adding Vision toggle only when supported
  const toolDefinitions = React.useMemo(() => {
    const defs = [...BASE_TOOL_DEFS];
    if (selectedModel?.capabilities?.includes('vision')) {
      defs.push({ key: 'vision', label: 'Vision', description: 'Enable image understanding', requiresToolsCapability: false });
    }
    return defs;
  }, [selectedModel]);

  // Auto-select first model when models load and no model is selected
  useEffect(() => {
    if (!modelsLoading && availableModels.length > 0 && !currentModel) {
      setCurrentModel(availableModels[0].id);
    }
  }, [availableModels, modelsLoading, currentModel, setCurrentModel]);

  // Effect to reset tools and context length when selectedModel changes
  useEffect(() => {
    if (selectedModel?.contextLength) {
      setContextLength(selectedModel.contextLength);
    }

    // Reset enabled tools to allowed set
    if (selectedModel) {
      const allowedTools: string[] = [];
      if (selectedModel.capabilities?.includes('tools')) {
        allowedTools.push('url-context', 'grounding-google-search', 'function-calling', 'code-execution');
      }
      if (selectedModel.capabilities?.includes('vision')) {
        allowedTools.push('vision');
      }
      const newToolsState: import('../../types').ToolToggleState = {} as import('../../types').ToolToggleState;
      // Loop over all tool keys in current state
      Object.keys(tools).forEach((key) => {
        newToolsState[key] = allowedTools.includes(key) ? tools[key] : false;
      });
      setTools(newToolsState);
    }
  }, [selectedModel]);

  // Local state for smooth slider interaction
  const [localTemperature, setLocalTemperature] = useState(temperature);
  // Local state for text input
  const [inputValue, setInputValue] = useState(temperature.toFixed(1));

  // Sync local state when global temperature changes
  useEffect(() => {
    setLocalTemperature(temperature);
    setInputValue(temperature.toFixed(1));
  }, [temperature]);

  const enabledToolsCount = Object.values(tools).filter(Boolean).length;

  const [detailsOpen, setDetailsOpen] = useState(false);

  /*
   * We used to refetch models every time the dropdown opened. Now that the
   * backend list call is lightweight and React-Query already refetches when
   * the cache becomes stale (5 min), the extra manual refetch is unnecessary
   * network noise, so we removed it.
   */

  return (
    <Box
      sx={{
        width: PANEL_WIDTH,
        height: '100%',
        // Match TopBar glassmorphic background
        backgroundColor: (theme) => theme.palette.mode === 'light'
          ? 'rgb(255,255,255)'
          : 'rgb(0,0,0)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        // Remove the left border outline for a seamless layout
        borderLeft: 'none',
        display: { xs: 'none', md: 'flex' }, // Hide on mobile, show on desktop
        flexDirection: 'column',
        flexShrink: 0, // Prevent shrinking
        pt: { xs: '56px', sm: '64px' }, // Offset for fixed TopBar
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            pb: 2, // Reduce bottom padding since no divider
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ScienceIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Run settings
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', px: 3, pt: 1, pb: 3 }}>
          {/* Model Selection */}
          <Box sx={{ mb: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={currentModel || ''}
                onChange={(e) => setCurrentModel(e.target.value)}
                label="Model"
                disabled={modelsLoading || availableModels.length === 0}
                // Removed onOpen refetch; rely on React-Query’s staleTime
              >
                {availableModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box>
                        {/* Show the model ID (e.g., "llama3") as the main title */}
                        <Typography variant="body2" fontWeight={500}>
                          {model.id}
                        </Typography>
                        {/* Show description if available; otherwise fall back to the computed displayLabel for extra context */}
                        {(model.description || model.displayLabel) && (
                          <Typography variant="caption" color="text.secondary">
                            {model.description ?? model.displayLabel}
                          </Typography>
                        )}
                      </Box>
                      {model.id === currentModel && (
                        <InfoIcon fontSize="small" sx={{ ml: 1, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setDetailsOpen(true); }} />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* No models alert */}
          {(!modelsLoading && availableModels.length === 0) && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="error">
                Ollama is not running or no chat models are available.
              </Typography>
            </Box>
          )}

          {/* Token Count Display */}
          <Box
            sx={{
              mb: 4,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1, // Match model dropdown border radius
              bgcolor: alpha('#009688', 0.02),
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Token count
            </Typography>
            <Typography variant="h6" color="primary">
              {tokenCount.total.toLocaleString()} / {(
                selectedModel?.contextLength ?? 1048576
              ).toLocaleString()}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Slider
                value={localTemperature}
                onChange={(_, value) => setLocalTemperature(value as number)}
                onChangeCommitted={(_, value) => setTemperature(Number((value as number).toFixed(1)))}
                min={0}
                max={2}
                step={0.1}
                valueLabelDisplay="auto"
                sx={{
                  flexGrow: 1,
                  '& .MuiSlider-thumb': {
                    bgcolor: 'primary.main',
                  },
                  '& .MuiSlider-track': {
                    bgcolor: 'primary.main',
                  },
                }}
              />
              <TextField
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  
                  // Allow empty input
                  if (newValue === '') {
                    setInputValue('');
                    return;
                  }
                  
                  // Only allow numbers and one decimal point
                  if (/^\d*\.?\d*$/.test(newValue)) {
                    // Ensure only one decimal point
                    const decimalCount = (newValue.match(/\./g) || []).length;
                    if (decimalCount <= 1) {
                      setInputValue(newValue);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  // Handle Enter key - trigger blur validation
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  
                  // Validate only on blur and correct if needed
                  if (isNaN(value) || value < 0) {
                    const correctedValue = 0.0;
                    setTemperature(correctedValue);
                    setLocalTemperature(correctedValue);
                    setInputValue(correctedValue.toFixed(1));
                  } else if (value > 2.0) {
                    const correctedValue = 2.0;
                    setTemperature(correctedValue);
                    setLocalTemperature(correctedValue);
                    setInputValue(correctedValue.toFixed(1));
                  } else {
                    const roundedValue = Number(value.toFixed(1));
                    setTemperature(roundedValue);
                    setLocalTemperature(roundedValue);
                    setInputValue(roundedValue.toFixed(1));
                  }
                }}
                inputProps={{
                  min: 0,
                  max: 2.0,
                  step: 0.1,
                  style: { 
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    MozAppearance: 'textfield', // Remove arrows in Firefox
                  }
                }}
                size="small"
                sx={{ 
                  width: 80,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1, // Match the model dropdown border radius
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield', // Remove arrows in Firefox
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none', // Remove arrows in Chrome/Safari
                    margin: 0,
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none', // Remove arrows in Chrome/Safari
                    margin: 0,
                  },
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
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
                      disabled={tool.requiresToolsCapability ? !toolsCapable : false}
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
                  labelPlacement="start"
                  sx={{ 
                    alignItems: 'flex-start', 
                    m: 0,
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
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
      {/* Lazy-loaded model details dialog */}
      <Suspense fallback={null}>
        <LazyModelDialog open={detailsOpen} onClose={() => setDetailsOpen(false)} model={selectedModel} />
      </Suspense>
    </Box>
  );
};

export default RunSettingsPanel; 