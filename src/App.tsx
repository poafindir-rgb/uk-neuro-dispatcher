/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Inbox as InboxIcon, 
  Ticket as TicketIcon, 
  CheckSquare, 
  Map as MapIcon, 
  BarChart3, 
  Users, 
  LogOut,
  Bell,
  Search,
  Plus,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge, Card, Button, cn } from './components/UI';
import { Role, Ticket, Task, Team, TicketStatus } from './types';
import { DEMO_TICKETS, DEMO_TASKS, DEMO_TEAMS } from './constants';
import Dashboard from './components/Dashboard';
import Inbox from './components/Inbox';
import TicketDetail from './components/TicketDetail';
import TasksKanban from './components/Tasks';
import RouteMap from './components/RouteManager';
import Analytics from './components/Analytics';
import ResidentPortal from './components/ResidentPortal';

type Tab = 'dashboard' | 'inbox' | 'ticket' | 'tasks' | 'route' | 'analytics';

export default function App() {
  const [role, setRole] = useState<Role>('DISPATCHER');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>(DEMO_TEAMS);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const savedTickets = localStorage.getItem('tickets');
    const savedTasks = localStorage.getItem('tasks');
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    } else {
      setTickets(DEMO_TICKETS);
    }
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(DEMO_TASKS);
    }
  }, []);

  useEffect(() => {
    if (tickets.length > 0) localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  };

  const addTicket = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  const addTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const selectedTicket = useMemo(() => 
    tickets.find(t => t.id === selectedTicketId), 
    [tickets, selectedTicketId]
  );

  const navigations = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard, roles: ['DISPATCHER', 'MANAGER'] },
    { id: 'inbox', label: 'Входящие', icon: InboxIcon, roles: ['DISPATCHER'] },
    { id: 'tasks', label: 'Задачи', icon: CheckSquare, roles: ['DISPATCHER', 'TECHNICIAN'] },
    { id: 'route', label: 'Маршруты', icon: MapIcon, roles: ['DISPATCHER', 'TECHNICIAN'] },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, roles: ['MANAGER'] },
  ];

  const filteredNav = navigations.filter(n => n.roles.includes(role as any));

  if (role === 'RESIDENT') {
    return (
      <div className="min-h-screen bg-slate-50">
        <RoleSwitcher role={role} setRole={setRole} />
        <ResidentPortal tickets={tickets} addTicket={addTicket} updateTicket={updateTicket} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldAlert className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Facility Desk</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold italic">Нейро-диспетчер</p>
            </div>
          </div>

          <nav className="space-y-1">
            {filteredNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  activeTab === item.id 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Смена роли</p>
            <RoleSwitcher role={role} setRole={setRole} compact />
          </div>
          <button className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-2 w-full">
            <LogOut size={18} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Поиск по ID, адресу или фамилии..." 
                className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-100 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-none">{role === 'DISPATCHER' ? 'Диспетчер Ольга' : role === 'MANAGER' ? 'Иван Сергеевич' : 'Мастер Николай'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                <img src={`https://picsum.photos/seed/${role}/100/100`} referrerPolicy="no-referrer" alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedTicketId || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard tickets={tickets} tasks={tasks} teams={teams} />}
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
                  onBack={() => setActiveTab('inbox')} 
                  onUpdate={(updates) => selectedTicketId && updateTicket(selectedTicketId, updates)}
                  teams={teams}
                  onAssignTask={addTask}
                />
              )}
              {activeTab === 'tasks' && <TasksKanban tasks={tasks} onUpdateTask={updateTask} tickets={tickets} />}
              {activeTab === 'route' && <RouteMap tickets={tickets} teams={teams} />}
              {activeTab === 'analytics' && <Analytics tickets={tickets} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function RoleSwitcher({ role, setRole, compact }: { role: Role; setRole: (r: Role) => void; compact?: boolean }) {
  const roles: Role[] = ['RESIDENT', 'DISPATCHER', 'TECHNICIAN', 'MANAGER'];
  
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-1">
        {roles.map(r => (
          <button 
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "px-1 py-1.5 text-[9px] font-bold rounded-lg transition-all uppercase tracking-tighter",
              role === r 
                ? "bg-blue-600 text-white" 
                : "bg-slate-700 text-slate-400 hover:text-white"
            )}
          >
            {r}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-white p-1 rounded-full shadow-xl border border-slate-200 flex gap-1">
      {roles.map(r => (
        <button 
          key={r}
          onClick={() => setRole(r)}
          className={cn(
            "px-3 py-1.5 text-[10px] font-bold rounded-full transition-all uppercase tracking-wider",
            role === r 
              ? "bg-slate-900 text-white" 
              : "text-slate-500 hover:bg-slate-100"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
