/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Filter, 
  ChevronDown, 
  MapPin, 
  Clock, 
  User, 
  Phone,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { Card, Badge, cn, Button } from './UI';
import { Ticket, TicketStatus, TicketType, Priority } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Inbox({ tickets, onSelectTicket }: { tickets: Ticket[], onSelectTicket: (id: string) => void }) {
  const [filterType, setFilterType] = useState<TicketType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');

  const filtered = tickets.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const getStatusVariant = (status: TicketStatus) => {
    switch (status) {
      case 'NEW': return 'info';
      case 'ASSIGNED': return 'warning';
      case 'IN_PROGRESS': return 'default';
      case 'CLOSED': return 'success';
      case 'NEED_INFO': return 'urgent';
      default: return 'default';
    }
  };

  const getPriorityVariant = (p: Priority) => {
    switch (p) {
      case 'P0': return 'urgent';
      case 'P1': return 'warning';
      case 'P2': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Входящие обращения</h2>
          <p className="text-slate-500 font-medium">Всего найдено: {filtered.length}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="text-xs font-bold uppercase tracking-widest text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Все типы</option>
              <option value="emergency">Авария</option>
              <option value="repair">Ремонт</option>
              <option value="complaint">Жалоба</option>
              <option value="meter_reading">Показания</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Clock size={16} className="text-slate-400" />
            <select 
              className="text-xs font-bold uppercase tracking-widest text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Все статусы</option>
              <option value="NEW">Новые</option>
              <option value="ASSIGNED">В работе</option>
              <option value="NEED_INFO">Требуют инфо</option>
              <option value="CLOSED">Закрытые</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Дата</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Объект / Житель</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Тип / Приоритет</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Описание</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Окно</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Статус</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-slate-50 transition-all cursor-pointer group"
                  onClick={() => onSelectTicket(ticket.id)}
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900 leading-tight">{ticket.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {format(new Date(ticket.createdAt), 'dd MMM, HH:mm', { locale: ru })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} className="text-slate-400" />
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{ticket.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{ticket.residentName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant={ticket.type === 'emergency' ? 'urgent' : 'default'} className="text-[9px]">
                        {ticket.type === 'emergency' ? 'Аварийная' : ticket.type === 'repair' ? 'Ремонт' : ticket.type === 'complaint' ? 'Жалоба' : 'Счётчики'}
                      </Badge>
                      <Badge variant={getPriorityVariant(ticket.priority)} className="text-[8px] opacity-70">
                        {ticket.priority}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 line-clamp-2 max-w-xs">{ticket.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={12} />
                      <span className={cn(
                        "text-xs font-black tracking-tight",
                        new Date(ticket.slaResolutionDeadline) < new Date() && ticket.status !== 'CLOSED' ? "text-red-500" : ""
                      )}>
                        {format(new Date(ticket.slaResolutionDeadline), 'HH:mm dd.MM')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(ticket.status)} className="text-[9px]">
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" className="p-2 opacity-0 group-hover:opacity-100 transition-all">
                      <ExternalLink size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
