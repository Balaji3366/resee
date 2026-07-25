import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export const downloadPDF = (resume: string) => {
  const pdf = new jsPDF();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Improved Resume", 20, 20);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const lines = pdf.splitTextToSize(resume, 170);

  let y = 35;

  lines.forEach((line: string) => {
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(line, 20, y);
    y += 7;
  });

  pdf.save("Improved_Resume.pdf");
};

export const downloadDOCX = async (resume: string) => {
  const paragraphs = resume.split("\n").map((line) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          size: 24,
        }),
      ],
      spacing: {
        after: 120,
      },
    });
  });

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  saveAs(blob, "Improved_Resume.docx");
};