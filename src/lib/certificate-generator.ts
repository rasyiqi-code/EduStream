/**
 * @file certificate-generator.ts
 * @description Generate PDF certificates with QR code verification
 */

import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface CertificateData {
  certificateId: string;
  studentName: string;
  courseName: string;
  completionDate: Date;
  instructorName: string;
  score?: number;
  duration?: string; // e.g., "10 hours"
}

/**
 * Generate a unique certificate ID
 */
export function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `CERT-${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Generate certificate PDF
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Background gradient (simulated with rectangles)
  pdf.setFillColor(249, 250, 251); // Light gray
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Border
  pdf.setDrawColor(139, 92, 246); // Primary color
  pdf.setLineWidth(2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner border
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Header decoration
  pdf.setFillColor(139, 92, 246);
  pdf.rect(20, 20, pageWidth - 40, 15, 'F');

  // Title
  pdf.setFontSize(40);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(139, 92, 246);
  pdf.text('SERTIFIKAT', pageWidth / 2, 60, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Ini diberikan kepada', pageWidth / 2, 75, { align: 'center' });

  // Student Name
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.studentName, pageWidth / 2, 95, { align: 'center' });

  // Underline
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(139, 92, 246);
  pdf.line(pageWidth / 2 - 80, 98, pageWidth / 2 + 80, 98);

  // Course completion text
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  pdf.text('telah berhasil menyelesaikan kursus', pageWidth / 2, 110, { align: 'center' });

  // Course Name
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(139, 92, 246);
  pdf.text(data.courseName, pageWidth / 2, 125, { align: 'center' });

  // Details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);

  if (data.score) {
    pdf.text(`Skor: ${data.score}%`, pageWidth / 2, 140, { align: 'center' });
  }

  if (data.duration) {
    pdf.text(`Durasi: ${data.duration}`, pageWidth / 2, 147, { align: 'center' });
  }

  // Completion Date
  const formattedDate = data.completionDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  pdf.text(`Tanggal: ${formattedDate}`, pageWidth / 2, 154, { align: 'center' });

  // Generate QR Code
  const verificationUrl = `${window.location.origin}/certificate/verify/${data.certificateId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
  });

  // Add QR code
  const qrSize = 30;
  pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth - 50, pageHeight - 50, qrSize, qrSize);

  // QR Code label
  pdf.setFontSize(8);
  pdf.text('Scan untuk verifikasi', pageWidth - 35, pageHeight - 15, { align: 'center' });

  // Certificate ID
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`ID: ${data.certificateId}`, 25, pageHeight - 15);

  // Instructor signature area
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Instruktur:', 40, pageHeight - 40);
  
  pdf.setFont('helvetica', 'italic');
  pdf.text(data.instructorName, 40, pageHeight - 32);
  
  // Signature line
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(35, pageHeight - 30, 85, pageHeight - 30);

  // School name/logo area
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(139, 92, 246);
  pdf.text('MA Alhuda Pangabasen', pageWidth / 2, pageHeight - 25, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Platform E-Learning', pageWidth / 2, pageHeight - 18, { align: 'center' });

  return pdf.output('blob');
}

/**
 * Download certificate as PDF
 */
export async function downloadCertificate(data: CertificateData): Promise<void> {
  const pdfBlob = await generateCertificatePDF(data);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Certificate-${data.studentName}-${data.courseName}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

