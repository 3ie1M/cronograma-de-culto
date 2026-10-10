import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

/** 
 * Helper to clone an element while preserving the state of inputs, textareas, and selects.
 * cloneNode(true) alone does not copy the .value property of these elements.
 */
function cloneWithInputs(original: HTMLElement): HTMLElement {
  const clone = original.cloneNode(true) as HTMLElement;
  
  const originalInputs = original.querySelectorAll('input, textarea, select');
  const cloneInputs = clone.querySelectorAll('input, textarea, select');
  
  originalInputs.forEach((input, index) => {
    const cloneInput = cloneInputs[index] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (cloneInput) {
      if (input instanceof HTMLInputElement && (input.type === 'checkbox' || input.type === 'radio')) {
        (cloneInput as HTMLInputElement).checked = input.checked;
      } else {
        cloneInput.value = (input as any).value;
      }
    }
  });
  
  return clone;
}

/**
 * Clones the header and the target element into a temporary container for exporting.
 */
function createExportContainer(elementId: string): HTMLElement | null {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) return null;

  const headerElement = document.querySelector('header');

  const printContainer = document.createElement('div');
  printContainer.style.width = '800px';
  printContainer.style.background = '#ffffff';
  printContainer.style.padding = '20px';
  printContainer.style.position = 'absolute';
  printContainer.style.top = '-9999px';
  printContainer.style.left = '0';

  if (headerElement) {
    const headerClone = cloneWithInputs(headerElement);
    // Remove the dark mode toggle button from the header clone if present
    const themeToggleContainer = headerClone.querySelector('.absolute.top-4.right-4');
    if (themeToggleContainer) {
      themeToggleContainer.remove();
    }
    printContainer.appendChild(headerClone);
  }

  const targetClone = cloneWithInputs(targetElement);
  targetClone.setAttribute('data-exporting', 'true');
  printContainer.appendChild(targetClone);

  document.body.appendChild(printContainer);
  return printContainer;
}

/** 
 * Gets the export image data URL natively supporting modern CSS (like Tailwind v4 oklch).
 */
async function getExportImage(elementId: string, format: 'png' | 'jpeg'): Promise<string | null> {
  const printContainer = createExportContainer(elementId);
  if (!printContainer) {
    alert("Elemento não encontrado para captura.");
    return null;
  }

  const wasDark = document.documentElement.classList.contains('dark');
  if (wasDark) document.documentElement.classList.remove('dark');

  try {
    const options = {
      backgroundColor: '#ffffff',
      pixelRatio: 2, // High resolution
    };
    
    let dataUrl = '';
    if (format === 'jpeg') {
      dataUrl = await toJpeg(printContainer, { ...options, quality: 0.95 });
    } else {
      dataUrl = await toPng(printContainer, options);
    }
    return dataUrl;
  } catch (error: any) {
    console.error('Erro no html-to-image:', error);
    alert('Erro ao gerar imagem: ' + (error.message || error.toString()));
    return null;
  } finally {
    document.body.removeChild(printContainer);
    if (wasDark) document.documentElement.classList.add('dark');
  }
}

export const exportToPNG = async (elementId: string, filename: string): Promise<void> => {
  try {
    const dataUrl = await getExportImage(elementId, 'png');
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err: any) {
    alert('Erro ao gerar PNG: ' + err.message);
  }
};

export const exportToPDF = async (elementId: string, filename: string): Promise<void> => {
  try {
    // Usamos PNG ou JPEG internamente para o jsPDF
    const dataUrl = await getExportImage(elementId, 'jpeg');
    if (!dataUrl) return;
    
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Create a temporary image to get dimensions
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const imgWidth = 190; // mm
    const imgHeight = (img.height * imgWidth) / img.width;

    pdf.addImage(dataUrl, 'JPEG', 10, 10, imgWidth, imgHeight);
    pdf.save(`${filename}.pdf`);
  } catch (err: any) {
    console.error(err);
    alert('Erro na geração do PDF: ' + err.message);
  }
};
