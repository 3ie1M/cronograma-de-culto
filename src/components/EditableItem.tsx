
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, AlertTriangle } from 'lucide-react';
import type { ScheduleItem } from '../types';

interface Props {
  item: ScheduleItem;
  updateItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteItem: (id: string) => void;
  deleteConfirm: string | null;
  isEditing: boolean;
}

/** Inline editable text input — transparent when not focused */
function EditableText({
  value, onChange, className = '', placeholder = '',
}: {
  value: string; onChange: (v: string) => void; className?: string; placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full ${className}`}
    />
  );
}

/** Auto-growing textarea */
function EditableArea({
  value, onChange, placeholder = '', className = '',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={Math.max(2, (value.match(/\n/g) || []).length + 1)}
      className={`w-full bg-transparent border border-transparent focus:border-blue-500 rounded p-1 outline-none resize-none ${className}`}
    />
  );
}

export function EditableItem({ item, updateItem, deleteItem, deleteConfirm, isEditing }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const set = (field: keyof ScheduleItem) => (value: string) =>
    updateItem(item.id, { [field]: value });

  const isPendingDelete = deleteConfirm === item.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-3 p-3 rounded-xl transition-colors ${
        isEditing ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60' : ''
      } ${isPendingDelete ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
    >
      {/* Drag handle */}
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical size={18} />
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">

        {/* HEADER */}
        {item.type === 'header' && (
          <div
            className="flex items-center gap-2 text-xl font-extrabold justify-center py-2 dark:text-blue-300"
            style={{ color: '#002e5d' }}
          >
            {isEditing ? (
              <>
                <EditableText value={item.icon || ''} onChange={set('icon')} className="w-8 text-center" placeholder="⛪" />
                <EditableText value={item.title} onChange={set('title')} className="text-center uppercase tracking-wide" placeholder="Título" />
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full uppercase tracking-wide">
                {item.icon && <span>{item.icon}</span>}
                <span>{item.title}</span>
              </div>
            )}
          </div>
        )}

        {/* SEPARATOR — section divider */}
        {item.type === 'separator' && (
          <div className="flex items-center gap-3 py-2 my-1">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            {isEditing ? (
              <>
                <EditableText value={item.icon || ''} onChange={set('icon')} className="w-6 text-center text-slate-500" placeholder="✦" />
                <EditableText value={item.title} onChange={set('title')} className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center" placeholder="Seção" />
              </>
            ) : (
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {item.icon} {item.title}
              </span>
            )}
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
        )}

        {/* TEAM */}
        {item.type === 'team' && (
          <div className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2 font-semibold">
                  <EditableText value={item.icon || ''} onChange={set('icon')} className="w-7" placeholder="🎼" />
                  <EditableText value={item.title} onChange={set('title')} placeholder="Nome da equipe" className="font-semibold" />
                </div>
                <EditableArea value={item.details || ''} onChange={set('details')} placeholder="- (nome do participante)" className="ml-1" />
              </>
            ) : (
              <>
                <div className="font-semibold flex gap-1.5 items-center">
                  {item.icon} <strong>{item.title}</strong>
                </div>
                <div className="whitespace-pre-wrap ml-1 leading-relaxed">
                  {item.details}
                </div>
              </>
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {item.type === 'activity' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                {isEditing ? (
                  <>
                    <EditableText value={item.icon || ''} onChange={set('icon')} className="w-7" placeholder="⏰" />
                    {/* type="time" ensures proper HH:MM format */}
                    <input
                      type="time"
                      value={item.time || ''}
                      onChange={e => set('time')(e.target.value)}
                      className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-red-500 dark:text-red-400 font-bold text-sm w-20"
                    />
                  </>
                ) : (
                  <>
                    <span>{item.icon}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold text-sm">{item.time}</span>
                  </>
                )}
              </div>
              <div className="flex-1 font-medium text-slate-800 dark:text-slate-100">
                {isEditing
                  ? <EditableText value={item.title} onChange={set('title')} placeholder="Título da atividade" className="font-medium" />
                  : item.title
                }
              </div>
            </div>

            {(isEditing || item.details) && (
              <div className="ml-10 text-sm text-slate-600 dark:text-slate-400">
                {isEditing
                  ? <EditableArea value={item.details || ''} onChange={set('details')} placeholder="Detalhes adicionais (opcional)" />
                  : <div className="whitespace-pre-wrap leading-relaxed">{item.details}</div>
                }
              </div>
            )}
          </div>
        )}

        {/* NOTES */}
        {item.type === 'notes' && (
          <div className="flex flex-col gap-1 mt-3 text-sm text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-700 pt-4">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
                  <EditableText value={item.icon || ''} onChange={set('icon')} className="w-6" placeholder="📌" />
                  <EditableText value={item.title} onChange={set('title')} placeholder="Título das observações" className="text-xs uppercase tracking-wider" />
                </div>
                <EditableArea value={item.details || ''} onChange={set('details')} placeholder="Texto da observação ou versículo..." />
              </>
            ) : (
              <>
                <div className="font-semibold uppercase text-xs tracking-widest">
                  {item.icon} {item.title}
                </div>
                <div className="whitespace-pre-wrap mt-1 italic leading-relaxed">
                  {item.details}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete button with 2-step confirmation */}
      {isEditing && (
        <button
          onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
          className={`shrink-0 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
            isPendingDelete
              ? 'bg-red-500 text-white opacity-100'
              : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
          title={isPendingDelete ? 'Clique novamente para confirmar a exclusão' : 'Remover item'}
          aria-label="Remover item"
        >
          {isPendingDelete ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
        </button>
      )}
    </div>
  );
}
