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
          setIsEditing(false);
          return;
        }
      } catch {
        console.error('Invalid data in URL');
      }
    }

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

  useEffect(() => {
    if (items.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('data')) {
      localStorage.setItem('cronograma-culto', JSON.stringify(items));
    }
  }, [items]);

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
    url.searchParams.set('data', encoded);
    navigator.clipboard.writeText(url.toString()).catch(() => {
      prompt('Copie o link abaixo:', url.toString());
    });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportPDF = async () => {
    setExportState('loading-pdf');
    try {
      await exportToPDF('schedule-preview', 'cronograma-culto');
    } finally {
      setExportState('idle');
    }
  };

  const handleExportPNG = async () => {
    setExportState('loading-png');
    try {
      await exportToPNG('schedule-preview', 'cronograma-culto');
    } finally {
      setExportState('idle');
    }
  };

  const loadTemplate = (key: string) => {
    const tpl = TEMPLATES[key];
    if (!tpl) return;
    setItems(tpl.items.map(item => ({ ...item, id: crypto.randomUUID() })));
    setShowTemplates(false);
  };

  const handleReset = () => {
    if (window.confirm('Iniciar um novo cronograma? O conteúdo atual será perdido.')) {
      loadTemplate('culto_sabado');
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f4f7f6] dark:bg-slate-950 transition-colors"
      onClick={() => { setDeleteConfirm(null); setShowTemplates(false); }}
    >
      {/* ── COQUEIRAL HEADER (matches escala-coqueiral identity) ── */}
      <header
        className="relative text-center text-white mb-6"
        style={{
          background: 'linear-gradient(135deg, #002e5d 0%, #004a99 100%)',
          borderRadius: '0 0 30px 30px',
          padding: '28px 16px 24px',
        }}
      >
        {/* Controls — top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-center">
          <button
            onClick={(e) => { e.stopPropagation(); setIsDarkMode(!isDarkMode); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}
            title={isDarkMode ? 'Tema claro' : 'Tema escuro'}
            aria-label="Alternar tema"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Logo + title */}
        <img
          src="/cronograma-de-culto/logo-iasd.svg"
          alt="IASD"
          className="mx-auto mb-3"
          style={{ width: 100, filter: 'brightness(0) invert(1)' }}
        />
        <h1 className="m-0 font-bold tracking-wide" style={{ fontSize: '1.15em', letterSpacing: 1 }}>
          Departamento de Comunicação — CRONOGRAMA
        </h1>
        <p className="mt-1 text-xs font-light uppercase tracking-widest opacity-75">
          Igreja Adventista do Sétimo Dia Coqueiral
        </p>
      </header>

      {/* ── TOOLBAR ── */}
      <div className="max-w-3xl mx-auto px-4 mb-4">
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm transition-colors">

          {/* Templates */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowTemplates(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
              title="Usar um template pronto"
            >
              Templates <ChevronDown size={13} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>
            {showTemplates && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
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

          <div className="flex-1" />

          {/* Edit / Done */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium text-sm transition-colors ${
              isEditing
                ? 'text-white hover:opacity-90'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            style={isEditing ? { background: '#002e5d' } : {}}
            aria-pressed={isEditing}
          >
            {isEditing ? <><Check size={15} /> Concluir</> : <><Edit3 size={15} /> Editar</>}
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            disabled={exportState !== 'idle'}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
            title="Exportar como PDF"
            aria-label="Exportar PDF"
          >
            {exportState === 'loading-pdf' ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPNG}
            disabled={exportState !== 'idle'}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
            title="Exportar como imagem PNG"
            aria-label="Exportar PNG"
          >
            {exportState === 'loading-png' ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
          </button>

          {/* Share */}
          <button
            onClick={generateShareLink}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
        </div>
      </div>

      {/* Feedback banners */}
      {copiedLink && (
        <div className="max-w-3xl mx-auto px-4 mb-4">
          <div className="px-4 py-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            <Check size={15} /> Link copiado! Qualquer pessoa com o link pode visualizar este cronograma.
          </div>
        </div>
      )}
      {exportState !== 'idle' && (
        <div className="max-w-3xl mx-auto px-4 mb-4">
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Loader2 size={15} className="animate-spin" />
            {exportState === 'loading-pdf' ? 'Gerando PDF…' : 'Gerando imagem PNG…'} Aguarde.
          </div>
        </div>
      )}

      {/* Schedule (exported area) */}
      <main id="schedule-preview" className="pb-16 px-4">
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
