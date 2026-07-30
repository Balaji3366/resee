import type jsPDF from "jspdf";

const MARGIN_X = 20;
const MAX_Y = 280;
const PAGE_TOP = 20;

export class PdfCursor {
  private pdf: jsPDF;
  y: number;

  constructor(pdf: jsPDF, startY = PAGE_TOP) {
    this.pdf = pdf;
    this.y = startY;
  }

  private ensureSpace(lineHeight: number) {
    if (this.y + lineHeight > MAX_Y) {
      this.pdf.addPage();
      this.y = PAGE_TOP;
    }
  }

  text(value: string, options: { size?: number; bold?: boolean; x?: number; lineHeight?: number } = {}) {
    const { size = 11, bold = false, x = MARGIN_X, lineHeight = 6 } = options;
    this.pdf.setFont("helvetica", bold ? "bold" : "normal");
    this.pdf.setFontSize(size);

    const width = 210 - x - MARGIN_X;
    const lines: string[] = this.pdf.splitTextToSize(value, width > 0 ? width : 170);

    lines.forEach((line) => {
      this.ensureSpace(lineHeight);
      this.pdf.text(line, x, this.y);
      this.y += lineHeight;
    });
  }

  twoColumn(left: string, right: string, options: { size?: number; bold?: boolean; lineHeight?: number } = {}) {
    const { size = 11, bold = false, lineHeight = 6 } = options;
    this.ensureSpace(lineHeight);
    this.pdf.setFont("helvetica", bold ? "bold" : "normal");
    this.pdf.setFontSize(size);
    this.pdf.text(left, MARGIN_X, this.y);
    this.pdf.text(right, 190, this.y, { align: "right" });
    this.y += lineHeight;
  }

  space(amount = 4) {
    this.y += amount;
  }

  divider() {
    this.ensureSpace(4);
    this.pdf.setDrawColor(180, 180, 180);
    this.pdf.line(MARGIN_X, this.y, 190, this.y);
    this.y += 4;
  }
}
