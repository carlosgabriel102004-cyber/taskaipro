
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Label, TimeRange, Priority } from './types.ts';
import { INITIAL_LABELS, INITIAL_TASKS } from './constants.tsx';
import { isToday, isTomorrow, isPast, getLocalDateString } from './utils/dateUtils.ts';
import TaskItem from './components/TaskItem.tsx';
import TaskModal from './components/TaskModal.tsx';
import LabelManager from './components/LabelManager.tsx';

// Fixed: Explicitly defined props interface for SidebarItem to make 'count' optional and resolve TypeScript errors
interface SidebarItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

// Fixed: Component definition moved above App and typed with React.FC for better type safety
const SidebarItem: React.FC<SidebarItemProps> = ({ active, onClick, icon, label, count }) => (
  <button onClick={onClick} className={`relative w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${active ? 'bg-[#EEF2FF] text-[#3F51B5]' : 'text-slate-400 hover:bg-slate-50 hover:text-[#2A2A5E]'}`}>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#3F51B5] rounded-r-full" />}
    <span className={active ? 'text-[#3F51B5]' : 'text-slate-300'}>{icon}</span>
    <span className="flex-grow text-left font-bold">{label}</span>
    {count !== undefined && (
      <span className={`min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-[10px] font-black ${active ? 'bg-[#3F51B5] text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
    )}
  </button>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tasks_elite_v1');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });
  
  const [labels, setLabels] = useState<Label[]>(() => {
    try {
      const saved = localStorage.getItem('labels_elite_v1');
      return saved ? JSON.parse(saved) : INITIAL_LABELS;
    } catch (e) {
      return INITIAL_LABELS;
    }
  });
  
  const [activeRange, setActiveRange] = useState<TimeRange>('today');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks_elite_v1', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('labels_elite_v1', JSON.stringify(labels));
  }, [labels]);

  const stats = useMemo(() => {
    return {
      past: tasks.filter(t => isPast(t.dueDate) && !t.completed).length,
      today: tasks.filter(t => isToday(t.dueDate) && !t.completed).length,
      tomorrow: tasks.filter(t => isTomorrow(t.dueDate) && !t.completed).length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const titleLower = (task.title || '').toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      const matchesSearch = titleLower.includes(queryLower);
      
      if (!matchesSearch) return false;

      switch (activeRange) {
        case 'today': return isToday(task.dueDate);
        case 'tomorrow': return isTomorrow(task.dueDate);
        case 'past': return isPast(task.dueDate);
        case 'upcoming': return !isPast(task.dueDate) && !isToday(task.dueDate) && !isTomorrow(task.dueDate);
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
    today: 'Hoje',
    tomorrow: 'Amanhã',
    past: 'Dias Passados',
    upcoming: 'Próximos Dias',
    all: 'Todas'
  };

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden text-[#2A2A5E]">
      {/* Sidebar - Matching Image exactly */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-100 transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3F51B5] rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-[#2A2A5E] leading-none">TaskPro <span className="text-[#3F51B5]">AI</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ORGANIZAÇÃO ELITE</p>
            </div>
          </div>

          <div className="flex-grow px-4 overflow-y-auto custom-scrollbar pt-4">
            {/* Cronograma Section */}
            <div className="mb-10">
              <div className="px-4 mb-4 flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">CRONOGRAMA</h3>
                <div className="w-1.5 h-1.5 bg-indigo-100 rounded-full" />
              </div>
              <nav className="space-y-1">
                <SidebarItem 
                  active={activeRange === 'past'} 
                  onClick={() => { setActiveRange('past'); setMobileMenuOpen(false); }} 
                  icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></svg>}
                  label="Dias Passados" 
                />
                <SidebarItem 
                  active={activeRange === 'today'} 
                  onClick={() => { setActiveRange('today'); setMobileMenuOpen(false); }} 
                  icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                  label="Foco de Hoje" 
                  count={stats.today}
                />
                <SidebarItem 
                  active={activeRange === 'tomorrow'} 
                  onClick={() => { setActiveRange('tomorrow'); setMobileMenuOpen(false); }} 
                  icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>}
                  label="Amanhã" 
                  count={stats.tomorrow}
                />
                <SidebarItem 
                  active={activeRange === 'upcoming'} 
                  onClick={() => { setActiveRange('upcoming'); setMobileMenuOpen(false); }} 
                  icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M3 10h18" /></svg>}
                  label="Próximos Dias" 
                />
              </nav>
            </div>

            {/* Workspace Section */}
            <div className="mb-10">
              <h3 className="px-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">WORKSPACE</h3>
              <nav className="space-y-1">
                <SidebarItem 
                  active={false}
                  onClick={() => {}} 
                  icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                  label="Notas de Texto" 
                />
              </nav>
            </div>
          </div>

          {/* Etiquetas Footer */}
          <div className="p-6 border-t border-slate-50">
            <button onClick={() => setIsLabelManagerOpen(true)} className="flex items-center justify-between w-full px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-400 group">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 5v14M5 12h14" strokeWidth={2.5} /></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">ETIQUETAS</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-full overflow-hidden relative">
        <header className="px-10 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-[#3F51B5]"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <div>
              <h2 className="text-2xl font-black text-[#2A2A5E] tracking-tight">{rangeTitle[activeRange]}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{filteredTasks.length} ITEM ATIVO</p>
            </div>
          </div>

          {/* Search bar - matching image */}
          <div className="flex-grow max-w-lg px-8">
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Pesquisar..." 
                className="w-full pl-11 pr-4 py-2.5 bg-[#EEF2FF] border-none rounded-full text-sm font-medium placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm shadow-indigo-50/50" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
               <button className="p-2.5 text-indigo-600 hover:bg-slate-50 border-r border-slate-50"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth={2} /></svg></button>
               <button className="p-2.5 text-slate-400 hover:bg-slate-50"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} /></svg></button>
            </div>
            <button 
              onClick={() => setIsTaskModalOpen(true)} 
              className="bg-[#3F51B5] text-white pl-4 pr-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-[#303F9F] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 5v14M5 12h14" /></svg>
              ADICIONAR
            </button>
          </div>
        </header>

        {/* Task List - Spaced and Styled per image */}
        <div className="flex-grow overflow-y-auto px-10 pb-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6 pt-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  labels={labels} 
                  onToggle={(id) => setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t))} 
                  onDelete={(id) => confirm('Excluir?') && setTasks(prev => prev.filter(t => t.id !== id))} 
                  onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-40 opacity-20">
                <svg className="w-20 h-20 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={1.5} /></svg>
                <p className="font-bold text-slate-400">Nenhum item encontrado</p>
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

export default App;
