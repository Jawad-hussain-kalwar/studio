import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ExpandMoreOutlined as ExpandMoreIcon, ScienceOutlined as ScienceIcon } from '@mui/icons-material';

/**
 * ImageRunSettingsPanel
 * ---------------------
 * Permanent sidebar panel that exposes Stable-Diffusion style parameters.
 * Modeled after RunSettingsPanel but trimmed for diffusion models.
 */
const PANEL_WIDTH = 320;

// Available diffusion / image models – this will eventually come from API
const availableModels: Array<{ id: string; name: string; provider: string }> = [
  { id: 'sdxl', name: 'Stable Diffusion XL', provider: 'StabilityAI' },
  { id: 'sdxl-lightning', name: 'SDXL-Lightning', provider: 'StabilityAI' },
  { id: 'flux-schnell', name: 'Flux Schnell', provider: 'Flux' },
  { id: 'flux-pro', name: 'Flux Pro', provider: 'Flux' },
];

const aspectRatios = [
  { label: '1:1', value: '1:1' },
  { label: '3:2', value: '3:2' },
  { label: '2:3', value: '2:3' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
];

const samplers = [
  'Euler',
  'Euler a',
  'DPM++ 2M',
  'DPM++ SDE',
  'DDIM',
  'UniPC',
];

const ImageRunSettingsPanel: React.FC = () => {
  // --- Controlled local state (could be migrated to zustand later) ---
  const [model, setModel] = useState<string>('sdxl');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [steps, setSteps] = useState<number>(30);
  const [cfgScale, setCfgScale] = useState<number>(7.5);
  const [sampler, setSampler] = useState<string>('Euler');
  const [seed, setSeed] = useState<number>(-1);
  const [hiresFix, setHiresFix] = useState<boolean>(false);

  return (
    <Box
      sx={{
        width: PANEL_WIDTH,
        height: '100%',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? 'rgb(255,255,255)' : 'rgb(0,0,0)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderLeft: 'none',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        flexShrink: 0,
        pt: { xs: '56px', sm: '64px' },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ScienceIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Image settings
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', px: 3, pt: 1, pb: 3 }}>
          {/* Model */}
          <Box sx={{ mb: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select value={model} onChange={(e) => setModel(e.target.value)} label="Model">
                {availableModels.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    <Typography variant="body2" fontWeight={500}>
                      {m.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {m.provider}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Negative prompt */}
          <Box sx={{ mb: 4 }}>
            <TextField
              label="Negative prompt"
              multiline
              minRows={2}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              fullWidth
            />
          </Box>

          {/* Aspect ratio */}
          <Box sx={{ mb: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Aspect ratio</InputLabel>
              <Select
                value={aspectRatio}
                label="Aspect ratio"
                onChange={(e) => setAspectRatio(e.target.value)}
              >
                {aspectRatios.map((ar) => (
                  <MenuItem key={ar.value} value={ar.value}>
                    {ar.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Steps */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Steps: {steps}
            </Typography>
            <Slider
              value={steps}
              onChange={(_, v) => setSteps(v as number)}
              min={1}
              max={150}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* CFG Scale */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Guidance scale (CFG): {cfgScale.toFixed(1)}
            </Typography>
            <Slider
              value={cfgScale}
              onChange={(_, v) => setCfgScale(v as number)}
              min={1}
              max={20}
              step={0.5}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Sampler + Seed */}
          <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Advanced</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Sampler */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Sampler</InputLabel>
                  <Select value={sampler} label="Sampler" onChange={(e) => setSampler(e.target.value)}>
                    {samplers.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Seed */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Seed (-1 random)"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value, 10) || -1)}
                  fullWidth
                />
              </Box>

              {/* Hires fix toggle */}
              <FormControlLabel
                control={<Switch checked={hiresFix} onChange={(_, c) => setHiresFix(c)} />}
                label="High-res fix"
              />
            </AccordionDetails>
          </Accordion>

          {/* Placeholder generate button – the actual action will live in main area */}
          <Typography variant="caption" color="text.secondary">
            Generation is triggered from the main canvas.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ImageRunSettingsPanel; 