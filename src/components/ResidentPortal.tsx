/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  MapPin, 
  User, 
  Bell, 
  History,
  AlertTriangle,
  ChevronRight,
  Loader2,
  CheckCircle2,
  ImageIcon,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, cn } from './UI';
import { Ticket, Message } from '../types';
import { processResidentMessage } from '../services/gemini';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ResidentPortal({ tickets, addTicket, updateTicket }: { tickets: Ticket[], addTicket: (t: Ticket) => void, updateTicket: (id: string, updates: Partial<Ticket>) => void }) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tickets, isProcessing]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleStartNewTicket = () => {
    setIsCreating(true);
    setSelectedTicketId(null);
    setChatHistory([]);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;

    const currentMessage = message;
    setMessage('');
    setIsProcessing(true);

    let currentTicket = selectedTicket;

    // 1. Add user message locally
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'RESIDENT',
      text: currentMessage,
      timestamp: new Date().toISOString()
    };

    if (currentTicket) {
      updateTicket(currentTicket.id, { messages: [...currentTicket.messages, userMsg] });
    }

    // 2. Call AI
    const aiResponse = await processResidentMessage(currentMessage, chatHistory);
    
    // Update local history for next turns
    setChatHistory(prev => [
      ...prev, 
      { role: 'user', content: currentMessage },
      { role: 'model', content: JSON.stringify(aiResponse) }
    ]);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'AI',
      text: aiResponse.ticket.resident_update_message || aiResponse.ticket.questions_to_user[0] || 'Принято, передаю диспетчеру.',
      timestamp: new Date().toISOString()
    };

    if (currentTicket) {
      updateTicket(currentTicket.id, { 
        messages: [...currentTicket.messages, userMsg, aiMsg],
        subtype: aiResponse.ticket.subtype,
        type: aiResponse.ticket.type,
        priority: aiResponse.ticket.priority,
        riskFlags: Array.from(new Set([...currentTicket.riskFlags, ...aiResponse.ticket.risk_flags])),
        status: aiResponse.ticket.missing_fields.length > 0 ? 'NEED_INFO' : 'NEW'
      });
    } else {
      // Create new ticket if first message
      const newTicket: Ticket = {
        id: `T-${Math.floor(Math.random() * 10000)}`,
        residentName: 'Демо Пользователь',
        address: 'ул. Центральная, д. 1', // Default, ideally extracted by AI
        phone: '+7 000 000 00 00',
        type: aiResponse.ticket.type,
        subtype: aiResponse.ticket.subtype,
        priority: aiResponse.ticket.priority,
        status: aiResponse.ticket.missing_fields.length > 0 ? 'NEED_INFO' : 'NEW',
        description: currentMessage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaReactionDeadline: new Date(Date.now() + aiResponse.ticket.sla_reaction_minutes * 60000).toISOString(),
        slaResolutionDeadline: new Date(Date.now() + aiResponse.ticket.sla_resolution_minutes * 60000).toISOString(),
        messages: [userMsg, aiMsg],
        riskFlags: aiResponse.ticket.risk_flags
      };
      addTicket(newTicket);
      setSelectedTicketId(newTicket.id);
      setIsCreating(false);
    }

    setIsProcessing(false);
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col pt-12 pb-6 px-4">
      <header className="flex justify-between items-center mb-8 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Мой Дом</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Личный кабинет жителя</p>
        </div>
        <button className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-400">
           <Bell size={24} />
        </button>
      </header>

      {/* active View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isCreating && !selectedTicketId ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-8 border-none bg-blue-600 text-white shadow-xl shadow-blue-200 overflow-hidden relative group">
               <div className="relative z-10">
                 <h2 className="text-2xl font-black tracking-tight mb-2">Что случилось?</h2>
                 <p className="text-blue-100 text-sm font-medium mb-6 leading-relaxed">Опишите проблему, и наш нейро-ассистент мгновенно направит помощь.</p>
                 <Button onClick={handleStartNewTicket} className="bg-white text-blue-600 hover:bg-blue-50 w-full py-4 text-sm font-black uppercase tracking-widest shadow-lg">
                   <Plus size={18} /> Создать заявку
                 </Button>
               </div>
               <ShieldAlert className="absolute -right-8 -bottom-8 text-blue-500 opacity-20 group-hover:scale-110 transition-transform" size={200} />
            </Card>

            <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Мои обращения</h3>
                 <History size={16} className="text-slate-300" />
               </div>
               <div className="space-y-3">
                 {tickets.slice(0, 5).map(t => (
                   <Card 
                     key={t.id} 
                     className="p-4 border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
                     onClick={() => setSelectedTicketId(t.id)}
                   >
                     <div className="flex justify-between items-start mb-2">
                        <Badge variant={t.status === 'CLOSED' ? 'success' : t.status === 'NEED_INFO' ? 'urgent' : 'info'} className="text-[8px]">
                           {t.status}
                        </Badge>
                        <p className="text-[9px] font-black text-slate-300 uppercase">{format(new Date(t.createdAt), 'dd.MM')}</p>
                     </div>
                     <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{t.description}</p>
                     <div className="mt-3 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.id}</p>
                        <ChevronRight size={14} className="text-slate-300" />
                     </div>
                   </Card>
                 ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
             {/* Chat Header */}
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-4 shrink-0">
                <Button variant="ghost" onClick={() => { setIsCreating(false); setSelectedTicketId(null); }} className="p-1 -ml-2">
                   <ChevronRight className="rotate-180" size={20} />
                </Button>
                <div className="flex-1">
                   <p className="text-sm font-black text-slate-900 leading-none">{selectedTicketId || 'Новая заявка'}</p>
                   <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Ассистент на связи
                   </p>
                </div>
                {selectedTicket && (
                  <Badge variant="default" className="text-[8px]">{selectedTicket.status}</Badge>
                )}
             </div>

             {/* Messages Area */}
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
                {selectedTicket?.messages.map(msg => (
                  <div key={msg.id} className={cn("flex flex-col", msg.sender === 'RESIDENT' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                      msg.sender === 'RESIDENT' ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                    )}>
                      {msg.text}
                    </div>
                    {msg.sender === 'AI' && selectedTicket.status === 'NEED_INFO' && (
                       <Badge variant="urgent" className="mt-2 text-[8px] py-0">Требуется уточнение</Badge>
                    )}
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic p-4 bg-white/50 rounded-2xl border border-dashed border-slate-200 mx-4">
                    <Loader2 size={16} className="animate-spin" />
                    Нейросеть классифицирует проблему...
                  </div>
                )}
             </div>

             {/* Input Area */}
             <div className="p-6 bg-white shrink-0 border-t border-slate-50">
                <div className="relative">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Напишите сообщение..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    disabled={isProcessing}
                  />
                  <button 
                    disabled={isProcessing || !message.trim()}
                    onClick={handleSendMessage}
                    className="absolute right-2 top-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 shadow-lg shadow-blue-100"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                   <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                      <ImageIcon size={16} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Прикрепить фото</span>
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {!isCreating && !selectedTicketId && (
        <nav className="mt-8 flex justify-around items-center px-4 bg-white py-4 rounded-3xl shadow-xl border border-slate-100 shrink-0">
           <button className="text-blue-600 flex flex-col items-center gap-1">
              <Plus size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest">Новое</span>
           </button>
           <button className="text-slate-300 hover:text-slate-600 flex flex-col items-center gap-1">
              <History size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest">Архив</span>
           </button>
           <button className="text-slate-300 hover:text-slate-600 flex flex-col items-center gap-1">
              <User size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest">Профиль</span>
           </button>
        </nav>
      )}
    </div>
  );
}
