import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const isDark = () => document.documentElement.classList.contains('dark');

/** During export, hide edit-mode chrome (drag handles, buttons, "add block" bar). */
async function withExportMode<T>(fn: () => Promise<T>): Promise<T> {
  const root = document.getElementById('schedule-preview');
  if (root) root.setAttribute('data-exporting', 'true');
  try {
    return await fn();
  } finally {
    if (root) root.removeAttribute('data-exporting');
  }
}

/** Capture an element as a high-res canvas. */
async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: isDark() ? '#0f172a' : '#f8fafc',
    // Small scroll to ensure element is fully in view before capture
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
  });
}

export const exportToPNG = (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return Promise.resolve();

  return withExportMode(async () => {
    const canvas = await captureElement(element);
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

export const exportToPDF = (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return Promise.resolve();

  return withExportMode(async () => {
    const canvas = await captureElement(element);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // A4 in mm: 210 x 297. We set PDF page width to 210mm.
    const pdfWidth = 210;
    const margin = 10; // mm
    const usableWidth = pdfWidth - margin * 2;

    // Scale image to fit usable width, then compute needed height
    const ratio = imgHeight / imgWidth;
    const scaledHeight = usableWidth * ratio;

    const pageHeight = 297; // A4 height in mm
    const usablePageHeight = pageHeight - margin * 2;

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    // If the content fits on one page, place it directly
    if (scaledHeight <= usablePageHeight) {
      pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, scaledHeight);
    } else {
      // Split across multiple pages
      // Each page represents a slice of the canvas
      const pageHeightPx = (usablePageHeight / usableWidth) * imgWidth;
      let yOffset = 0;

      while (yOffset < imgHeight) {
        const sliceHeight = Math.min(pageHeightPx, imgHeight - yOffset);

        // Draw only the slice on a temporary canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgWidth;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, yOffset, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        const sliceHeightMm = (sliceHeight / imgWidth) * usableWidth;

        if (yOffset > 0) pdf.addPage();
        pdf.addImage(sliceData, 'JPEG', margin, margin, usableWidth, sliceHeightMm);

        yOffset += sliceHeight;
      }
    }

    pdf.save(`${filename}.pdf`);
  });
};
