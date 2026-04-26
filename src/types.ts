/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'RESIDENT' | 'DISPATCHER' | 'TECHNICIAN' | 'MANAGER';

export type TicketType = 'emergency' | 'repair' | 'complaint' | 'meter_reading';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export type TicketStatus = 
  | 'NEW' 
  | 'NEED_INFO' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'WAITING_ACCESS' 
  | 'DONE_PENDING_REVIEW' 
  | 'CLOSED' 
  | 'REOPENED';

export interface Ticket {
  id: string;
  residentName: string;
  address: string;
  phone: string;
  type: TicketType;
  subtype: string;
  priority: Priority;
  status: TicketStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  slaReactionDeadline: string;
  slaResolutionDeadline: string;
  assignedTo?: string; // Team ID
  messages: Message[];
  riskFlags: string[];
  evidence?: {
    photosBefore: string[];
    photosAfter: string[];
    comment: string;
    result: string;
    checklist: Record<string, boolean>;
    actText: string;
  };
}

export interface Message {
  id: string;
  sender: 'RESIDENT' | 'AI' | 'DISPATCHER';
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  ticketId: string;
  teamId: string;
  title: string;
  status: 'TODO' | 'DOING' | 'DONE';
  deadline: string;
  instructions: string[];
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  currentLoad: number; // Percentage
  specialization: TicketType[];
}

export interface SLAMatrixEntry {
  type: TicketType;
  priority: Priority;
  reactionMinutes: number;
  resolutionMinutes: number;
}

export interface AIResponse {
  ticket: {
    type: TicketType;
    subtype: string;
    priority: Priority;
    sla_reaction_minutes: number;
    sla_resolution_minutes: number;
    missing_fields: string[];
    questions_to_user: string[];
    tech_instructions: string[];
    resident_update_message: string;
    risk_flags: string[];
  };
}
