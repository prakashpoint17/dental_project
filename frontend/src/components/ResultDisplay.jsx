import React from 'react';
import { Box, Typography, Fade, useTheme } from '@mui/material';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

const ResultDisplay = ({ resultImage, preview }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Adaptive background: deep black for dark mode, subtle off-white for light
        bgcolor: isDark ? '#000000' : '#f8f9fa', 
        position: 'relative',
        borderRadius: 'inherit',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* 📡 DIAGNOSTIC HUD OVERLAY */}
      {(resultImage || preview) && (
        <Box sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Box sx={{
            bgcolor: isDark ? 'rgba(12, 93, 215, 0.15)' : 'rgba(12, 93, 215, 0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid',
            borderColor: 'primary.main',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{ 
              width: 8, height: 8, borderRadius: '50%', 
              bgcolor: resultImage ? 'success.main' : 'primary.main',
              boxShadow: resultImage 
                ? `0 0 10px ${theme.palette.success.main}` 
                : `0 0 10px ${theme.palette.primary.main}`,
              animation: resultImage ? 'none' : 'pulse 2s infinite'
            }} />
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 800, 
              letterSpacing: 1 
            }}>
              {resultImage ? 'AI ANALYSIS COMPLETE' : 'WAITING FOR INPUT'}
            </Typography>
          </Box>
        </Box>
      )}

      {/* 🖼️ IMAGE VIEWPORT - Aspect Ratio Fixed */}
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2 // Padding ensures edges aren't clipped by rounded corners
      }}>
        {resultImage ? (
          <Fade in timeout={800}>
            <img 
              src={resultImage} 
              alt="AI Diagnostic" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                width: 'auto',
                height: 'auto',
                objectFit: 'contain', // Maintains ratio
                filter: isDark ? 'contrast(1.1) brightness(1.1)' : 'none' 
              }} 
            />
          </Fade>
        ) : preview ? (
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <img 
              src={preview} 
              alt="X-ray Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                width: 'auto',
                height: 'auto', 
                objectFit: 'contain', 
                opacity: 0.5,
                filter: 'grayscale(100%)'
              }} 
            />
            {/* Scanning Line Animation */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '2px',
              background: `linear-gradient(to right, transparent, ${theme.palette.primary.main}, transparent)`,
              boxShadow: `0 0 15px ${theme.palette.primary.main}`,
              animation: 'scan 3s linear infinite'
            }} />
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <CenterFocusStrongIcon sx={{ 
              fontSize: 80, 
              mb: 2, 
              color: theme.palette.text.disabled,
              opacity: 0.3 
            }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              letterSpacing: 1, 
              color: theme.palette.text.secondary 
            }}>
              AWAITING RADIOGRAPH
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              PLEASE UPLOAD OPG OR INTRAORAL SCAN
            </Typography>
          </Box>
        )}
      </Box>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes scan {
            0% { top: 0%; }
            100% { top: 100%; }
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default ResultDisplay;