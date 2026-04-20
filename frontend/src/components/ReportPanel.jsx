import React from 'react';
import {
  Paper, Typography, Box, Divider,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Chip, Skeleton, Stack, useTheme, Grid
} from "@mui/material";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

const getSeverityColor = (severity) => {
  const s = severity?.toLowerCase();
  if (s === "high") return "error";
  if (s === "moderate") return "warning";
  return "success";
};

const ReportSkeleton = () => (
  <Paper sx={{ p: 3, mt: 3, borderRadius: 4 }}>
    <Skeleton variant="text" sx={{ fontSize: '2rem', width: '60%', mb: 2 }} />
    <Divider sx={{ mb: 3 }} />
    <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 3 }} />
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
    {/* Narrative Skeleton */}
    <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
    <Skeleton variant="text" sx={{ mb: 0.5 }} />
    <Skeleton variant="text" sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width="80%" />
  </Paper>
);

const ReportPanel = ({ report, loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) return <ReportSkeleton />;
  if (!report) return null;

  if (report.error) {
    return (
      <Paper sx={{ p: 3, mt: 3, borderLeft: `6px solid ${theme.palette.error.main}`, borderRadius: 4 }}>
        <Typography color="error" fontWeight="bold">AI Report Unavailable</Typography>
        <Typography variant="body2" color="text.secondary">{report.error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, mt: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h5" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        🦷 Professional Clinical Analysis
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* 1. TOP LEVEL SUMMARY */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="800" color="text.primary" sx={{ mb: 1 }}>
          Clinical Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
          {report.summary}
        </Typography>
      </Box>

      {/* 2. FINDINGS TABLE */}
      <Typography variant="subtitle1" fontWeight="800" color="text.primary" gutterBottom>
        Detailed Findings (FDI Notation)
      </Typography>
      <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 4 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Tooth</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Condition</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.detailed_findings?.map((finding, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={finding.tooth_number} size="small" color="primary" variant="filled" sx={{ fontWeight: 700 }} />
                    <Typography variant="caption" fontWeight={600} color="text.primary">{finding.tooth_name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} color="text.primary">{finding.condition}</Typography>
                  <Typography variant="caption" color="primary" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>
                    Plan: {finding.treatment}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={finding.severity} size="small" color={getSeverityColor(finding.severity)} sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                </TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{finding.notes}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 3. CLINICAL NARRATIVE (The Detailed Report Summary) */}
      {report.report_Summary && (
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <DescriptionOutlinedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight="800">Clinical Narrative</Typography>
          </Stack>
          <Stack spacing={1.5}>
            {report.report_Summary.map((point, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                <Box sx={{ minWidth: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main', mt: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {point}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* 4. RECOMMENDATIONS & SEVERITY */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight="800">Risk Assessment</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1, textAlign: 'center', borderColor: getSeverityColor(report.overall_severity) + '.main', borderWidth: 2 }}>
             <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Overall Severity</Typography>
             <Typography variant="h6" fontWeight={900} color={getSeverityColor(report.overall_severity) + '.main'}>
                {report.overall_severity?.toUpperCase()}
             </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="subtitle1" fontWeight="800">Recommendations</Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1, '& li': { mb: 1, color: 'text.secondary' } }}>
            {report.recommendations?.map((rec, i) => (
              <li key={i}><Typography variant="body2" fontWeight={500}>{rec}</Typography></li>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportPanel;