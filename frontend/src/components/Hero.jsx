import React from 'react';
import { Box, Typography, Stack, Container } from '@mui/material';

const Hero = () => {
  return (
    <Box sx={{ 
      textAlign: 'center', 
      py: { xs: 4, md: 6 }, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <Container maxWidth="md">
        {/* Main Title - Matching the Alzheimer MRI Bold Style */}
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '-0.04em',
            mb: 1,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000'
          }}
        >
          Dental AI Classifier
        </Typography>

        {/* Subtitle - Using your "Smarter Care" vibe */}
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'primary.main', 
            fontWeight: 600, 
            mb: 4,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: { xs: '0.9rem', md: '1.1rem' }
          }}
        >
          Early Detection. Smarter Dental Care.
        </Typography>

        {/* Hero Image Container - Adding a professional reflection/glow */}
        <Box sx={{ 
          position: 'relative',
          width: '60%',  //img size
          maxWidth: '700px',
          mx: 'auto',
          mb: 2,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -20,
            left: '10%',
            width: '80%',
            height: '40px',
            background: 'radial-gradient(ellipse at center, rgba(220, 232, 251, 0.2) 0%, rgba(0,0,0,0) 70%)',
            zIndex: -1
          }
        }}>
          <Box
            component="img"
            src="src/assets/pngwing.com (5).png" // Ensure your PNG is in the public folder
            alt="Dental AI Analysis"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 4,
              filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.5))',
              transition: 'transform 0.5s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          />
        </Box>

        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            maxWidth: '600px', 
            mx: 'auto', 
            mt: 4,
            lineHeight: 1.6,
            fontWeight: 500
          }}
        >
          Upload OPG or Intraoral X-rays to get AI-powered screening for 
          Anomalies in seconds.
        </Typography>
      </Container>
    </Box>
  );
};

export default Hero;