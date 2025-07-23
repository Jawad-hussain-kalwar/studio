import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import type { ShowcaseCategory, ShowcaseApplication } from '../../../types/showcase';
import ShowcaseCard from '../../../components/studio/ShowcaseCard';
import ShowcaseFilters from '../../../components/studio/ShowcaseFilters';
import showcaseData from '../../../mock/showcase';

const ShowcasePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ShowcaseCategory | 'all'>('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Filter applications based on active category
  const filteredApplications = useMemo(() => {
    if (activeCategory === 'all') {
      return showcaseData.applications;
    }
    return showcaseData.applications.filter(app => app.category === activeCategory);
  }, [activeCategory]);

  // Handle demo view (placeholder functionality)
  const handleViewDemo = (app: ShowcaseApplication) => {
    setSnackbarMessage(`Demo for "${app.title}" coming soon! This would integrate with your API keys to provide a live demo.`);
    setSnackbarOpen(true);
  };

  // Handle source code view (placeholder functionality)
  const handleViewSource = (app: ShowcaseApplication) => {
    setSnackbarMessage(`Source code for "${app.title}" would open in a new tab with implementation examples.`);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        backgroundColor: (theme) => theme.palette.pageBackground.default,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 6, pb: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              // Gradient text effect matching theme
              background: (theme) => theme.customGradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}
          >
            AI Application Showcase
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              color: 'text.secondary',
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Explore real-world AI applications built with our API platform. 
            Each showcase demonstrates how to leverage our endpoints for different use cases, 
            from creative content generation to business intelligence and productivity tools.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              fontStyle: 'italic',
              mb: 4
            }}
          >
            Get inspired by these examples and use your API keys to build similar applications.
          </Typography>
        </Box>

        {/* Filters */}
        <ShowcaseFilters
          categories={showcaseData.categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Results Count */}
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            color: 'text.secondary',
            fontWeight: 500
          }}
        >
          Showing {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
          {activeCategory !== 'all' && ` in ${showcaseData.categories.find(cat => cat.category === activeCategory)?.label}`}
        </Typography>

        {/* Applications Grid */}
        {filteredApplications.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',                    // 1 column on mobile
                sm: 'repeat(2, 1fr)',         // 2 columns on small screens
                md: 'repeat(3, 1fr)',         // 3 columns on medium screens  
                lg: 'repeat(4, 1fr)',         // 4 columns on large screens
              },
              gap: 3,
            }}
          >
            {filteredApplications.map((application) => (
              <ShowcaseCard
                key={application.id}
                application={application}
                onViewDemo={handleViewDemo}
                onViewSource={handleViewSource}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              No applications found
            </Typography>
            <Typography variant="body2">
              Try selecting a different category or check back later for new showcases.
            </Typography>
          </Box>
        )}

        {/* Featured Section */}
        {activeCategory === 'all' && showcaseData.featuredApps.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mb: 3,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Featured Applications
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',                    // 1 column on mobile
                  sm: 'repeat(2, 1fr)',         // 2 columns on small screens
                  md: 'repeat(4, 1fr)',         // 4 columns on medium+ screens
                },
                gap: 3,
              }}
            >
              {showcaseData.applications
                .filter(app => app.featured)
                .slice(0, 4)
                .map((application) => (
                  <ShowcaseCard
                    key={application.id}
                    application={application}
                    onViewDemo={handleViewDemo}
                    onViewSource={handleViewSource}
                  />
                ))}
            </Box>
          </Box>
        )}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShowcasePage; 