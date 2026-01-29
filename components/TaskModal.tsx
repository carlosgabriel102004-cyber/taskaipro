
import React, { useState } from 'react';
import { Task, Label, Priority } from '../types.ts';
import Button from './Button.tsx';
import { analyzeTaskPrompt } from '../services/geminiService.ts';

interface TaskModalProps {
  task?: Task | null;
  labels: Label[];
  defaultDate?: string;
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, labels, defaultDate, onSave, onClose }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : (defaultDate || new Date().toISOString().split('T')[0]));
  const [priority, setPriority] = useState<Priority>(task?.priority || Priority.MEDIUM);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task?.labelIds || []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      dueDate: dueDate,
      priority,
      labelIds: selectedLabels,
      completed: task?.completed || false,
    });
  };

  const handleSmartAnalyze = async () => {
    if (!title) return;
    setIsAnalyzing(true);
    setAiFeedback(null);
    const result = await analyzeTaskPrompt(title);
    if (result) {
      if (result.suggestedPriority) {
        const p = result.suggestedPriority.toLowerCase();
        if (p.includes('alta')) setPriority(Priority.HIGH);
        else if (p.includes('baixa')) setPriority(Priority.LOW);
        else setPriority(Priority.MEDIUM);
      }
      
      setAiFeedback(`IA sugeriu prioridade ${result.suggestedPriority} e ${result.estimatedMinutes}min.`);
      setTimeout(() => setAiFeedback(null), 4000);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {task ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Organização Inteligente</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Título da Tarefa</label>
                {aiFeedback && <span className="text-[10px] font-bold text-indigo-600 animate-pulse">{aiFeedback}</span>}
              </div>
              <div className="flex gap-2">
                <input
                  autoFocus
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="O que vamos realizar?"
                  className="w-full px-5 py-3 bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-900 font-bold placeholder-slate-400"
                />
                <button 
                  type="button" 
                  onClick={handleSmartAnalyze} 
                  disabled={isAnalyzing || !title}
                  className="px-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center shadow-sm"
                  title="Analisar com IA"
                >
                  {isAnalyzing ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Detalhes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione notas ou contexto importante..."
                className="w-full px-5 py-3 bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all h-28 resize-none text-slate-700 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Data de Entrega</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-5 py-3 bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-slate-900 font-bold appearance-none cursor-pointer"
                >
                  <option value={Priority.LOW}>Baixa</option>
                  <option value={Priority.MEDIUM}>Média</option>
                  <option value={Priority.HIGH}>Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {labels.map(l => {
                  const isSelected = selectedLabels.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setSelectedLabels(prev => 
                          prev.includes(l.id) ? prev.filter(id => id !== l.id) : [...prev, l.id]
                        );
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                        {l.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              className="flex-1 py-4 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Salvar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
