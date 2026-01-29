
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Label, ViewType, TimeRange, Priority } from './types.ts';
import { INITIAL_LABELS, INITIAL_TASKS } from './constants.tsx';
import { isToday, isTomorrow, isPast, getLocalDateString } from './utils/dateUtils.ts';
import TaskItem from './components/TaskItem.tsx';
import AgendaView from './components/AgendaView.tsx';
import NotesView from './components/NotesView.tsx';
import TaskModal from './components/TaskModal.tsx';
import LabelManager from './components/LabelManager.tsx';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tasks_v4_pro');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });
  
  const [labels, setLabels] = useState<Label[]>(() => {
    try {
      const saved = localStorage.getItem('labels_v4_pro');
      return saved ? JSON.parse(saved) : INITIAL_LABELS;
    } catch (e) {
      return INITIAL_LABELS;
    }
  });
  
  const [viewType, setViewType] = useState<ViewType>('list');
  const [activeRange, setActiveRange] = useState<TimeRange>('today');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks_v4_pro', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('labels_v4_pro', JSON.stringify(labels));
  }, [labels]);

  const stats = useMemo(() => {
    return {
      past: tasks.filter(t => isPast(t.dueDate) && !t.completed).length,
      today: tasks.filter(t => isToday(t.dueDate) && !t.completed).length,
      tomorrow: tasks.filter(t => isTomorrow(t.dueDate) && !t.completed).length,
      upcoming: tasks.filter(t => !isPast(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate) && !t.completed).length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const titleLower = (task.title || '').toLowerCase();
      const descLower = (task.description || '').toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      const matchesSearch = titleLower.includes(queryLower) || descLower.includes(queryLower);
      
      if (!matchesSearch) return false;

      switch (activeRange) {
        case 'today': return isToday(task.dueDate);
        case 'tomorrow': return isTomorrow(task.dueDate);
        case 'past': return isPast(task.dueDate);
        case 'upcoming': return !isPast(task.dueDate) && !isToday(task.dueDate) && !isTomorrow(task.dueDate);
        case 'all': return true;
        default: return true;
      }
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, activeRange, searchQuery]);

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || '',
        description: taskData.description || '',
        dueDate: taskData.dueDate || getLocalDateString(),
        completed: false,
        priority: taskData.priority || Priority.MEDIUM,
        labelIds: taskData.labelIds || [],
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const rangeTitle = {
    today: 'Foco de Hoje',
    tomorrow: 'Amanhã',
    past: 'Tarefas Atrasadas',
    upcoming: 'Próximos Dias',
    all: 'Todas as Tarefas'
  };

  return (
    <div className="flex h-screen bg-[#fafbfc] overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200/50 transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">TaskPro <span className="text-indigo-600">AI</span></h1>
          </div>

          <nav className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
             <SidebarItem 
              active={activeRange === 'past'} 
              onClick={() => { setActiveRange('past'); setMobileMenuOpen(false); }} 
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></svg>}
              label="Passadas" 
              count={stats.past}
              variant="danger"
            />
            <SidebarItem 
              active={activeRange === 'today'} 
              onClick={() => { setActiveRange('today'); setMobileMenuOpen(false); }} 
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
              label="Hoje" 
              count={stats.today}
            />
            <SidebarItem 
              active={activeRange === 'tomorrow'} 
              onClick={() => { setActiveRange('tomorrow'); setMobileMenuOpen(false); }} 
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>}
              label="Amanhã" 
              count={stats.tomorrow}
            />
            <SidebarItem 
              active={activeRange === 'upcoming'} 
              onClick={() => { setActiveRange('upcoming'); setMobileMenuOpen(false); }} 
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>}
              label="Próximos Dias" 
              count={stats.upcoming}
            />
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <button onClick={() => setIsLabelManagerOpen(true)} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-500 font-bold text-sm transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 7h10v10H7z" strokeWidth={2} /><path d="M12 7v10M7 12h10" strokeWidth={2} /></svg>
              Etiquetas
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-full overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-8 py-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{rangeTitle[activeRange]}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{filteredTasks.length} tarefas encontradas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar..." className="pl-11 pr-4 py-3 bg-slate-100 border-none rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all w-64" />
            </div>
            <button onClick={() => setIsTaskModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95">ADICIONAR</button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  labels={labels} 
                  onToggle={(id) => setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t))} 
                  onDelete={(id) => confirm('Excluir esta tarefa?') && setTasks(prev => prev.filter(t => t.id !== id))} 
                  onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4"><svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth={1.5} /></svg></div>
                <p className="font-bold">Nada por aqui no momento</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isTaskModalOpen && <TaskModal task={editingTask} labels={labels} onSave={handleSaveTask} onClose={() => {setIsTaskModalOpen(false); setEditingTask(null);}} />}
      {isLabelManagerOpen && <LabelManager labels={labels} onAdd={(n, c) => setLabels([...labels, {id: Date.now().toString(), name: n, color: c}])} onDelete={(id) => setLabels(labels.filter(l => l.id !== id))} onClose={() => setIsLabelManagerOpen(false)} />}
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label, count, variant = 'default' }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
    <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
    <span className="flex-grow text-left">{label}</span>
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${active ? 'bg-indigo-600 text-white' : variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
    )}
  </button>
);

export default App;
