import React, { useState } from "react";
import { Box, Typography, LinearProgress, IconButton, Stack, Fade, useTheme } from "@mui/material";

// --- FIXED INDIVIDUAL IMPORTS ---
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import DeleteIcon from "@mui/icons-material/Delete"; 
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
// --------------------------------

const AudioUpload = ({ audioFile, setAudioFile }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleFile = (file) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    
    let value = 0;
    const interval = setInterval(() => {
      value += Math.floor(Math.random() * 15) + 5;
      if (value >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setUploading(false);
          setAudioFile(file);
        }, 400);
      } else {
        setProgress(value);
      }
    }, 150);
  };

  const removeFile = () => {
    setAudioFile(null);
    setProgress(0);
    setUploading(false);
  };

  return (
    <Box>
      <Typography 
        variant="overline" 
        sx={{ 
          fontWeight: 800, 
          color: 'text.secondary', 
          letterSpacing: 1.5,
          display: 'block',
          mb: 0.5 
        }}
      >
        Multi-Modal Input
      </Typography>

      {/* 1. INITIAL STATE: CLICK TO UPLOAD */}
      {!audioFile && !uploading && (
        <Box
          component="label"
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
            px: { xs: 2, sm: 3 }, 
            py: 2,
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: 3,
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : theme.palette.background.paper,
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: isDark ? 'rgba(12, 93, 215, 0.08)' : 'rgba(12, 93, 215, 0.04)',
              transform: 'translateY(-1px)'
            },
            "&:active": { transform: 'translateY(0)' }
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
            <Box sx={{ 
              p: 1, 
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', 
              borderRadius: 2, 
              display: 'flex',
              flexShrink: 0
            }}>
              <MicNoneOutlinedIcon sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary' }}>
                Clinical Voice Note
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                Enhance report with audio context
              </Typography>
            </Box>
          </Stack>
          <input
            hidden
            type="file"
            accept=".mp3,.wav,.mpeg,.m4a,.aac,audio/*"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </Box>
      )}

      {/* 2. PROGRESS STATE: SCANNING SIGNAL */}
      {uploading && (
        <Fade in>
          <Box sx={{ 
            mt: 1, 
            p: 2.5, 
            border: '1px solid',
            borderColor: theme.palette.divider, 
            borderRadius: 3, 
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : theme.palette.background.paper 
          }}>
            <Stack direction="row" justifyContent="space-between" mb={1.5}>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>
                ENCODING SIGNAL...
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800 }}>
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                borderRadius: 1, 
                height: 6,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  background: 'linear-gradient(90deg, #0c5dd7, #448aff)'
                }
              }} 
            />
          </Box>
        </Fade>
      )}

      {/* 3. SUCCESS STATE: FILE ATTACHED */}
      {audioFile && !uploading && (
        <Fade in>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: isDark ? "rgba(46, 125, 50, 0.12)" : "rgba(46, 125, 50, 0.05)",
              border: "1px solid",
              borderColor: isDark ? "rgba(46, 125, 50, 0.4)" : "rgba(46, 125, 50, 0.2)",
              transition: "all 0.3s ease"
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flexGrow: 1 }}>
              <GraphicEqIcon sx={{ 
                color: 'success.main', 
                animation: 'pulse 1.5s infinite',
                fontSize: { xs: 24, sm: 28 },
                flexShrink: 0
              }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  fontWeight="700" 
                  sx={{ 
                    color: 'text.primary', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}
                >
                  {audioFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800, display: 'block' }}>
                  VOICE ENCODING SUCCESSFUL
                </Typography>
              </Box>
            </Stack>

            <IconButton 
              size="small" 
              onClick={removeFile} 
              sx={{ 
                color: 'text.secondary', 
                ml: 1, 
                '&:hover': { color: 'error.main', bgcolor: 'rgba(211, 47, 47, 0.1)' } 
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Fade>
      )}

      <style>
        {`
          @keyframes pulse { 
            0% { opacity: 0.4; transform: scale(0.95); } 
            50% { opacity: 1; transform: scale(1); } 
            100% { opacity: 0.4; transform: scale(0.95); } 
          }
        `}
      </style>
    </Box>
  );
};

export default AudioUpload;