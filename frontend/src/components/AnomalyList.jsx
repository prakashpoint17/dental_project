import React from "react";
import { Paper, Typography, Box, Stack, useTheme } from "@mui/material";
import RadarIcon from '@mui/icons-material/Radar';

const AnomalyList = ({ anomalies }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!anomalies.length) return null;

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, md: 3 }, // Responsive padding
        height: '100%', 
        bgcolor: isDark ? '#050505' : theme.palette.background.paper, 
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 4,
        transition: 'all 0.3s ease'
      }}
    >
      {/* HEADER */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <RadarIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
        <Typography 
          variant="overline" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '1px', 
            color: 'text.secondary',
            lineHeight: 1.2
          }}
        >
          Spatial Detections
        </Typography>
      </Stack>

      {/* GRID OF CHIPS */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: { xs: 1, sm: 1.5 } // Tighter gap on mobile
      }}>
        {anomalies.map((a, i) => (
          <Box
            key={i}
            sx={{
              px: { xs: 1.5, sm: 2 },
              py: 1,
              // Background adapts to light/dark mode
              bgcolor: isDark ? '#0a0a0a' : 'rgba(0, 0, 0, 0.02)',
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease-in-out',
              cursor: 'default',
              '&:hover': {
                borderColor: 'secondary.main',
                transform: 'translateY(-2px)',
                bgcolor: isDark ? 'rgba(255, 61, 71, 0.05)' : 'rgba(255, 61, 71, 0.02)',
                boxShadow: `0 4px 12px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.05)'}`
              }
            }}
          >
            {/* Status Indicator Dot */}
            <Box sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              bgcolor: 'secondary.main', 
              mr: 1.5,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 0 8px #ff3d47' 
                : '0 0 4px rgba(255, 61, 71, 0.6)' 
            }} />
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.primary', // Theme-aware color
                fontWeight: 700, 
                fontSize: { xs: '0.7rem', sm: '0.8rem' }, // Responsive font size
                whiteSpace: 'nowrap'
              }}
            >
              {a.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default AnomalyList;