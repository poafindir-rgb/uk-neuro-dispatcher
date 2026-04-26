/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Users, 
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, Badge, Button, cn } from './UI';
import { Ticket, Team } from '../types';

export default function RouteMap({ tickets, teams }: { tickets: Ticket[], teams: Team[] }) {
  const activeTickets = tickets.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS');

  return (
    <div className="h-full flex gap-8">
      {/* Route List */}
      <div className="w-96 flex flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Логистика района</h2>
          <p className="text-slate-500 font-medium">Оптимизация выездов и окон доступа</p>
        </div>

        <Card className="flex-1 border-none shadow-md overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-4 shrink-0">
             <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Calendar size={14} />
                <p className="text-[10px] font-black uppercase tracking-widest">Сегодня, 19 Апреля</p>
             </div>
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-xl font-black text-white leading-none">12 выездов</p>
                   <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1">Оптимизировано</p>
                </div>
                <Badge variant="success" className="text-[9px]">SLA OK</Badge>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50">
             {activeTickets.map((t, i) => (
               <div key={t.id} className="relative pl-6 pb-6 last:pb-0 group">
                  {/* Timeline dot/line */}
                  <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-slate-200 group-last:bottom-auto group-last:h-4"></div>
                  <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-sm z-10"></div>
                  
                  <div className="p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.id}</p>
                       <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-1.5 rounded">{10 + i}:00</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 leading-tight mb-1">{t.address}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{t.residentName}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                       <div className="flex items-center gap-1">
                          <Users size={10} className="text-slate-400" />
                          <span className="text-[9px] font-black text-slate-500 uppercase">{teams.find(tm => tm.id === t.assignedTo)?.name.split(' ')[1] || '---'}</span>
                       </div>
                       <Badge variant={t.priority === 'P0' ? 'urgent' : 'default'} className="text-[8px] py-0">{t.priority}</Badge>
                    </div>
                  </div>
               </div>
             ))}
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-white">
             <Button variant="primary" className="w-full text-xs font-black uppercase tracking-widest py-3">
                <Navigation size={14} /> Построить маршрут
             </Button>
          </div>
        </Card>
      </div>

      {/* Map Mockup */}
      <div className="flex-1 bg-slate-200 rounded-3xl relative overflow-hidden shadow-inner border-4 border-white">
        {/* Background Simulation */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-slate-400"></div>
              ))}
           </div>
        </div>

        {/* Map Markers */}
        <div className="absolute inset-0">
           {activeTickets.map((t, i) => (
             <div 
               key={t.id} 
               className="absolute animate-bounce" 
               style={{ 
                 left: `${20 + (i * 139) % 60}%`, 
                 top: `${20 + (i * 243) % 60}%` 
               }}
             >
                <div className="relative group cursor-pointer">
                   <div className={cn(
                     "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl transform group-hover:scale-125 transition-all outline outline-4 outline-white/50",
                     t.priority === 'P0' ? "bg-red-600" : "bg-blue-600"
                   )}>
                      <MapPin size={20} />
                   </div>
                   <div className="absolute left-1/2 -translate-x-1/2 top-12 bg-white px-2 py-1 rounded-lg shadow-lg border border-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                      <p className="text-[10px] font-black text-slate-900">{t.address}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.subtype}</p>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Floating Tooltips */}
        <div className="absolute bottom-6 right-6 w-72 space-y-3">
           <Card className="p-4 bg-white/90 backdrop-blur-md border-none shadow-2xl flex gap-3 items-center">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                 <Info size={20} />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Рекомендация</p>
                 <p className="text-xs font-bold text-slate-800 leading-tight">Объедините заявки №1045 и №1048 — они в одном подъезде.</p>
              </div>
           </Card>
           
           <div className="bg-slate-900 border border-slate-700 p-2 rounded-2xl flex items-center gap-2 shadow-2xl">
              <div className="flex -space-x-2 overflow-hidden px-2">
                {[1,2,3].map(i => (
                  <img key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-slate-800" src={`https://picsum.photos/seed/${i}/40/40`} alt="" />
                ))}
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex-1">3 бригады онлайн</p>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
           </div>
        </div>

        {/* Map UI */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
           <button className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center font-bold">+</button>
           <button className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center font-bold">-</button>
        </div>
      </div>
    </div>
  );
}
