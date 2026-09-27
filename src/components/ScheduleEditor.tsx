
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
  isEditing: boolean;
}

export function ScheduleEditor({ items, setItems, updateItem, deleteItem, isEditing }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
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
    const newItem: ScheduleItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title: type === 'header' ? 'Novo Título' : type === 'activity' ? 'Nova Atividade' : 'Novo Item',
      icon: type === 'activity' ? '⏰' : type === 'header' ? '📌' : '🔹',
      time: type === 'activity' ? '00:00' : undefined,
    };
    setItems([...items, newItem]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <EditableItem
                key={item.id}
                item={item}
                updateItem={updateItem}
                deleteItem={deleteItem}
                isEditing={isEditing}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isEditing && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-3 text-center font-medium">Adicionar novo bloco</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => addItem('header')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
            >
              <PlusCircle size={16} /> Título
            </button>
            <button
              onClick={() => addItem('activity')}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
            >
              <PlusCircle size={16} /> Atividade
            </button>
            <button
              onClick={() => addItem('team')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
            >
              <PlusCircle size={16} /> Equipe
            </button>
            <button
              onClick={() => addItem('notes')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors text-sm font-medium"
            >
              <PlusCircle size={16} /> Observação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
