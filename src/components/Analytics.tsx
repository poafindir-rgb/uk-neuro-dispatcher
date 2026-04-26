/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { Download, Filter, TrendingUp, TrendingDown, Target, Zap, Clock } from 'lucide-react';
import { Card, Badge, Button, cn } from './UI';
import { Ticket } from '../types';

export default function Analytics({ tickets }: { tickets: Ticket[] }) {
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

  const typeData = [
    { name: 'Аварии', value: tickets.filter(t => t.type === 'emergency').length },
    { name: 'Ремонт', value: tickets.filter(t => t.type === 'repair').length },
    { name: 'Жалобы', value: tickets.filter(t => t.type === 'complaint').length },
    { name: 'Счётчики', value: tickets.filter(t => t.type === 'meter_reading').length },
  ];

  const slaData = [
    { name: 'В норме', value: 85 },
    { name: 'Критично', value: 10 },
    { name: 'Просрочено', value: 5 },
  ];

  const reasonsData = [
    { reason: 'Износ труб', count: 12 },
    { reason: 'Эл. перегрузки', count: 8 },
    { reason: 'Лифты', count: 5 },
    { reason: 'Кровля', count: 3 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Аналитика и отчёты</h2>
          <p className="text-slate-500 font-medium">Мониторинг качества обслуживания и причин сбоев</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="text-xs uppercase tracking-widest font-black">
             <Filter size={16} /> Апрель 2026
          </Button>
          <Button variant="primary" className="text-xs uppercase tracking-widest font-black bg-blue-600">
             <Download size={16} /> Экспорт PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-8 border-none shadow-md space-y-6">
           <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Среднее время (ART)</h3>
                 <p className="text-4xl font-black text-slate-900 tracking-tighter mt-2">18.5 м</p>
                 <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
                    <TrendingDown size={14} /> -3.2% к марту
                 </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                 <Clock size={28} />
              </div>
           </div>
           <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Цель по SLA (15м)</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-[70%]" />
              </div>
           </div>
        </Card>

        <Card className="p-8 border-none shadow-md space-y-6">
           <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Повторные заявки</h3>
                 <p className="text-4xl font-black text-slate-900 tracking-tighter mt-2">4.2 %</p>
                 <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                    <TrendingUp size={14} /> +0.8% к марту
                 </p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                 <Target size={28} />
              </div>
           </div>
           <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Норматив (5.0%)</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[84%]" />
              </div>
           </div>
        </Card>

        <Card className="p-8 border-none shadow-md space-y-6">
           <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Эффективность (CSI)</h3>
                 <p className="text-4xl font-black text-slate-900 tracking-tighter mt-2">4.8 / 5</p>
                 <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
                    <TrendingUp size={14} /> +0.1% к марту
                 </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                 <Zap size={28} />
              </div>
           </div>
           <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Лояльность жильцов</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-[96%]" />
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-8 border-none shadow-md h-96">
           <h3 className="text-lg font-bold mb-6">Структура обращений</h3>
           <div className="h-64 w-full flex">
              <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={typeData} 
                          innerRadius={60} 
                          outerRadius={80} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {typeData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="w-48 flex flex-col justify-center space-y-4">
                 {typeData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 leading-none">{item.name}</p>
                          <p className="text-sm font-bold text-slate-800">{Math.round(item.value / tickets.length * 100)}%</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </Card>

        <Card className="p-8 border-none shadow-md h-96 flex flex-col">
           <h3 className="text-lg font-bold mb-6">Основные причины аварий (P0/P1)</h3>
           <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {reasonsData.map((item, i) => (
                <div key={item.reason} className="space-y-2">
                   <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-700">{item.reason}</p>
                      <p className="text-xs font-black text-slate-900">{item.count} инц.</p>
                   </div>
                   <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                         className={cn("h-full rounded-full transition-all duration-1000", i === 0 ? "bg-red-500" : "bg-blue-500")} 
                         style={{ width: `${(item.count / 12) * 100}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
           <div className="mt-4 pt-4 border-t border-slate-100">
              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-blue-600">
                 Детальный отчет по причинам
              </Button>
           </div>
        </Card>
      </div>

      <Card className="p-8 border-none shadow-md h-96">
         <h3 className="text-lg font-bold mb-6">Динамика закрытия задач бригадами</h3>
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={[
                  { name: '10:00', teamA: 3, teamB: 2, teamC: 1 },
                  { name: '12:00', teamA: 5, teamB: 4, teamC: 3 },
                  { name: '14:00', teamA: 8, teamB: 6, teamC: 9 },
                  { name: '16:00', teamA: 12, teamB: 11, teamC: 10 },
                  { name: '18:00', teamA: 15, teamB: 14, teamC: 12 },
                  { name: '20:00', teamA: 18, teamB: 16, teamC: 13 },
               ]}>
                  <defs>
                     <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient>
                     <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.1} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="teamA" stroke="#2563EB" fillOpacity={1} fill="url(#colorA)" strokeWidth={2} />
                  <Area type="monotone" dataKey="teamB" stroke="#10B981" fillOpacity={1} fill="url(#colorB)" strokeWidth={2} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </Card>
    </div>
  );
}
