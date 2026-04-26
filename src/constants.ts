/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SLAMatrixEntry, Ticket, Team, Task } from './types';
import { addMinutes, subDays, subHours } from 'date-fns';

export const SLA_MATRIX: SLAMatrixEntry[] = [
  { type: 'emergency', priority: 'P0', reactionMinutes: 30, resolutionMinutes: 180 },
  { type: 'emergency', priority: 'P1', reactionMinutes: 60, resolutionMinutes: 360 },
  { type: 'repair', priority: 'P1', reactionMinutes: 120, resolutionMinutes: 1440 },
  { type: 'repair', priority: 'P2', reactionMinutes: 240, resolutionMinutes: 2880 },
  { type: 'complaint', priority: 'P2', reactionMinutes: 480, resolutionMinutes: 4320 },
  { type: 'meter_reading', priority: 'P3', reactionMinutes: 1440, resolutionMinutes: 7200 },
];

export const DEMO_TEAMS: Team[] = [
  { id: 'team-1', name: 'Бригада А (Сантехника)', members: ['Иванов', 'Петров'], currentLoad: 80, specialization: ['emergency', 'repair'] },
  { id: 'team-2', name: 'Бригада Б (Электрика)', members: ['Сидоров', 'Кузнецов'], currentLoad: 40, specialization: ['emergency', 'repair'] },
  { id: 'team-3', name: 'Бригада В (Универсалы)', members: ['Смирнов', 'Козлов'], currentLoad: 20, specialization: ['repair', 'meter_reading', 'complaint'] },
];

const now = new Date();

export const DEMO_TICKETS: Ticket[] = [
  {
    id: 'T-1001',
    residentName: 'Анна Петрова',
    address: 'ул. Ленина, д. 10, кв. 45',
    phone: '+7 900 123 45 67',
    type: 'emergency',
    subtype: 'Прорыв трубы',
    priority: 'P0',
    status: 'IN_PROGRESS',
    description: 'Сильная течь в ванной, заливает соседей.',
    createdAt: subHours(now, 2).toISOString(),
    updatedAt: subHours(now, 1).toISOString(),
    slaReactionDeadline: addMinutes(subHours(now, 2), 30).toISOString(),
    slaResolutionDeadline: addMinutes(subHours(now, 2), 180).toISOString(),
    assignedTo: 'team-1',
    messages: [
      { id: 'm1', sender: 'RESIDENT', text: 'У нас прорвало трубу в ванной!', timestamp: subHours(now, 2).toISOString() },
      { id: 'm2', sender: 'AI', text: 'Принято. Передаю в экстренную службу.', timestamp: subHours(now, 1.9).toISOString() }
    ],
    riskFlags: ['Залив']
  },
  {
    id: 'T-1002',
    residentName: 'Сергей Волков',
    address: 'пр. Мира, д. 5, кв. 12',
    phone: '+7 911 222 33 44',
    type: 'repair',
    subtype: 'Замена лампочки',
    priority: 'P2',
    status: 'NEW',
    description: 'Перегорела лампа в подъезде на 3 этаже.',
    createdAt: subHours(now, 5).toISOString(),
    updatedAt: subHours(now, 5).toISOString(),
    slaReactionDeadline: addMinutes(subHours(now, 5), 240).toISOString(),
    slaResolutionDeadline: addMinutes(subHours(now, 5), 2880).toISOString(),
    messages: [],
    riskFlags: []
  },
  // Add more to reach ~10-20
  ...Array.from({ length: 15 }).map((_, i) => {
    const d = subDays(now, Math.floor(Math.random() * 5));
    return {
      id: `T-200${i}`,
      residentName: `Жилец ${i + 1}`,
      address: `ул. Тестовая, д. ${i + 1}, кв. ${i * 10}`,
      phone: `+7 999 000 00 ${i < 10 ? '0' + i : i}`,
      type: (['emergency', 'repair', 'complaint', 'meter_reading'][i % 4]) as any,
      subtype: 'Плановая работа',
      priority: (['P0', 'P1', 'P2', 'P3'][i % 4]) as any,
      status: (['NEW', 'ASSIGNED', 'DONE_PENDING_REVIEW', 'CLOSED'][i % 4]) as any,
      description: `Тестовое описание обращения номер ${i + 1}`,
      createdAt: d.toISOString(),
      updatedAt: d.toISOString(),
      slaReactionDeadline: addMinutes(d, 60).toISOString(),
      slaResolutionDeadline: addMinutes(d, 1440).toISOString(),
      messages: [],
      riskFlags: []
    } as Ticket;
  })
];

export const DEMO_TASKS: Task[] = [
  {
    id: 'TSK-1',
    ticketId: 'T-1001',
    teamId: 'team-1',
    title: 'Устранение течи',
    status: 'DOING',
    deadline: addMinutes(now, 60).toISOString(),
    instructions: ['Перекрыть стояк', 'Заменить участок трубы', 'Проверить герметичность']
  }
];
