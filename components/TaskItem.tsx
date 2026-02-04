import React from 'react';
import { Task, Label, Priority } from '../types';
import { formatDate, isPast } from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  labels: Label[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, labels, onToggle, onDelete, onEdit }) => {
  const taskLabels = labels.filter(l => task.labelIds.includes(l.id));
  const isAtrasada = isPast(task.dueDate) && !task.completed;

  const priorityStyle = {
    [Priority.LOW]: 'bg-blue-50 text-blue-600 border-blue-100',
    [Priority.MEDIUM]: 'bg-amber-50 text-amber-600 border-amber-100',
    [Priority.HIGH]: 'bg-rose-50 text-rose-500 border-rose-100',
  };

  return (
    <div className={`group relative bg-white rounded-[32px] p-6 flex items-start gap-4 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 border border-slate-100 task-card-enter ${task.completed ? 'opacity-60' : ''}`}>
      {/* Indicador Lateral */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full transition-all duration-500 ${
        task.completed ? 'bg-slate-200' : isAtrasada ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'bg-indigo-600'
      }`} />

      {/* Checkbox Customizado */}
      <button 
        onClick={() => onToggle(task.id)}
        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
          task.completed 
            ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' 
            : 'border-slate-200 hover:border-indigo-400 bg-white'
        }`}
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
        )}
      </button>

      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className={`text-[17px] font-bold text-slate-800 tracking-tight leading-snug truncate pr-4 ${task.completed ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(task)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
            <button onClick={() => onDelete(task.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-2 mt-2">
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${priorityStyle[task.priority]}`}>
            {task.priority}
          </span>
          
          <div className={`flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
            isAtrasada ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'
          }`}>
            <svg className="w-3 h-3 mr-1.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} /></svg>
            {formatDate(task.dueDate)}
            {isAtrasada && <span className="ml-1.5 font-black uppercase text-[8px]">• Atrasada</span>}
          </div>

          <div className="flex -space-x-1.5 ml-auto">
            {taskLabels.map((l) => (
              <div 
                key={l.id} 
                className="w-3.5 h-3.5 rounded-full border-2 border-white ring-1 ring-slate-100 shadow-sm" 
                style={{ backgroundColor: l.color }}
                title={l.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;