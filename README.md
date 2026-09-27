# Criador de Cronograma de Culto

Um aplicativo web simples e responsivo para criar, editar, e exportar cronogramas de culto religioso. Construído usando as tecnologias mais modernas do ecossistema web, o aplicativo foca na facilidade de uso, personalização intuitiva e exportações de alta qualidade.

## 🚀 Funcionalidades

- **Edição em Tempo Real**: Altere horários, textos, e ícones facilmente.
- **Drag & Drop**: Reordene blocos facilmente clicando e arrastando-os pelo ícone à esquerda.
- **Armazenamento Automático**: Nunca perca seu progresso (utiliza o `localStorage` do seu navegador).
- **Exportação Eficiente**:
  - Exporte para **PDF** (formato A4 para impressão).
  - Exporte como **Imagem (PNG)** para fácil compartilhamento em redes sociais ou WhatsApp.
- **Compartilhamento de Link**: Gere um link e envie seu cronograma preenchido para outras pessoas sem a necessidade de banco de dados.
- **Design Adaptativo**: Funciona perfeitamente em dispositivos móveis e desktop, e conta com **Tema Escuro (Dark Mode)**!

## 🛠️ Tecnologias Utilizadas

- [React 19](https://react.dev) + [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS v4](https://tailwindcss.com/)
- [@dnd-kit](https://dndkit.com/) para Drag and Drop
- [html2canvas](https://html2canvas.hertzen.com/) (Imagem PNG) & [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (PDF)
- [Lucide Icons](https://lucide.dev/)

## 💻 Instalação Local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse em seu navegador:
   `http://localhost:5173`

## 🌐 Demo Online (GitHub Pages)

O projeto está publicado e disponível publicamente em:
👉 **[https://3ie1m.github.io/cronograma-de-culto/](https://3ie1m.github.io/cronograma-de-culto/)**

Qualquer atualização enviada para a branch `main` será automaticamente compilada e publicada via GitHub Actions!

## 🌍 Deploy Alternativo (Vercel)

Caso deseje publicar também na Vercel:
1. Crie uma conta no [Vercel](https://vercel.com/)
2. Importe o repositório diretamente do seu GitHub (`3ie1M/cronograma-de-culto`)
3. O Vercel fará todo o processo de build automaticamente.
