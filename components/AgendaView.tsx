
import React from 'react';
import { Task, Label } from '../types.ts';
import TaskItem from './TaskItem.tsx';
import { formatFullDate, formatDate } from '../utils/dateUtils.ts';

interface AgendaViewProps {
  tasks: Task[];
  labels: Label[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ tasks, labels, onToggle, onDelete, onEdit }) => {
  const groups: Record<string, Task[]> = {};
  tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).forEach(task => {
    const dateKey = task.dueDate.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(task);
  });

  const sortedDates = Object.keys(groups).sort();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-bold text-slate-400">Tudo limpo por aqui!</p>
        <p className="text-sm text-slate-400/60 mt-1">Nenhuma tarefa encontrada neste período.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {sortedDates.map(date => (
        <div key={date} className="relative group">
          <div className="sticky top-[88px] z-10 bg-[#fafbfc]/90 backdrop-blur-md py-4 mb-6 border-b border-slate-100 flex items-baseline justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-indigo-50" />
              {formatDate(date)}
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {formatFullDate(date).split(',')[0]}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-6 border-l-2 border-slate-100 group-hover:border-indigo-100 transition-colors">
            {groups[date].map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                labels={labels} 
                onToggle={onToggle} 
                onDelete={onDelete} 
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgendaView;
