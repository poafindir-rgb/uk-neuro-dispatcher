/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Inbox as InboxIcon,
  CheckSquare,
  Map as MapIcon,
  BarChart3,
  LogOut,
} from 'lucide-react';

import { cn } from './components/UI';
import { Role, Ticket, Task, Team } from './types';
import { DEMO_TICKETS, DEMO_TASKS, DEMO_TEAMS } from './constants';

import Dashboard from './components/Dashboard';
import Inbox from './components/Inbox';
import TicketDetail from './components/TicketDetail';
import TasksKanban from './components/Tasks';
import RouteMap from './components/RouteManager';
import Analytics from './components/Analytics';
import ResidentPortal from './components/ResidentPortal';

type Tab = 'dashboard' | 'inbox' | 'ticket' | 'tasks' | 'route' | 'analytics';

const TICKETS_STORAGE_KEY = 'tickets';
const TASKS_STORAGE_KEY = 'tasks';

function loadTicketsFromLocalStorage(): Ticket[] {
  try {
    const savedTickets = localStorage.getItem(TICKETS_STORAGE_KEY);
    return savedTickets ? JSON.parse(savedTickets) : DEMO_TICKETS;
  } catch (error) {
    console.error('Ошибка загрузки tickets из localStorage:', error);
    return DEMO_TICKETS;
  }
}

function loadTasksFromLocalStorage(): Task[] {
  try {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : DEMO_TASKS;
  } catch (error) {
    console.error('Ошибка загрузки tasks из localStorage:', error);
    return DEMO_TASKS;
  }
}

function saveTicketsToLocalStorage(tickets: Ticket[]) {
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch (error) {
    console.error('Ошибка сохранения tickets в localStorage:', error);
  }
}

function saveTasksToLocalStorage(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Ошибка сохранения tasks в localStorage:', error);
  }
}

function pickTeamForTicket(ticket: Ticket, teams: Team[]): string {
  const matchedTeam = teams.find((team) =>
    team.specialization.includes(ticket.type)
  );

  return matchedTeam?.id || teams[0]?.id || 'team-1';
}

function buildTaskFromTicket(ticket: Ticket, teams: Team[]): Task {
  const teamId = pickTeamForTicket(ticket, teams);

  return {
    id: `TSK-${Date.now()}`,
    ticketId: ticket.id,
    teamId,
    title: `${ticket.subtype || 'Новое обращение'} — ${
      ticket.address || 'Адрес не указан'
    }`,
    status: 'TODO',
    deadline: ticket.slaResolutionDeadline,
    instructions: [
      `Проверить обращение: ${ticket.description || 'Описание не указано'}`,
      `Связаться с жильцом: ${ticket.residentName || 'Житель'} / ${
        ticket.phone || 'телефон не указан'
      }`,
      'Уточнить доступ к объекту',
      'Зафиксировать результат выполнения',
    ],
  };
}

export default function App() {
  const [role, setRole] = useState<Role>('DISPATCHER');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams] = useState<Team[]>(DEMO_TEAMS);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    setTickets(loadTicketsFromLocalStorage());
    setTasks(loadTasksFromLocalStorage());
  }, []);

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) => {
      const updatedTickets = prev.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : ticket
      );

      saveTicketsToLocalStorage(updatedTickets);
      return updatedTickets;
    });
  };

  const addTicket = (newTicket: Ticket) => {
    const ticketWithDates: Ticket = {
      ...newTicket,
      createdAt: newTicket.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTickets((prev) => {
      const withoutDuplicate = prev.filter(
        (ticket) => ticket.id !== ticketWithDates.id
      );

      const updatedTickets = [ticketWithDates, ...withoutDuplicate];

      saveTicketsToLocalStorage(updatedTickets);
      return updatedTickets;
    });

    const autoTask = buildTaskFromTicket(ticketWithDates, teams);

    setTasks((prev) => {
      const alreadyHasTask = prev.some(
        (task) => task.ticketId === ticketWithDates.id
      );

      if (alreadyHasTask) {
        return prev;
      }

      const updatedTasks = [autoTask, ...prev];

      saveTasksToLocalStorage(updatedTasks);
      return updatedTasks;
    });
  };

  const addTask = (newTask: Task) => {
    setTasks((prev) => {
      const withoutDuplicate = prev.filter((task) => task.id !== newTask.id);
      const updatedTasks = [newTask, ...withoutDuplicate];

      saveTasksToLocalStorage(updatedTasks);
      return updatedTasks;
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updatedTasks = prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      );

      saveTasksToLocalStorage(updatedTasks);
      return updatedTasks;
    });
  };

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId),
    [tickets, selectedTicketId]
  );

  const navigations: {
    id: Tab;
    label: string;
    icon: React.ElementType;
    roles: Role[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Дашборд',
      icon: LayoutDashboard,
      roles: ['DISPATCHER', 'MANAGER'],
    },
    {
      id: 'inbox',
      label: 'Входящие',
      icon: InboxIcon,
      roles: ['DISPATCHER'],
    },
    {
      id: 'tasks',
      label: 'Задачи',
      icon: CheckSquare,
      roles: ['DISPATCHER', 'TECHNICIAN'],
    },
    {
      id: 'route',
      label: 'Маршруты',
      icon: MapIcon,
      roles: ['DISPATCHER', 'TECHNICIAN'],
    },
    {
      id: 'analytics',
      label: 'Аналитика',
      icon: BarChart3,
      roles: ['MANAGER'],
    },
  ];

  const filteredNav = navigations.filter((item) => item.roles.includes(role));

  if (role === 'RESIDENT') {
    return (
      <div className="relative min-h-screen">
        <button
          onClick={() => {
            setRole('DISPATCHER');
            setActiveTab('inbox');
            setSelectedTicketId(null);
          }}
          className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all"
        >
          Режим диспетчера
        </button>

        <ResidentPortal
          tickets={tickets}
          addTicket={addTicket}
          updateTicket={updateTicket}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-white min-h-screen p-5 flex flex-col">
        <div className="mb-8">
          <div className="text-2xl font-black tracking-tight">
            Facility Desk
          </div>
          <div className="text-sm text-slate-400 mt-1">Нейро-диспетчер</div>
        </div>

        <nav className="space-y-2">
          {filteredNav.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);

                  if (item.id !== 'ticket') {
                    setSelectedTicketId(null);
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={20} />
                <span className="font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-slate-900 rounded-2xl p-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">
              Смена роли
            </div>

            <RoleSwitcher role={role} setRole={setRole} compact />
          </div>

          <button
            onClick={() => setRole('RESIDENT')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          >
            <LogOut size={18} />
            <span className="font-bold">Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
          <div>
            <div className="text-sm text-slate-500 font-semibold">
              Текущая роль
            </div>

            <h1 className="text-2xl font-black tracking-tight">
              {role === 'DISPATCHER'
                ? 'Диспетчер Ольга'
                : role === 'MANAGER'
                  ? 'Иван Сергеевич'
                  : 'Мастер Николай'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest">
              {role}
            </div>

            <RoleSwitcher role={role} setRole={setRole} />
          </div>
        </header>

        {/* View Content */}
        <section className="p-8">
          {activeTab === 'dashboard' && (
            <Dashboard tickets={tickets} tasks={tasks} teams={teams} />
          )}

          {activeTab === 'inbox' && (
            <Inbox
              tickets={tickets}
              onSelectTicket={(id) => {
                setSelectedTicketId(id);
                setActiveTab('ticket');
              }}
            />
          )}

          {activeTab === 'ticket' && (
            <TicketDetail
              ticket={selectedTicket}
              onBack={() => {
                setSelectedTicketId(null);
                setActiveTab('inbox');
              }}
              onUpdate={(updates) => {
                if (selectedTicketId) {
                  updateTicket(selectedTicketId, updates);
                }
              }}
              teams={teams}
              onAssignTask={addTask}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksKanban
              tasks={tasks}
              onUpdateTask={updateTask}
              tickets={tickets}
            />
          )}

          {activeTab === 'route' && (
            <RouteMap tickets={tickets} teams={teams} />
          )}

          {activeTab === 'analytics' && <Analytics tickets={tickets} />}
        </section>
      </main>
    </div>
  );
}

function RoleSwitcher({
  role,
  setRole,
  compact,
}: {
  role: Role;
  setRole: (role: Role) => void;
  compact?: boolean;
}) {
  const roles: Role[] = ['RESIDENT', 'DISPATCHER', 'TECHNICIAN', 'MANAGER'];

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {roles.map((item) => (
          <button
            key={item}
            onClick={() => setRole(item)}
            className={cn(
              'px-2 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-tighter',
              role === item
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            )}
          >
            {item}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {roles.map((item) => (
        <button
          key={item}
          onClick={() => setRole(item)}
          className={cn(
            'px-3 py-1.5 text-[10px] font-black rounded-full transition-all uppercase tracking-wider',
            role === item
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
