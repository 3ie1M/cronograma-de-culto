import html2canvas from 'html2canvas';
// html2pdf.js does not ship its own .d.ts, so we use @ts-expect-error where needed
// rather than a blanket @ts-ignore. A proper declaration would live in html2pdf.d.ts.

const isDark = () => document.documentElement.classList.contains('dark');

/** Temporarily hides edit-mode UI (drag handles, delete buttons, add-block bar)
 *  so the exported image/PDF is clean. */
function withExportMode(fn: () => Promise<void>): Promise<void> {
  const root = document.getElementById('schedule-preview');
  if (root) root.setAttribute('data-exporting', 'true');
  return fn().finally(() => {
    if (root) root.removeAttribute('data-exporting');
  });
}

export const exportToPNG = (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return Promise.resolve();

  return withExportMode(async () => {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: isDark() ? '#0f172a' : '#f8fafc',
      // Ignore elements tagged for export-only hiding
      ignoreElements: el => el.getAttribute('data-export-ignore') === 'true',
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${filename}.png`;
    link.click();
  });
};

export const exportToPDF = (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return Promise.resolve();

  return withExportMode(async () => {
    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
      margin: 10,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark() ? '#0f172a' : '#f8fafc',
        ignoreElements: (el: Element) => el.getAttribute('data-export-ignore') === 'true',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };

    await html2pdf().set(opt).from(element).save();
  });
};
