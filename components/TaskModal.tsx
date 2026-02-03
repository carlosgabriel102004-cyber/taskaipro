
import React, { useState } from 'react';
import { Task, Label, Priority, RecurrenceType } from '../types';
import { analyzeTaskPrompt } from '../services/geminiService';

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
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(task?.recurrence?.type || 'none');
  const [recurrenceUntil, setRecurrenceUntil] = useState(task?.recurrence?.until || '');
  const [webhookEnabled, setWebhookEnabled] = useState(task?.webhookEnabled || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      dueDate,
      priority,
      labelIds: selectedLabels,
      completed: task?.completed || false,
      webhookEnabled,
      recurrence: recurrenceType !== 'none' ? {
        type: recurrenceType,
        until: recurrenceUntil || dueDate
      } : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Agendar Tarefa</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronização Elite Ativa</p>
          </div>
          <button onClick={onClose} type="button" className="p-3 text-slate-300 hover:text-slate-900 hover:bg-white rounded-2xl shadow-sm transition-all border border-transparent hover:border-slate-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">O que vamos realizar?</label>
              <input
                autoFocus required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-900 font-bold placeholder-slate-300"
                placeholder="Ex: Reunião de Planejamento"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Agendado Para</label>
                <input
                  type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Prioridade</label>
                <select
                  value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-slate-900 font-bold appearance-none cursor-pointer"
                >
                  <option value={Priority.LOW}>Baixa</option>
                  <option value={Priority.MEDIUM}>Média</option>
                  <option value={Priority.HIGH}>Alta</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-[#F8F9FD] rounded-3xl space-y-6 border border-slate-100">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${webhookEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth={2} /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Webhook Ativo</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Enviar para automação no dia</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setWebhookEnabled(!webhookEnabled)} className={`w-12 h-6 rounded-full transition-all relative ${webhookEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${webhookEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Notas Adicionais</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione detalhes aqui..."
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all h-24 resize-none text-slate-600 font-medium"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <button type="button" className="flex-1 py-5 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all" onClick={onClose}>Cancelar</button>
            <button type="submit" className="flex-[2] py-5 bg-[#3F51B5] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-[#303F9F] transition-all active:scale-95">Salvar Cronograma</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
