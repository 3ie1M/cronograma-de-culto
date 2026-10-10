import html2canvas from 'html2canvas';
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

/** Capture an element by cloning it into a fixed-width container to ensure layout stability (like escala-coqueiral). */
async function captureElementCloned(elementId: string): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const original = document.getElementById(elementId);
    if (!original) {
      alert("Elemento não encontrado para captura.");
      resolve(null);
      return;
    }

    const wasDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute'; // Volta ao original do escala-coqueiral
    printContainer.style.top = '-9999px';
    printContainer.style.left = '0';
    printContainer.style.width = '800px'; // Largura fixa para garantir layout
    printContainer.style.background = '#ffffff';
    printContainer.style.padding = '20px';

    // To apply data-exporting to hide UI chrome
    original.setAttribute('data-exporting', 'true');
    const clone = cloneWithInputs(original);
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
      }).catch((error) => {
        console.error('Erro no html2canvas:', error);
        alert('Erro ao gerar imagem com html2canvas: ' + error);
        document.body.removeChild(printContainer);
        if (wasDark) document.documentElement.classList.add('dark');
        resolve(null);
      });
    }, 150);
  });
}

export const exportToPNG = async (elementId: string, filename: string): Promise<void> => {
  try {
    const canvas = await captureElementCloned(elementId);
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
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
    const canvas = await captureElementCloned(elementId);
    if (!canvas) return;

    const imgData = canvas.toDataURL('image/png'); // Volta para PNG como no escala-coqueiral
    
    // Volta para a sintaxe antiga de inicialização
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`${filename}.pdf`);
  } catch (err: any) {
    console.error(err);
    alert('Erro na geração do PDF: ' + err.message);
  }
};
