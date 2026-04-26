/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  User,
  ClipboardList,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  FileText,
  Zap,
  Users
} from 'lucide-react';
import { Badge, Card, Button, cn } from './UI';
import { Ticket, Team, Task, Message } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function TicketDetail({ 
  ticket, 
  onBack, 
  onUpdate,
  teams,
  onAssignTask
}: { 
  ticket?: Ticket, 
  onBack: () => void, 
  onUpdate: (updates: Partial<Ticket>) => void,
  teams: Team[],
  onAssignTask: (task: Task) => void
}) {
  const [chatMessage, setChatMessage] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  if (!ticket) return null;

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'DISPATCHER',
      text: chatMessage,
      timestamp: new Date().toISOString()
    };
    onUpdate({ 
      messages: [...ticket.messages, newMessage],
      status: ticket.status === 'NEW' ? 'IN_PROGRESS' : ticket.status
    });
    setChatMessage('');
  };

  const handleAssignTeam = (teamId: string) => {
    onUpdate({ assignedTo: teamId, status: 'ASSIGNED' });
    const newTask: Task = {
      id: `TSK-${Date.now()}`,
      ticketId: ticket.id,
      teamId: teamId,
      title: `Работы по заявке ${ticket.id}`,
      status: 'TODO',
      deadline: ticket.slaResolutionDeadline,
      instructions: ['Связаться с жильцом', 'Провести осмотр', 'Устранить неисправность']
    };
    onAssignTask(newTask);
    setIsAssigning(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={onBack} className="p-2 rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{ticket.id}</h2>
            <Badge variant={ticket.priority === 'P0' ? 'urgent' : 'default'}>{ticket.priority}</Badge>
            <Badge variant="info">{ticket.status}</Badge>
          </div>
          <p className="text-slate-500 font-medium">{ticket.subtype} — {format(new Date(ticket.createdAt), 'd MMMM, HH:mm', { locale: ru })}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column: Info */}
        <div className="col-span-2 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <Card className="p-6 space-y-6 border-none shadow-md">
            <div className="grid grid-cols-2 gap-8">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                  <MapPin size={14} /> Местоположение и контакт
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <p className="text-sm font-bold text-slate-600 w-20 shrink-0">Адрес</p>
                    <p className="text-sm font-black text-slate-900">{ticket.address}</p>
                  </div>
                  <div className="flex gap-3">
                    <p className="text-sm font-bold text-slate-600 w-20 shrink-0">Жилец</p>
                    <p className="text-sm font-black text-slate-900">{ticket.residentName}</p>
                  </div>
                  <div className="flex gap-3">
                    <p className="text-sm font-bold text-slate-600 w-20 shrink-0">Телефон</p>
                    <p className="text-sm font-black text-blue-600">{ticket.phone}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Clock size={14} /> Контроль SLA
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase">Реакция</p>
                    <Badge variant={new Date(ticket.slaReactionDeadline) < new Date() ? 'urgent' : 'success'}>
                      {format(new Date(ticket.slaReactionDeadline), 'HH:mm')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase">Закрытие</p>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">{format(new Date(ticket.slaResolutionDeadline), 'dd.MM, HH:mm')}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Осталось: 2ч 15м</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Суть обращения</h3>
              <div className="bg-slate-50 p-4 rounded-xl relative">
                <p className="text-slate-800 font-medium leading-relaxed italic">"{ticket.description}"</p>
                {ticket.riskFlags.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {ticket.riskFlags.map(risk => (
                      <Badge key={risk} variant="urgent" className="text-[9px] animate-pulse">Риск: {risk}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </Card>

          {/* AI Insights */}
          <Card className="p-6 bg-blue-50 border-blue-100 shadow-sm border">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={14} /> Нейро-анализ обращения
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Недостающие данные (чек-лист)</p>
                <div className="space-y-1">
                  {['Адрес', 'Доступ', 'Фото'].map(field => (
                    <div key={field} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border border-slate-300"></div>
                      <span className="text-xs font-bold text-slate-600">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Рекомендации мастеру</p>
                <ul className="space-y-1 list-disc list-inside text-xs font-bold text-slate-700">
                  <li>Проверить состояние гибкой подводки</li>
                  <li>Оценить ущерб отделке</li>
                  <li>Замерить давление в системе</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Chat Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">История взаимодействия</h3>
            <div className="space-y-4">
              {ticket.messages.length === 0 && (
                <div className="text-center py-8 text-slate-400 italic text-sm">История сообщений пуста</div>
              )}
              {ticket.messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col", msg.sender === 'RESIDENT' ? "items-start" : "items-end")}>
                  <div className={cn(
                    "max-w-md px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                    msg.sender === 'RESIDENT' ? "bg-white text-slate-900 rounded-tl-none" : "bg-blue-600 text-white rounded-tr-none"
                  )}>
                    {msg.text}
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1 px-1">
                    {msg.sender === 'RESIDENT' ? 'Жилец' : msg.sender === 'AI' ? 'AI Ассистент' : 'Диспетчер'} • {format(new Date(msg.timestamp), 'HH:mm')}
                  </p>
                </div>
              ))}
            </div>
            <div className="relative pt-4">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Написать жильцу или AI..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-4 focus:ring-blue-100 transition-all shadow-md focus:border-blue-400"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-3 top-[calc(1rem+8px)] w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <Send size={18} />
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-md space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Назначение бригады</h3>
              {ticket.assignedTo ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <Users size={18} />
                    </div>
                    <p className="text-sm font-black text-emerald-900">{teams.find(t => t.id === ticket.assignedTo)?.name || 'Бригада'}</p>
                  </div>
                  <Button variant="secondary" onClick={() => setIsAssigning(true)} className="w-full text-xs font-bold py-1 px-2 uppercase tracking-widest mt-2 border-emerald-200 text-emerald-700">Переназначить</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 border-dashed text-center">
                    <p className="text-xs font-bold text-amber-600 mb-3">Бригада не назначена</p>
                    <Button onClick={() => setIsAssigning(true)} className="w-full uppercase text-[10px] tracking-widest font-black py-2 bg-amber-500 hover:bg-amber-600 shadow-amber-100 shadow-lg">Назначить сейчас</Button>
                  </div>
                </div>
              )}
            </div>

            {isAssigning && (
              <div className="space-y-2 animate-in slide-in-from-top duration-300">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Выберите свободную бригаду</p>
                {teams.map(team => (
                  <button 
                    key={team.id}
                    onClick={() => handleAssignTeam(team.id)}
                    className="w-full border border-slate-200 p-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group"
                  >
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900">{team.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Нагрузка: {team.currentLoad}%</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 space-y-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Управление статусом</h3>
               <div className="grid grid-cols-2 gap-2">
                 <Button variant="outline" className="text-[10px] uppercase font-black tracking-tighter" onClick={() => onUpdate({ status: 'NEED_INFO' })}>Need Info</Button>
                 <Button variant="outline" className="text-[10px] uppercase font-black tracking-tighter" onClick={() => onUpdate({ status: 'WAITING_ACCESS' })}>Access</Button>
                 <Button variant="outline" className="text-[10px] uppercase font-black tracking-tighter col-span-2 text-red-600 border-red-100 hover:bg-red-50" onClick={() => onUpdate({ status: 'CLOSED' })}>Закрыть (Hard)</Button>
               </div>
            </div>
          </Card>

          {/* Evidence Card (if status is advanced) */}
          {ticket.status === 'DONE_PENDING_REVIEW' && (
            <Card className="p-6 border-emerald-200 bg-emerald-50/30 shadow-md animate-pulse">
               <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <CheckCircle2 size={16} /> Результат работ
               </h3>
               <div className="space-y-4">
                  <div className="flex gap-2 h-20">
                    <div className="flex-1 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400"><Camera size={18} /></div>
                    <div className="flex-1 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400"><ImageIcon size={18} /></div>
                  </div>
                  <p className="text-xs font-bold text-slate-700">Работы выполнены, течь устранена. Соседи не пострадали.</p>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-[10px] uppercase tracking-widest font-black py-3 shadow-lg shadow-emerald-100">Утвердить и закрыть</Button>
               </div>
            </Card>
          )}

          <div className="p-4 bg-slate-900 rounded-2xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={16} className="text-blue-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Акт выполненных работ</h3>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-slate-800 rounded-full w-3/4"></div>
              <div className="h-2 bg-slate-800 rounded-full w-full"></div>
              <div className="h-2 bg-slate-800 rounded-full w-1/2"></div>
            </div>
            <Button variant="ghost" className="w-full mt-4 text-[9px] uppercase tracking-widest font-black text-blue-400 hover:text-blue-300 p-0">Предпросмотр акта</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className: string }) {
  return <path className={className} d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }} />
}
