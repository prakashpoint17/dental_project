import React, { useState } from 'react';
import { Box, Typography, Stack, IconButton, useTheme } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const FileUpload = ({ file, onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const theme = useTheme();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
        sx={{
          border: '2px dashed',
          borderColor: isDragging 
            ? 'primary.main' 
            : (file ? 'success.main' : theme.palette.divider),
          borderRadius: 4,
          p: 3,
          minHeight: '180px', // Forces consistency so components below don't jump
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragging ? 'rgba(12, 93, 215, 0.08)' : 'transparent',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          },
        }}
      >
        <input
          id="file-input"
          type="file"
          hidden
          onChange={(e) => onFileSelect(e.target.files[0])}
          accept="image/*"
        />

        {!file ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: 300,   // ✅ IMPORTANT: fixes visual centering
              mx: 'auto'
            }}
          >
            <CloudUploadIcon
              sx={{
                fontSize: 48,
                color: 'text.secondary',
                mb: 1,
              }}
            />

                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Drag & drop image here, or{" "}
                  <span style={{ color: theme.palette.primary.main }}>browse</span>
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Supports OPG, Bitewing, and Periapical X-rays
                </Typography>
              </Box>
            </Stack>
          ) : (
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center" 
            justifyContent="center"
            sx={{ 
              width: '100%',
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: 'background.paper'
            }}
          >
            <InsertDriveFileIcon color="primary" />
            <Box sx={{ textAlign: 'left', flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: 'text.primary' }}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              sx={{ color: 'error.main' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default FileUpload;