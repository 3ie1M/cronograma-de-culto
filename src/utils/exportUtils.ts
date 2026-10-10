import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/** Capture an element by cloning it into a fixed-width container to ensure layout stability (like escala-coqueiral). */
async function captureElementCloned(elementId: string): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const original = document.getElementById(elementId);
    if (!original) {
      resolve(null);
      return;
    }

    const wasDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.top = '-9999px';
    printContainer.style.left = '0';
    printContainer.style.width = '800px'; // Largura fixa para garantir layout
    printContainer.style.background = '#ffffff';
    printContainer.style.padding = '20px';

    // To apply data-exporting to hide UI chrome
    original.setAttribute('data-exporting', 'true');
    const clone = original.cloneNode(true) as HTMLElement;
    original.removeAttribute('data-exporting');

    printContainer.appendChild(clone);
    document.body.appendChild(printContainer);

    // Aguarda renderização
    setTimeout(() => {
      html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff' // Garante fundo branco
      }).then((canvas) => {
        document.body.removeChild(printContainer);
        if (wasDark) document.documentElement.classList.add('dark');
        resolve(canvas);
      });
    }, 100);
  });
}

export const exportToPNG = async (elementId: string, filename: string): Promise<void> => {
  const canvas = await captureElementCloned(elementId);
  if (!canvas) return;

  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (elementId: string, filename: string): Promise<void> => {
  const canvas = await captureElementCloned(elementId);
  if (!canvas) return;

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  pdf.save(`${filename}.pdf`);
};
