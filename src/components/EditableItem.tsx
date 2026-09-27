
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { ScheduleItem } from '../types';

interface Props {
  item: ScheduleItem;
  updateItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteItem: (id: string) => void;
  isEditing: boolean;
}

export function EditableItem({ item, updateItem, deleteItem, isEditing }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleChange = (field: keyof ScheduleItem, value: string) => {
    updateItem(item.id, { [field]: value });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-3 p-3 rounded-xl transition-colors ${
        isEditing ? 'hover:bg-gray-100 dark:hover:bg-slate-800' : ''
      }`}
    >
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={20} />
        </div>
      )}

      <div className="flex-1 flex flex-col gap-1">
        {item.type === 'header' && (
          <div className="flex items-center gap-2 text-xl font-bold text-center justify-center text-primary-dark dark:text-blue-400">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={item.icon || ''}
                  onChange={(e) => handleChange('icon', e.target.value)}
                  className="w-10 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-center"
                  placeholder="Icon"
                />
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="flex-1 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-center"
                  placeholder="Título"
                />
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full uppercase">
                {item.icon && <span>{item.icon}</span>}
                <span>{item.title}</span>
              </div>
            )}
          </div>
        )}

        {item.type === 'team' && (
          <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2 font-semibold">
                  <input
                    type="text"
                    value={item.icon || ''}
                    onChange={(e) => handleChange('icon', e.target.value)}
                    className="w-8 bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                    placeholder="Icon"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="flex-1 bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                    placeholder="Título da Equipe"
                  />
                </div>
                <textarea
                  value={item.details || ''}
                  onChange={(e) => handleChange('details', e.target.value)}
                  className="w-full bg-transparent border border-transparent focus:border-blue-500 rounded p-1 outline-none resize-none min-h-[60px]"
                  placeholder="Nomes dos participantes"
                />
              </>
            ) : (
              <>
                <div className="font-semibold flex gap-1 items-center">
                  {item.icon} *{item.title}*
                </div>
                <div className="whitespace-pre-wrap ml-1 leading-relaxed">
                  {item.details}
                </div>
              </>
            )}
          </div>
        )}

        {item.type === 'activity' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white shrink-0 mt-0.5">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={item.icon || ''}
                      onChange={(e) => handleChange('icon', e.target.value)}
                      className="w-8 bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                      placeholder="Icon"
                    />
                    <input
                      type="text"
                      value={item.time || ''}
                      onChange={(e) => handleChange('time', e.target.value)}
                      className="w-16 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-red-500 dark:text-red-400 font-bold"
                      placeholder="Hora"
                    />
                  </>
                ) : (
                  <>
                    <span>{item.icon}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">{item.time}</span>
                  </>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full font-medium bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                    placeholder="Título da atividade"
                  />
                ) : (
                  <div className="font-medium text-gray-800 dark:text-gray-100">{item.title}</div>
                )}
              </div>
            </div>
            
            {(isEditing || item.details) && (
              <div className="ml-8 mt-1 text-sm text-gray-700 dark:text-gray-300">
                {isEditing ? (
                  <textarea
                    value={item.details || ''}
                    onChange={(e) => handleChange('details', e.target.value)}
                    className="w-full bg-transparent border border-transparent focus:border-blue-500 rounded p-1 outline-none resize-none min-h-[40px]"
                    placeholder="Detalhes adicionais (opcional)"
                  />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {item.details}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {item.type === 'notes' && (
          <div className="flex flex-col gap-1 mt-4 text-sm text-gray-600 dark:text-gray-400">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2 font-medium">
                  <input
                    type="text"
                    value={item.icon || ''}
                    onChange={(e) => handleChange('icon', e.target.value)}
                    className="w-8 bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                    placeholder="Icon"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="flex-1 bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                    placeholder="Título das Observações"
                  />
                </div>
                <textarea
                  value={item.details || ''}
                  onChange={(e) => handleChange('details', e.target.value)}
                  className="w-full bg-transparent border border-transparent focus:border-blue-500 rounded p-1 outline-none resize-none min-h-[60px]"
                  placeholder="Texto das observações"
                />
              </>
            ) : (
              <>
                <div className="font-medium uppercase text-xs tracking-wider">
                  {item.icon} {item.title}
                </div>
                <div className="whitespace-pre-wrap mt-1 italic">
                  {item.details}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <button
          onClick={() => deleteItem(item.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Remover item"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
