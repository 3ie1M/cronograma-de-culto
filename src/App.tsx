import { useState, useEffect, useCallback } from 'react';
import { ScheduleEditor } from './components/ScheduleEditor';
import { type ScheduleItem, defaultSchedule, TEMPLATES } from './types';
import { exportToPDF, exportToPNG } from './utils/exportUtils';
import {
  Moon, Sun, Download, Image as ImageIcon, Link as LinkIcon,
  Edit3, Check, RotateCcw, ChevronDown, Loader2,
} from 'lucide-react';
import { Base64 } from 'js-base64';

type ExportState = 'idle' | 'loading-pdf' | 'loading-png';

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem('cronograma-darkmode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function App() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [isEditing, setIsEditing] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [showTemplates, setShowTemplates] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load from URL (without overwriting localStorage) or from localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');

    if (dataParam) {
      try {
        const decoded = JSON.parse(Base64.decode(dataParam));
        if (Array.isArray(decoded)) {
          setItems(decoded);
          setIsEditing(false); // View mode when opened from a shared link
          return; // Don't touch localStorage — it belongs to the recipient
        }
      } catch {
        console.error('Invalid data in URL');
      }
    }

    // Only fall back to localStorage if there's no shared URL
    const saved = localStorage.getItem('cronograma-culto');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
        return;
      } catch {
        console.error('Error parsing localStorage');
      }
    }

    setItems(defaultSchedule.items);
  }, []);

  // Save to localStorage (only when NOT opened from a shared link)
  useEffect(() => {
    if (items.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('data')) {
      localStorage.setItem('cronograma-culto', JSON.stringify(items));
    }
  }, [items]);

  // Handle dark mode — persist preference and apply class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('cronograma-darkmode', String(isDarkMode));
  }, [isDarkMode]);

  const handleUpdateItem = useCallback((id: string, updates: Partial<ScheduleItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  // Show confirmation tooltip, then delete after 2s if not cancelled
  const handleDeleteItem = useCallback((id: string) => {
    if (deleteConfirm === id) {
      setItems(prev => prev.filter(item => item.id !== id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(prev => prev === id ? null : prev), 2500);
    }
  }, [deleteConfirm]);

  const generateShareLink = () => {
    const encoded = Base64.encode(JSON.stringify(items));
    const url = new URL(window.location.href);
    // Remove existing data param to build clean URL
    url.searchParams.set('data', encoded);

    navigator.clipboard.writeText(url.toString()).catch(() => {
      // Fallback for browsers that deny clipboard access
      prompt('Copie o link abaixo:', url.toString());
    });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportPDF = async () => {
    setExportState('loading-pdf');
    try {
      await exportToPDF('schedule-preview', 'cronograma');
    } finally {
      setExportState('idle');
    }
  };

  const handleExportPNG = async () => {
    setExportState('loading-png');
    try {
      await exportToPNG('schedule-preview', 'cronograma');
    } finally {
      setExportState('idle');
    }
  };

  const loadTemplate = (key: string) => {
    const tpl = TEMPLATES[key];
    if (!tpl) return;
    const newItems: ScheduleItem[] = tpl.items.map(item => ({
      ...item,
      id: crypto.randomUUID(),
    }));
    setItems(newItems);
    setShowTemplates(false);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja iniciar um novo cronograma? O conteúdo atual será perdido.')) {
      loadTemplate('culto_sabado');
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors py-6 px-4 sm:px-6 lg:px-8"
      onClick={() => { setDeleteConfirm(null); setShowTemplates(false); }}
    >
      {/* Header / Controls */}
      <header className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Edit3 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">Cronograma de Culto</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monte, edite e compartilhe</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Controles do cronograma">

          {/* Templates dropdown */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowTemplates(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
              aria-label="Selecionar template"
              title="Usar um template pronto"
            >
              Templates <ChevronDown size={14} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>
            {showTemplates && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                {Object.entries(TEMPLATES).map(([key, tpl]) => (
                  <button
                    key={key}
                    onClick={() => loadTemplate(key)}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit / Done toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isEditing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            aria-pressed={isEditing}
          >
            {isEditing ? <><Check size={16} /> Concluir</> : <><Edit3 size={16} /> Editar</>}
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            disabled={exportState !== 'idle'}
            className="flex items-center gap-1.5 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Exportar como PDF"
            aria-label="Exportar PDF"
          >
            {exportState === 'loading-pdf'
              ? <Loader2 size={20} className="animate-spin" />
              : <Download size={20} />
            }
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPNG}
            disabled={exportState !== 'idle'}
            className="flex items-center gap-1.5 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Exportar como imagem (PNG)"
            aria-label="Exportar PNG"
          >
            {exportState === 'loading-png'
              ? <Loader2 size={20} className="animate-spin" />
              : <ImageIcon size={20} />
            }
          </button>

          {/* Share link */}
          <button
            onClick={generateShareLink}
            className="flex items-center gap-1.5 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Copiar link de compartilhamento"
            aria-label="Copiar link"
          >
            {copiedLink ? <Check size={20} className="text-green-500" /> : <LinkIcon size={20} />}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors"
            title="Novo cronograma (limpar tudo)"
            aria-label="Novo cronograma"
          >
            <RotateCcw size={20} />
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5" role="separator" />

          {/* Dark mode */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            aria-label="Alternar tema"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </header>

      {/* Feedback banners */}
      {copiedLink && (
        <div className="max-w-4xl mx-auto mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-center gap-2 transition-all">
          <Check size={16} /> Link copiado! Qualquer pessoa com o link pode visualizar este cronograma.
        </div>
      )}
      {exportState !== 'idle' && (
        <div className="max-w-4xl mx-auto mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          {exportState === 'loading-pdf' ? 'Gerando PDF…' : 'Gerando imagem PNG…'} Aguarde.
        </div>
      )}

      {/* Schedule content (exported area) */}
      <main id="schedule-preview" className="pb-12">
        <ScheduleEditor
          items={items}
          setItems={setItems}
          updateItem={handleUpdateItem}
          deleteItem={handleDeleteItem}
          deleteConfirm={deleteConfirm}
          isEditing={isEditing}
        />
      </main>
    </div>
  );
}

export default App;
