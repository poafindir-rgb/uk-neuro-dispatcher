/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Zap,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Inbox
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, Badge, cn, Button } from './UI';
import { Ticket, Task, Team } from '../types';

export default function Dashboard({ tickets, tasks, teams }: { tickets: Ticket[], tasks: Task[], teams: Team[] }) {
  const stats = [
    { label: 'Всего заявок', value: tickets.length, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'В работе', value: tickets.filter(t => t.status === 'IN_PROGRESS').length, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'SLA Просрочено', value: tickets.filter(t => new Date(t.slaResolutionDeadline) < new Date() && t.status !== 'CLOSED').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Выполнено сегодня', value: tickets.filter(t => t.status === 'CLOSED').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const chartData = [
    { name: 'Пн', issues: 12, resolved: 10 },
    { name: 'Вт', issues: 19, resolved: 15 },
    { name: 'Ср', issues: 15, resolved: 18 },
    { name: 'Чт', issues: 22, resolved: 12 },
    { name: 'Пт', issues: 28, resolved: 20 },
    { name: 'Сб', issues: 8, resolved: 10 },
    { name: 'Вс', issues: 10, resolved: 5 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Операционная сводка</h2>
        <p className="text-slate-500 font-medium">Контроль заявок и KPI в режиме реального времени</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-md hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <Badge variant="info">
                <TrendingUp size={12} className="mr-1" /> +12%
              </Badge>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-8 border-none shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Нагрузка на систему (7 дней)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Новые</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Закрытые</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="issues" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 border-none shadow-xl text-white">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Дежурные бригады</h3>
            <div className="space-y-4">
              {teams.map(team => (
                <div key={team.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold tracking-tight">{team.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{team.members.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xs font-black", team.currentLoad > 70 ? "text-red-400" : "text-emerald-400")}>
                      {team.currentLoad}%
                    </p>
                    <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", team.currentLoad > 70 ? "bg-red-400" : "bg-emerald-400")} style={{ width: `${team.currentLoad}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-slate-400 hover:text-white border border-slate-800 uppercase tracking-widest text-[10px] py-1 font-black">
              Управление сменами <ChevronRight size={14} />
            </Button>
          </Card>

          <Card className="p-6 border-none shadow-md overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Вызовы P0 (Аварии)</h3>
              <p className="text-sm text-slate-500 mb-6">Требуют немедленной реакции</p>
              
              <div className="space-y-3">
                {tickets.filter(t => t.priority === 'P0' && t.status !== 'CLOSED').slice(0, 2).map(t => (
                  <div key={t.id} className="p-3 bg-red-50 rounded-xl border border-red-100 animate-pulse">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-black text-red-700 uppercase tracking-widest">{t.id}</p>
                      <Badge variant="urgent">SLA: 12м</Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-700 truncate">{t.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.address}</p>
                  </div>
                ))}
              </div>
            </div>
            <AlertTriangle className="absolute -right-4 -bottom-4 text-slate-100" size={120} />
          </Card>
        </div>
      </div>
    </div>
  );
}
