import { useState, useEffect } from 'react';
import { ScheduleEditor } from './components/ScheduleEditor';
import { type ScheduleItem, defaultSchedule } from './types';
import { exportToPDF, exportToPNG } from './utils/exportUtils';
import { Moon, Sun, Download, Image as ImageIcon, Link as LinkIcon, Edit3, Check } from 'lucide-react';
import { Base64 } from 'js-base64';

function App() {
  const [items, setItems] = useState<ScheduleItem[]>(defaultSchedule.items);
  const [isEditing, setIsEditing] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load from URL or LocalStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');

    if (dataParam) {
      try {
        const decoded = JSON.parse(Base64.decode(dataParam));
        if (Array.isArray(decoded)) {
          setItems(decoded);
          setIsEditing(false); // If loaded from link, start in view mode
          return;
        }
      } catch (e) {
        console.error('Invalid data in URL');
      }
    }

    const saved = localStorage.getItem('cronograma-culto');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing localStorage');
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('cronograma-culto', JSON.stringify(items));
  }, [items]);

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleUpdateItem = (id: string, updates: Partial<ScheduleItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const generateShareLink = () => {
    const encoded = Base64.encode(JSON.stringify(items));
    const url = new URL(window.location.href);
    url.searchParams.set('data', encoded);
    
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header / Controls */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Edit3 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Criador de Cronogramas</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monte, edite e exporte facilmente</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isEditing 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isEditing ? <><Check size={16} /> Concluir Edição</> : <><Edit3 size={16} /> Editar</>}
          </button>
          
          <button
            onClick={() => exportToPDF('schedule-preview', 'cronograma')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Exportar PDF"
          >
            <Download size={20} />
          </button>

          <button
            onClick={() => exportToPNG('schedule-preview', 'cronograma')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Exportar Imagem (PNG)"
          >
            <ImageIcon size={20} />
          </button>

          <button
            onClick={generateShareLink}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
            title="Copiar Link"
          >
            {copiedLink ? <Check size={20} className="text-green-500" /> : <LinkIcon size={20} />}
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Alternar Tema"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div id="schedule-preview" className="pb-12">
        <ScheduleEditor
          items={items}
          setItems={setItems}
          updateItem={handleUpdateItem}
          deleteItem={handleDeleteItem}
          isEditing={isEditing}
        />
      </div>
      
    </div>
  );
}

export default App;
