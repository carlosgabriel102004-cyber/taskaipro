
export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta'
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: Priority;
  labelIds: string[];
  createdAt: string;
  webhookEnabled?: boolean;
  recurrence?: {
    type: RecurrenceType;
    until?: string;
    parentId?: string;
  };
}

export type ViewType = 'list' | 'agenda' | 'notes' | 'calendar';

export type TimeRange = 'past' | 'today' | 'tomorrow' | 'upcoming' | 'all';
