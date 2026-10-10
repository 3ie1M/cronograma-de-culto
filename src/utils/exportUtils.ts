import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Clean Code: Export in-place!
 * Em vez de clonar elementos para um container off-screen (o que falha com Constructable Stylesheets
 * no Vite e causa telas brancas), capturamos a própria raiz do App diretamente.
 * Usamos a propriedade `filter` nativa para excluir os botões da UI (marcados com data-no-export="true").
 * Isso garante que todas as classes Tailwind, variáveis globais, Web Fonts e CSS Modules estejam perfeitamente aplicados.
 */
async function getExportImage(elementId: string, format: 'png' | 'jpeg'): Promise<string | null> {
  const rootElement = document.getElementById(elementId);
  if (!rootElement) {
    alert("Elemento raiz não encontrado para captura.");
    return null;
  }

  // Removemos temporariamente o dark mode do HTML para forçar a renderização clara
  const wasDark = document.documentElement.classList.contains('dark');
  if (wasDark) document.documentElement.classList.remove('dark');

  try {
    const options = {
      backgroundColor: '#f4f7f6', // Fundo padrão do App
      pixelRatio: 2, // Alta resolução
      filter: (node: HTMLElement) => {
        // Exclui da "foto" qualquer elemento com data-no-export
        if (node?.hasAttribute && node.hasAttribute('data-no-export')) {
          return false;
        }
        return true;
      },
      style: {
        // Força o contêiner a ter largura fixa ideal para PDF A4, sem alterar a tela do usuário!
        width: '800px',
        margin: '0 auto',
      },
      width: 800,
    };
    
    // Fallback: Chama toPng uma vez antes para forçar o carregamento de imagens/SVGs em cache (Bug do Safari/Chrome)
    await toPng(rootElement, options);
    
    // Captura final
    let dataUrl = '';
    if (format === 'jpeg') {
      dataUrl = await toJpeg(rootElement, { ...options, quality: 0.95 });
    } else {
      dataUrl = await toPng(rootElement, options);
    }
    
    return dataUrl;
  } catch (error: any) {
    console.error('Erro na exportação (html-to-image):', error);
    alert('Erro ao gerar imagem: ' + (error.message || error.toString()));
    return null;
  } finally {
    // Restaura o tema dark original do usuário
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
    console.error(err);
    alert('Erro crítico ao gerar PNG: ' + err.message);
  }
};

export const exportToPDF = async (elementId: string, filename: string): Promise<void> => {
  try {
    // Captura como JPEG para reduzir significativamente o tamanho final do PDF
    const dataUrl = await getExportImage(elementId, 'jpeg');
    if (!dataUrl) return;
    
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Precisamos de um objeto Image temporário para calcular a proporção exata
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Falha ao carregar a imagem renderizada"));
    });

    // Dimensões A4 seguras com pequena margem
    const pdfWidth = 190; // mm
    const pdfHeight = (img.height * pdfWidth) / img.width;

    pdf.addImage(dataUrl, 'JPEG', 10, 10, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (err: any) {
    console.error(err);
    alert('Erro crítico na geração do PDF: ' + err.message);
  }
};
