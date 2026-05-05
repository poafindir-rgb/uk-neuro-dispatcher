/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plus,
  Bell,
  History,
  ChevronRight,
  Loader2,
  ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, cn } from './UI';
import { Ticket, Message } from '../types';
import { processResidentMessage } from '../services/gemini';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type ResidentPortalProps = {
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
};

function extractPhone(text: string): string {
  const explicitPhoneMatch = text.match(
    /(?:телефон|тел\.|т\.|номер|связь)[:\s-]*((?:\+7|8|7)?[\s\-()]?\d[\d\s\-()]{2,})/i
  );

  if (explicitPhoneMatch?.[1]) {
    return explicitPhoneMatch[1].trim();
  }

  const phoneMatch = text.match(
    /(?:\+7|8|7)[\s\-()]?\d{3}[\s\-()]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/
  );

  return phoneMatch ? phoneMatch[0].trim() : '';
}

function cleanExtractedAddress(address: string): string {
  return address
    .replace(/^адрес[:\s-]*/i, '')
    .replace(/^по адресу[:\s-]*/i, '')
    .replace(/(?:,\s*)?(?:телефон|тел\.|т\.|номер|связь)[:\s-].*$/i, '')
    .replace(/(?:,\s*)?(?:время|доступ|буду дома|когда)[:\s-].*$/i, '')
    .trim()
    .replace(/[,.]+$/, '')
    .trim();
}

function extractAddress(text: string): string {
  const patterns = [
    /(?:по адресу|адрес)[:\s-]+(.+?)(?=(?:телефон|тел\.|т\.|номер|связь|время|доступ|буду дома|$))/i,
    /(москва\s*,?\s*ул\.?\s*[^,]+,\s*(?:д\.?|дом)\s*[^,]+(?:,\s*[^,]+){0,3})/i,
    /(ул\.?\s*[^,]+,\s*(?:д\.?|дом)\s*[^,]+(?:,\s*[^,]+){0,3})/i,
    /((?:д\.?|дом)\s*\d+[^,]*(?:,\s*(?:подъезд|п-д|кв\.?|квартира|этаж)\s*[^,]+){0,3})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      const value = match[1] || match[0];
      const cleaned = cleanExtractedAddress(value);

      if (cleaned.length > 3) {
        return cleaned;
      }
    }
  }

  return '';
}

function mergeAddress(oldAddress: string, newAddress: string): string {
  if (!newAddress) return oldAddress;
  if (!oldAddress || oldAddress === 'Адрес не указан' || oldAddress === 'ул. Центральная, д. 1') {
    return newAddress;
  }
  return oldAddress;
}

function mergePhone(oldPhone: string, newPhone: string): string {
  if (!newPhone) return oldPhone;
  if (!oldPhone || oldPhone === 'Телефон не указан' || oldPhone === '+7 000 000 00 00') {
    return newPhone;
  }
  return oldPhone;
}

export default function ResidentPortal({
  tickets,
  addTicket,
  updateTicket,
}: ResidentPortalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: 'user' | 'model'; content: string }[]
  >([]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tickets, isProcessing]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleStartNewTicket = () => {
    setIsCreating(true);
    setSelectedTicketId(null);
    setChatHistory([]);
  };

  const handleBack = () => {
    setIsCreating(false);
    setSelectedTicketId(null);
    setChatHistory([]);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;

    const currentMessage = message.trim();
    setMessage('');
    setIsProcessing(true);

    const currentTicket = selectedTicket;

    const extractedAddress = extractAddress(currentMessage);
    const extractedPhone = extractPhone(currentMessage);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'RESIDENT',
      text: currentMessage,
      timestamp: new Date().toISOString(),
    };

    if (currentTicket) {
      updateTicket(currentTicket.id, {
        messages: [...currentTicket.messages, userMsg],
        address: mergeAddress(currentTicket.address, extractedAddress),
        phone: mergePhone(currentTicket.phone, extractedPhone),
      });
    }

    try {
      const aiResponse = await processResidentMessage(currentMessage, chatHistory);

      setChatHistory((prev) => [
        ...prev,
        { role: 'user', content: currentMessage },
        { role: 'model', content: JSON.stringify(aiResponse) },
      ]);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        text:
          aiResponse.ticket.resident_update_message ||
          aiResponse.ticket.questions_to_user?.[0] ||
          'Принято, передаю диспетчеру.',
        timestamp: new Date().toISOString(),
      };

      if (currentTicket) {
        updateTicket(currentTicket.id, {
          messages: [...currentTicket.messages, userMsg, aiMsg],
          subtype: aiResponse.ticket.subtype,
          type: aiResponse.ticket.type,
          priority: aiResponse.ticket.priority,
          riskFlags: Array.from(
            new Set([
              ...(currentTicket.riskFlags || []),
              ...(aiResponse.ticket.risk_flags || []),
            ])
          ),
          status:
            aiResponse.ticket.missing_fields.length > 0 ? 'NEED_INFO' : 'NEW',
          address: mergeAddress(currentTicket.address, extractedAddress),
          phone: mergePhone(currentTicket.phone, extractedPhone),
        });
      } else {
        const now = new Date();

        const newTicket: Ticket = {
          id: `T-${Math.floor(Math.random() * 10000)}`,
          residentName: 'Пользователь',
          address: extractedAddress || 'Адрес не указан',
          phone: extractedPhone || 'Телефон не указан',
          type: aiResponse.ticket.type,
          subtype: aiResponse.ticket.subtype || 'Новое обращение',
          priority: aiResponse.ticket.priority,
          status:
            aiResponse.ticket.missing_fields.length > 0 ? 'NEED_INFO' : 'NEW',
          description: currentMessage,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          slaReactionDeadline: new Date(
            Date.now() + aiResponse.ticket.sla_reaction_minutes * 60000
          ).toISOString(),
          slaResolutionDeadline: new Date(
            Date.now() + aiResponse.ticket.sla_resolution_minutes * 60000
          ).toISOString(),
          messages: [userMsg, aiMsg],
          riskFlags: aiResponse.ticket.risk_flags || [],
        };

        addTicket(newTicket);
        setSelectedTicketId(newTicket.id);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Resident message processing error:', error);

      const fallbackAiMsg: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'AI',
        text: 'Принято. Мы передали обращение диспетчеру для ручной обработки.',
        timestamp: new Date().toISOString(),
      };

      if (currentTicket) {
        updateTicket(currentTicket.id, {
          messages: [...currentTicket.messages, userMsg, fallbackAiMsg],
          address: mergeAddress(currentTicket.address, extractedAddress),
          phone: mergePhone(currentTicket.phone, extractedPhone),
        });
      } else {
        const now = new Date();

        const fallbackTicket: Ticket = {
          id: `T-${Math.floor(Math.random() * 10000)}`,
          residentName: 'Пользователь',
          address: extractedAddress || 'Адрес не указан',
          phone: extractedPhone || 'Телефон не указан',
          type: 'repair',
          subtype: 'Новое обращение',
          priority: 'P2',
          status: 'NEW',
          description: currentMessage,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          slaReactionDeadline: new Date(Date.now() + 240 * 60000).toISOString(),
          slaResolutionDeadline: new Date(Date.now() + 1440 * 60000).toISOString(),
          messages: [userMsg, fallbackAiMsg],
          riskFlags: [],
        };

        addTicket(fallbackTicket);
        setSelectedTicketId(fallbackTicket.id);
        setIsCreating(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950">
              Мой Дом
            </h1>
            <p className="text-sm font-black tracking-widest uppercase text-slate-400">
              Личный кабинет жителя
            </p>
          </div>

          <button className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-400">
            <Bell size={28} />
          </button>
        </div>

        {!isCreating && !selectedTicketId ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <Card className="p-7 rounded-[2rem]">
              <h2 className="text-2xl font-black mb-3">Что случилось?</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">
                Опишите проблему, и наш нейро-ассистент мгновенно направит
                помощь.
              </p>

              <Button
                onClick={handleStartNewTicket}
                className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Создать заявку
              </Button>
            </Card>

            <Card className="p-7 rounded-[2rem]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black">Мои обращения</h3>
                <History size={20} className="text-slate-400" />
              </div>

              <div className="space-y-3">
                {tickets.slice(0, 5).map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            ticket.status === 'NEW'
                              ? 'info'
                              : ticket.status === 'NEED_INFO'
                                ? 'warning'
                                : 'default'
                          }
                        >
                          {ticket.status}
                        </Badge>

                        <span className="text-xs text-slate-400 font-bold">
                          {format(new Date(ticket.createdAt), 'dd.MM', {
                            locale: ru,
                          })}
                        </span>
                      </div>

                      <div className="font-black text-slate-900 truncate">
                        {ticket.description}
                      </div>

                      <div className="text-xs text-slate-400 font-bold mt-1">
                        {ticket.id}
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                ))}

                {tickets.length === 0 && (
                  <div className="text-center text-slate-400 font-bold py-8">
                    Пока нет обращений
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          <Card className="rounded-[2rem] overflow-hidden p-0 h-[680px] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <button onClick={handleBack} className="p-2 -ml-2">
                <ChevronRight className="rotate-180 text-slate-600" size={24} />
              </button>

              <div className="flex-1 px-3">
                <div className="font-black text-lg">
                  {selectedTicketId || 'Новая заявка'}
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-emerald-500">
                  ● Ассистент на связи
                </div>
              </div>

              {selectedTicket && (
                <Badge
                  variant={
                    selectedTicket.status === 'NEED_INFO'
                      ? 'warning'
                      : selectedTicket.status === 'NEW'
                        ? 'info'
                        : 'default'
                  }
                >
                  {selectedTicket.status}
                </Badge>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {selectedTicket?.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'max-w-[85%] rounded-3xl px-5 py-4 shadow-sm font-semibold leading-relaxed',
                      msg.sender === 'RESIDENT'
                        ? 'ml-auto bg-blue-600 text-white'
                        : 'bg-white text-slate-800 border border-slate-100'
                    )}
                  >
                    {msg.text}

                    {msg.sender === 'AI' &&
                      selectedTicket.status === 'NEED_INFO' && (
                        <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1 rounded-full inline-block">
                          Требуется уточнение
                        </div>
                      )}
                  </motion.div>
                ))}

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-slate-100 rounded-3xl px-5 py-4 shadow-sm max-w-[85%] flex items-center gap-3 text-slate-500 font-bold"
                  >
                    <Loader2 className="animate-spin" size={18} />
                    Нейросеть классифицирует проблему...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white space-y-3">
              <div className="relative">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="Напишите сообщение..."
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  disabled={isProcessing}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !message.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl flex items-center justify-center transition-all"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>

              <button className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <ImageIcon size={18} />
                Прикрепить фото
              </button>
            </div>
          </Card>
        )}

        {!isCreating && !selectedTicketId && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <Plus className="mx-auto text-blue-500 mb-2" size={20} />
              <div className="text-[10px] font-black uppercase text-slate-400">
                Новое
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={20} />
              <div className="text-[10px] font-black uppercase text-slate-400">
                Архив
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <Bell className="mx-auto text-slate-400 mb-2" size={20} />
              <div className="text-[10px] font-black uppercase text-slate-400">
                Профиль
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
