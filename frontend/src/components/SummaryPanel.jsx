import React from 'react';
import { Paper, Typography, Box, Stack, Divider, useTheme } from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

const SummaryPanel = ({ summary }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!summary) return null;

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, md: 3 }, // Less padding on mobile
        height: '100%', 
        minHeight: { xs: 'auto', md: 200 }, // Responsive height
        bgcolor: isDark ? '#050505' : theme.palette.background.paper, 
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* HEADER SECTION */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <AssessmentOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography 
          variant="overline" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '1px', 
            color: 'text.secondary',
            lineHeight: 1.2
          }}
        >
          Quantitative Analysis
        </Typography>
      </Stack>

      {/* DATA LIST */}
      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        {Object.entries(summary).map(([key, val]) => (
          <Box key={key} sx={{ width: '100%' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 1,
                gap: 1 // Prevents text/number collision on very small screens
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.primary', // Automatically white in dark / black in light
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' } // Slightly smaller on mobile
                }}
              >
                {key}
              </Typography>
              
              <Box sx={{ 
                bgcolor: isDark ? 'rgba(12, 93, 215, 0.15)' : 'rgba(12, 93, 215, 0.08)', 
                color: 'primary.main', 
                px: 1.2, 
                py: 0.4, 
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid',
                borderColor: 'rgba(12, 93, 215, 0.2)',
                fontFamily: 'monospace' // Cleaner for diagnostic numbers
              }}>
                {String(val.count).padStart(2, '0')}
              </Box>
            </Box>
            <Divider sx={{ borderColor: theme.palette.divider, opacity: 0.5 }} />
          </Box>
        ))}
      </Stack>

      {/* FOOTER (Optional - adds balance for height: 100%) */}
      {Object.keys(summary).length === 0 && (
        <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center', mt: 2 }}>
          No detections to summarize.
        </Typography>
      )}
    </Paper>
  );
};

export default SummaryPanel;