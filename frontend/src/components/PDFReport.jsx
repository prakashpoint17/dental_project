import React from "react";
import { Button } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PDFReport = ({ report, originalImage, resultImage }) => {
  
  // Helper to convert blob/url to base64 for jsPDF
  const getBase64Image = (imgUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imgUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.onerror = (e) => reject(e);
    });
  };

  const downloadPDF = async () => {
    if (!report) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const colors = {
      primary: [12, 93, 215],    // Your DentalAI Blue
      text: [30, 41, 59],         // Dark Slate
      secondary: [100, 116, 139], // Muted Slate
      light: [248, 250, 252],     // Clean BG
      danger: [211, 47, 47],
      warning: [237, 108, 2],
      success: [46, 125, 50]
    };

    // --- HEADER ---
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 45, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("CLINICAL ANALYSIS", 15, 22);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("DENTAL AI DIAGNOSTIC RADIOLOGY", 15, 30);
    doc.text(`REF: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth - 15, 22, { align: "right" });
    doc.text(`ISSUED: ${new Date().toLocaleDateString()}`, pageWidth - 15, 30, { align: "right" });

    let y = 55;

    // --- EXECUTIVE SUMMARY ---
    doc.setFillColor(...colors.light);
    doc.roundedRect(15, y, pageWidth - 30, 28, 3, 3, "F");
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("EXECUTIVE SUMMARY", 20, y + 8);
    
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(report.summary || "No summary provided.", pageWidth - 40);
    doc.text(summaryLines, 20, y + 16);

    y += 45;

    // --- RADIOLOGY SECTION ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("RADIOLOGICAL EVIDENCE", 15, y);
    
    const imgWidth = (pageWidth - 40) / 2;
    const imgHeight = 60;

    try {
      if (originalImage) {
        const base64Orig = await getBase64Image(originalImage);
        doc.setFontSize(8);
        doc.setTextColor(...colors.secondary);
        doc.text("ORIGINAL RADIOGRAPH", 15, y + 5);
        doc.addImage(base64Orig, "JPEG", 15, y + 8, imgWidth, imgHeight);
      }
      if (resultImage) {
        const base64Res = await getBase64Image(resultImage);
        doc.text("AI DIAGNOSTIC MASK", 15 + imgWidth + 10, y + 5);
        doc.addImage(base64Res, "JPEG", 15 + imgWidth + 10, y + 8, imgWidth, imgHeight);
      }
    } catch (e) {
      console.error("Image processing error", e);
    }

    y += 85;

    // --- FINDINGS TABLE ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text("DETAILED PATHOLOGY FINDINGS", 15, y);
    
    const tableData = report.detailed_findings?.map((f) => [
      f.tooth_number,
      f.tooth_name,
      f.condition,
      f.severity,
      f.treatment
    ]);

    autoTable(doc, {
      startY: y + 5,
      head: [["FDI", "Anatomical Tooth", "Condition", "Severity", "Clinical Plan"]],
      body: tableData || [],
      theme: 'grid',
      headStyles: { fillColor: colors.primary, fontSize: 9, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        3: { halign: 'center', fontStyle: 'bold' }
      },
      didDrawCell: (data) => {
        // Color code the Severity cell
        if (data.section === 'body' && data.column.index === 3) {
          const val = data.cell.raw.toLowerCase();
          if (val === 'high') doc.setTextColor(...colors.danger);
          else if (val === 'moderate') doc.setTextColor(...colors.warning);
          else doc.setTextColor(...colors.success);
        }
      }
    });

    // --- PAGE 2: CLINICAL NARRATIVE ---
    doc.addPage();
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 15, "F");

    y = 30;
    doc.setTextColor(...colors.primary);
    doc.setFontSize(14);
    doc.text("DETAILED CLINICAL NARRATIVE", 15, y);
    
    y += 12;
    doc.setTextColor(...colors.text);
    report.report_Summary?.forEach((point) => {
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 30;
      }
      doc.setFillColor(...colors.primary);
      doc.circle(17, y - 1, 0.8, "F");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(point, pageWidth - 35);
      doc.text(lines, 22, y);
      y += (lines.length * 5) + 4;
    });

    // --- RECOMMENDATIONS ---
    y += 10;
    if (y > pageHeight - 60) { doc.addPage(); y = 30; }
    
    doc.setFillColor(241, 245, 249);
    const recHeight = (report.recommendations?.length * 8) + 15;
    doc.roundedRect(15, y, pageWidth - 30, recHeight, 2, 2, "F");
    
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "bold");
    doc.text("REQUIRED FOLLOW-UP & RECOMMENDATIONS", 20, y + 8);
    
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "normal");
    report.recommendations?.forEach((rec, i) => {
      doc.text(`${i + 1}. ${rec}`, 25, y + 18 + (i * 7));
    });

    // --- FOOTER ---
    const footerY = pageHeight - 30;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, footerY, pageWidth - 15, footerY);
    
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    const disclaimer = "DISCLAIMER: This document is an AI-assisted diagnostic report. Final clinical decisions must be verified by a board-certified dental professional via physical examination.";
    doc.text(disclaimer, pageWidth / 2, pageHeight - 15, { align: "center", maxWidth: pageWidth - 40 });

    doc.save(`DentalReport_${new Date().getTime()}.pdf`);
  };

  return (
    <Button
      variant="contained"
      fullWidth
      startIcon={<PictureAsPdfIcon />}
      onClick={downloadPDF}
      disabled={!report}
      sx={{ 
        mt: 2, 
        py: 1.8, 
        background: 'linear-gradient(45deg, #0c5dd7 30%, #448aff 90%)',
        color: "white",
        fontWeight: 800,
        borderRadius: 2,
        boxShadow: "0 8px 16px rgba(12, 93, 215, 0.2)",
        '&:hover': { transform: 'translateY(-1px)', boxShadow: "0 12px 20px rgba(12, 93, 215, 0.3)" }
      }}
    >
      Download Clinical PDF
    </Button>
  );
};

export default PDFReport;