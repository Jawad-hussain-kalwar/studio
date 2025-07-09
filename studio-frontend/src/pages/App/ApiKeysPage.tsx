import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

/**
 * ApiKeysPage
 * -----------
 * Initial implementation of the API Keys management screen.
 *
 * This page mirrors the layout in the provided design screenshot:
 *   1. Header with page title and "Create API key" button
 *   2. Quick-start CURL snippet for fast testing
 *   3. Table listing existing keys (placeholder data for now)
 *
 * Later iterations will integrate real data via backend endpoints.
 */
const ApiKeysPage: React.FC = () => {
  // TODO: Replace with API call once backend implementation exists
  const apiKeys = [
    {
      projectNumber: '…0494',
      projectName: 'Gemini API',
      apiKey: '…BYBs',
      created: 'Feb 18, 2025',
      plan: 'Free',
    },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        pt: { xs: '72px', sm: '80px' }, // offset for fixed TopBar
        px: { xs: 2, sm: 4 },
        pb: 4,
        boxSizing: 'border-box',
        gap: 3,
      }}
    >
      {/* Header Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" fontWeight={600}>
          API Keys
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} size="medium">
          Create API key
        </Button>
      </Box>

      {/* Quick-start Snippet */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          API quickstart guide
        </Typography>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
            borderRadius: 1,
            fontSize: 12,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
{`curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
  "contents": [
    {
      "parts": [
        {
          "text": "Explain how AI works in a few words"
        }
      ]
    }
  ]
}'`}
        </Box>
      </Paper>

      {/* API Keys Table */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Project number</TableCell>
              <TableCell>Project name</TableCell>
              <TableCell>API key</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Plan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.map((row) => (
              <TableRow key={row.apiKey} hover>
                <TableCell>{row.projectNumber}</TableCell>
                <TableCell>{row.projectName}</TableCell>
                <TableCell>{row.apiKey}</TableCell>
                <TableCell>{row.created}</TableCell>
                <TableCell>{row.plan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ApiKeysPage;