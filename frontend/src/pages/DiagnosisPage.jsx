import React, { useState, useMemo } from 'react';
import {
  Container, Grid, Button, CircularProgress, Typography,
  Box, AppBar, Toolbar, IconButton, ThemeProvider,
  createTheme, CssBaseline, Paper, Stack, Fade
} from '@mui/material';

import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ShieldMoonIcon from '@mui/icons-material/ShieldMoon';

import axios from 'axios';

import Hero from '../components/Hero.jsx';
import FileUpload from '../components/FileUpload';
import AnomalyFilters from '../components/AnomalyFilters';
import ResultDisplay from '../components/ResultDisplay';
import SummaryPanel from '../components/SummaryPanel.jsx';
import AnomalyList from '../components/AnomalyList.jsx';
import ReportPanel from '../components/ReportPanel.jsx';
import AudioUpload from '../components/AudioUpload.jsx';
import PDFReport from '../components/PDFReport.jsx';

const DentalDashboard = () => {
  const [mode, setMode] = useState('dark');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#0c5dd7' },
      secondary: { main: '#ff3d47' },
      background: {
        default: mode === 'light' ? '#F4F7FA' : '#000000',
        paper: mode === 'light' ? '#FFFFFF' : '#0a0a0a',
      },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      h6: { fontWeight: 800, letterSpacing: '-0.02em' }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: mode === 'dark' ? '1px solid #1a1a1a' : '1px solid #e0e0e0',
            transition: 'all 0.3s ease-in-out',
          }
        }
      }
    }
  }), [mode]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResultImage(null);
    setAnomalies([]);
    setSelectedIds([]);
    setSummary(null);
    setReport(null);
  };

  const generateSummary = (detections) => {
    const sum = {};
    detections.forEach((d) => {
      if (!sum[d.name]) sum[d.name] = { count: 0 };
      sum[d.name].count += 1;
    });
    return sum;
  };

  const runDiagnosis = async (forcedIds = null) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("selected_classes", JSON.stringify(forcedIds || []));
    try {
      const res = await axios.post('http://localhost:8000/diagnose', formData);
      setResultImage(res.data.image);
      if (!forcedIds) {
        setAnomalies(res.data.anomalies);
        setSelectedIds(res.data.anomalies.map(a => a.id));
        setSummary(generateSummary(res.data.all_detections));
        setReport(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!file || anomalies.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("detections", JSON.stringify(anomalies));
    if (audioFile) formData.append("audio", audioFile);
    try {
      const url = audioFile ? 'http://localhost:8000/report-audio' : 'http://localhost:8000/report';
      const res = await axios.post(url, formData);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxToggle = (id) => {
    const updatedIds = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];
    setSelectedIds(updatedIds);
    runDiagnosis(updatedIds);
  };

  return (
  <ThemeProvider theme={theme}>
    <CssBaseline />

    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.82)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar
        sx={{
          minHeight: 72,
          px: { xs: 2, sm: 3, md: 5 },
          maxWidth: '1440px',
          width: '100%',
          mx: 'auto',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
        {/* Icon Wrapper */}
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            p: 0.8, 
            borderRadius: 2, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MedicalServicesIcon sx={{ color: 'white', fontSize: 22 }} />
        </Box>

        {/* Typography Fix */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 800,
            display: 'flex', 
            alignItems: 'center', // Centers text vertically relative to the Box
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            lineHeight: 0, // Removes the text box "tail"
          }}
        >
          DENTAL
          <Box 
            component="span" 
            sx={{ 
              color: 'primary.main',
              ml: 0.5, // Subtle gap between DENTAL and AI
            }}
          >
            AI
          </Box>
        </Typography>
      </Stack>

        <IconButton onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} color="inherit">
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>

    <Box
      component="main"
      sx={{
        width: '100%',
        py: { xs: 3, md: 5 },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            maxWidth: '980px',
            mx: 'auto',
            mb: { xs: 3, md: 5 },
            textAlign: 'center',
          }}
        >
          <Hero />
        </Box>
        
        <Container maxWidth="md">
        <Grid
            // FIXED: Restored the container prop
            spacing={{ xs: 3, md: 4 }}
            justifyContent="center"
            alignItems="flex-start" 
          >
          <Grid item xs={12} md={5} lg={4}>
            <Stack
              spacing={3}
              sx={{
                width: '100%',
                position: { xs: 'static', lg: 'sticky' },
                top: { lg: 96 },
              }}
            >
              <Paper
                sx={{
                  p: { xs: 2.5, sm: 3, md: 4 },
                  width: '100%',
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontWeight: 700, letterSpacing: 1 }}
                  >
                    Diagnostic Entry
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ mt: 0.5, fontWeight: 800, color: 'text.primary' }}
                  >
                    Upload Radiograph
                  </Typography>
                </Box>

                <FileUpload file={file} onFileSelect={handleFileSelect} />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={
                    loading ? <CircularProgress size={20} color="inherit" /> : <AutoGraphIcon />
                  }
                  onClick={() => runDiagnosis()}
                  disabled={!file || loading}
                  sx={{
                    mt: 3,
                    py: 1.8,
                    fontWeight: 700,
                    borderRadius: 3,
                    background: file
                      ? 'linear-gradient(45deg, #0c5dd7 30%, #448aff 90%)'
                      : undefined,
                    boxShadow: file ? '0 8px 24px rgba(12, 93, 215, 0.28)' : 'none',
                  }}
                >
                  {loading ? 'Analyzing Matrix...' : 'Predict Detections'}
                </Button>
              </Paper>

              <Fade in={!!anomalies.length}>
                <Box sx={{ width: '100%' }}>
                  <Paper sx={{ p: { xs: 2.5, sm: 3 }, width: '100%' }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="800"
                      gutterBottom
                      color="text.primary"
                    >
                      FILTER ANOMALIES
                    </Typography>
                    <AnomalyFilters
                      anomalies={anomalies}
                      selectedIds={selectedIds}
                      onToggle={handleCheckboxToggle}
                    />
                  </Paper>
                </Box>
              </Fade>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7} lg={8}>
            <Stack
              spacing={{ xs: 3, md: 4 }}
              sx={{
                width: '100%',
              }}
            >
              <Paper
                sx={{
                  p: { xs: 1.5, sm: 2, md: 3 },
                  borderRadius: 5,
                  overflow: 'hidden',
                  minHeight: { xs: 260, sm: 340, md: 460 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: mode === 'dark' ? '#050505' : '#f6f7fb',
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <ResultDisplay resultImage={resultImage} preview={preview} />
                </Box>
              </Paper>

              <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: '100%' }}>
                    <SummaryPanel summary={summary} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: '100%' }}>
                    <AnomalyList anomalies={anomalies} />
                  </Box>
                </Grid>
              </Grid>

              <Fade in={!!anomalies.length}>
                <Grid container spacing={3} alignItems="stretch">
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        height: '100%',
                        minHeight: 220,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <AudioUpload audioFile={audioFile} setAudioFile={setAudioFile} />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        height: '100%',
                        minHeight: 220,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}
                      >
                        Final Step: Consolidate Findings
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={generateReport}
                        disabled={loading}
                        startIcon={
                          loading ? <CircularProgress size={20} color="inherit" /> : <ShieldMoonIcon />
                        }
                        sx={{
                          py: 1.8,
                          borderRadius: 3,
                          background: 'linear-gradient(45deg, #0c5dd7 30%, #004ba0 90%)',
                        }}
                      >
                        {loading ? 'Generating Report...' : 'Generate Clinical AI Report'}
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </Fade>

              {(report || loading) && (
                <Box sx={{ width: '100%' }}>
                  <ReportPanel report={report} loading={loading} />
                  {report && (
                    <Stack
                      direction="row"
                      justifyContent={{ xs: 'center', sm: 'flex-end' }}
                      sx={{ mt: 3 }}
                    >
                      <PDFReport
                        report={report}
                        originalImage={preview}
                        resultImage={resultImage}
                      />
                    </Stack>
                  )}
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>

        </Container>
        
      </Container>
    </Box>
  </ThemeProvider>
);
};

export default DentalDashboard;