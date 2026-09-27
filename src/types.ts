export type ItemType = 'header' | 'team' | 'activity' | 'notes' | 'separator';

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

export const TEMPLATES: Record<string, { label: string; items: Omit<ScheduleItem, 'id'>[] }> = {
  culto_sabado: {
    label: '⛪ Culto de Sábado',
    items: [
      { type: 'header', icon: '⛪', title: 'Culto de Sábado' },
      { type: 'team', icon: '🎼', title: 'Equipe de Louvor', details: '- (nome)\n- (nome)\n- (nome)' },
      { type: 'separator', title: 'Escola Sabatina', icon: '📖' },
      { type: 'activity', icon: '⏰', time: '08:45', title: 'Louvores prévios', details: '🎵 (nome do hino)\n🎵 (nome do hino)' },
      { type: 'activity', icon: '🙏', time: '09:00', title: 'Oração de abertura', details: '' },
      { type: 'activity', icon: '📖', time: '09:10', title: 'Lição da Escola Sabatina', details: 'Responsável: (nome)' },
      { type: 'activity', icon: '🎵', time: '09:50', title: 'Canto especial', details: '(título do canto)' },
      { type: 'separator', title: 'Culto Divino', icon: '✝️' },
      { type: 'activity', icon: '🎶', time: '10:15', title: 'Louvores de abertura', details: '🎵 (nome do hino)\n🎵 (nome do hino)\n🎵 (nome do hino)' },
      { type: 'activity', icon: '🙏', time: '10:30', title: 'Oração pastoral', details: 'Responsável: (nome)' },
      { type: 'activity', icon: '🎁', time: '10:40', title: 'Dízimos e ofertas', details: '' },
      { type: 'activity', icon: '🎤', time: '10:50', title: 'Canto especial', details: '(nome do cantor / grupo)' },
      { type: 'activity', icon: '📜', time: '11:00', title: 'Sermão', details: 'Pregador: (nome)\nTema: (tema)\nTexto base: (versículo)' },
      { type: 'activity', icon: '🚪', time: '11:45', title: 'Convite e encerramento', details: '' },
      { type: 'notes', icon: '🙏', title: 'Observações', details: '"Porque eu sei os planos que tenho para vós..." — Jr 29:11' },
    ],
  },
  escola_sabatina: {
    label: '📚 Escola Sabatina',
    items: [
      { type: 'header', icon: '📚', title: 'Escola Sabatina' },
      { type: 'team', icon: '👨‍🏫', title: 'Professores', details: '- (nome)\n- (nome)' },
      { type: 'activity', icon: '⏰', time: '09:00', title: 'Boas-vindas', details: 'Responsável: (nome)' },
      { type: 'activity', icon: '🎵', time: '09:05', title: 'Cântico inicial', details: '🎵 (nome do hino)' },
      { type: 'activity', icon: '🙏', time: '09:10', title: 'Oração de abertura', details: '' },
      { type: 'activity', icon: '📖', time: '09:15', title: 'Estudo da lição', details: 'Lição: (número)\nTema: (tema)' },
      { type: 'activity', icon: '💰', time: '09:45', title: 'Oferta missionária', details: '' },
      { type: 'activity', icon: '🌍', time: '09:50', title: 'Informe missionário', details: '' },
      { type: 'notes', icon: '📌', title: 'Recados', details: '' },
    ],
  },
  culto_simples: {
    label: '✝️ Culto Simples',
    items: [
      { type: 'header', icon: '✝️', title: 'Culto de Adoração' },
      { type: 'activity', icon: '⏰', time: '19:00', title: 'Louvores', details: '🎵 (hino 1)\n🎵 (hino 2)' },
      { type: 'activity', icon: '🙏', time: '19:20', title: 'Oração', details: 'Responsável: (nome)' },
      { type: 'activity', icon: '📜', time: '19:30', title: 'Mensagem', details: 'Pregador: (nome)\nTexto: (versículo)' },
      { type: 'activity', icon: '🚪', time: '20:15', title: 'Encerramento', details: '' },
      { type: 'notes', icon: '📌', title: 'Observações', details: '' },
    ],
  },
};

export const defaultSchedule: Schedule = {
  id: 'default-schedule',
  title: 'Culto de Sábado',
  date: new Date().toISOString().split('T')[0],
  items: TEMPLATES.culto_sabado.items.map((item, i) => ({
    ...item,
    id: `default-${i}`,
  })),
};
