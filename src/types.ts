export type ItemType = 'header' | 'team' | 'activity' | 'notes';

export interface ScheduleItem {
  id: string;
  type: ItemType;
  time?: string;
  icon?: string;
  title: string;
  details?: string;
}

export interface Schedule {
  id: string;
  title: string;
  date: string;
  items: ScheduleItem[];
}

export const defaultSchedule: Schedule = {
  id: 'default-schedule',
  title: 'Culto de Sábado',
  date: new Date().toISOString().split('T')[0],
  items: [
    {
      id: '1',
      type: 'header',
      icon: '⛪',
      title: 'Culto de Sábado'
    },
    {
      id: '2',
      type: 'team',
      icon: '🎼',
      title: 'Equipe de louvor',
      details: '- João\n- Maria\n- Pedro'
    },
    {
      id: '3',
      type: 'activity',
      icon: '⏰',
      time: '08:45',
      title: 'Louvores prévios',
      details: '🎵 O Poder do Amor\n🎵 Dia de Esperança'
    },
    {
      id: '4',
      type: 'activity',
      icon: '💙',
      time: '09:00',
      title: 'ESCOLA SABATINA',
      details: 'Boas vindas'
    },
    {
      id: '5',
      type: 'notes',
      icon: '🙏',
      title: 'Observações',
      details: 'Lembre-se de Deus em tudo que fizer.'
    }
  ]
};
