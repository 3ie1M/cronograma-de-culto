
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ScheduleItem } from '../types';
import { EditableItem } from './EditableItem';
import { PlusCircle } from 'lucide-react';

interface Props {
  items: ScheduleItem[];
  setItems: (items: ScheduleItem[]) => void;
  updateItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteItem: (id: string) => void;
  deleteConfirm: string | null;
  isEditing: boolean;
}

export function ScheduleEditor({ items, setItems, updateItem, deleteItem, deleteConfirm, isEditing }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const addItem = (type: ScheduleItem['type']) => {
    const defaults: Record<ScheduleItem['type'], Partial<ScheduleItem>> = {
      header: { title: 'Novo Título', icon: '📌' },
      activity: { title: 'Nova Atividade', icon: '⏰', time: '00:00' },
      team: { title: 'Nova Equipe', icon: '👥', details: '- (nome)' },
      notes: { title: 'Observações', icon: '📌', details: '' },
      separator: { title: 'Nova Seção', icon: '✦' },
    };

    const newItem: ScheduleItem = {
      id: crypto.randomUUID(),
      type,
      ...defaults[type],
    } as ScheduleItem;

    setItems([...items, newItem]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <EditableItem
                key={item.id}
                item={item}
                updateItem={updateItem}
                deleteItem={deleteItem}
                deleteConfirm={deleteConfirm}
                isEditing={isEditing}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isEditing && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 mb-3 text-center font-medium uppercase tracking-wider">
            ☰ Arraste para reordenar · Adicionar bloco
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { type: 'header' as const, label: 'Título', color: 'blue' },
              { type: 'separator' as const, label: 'Seção', color: 'indigo' },
              { type: 'activity' as const, label: 'Atividade', color: 'red' },
              { type: 'team' as const, label: 'Equipe', color: 'purple' },
              { type: 'notes' as const, label: 'Observação', color: 'amber' },
            ].map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => addItem(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium
                  bg-${color}-50 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400
                  hover:bg-${color}-100 dark:hover:bg-${color}-900/50`}
              >
                <PlusCircle size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
