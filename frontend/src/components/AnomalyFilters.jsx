import React from 'react';
import { Paper, Typography, Box, Checkbox, Stack, useTheme } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

const AnomalyFilters = ({ anomalies, selectedIds, onToggle }) => {
  const theme = useTheme();
  if (anomalies.length === 0) return null;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <FilterListIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography 
          variant="overline" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '1px', 
            color: 'text.secondary' 
          }}
        >
          Layer Selection
        </Typography>
      </Stack>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {anomalies.map((item) => {
          const isActive = selectedIds.includes(item.id);
          
          return (
            <Box
              key={item.id}
              onClick={() => onToggle(item.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1,
                borderRadius: '10px',
                cursor: 'pointer',
                border: '1px solid',
                // ADAPTIVE BORDER: Divider color is better than hardcoded #222
                borderColor: isActive ? 'primary.main' : theme.palette.divider,
                bgcolor: isActive 
                  ? 'rgba(12, 93, 215, 0.12)' 
                  : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'rgba(0, 0, 0, 0.03)',
                },
                boxShadow: isActive ? `0 0 12px ${theme.palette.primary.main}44` : 'none',
              }}
            >
              <Checkbox
                size="small"
                checked={isActive}
                sx={{
                  p: 0,
                  mr: 1.5,
                  // ADAPTIVE CHECKBOX: grey when off, primary when on
                  color: theme.palette.text.disabled,
                  '&.Mui-checked': { color: 'primary.main' },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  // ADAPTIVE TEXT: Switch between white/black automatically
                  color: isActive 
                    ? theme.palette.text.primary 
                    : theme.palette.text.secondary,
                  fontSize: '0.85rem',
                }}
              >
                {item.name}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default AnomalyFilters;