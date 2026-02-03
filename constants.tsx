
import React from 'react';
import { Label, Priority } from './types.ts';

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', 
  '#64748b', '#06b6d4'
];

export const INITIAL_LABELS: Label[] = [
  { id: 'l1', name: 'Trabalho', color: '#3b82f6' },
  { id: 'l2', name: 'Pessoal', color: '#10b981' },
  { id: 'l3', name: 'Urgente', color: '#ef4444' },
];

// Tarefas zeradas conforme solicitado
export const INITIAL_TASKS = [];
