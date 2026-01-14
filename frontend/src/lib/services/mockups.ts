import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export type ViewerState = 'folded' | 'partial' | 'open';

export interface MockupOptions {
  brochureName: string;
  includeAttribution?: boolean;
}

const PAGE_WIDTH_MM = 297; // A4 landscape
const PAGE_HEIGHT_MM = 210;
const MARGIN_MM = 15;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - 2 * MARGIN_MM;
const CONTENT_HEIGHT_MM = 160;

/**
 * Capture the viewer at a specific state
 */
async function captureViewerState(
  viewerElement: HTMLElement,
  state: ViewerState
): Promise<string> {
  // The viewerElement should expose a method to set state
  // For now, we'll capture the current state
  const canvas = await html2canvas(viewerElement, {
    scale: 2, // Higher resolution
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
  });

  return canvas.toDataURL('image/png');
}

/**
 * Generate a mockup PDF with multiple views
 */
export async function generateMockupPDF(
  viewerElement: HTMLElement,
  options: MockupOptions
): Promise<Blob> {
  const { brochureName, includeAttribution = true } = options;

  // Create PDF in landscape A4
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Title page
  pdf.setFontSize(24);
  pdf.setTextColor(60, 60, 60);
  pdf.text(brochureName, PAGE_WIDTH_MM / 2, 40, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setTextColor(128, 128, 128);
  pdf.text('3D Brochure Mockup', PAGE_WIDTH_MM / 2, 55, { align: 'center' });

  // Capture current view
  const viewImage = await captureViewerState(viewerElement, 'folded');

  // Add image to first page (centered below title)
  const imgData = viewImage;
  const imgWidth = CONTENT_WIDTH_MM;
  const imgHeight = CONTENT_HEIGHT_MM;
  const imgX = (PAGE_WIDTH_MM - imgWidth) / 2;
  const imgY = 70;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);

  // Attribution footer
  if (includeAttribution) {
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text(
      'Created with Open Brochure - openbrochure.com',
      PAGE_WIDTH_MM / 2,
      PAGE_HEIGHT_MM - 10,
      { align: 'center' }
    );
  }

  // Add additional pages for different views
  // Page 2: Another view angle (if available)
  pdf.addPage();

  pdf.setFontSize(16);
  pdf.setTextColor(60, 60, 60);
  pdf.text('Brochure Preview', PAGE_WIDTH_MM / 2, 20, { align: 'center' });

  // Add same image (in real implementation, different angles)
  pdf.addImage(imgData, 'PNG', imgX, 30, imgWidth, imgHeight);

  if (includeAttribution) {
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text(
      'Created with Open Brochure - openbrochure.com',
      PAGE_WIDTH_MM / 2,
      PAGE_HEIGHT_MM - 10,
      { align: 'center' }
    );
  }

  // Page 3: Info page
  pdf.addPage();

  pdf.setFontSize(16);
  pdf.setTextColor(60, 60, 60);
  pdf.text('About This Mockup', PAGE_WIDTH_MM / 2, 40, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);

  const infoLines = [
    `Brochure Name: ${brochureName}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    'This mockup was created with Open Brochure, a free tool for',
    'creating interactive tri-fold brochure presentations.',
    '',
    'Visit openbrochure.com to create your own brochures.',
  ];

  let yPos = 60;
  infoLines.forEach((line) => {
    pdf.text(line, PAGE_WIDTH_MM / 2, yPos, { align: 'center' });
    yPos += 8;
  });

  if (includeAttribution) {
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text(
      'Created with Open Brochure - openbrochure.com',
      PAGE_WIDTH_MM / 2,
      PAGE_HEIGHT_MM - 10,
      { align: 'center' }
    );
  }

  return pdf.output('blob');
}

/**
 * Download the mockup PDF
 */
export async function downloadMockupPDF(
  viewerElement: HTMLElement,
  brochureName: string
): Promise<void> {
  const blob = await generateMockupPDF(viewerElement, { brochureName });

  const filename = `${brochureName.toLowerCase().replace(/\s+/g, '-')}-mockup.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Download original file from URL
 */
export async function downloadOriginalFile(
  fileUrl: string,
  filename: string
): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch {
    // Fallback: open in new tab
    window.open(fileUrl, '_blank');
  }
}
