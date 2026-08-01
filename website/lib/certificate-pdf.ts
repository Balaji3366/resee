import jsPDF from "jspdf";

interface CertificateData {
  recipientName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: string;
}

/**
 * Certificates are a single decorative landscape page (centered text,
 * a border), not the multi-page paragraph layout lib/resume-pdf's
 * PdfCursor is built for — so this draws directly with jsPDF instead
 * of reusing that helper.
 */
export function downloadCertificatePdf({
  recipientName,
  courseTitle,
  certificateNumber,
  issuedAt,
}: CertificateData) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  const inkColor: [number, number, number] = [35, 26, 20];
  const amberColor: [number, number, number] = [255, 107, 74];

  pdf.setDrawColor(...inkColor);
  pdf.setLineWidth(1.2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
  pdf.setLineWidth(0.4);
  pdf.rect(14, 14, pageWidth - 28, pageHeight - 28);

  pdf.setTextColor(...amberColor);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("RESEE", centerX, 34, { align: "center" });

  pdf.setTextColor(...inkColor);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text("Certificate of Completion", centerX, 46, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text("This certifies that", centerX, 66, { align: "center" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  pdf.text(recipientName, centerX, 82, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text("has successfully completed the course", centerX, 96, { align: "center" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(courseTitle, centerX, 110, { align: "center" });

  const issuedDate = new Date(issuedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Issued ${issuedDate}`, centerX, 130, { align: "center" });
  pdf.text(`Certificate No. ${certificateNumber}`, centerX, 138, { align: "center" });

  pdf.save(`${courseTitle.replace(/[^a-z0-9]+/gi, "_")}_Certificate.pdf`);
}
