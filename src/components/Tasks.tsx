/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Camera, 
  MoreVertical,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';
import { Card, Badge, cn, Button } from './UI';
import { Task, Ticket } from '../types';

export default function TasksKanban({ tasks, onUpdateTask, tickets }: { tasks: Task[], onUpdateTask: (id: string, updates: Partial<Task>) => void, tickets: Ticket[] }) {
  const columns = [
    { id: 'TODO', label: 'В очереди', color: 'bg-slate-200' },
    { id: 'DOING', label: 'В процессе', color: 'bg-blue-600' },
    { id: 'DONE', label: 'Выполнено', color: 'bg-emerald-500' }
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Задачи техников</h2>
        <p className="text-slate-500 font-medium">Канбан-доска активных работ на сегодня</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col space-y-4 h-full overflow-hidden">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", col.color)}></div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">{col.label}</h3>
              </div>
              <Badge variant="default" className="text-[10px]">{tasks.filter(t => t.status === col.id).length}</Badge>
            </div>

            <div className="flex-1 bg-slate-100/50 rounded-2xl p-4 space-y-4 overflow-y-auto custom-scrollbar border border-slate-200/50">
              {tasks.filter(t => t.status === col.id).map(task => {
                const ticket = tickets.find(tic => tic.id === task.ticketId);
                return (
                  <Card key={task.id} className="p-4 border-none shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{task.ticketId}</p>
                      <button className="text-slate-300 hover:text-slate-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    
                    <h4 className="text-sm font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{task.title}</h4>
                    
                    {ticket && (
                      <div className="space-y-2 mb-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">{ticket.address}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 italic">"{ticket.description}"</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        <Clock size={12} />
                        {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      <div className="flex gap-2">
                        {col.id === 'TODO' && (
                          <Button variant="primary" className="py-1 px-3 text-[9px] uppercase tracking-widest" onClick={() => onUpdateTask(task.id, { status: 'DOING' })}>Начать</Button>
                        )}
                        {col.id === 'DOING' && (
                          <Button variant="secondary" className="py-1 px-3 text-[9px] uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100" onClick={() => onUpdateTask(task.id, { status: 'DONE' })}>Завершить</Button>
                        )}
                        {col.id === 'DONE' && (
                          <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px] uppercase border px-2 py-1 rounded bg-emerald-50">
                            <CheckCircle2 size={12} /> OK
                          </div>
                        )}
                      </div>
                    </div>

                    {col.id === 'DOING' && (
                       <div className="mt-4 p-3 bg-slate-900 rounded-xl space-y-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Требуемые доказательства</p>
                          <div className="flex gap-2">
                             <button className="flex-1 h-12 bg-slate-800 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-slate-700 transition-all">
                               <Camera size={14} className="text-slate-400" />
                               <span className="text-[8px] text-slate-500 font-bold uppercase">ФОТО ДО</span>
                             </button>
                             <button className="flex-1 h-12 bg-slate-800 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-slate-700 transition-all">
                               <Camera size={14} className="text-slate-400" />
                               <span className="text-[8px] text-slate-500 font-bold uppercase">ФОТО ПОСЛЕ</span>
                             </button>
                          </div>
                          <button className="w-full py-2 bg-slate-800 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">
                             Заполнить чек-лист
                          </button>
                       </div>
                    )}
                  </Card>
                );
              })}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-50">
                   <ClipboardCheck size={48} className="mb-2" strokeWidth={1} />
                   <p className="text-xs font-bold uppercase tracking-widest">Пусто</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
