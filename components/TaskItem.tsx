
import React from 'react';
import { Task, Label, Priority } from '../types.ts';
import { formatDate } from '../utils/dateUtils.ts';

interface TaskItemProps {
  task: Task;
  labels: Label[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, labels, onToggle, onDelete, onEdit }) => {
  const taskLabels = labels.filter(l => task.labelIds.includes(l.id));

  const priorityStyle = {
    [Priority.LOW]: 'bg-blue-50 text-blue-600',
    [Priority.MEDIUM]: 'bg-amber-50 text-amber-600',
    [Priority.HIGH]: 'bg-rose-50 text-rose-500',
  };

  return (
    <div className={`group relative bg-white rounded-3xl p-7 flex items-start gap-5 shadow-sm hover:shadow-xl hover:shadow-indigo-50/40 transition-all duration-300 border border-slate-50/50 ${task.completed ? 'opacity-40 grayscale-[0.5]' : ''}`}>
      {/* Indicator Bar per Image */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full transition-colors ${
        task.completed ? 'bg-slate-200' : task.priority === Priority.HIGH ? 'bg-rose-500' : 'bg-indigo-600'
      }`} />

      {/* Modern Large Checkbox */}
      <button 
        onClick={() => onToggle(task.id)}
        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          task.completed 
            ? 'bg-[#3F51B5] border-[#3F51B5] shadow-md shadow-indigo-100' 
            : 'border-slate-200 hover:border-indigo-300 bg-white'
        }`}
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
        )}
      </button>

      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className={`text-lg font-bold text-[#2A2A5E] tracking-tight truncate ${task.completed ? 'line-through decoration-slate-300' : ''}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
            <button onClick={() => onEdit(task)} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
            <button onClick={() => onDelete(task.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
        </div>

        <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4 line-clamp-1">
          {task.description || "Sem notas adicionais."}
        </p>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.1em] ${priorityStyle[task.priority]}`}>
            {task.priority}
          </span>
          
          <div className="flex items-center text-[11px] text-slate-400 font-bold bg-[#F8F9FD] px-2.5 py-1 rounded-md border border-slate-100/50">
            <svg className="w-3.5 h-3.5 mr-1.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} /></svg>
            {formatDate(task.dueDate)}
          </div>

          <div className="flex -space-x-1.5 ml-auto">
            {taskLabels.map((l, i) => (
              <div 
                key={l.id} 
                className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-slate-100" 
                style={{ backgroundColor: l.color, zIndex: 10 - i }}
                title={l.name}
              />
            ))}
            {taskLabels.length === 0 && (
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-200 border border-white" />
                <div className="w-2.5 h-2.5 rounded-full bg-rose-200 border border-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
