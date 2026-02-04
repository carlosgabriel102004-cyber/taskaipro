import React, { useState, useEffect, useMemo } from 'react';
import { Task, Label, TimeRange, Priority, ViewType } from './types';
import { INITIAL_LABELS, INITIAL_TASKS } from './constants';
import { isToday, isTomorrow, isPast, getLocalDateString } from './utils/dateUtils';
import TaskItem from './components/TaskItem';
import TaskModal from './components/TaskModal';
import LabelManager from './components/LabelManager';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  activeColor: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label, count, activeColor }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200 group ${
      active 
        ? `${activeColor} text-white shadow-lg shadow-indigo-100/20 translate-x-1` 
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
    }`}
  >
    <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className="flex-grow text-left">{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {count}
      </span>
    )}
  </button>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('taskpro_v5');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) { return INITIAL_TASKS; }
  });
  
  const [labels, setLabels] = useState<Label[]>(() => {
    try {
      const saved = localStorage.getItem('labels_v5');
      return saved ? JSON.parse(saved) : INITIAL_LABELS;
    } catch (e) { return INITIAL_LABELS; }
  });
  
  const [activeRange, setActiveRange] = useState<TimeRange>('today');
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => { localStorage.setItem('taskpro_v5', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('labels_v5', JSON.stringify(labels)); }, [labels]);

  const stats = useMemo(() => ({
    past: tasks.filter(t => isPast(t.dueDate) && !t.completed).length,
    today: tasks.filter(t => isToday(t.dueDate) && !t.completed).length,
    tomorrow: tasks.filter(t => isTomorrow(t.dueDate) && !t.completed).length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (currentView !== 'list') return true;
      switch (activeRange) {
        case 'today': return isToday(task.dueDate);
        case 'tomorrow': return isTomorrow(task.dueDate);
        case 'past': return isPast(task.dueDate);
        default: return true;
      }
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, activeRange, currentView]);

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || '',
        description: taskData.description || '',
        completed: false,
        priority: taskData.priority || Priority.MEDIUM,
        dueDate: taskData.dueDate || getLocalDateString(),
        labelIds: taskData.labelIds || [],
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 p-6 flex flex-col gap-8 flex-shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">TaskPro</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">AI Assistant</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] px-4 mb-2 mt-4">Cronograma</p>
          <NavItem 
            active={currentView === 'list' && activeRange === 'past'} 
            onClick={() => { setActiveRange('past'); setCurrentView('list'); }} 
            label="Dias Passados" 
            count={stats.past}
            activeColor="bg-rose-500"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <NavItem 
            active={currentView === 'list' && activeRange === 'today'} 
            onClick={() => { setActiveRange('today'); setCurrentView('list'); }} 
            label="Foco de Hoje" 
            count={stats.today}
            activeColor="bg-indigo-600"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <NavItem 
            active={currentView === 'list' && activeRange === 'tomorrow'} 
            onClick={() => { setActiveRange('tomorrow'); setCurrentView('list'); }} 
            label="Amanhã" 
            count={stats.tomorrow}
            activeColor="bg-emerald-500"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>}
          />
          
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] px-4 mb-2 mt-8">Extras</p>
          <NavItem 
            active={currentView === 'calendar'} 
            onClick={() => setCurrentView('calendar')} 
            label="Calendário" 
            activeColor="bg-slate-800"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <NavItem 
            active={currentView === 'notes'} 
            onClick={() => setCurrentView('notes')} 
            label="Bloco de Notas" 
            activeColor="bg-amber-500"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9" /></svg>}
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-50">
          <button 
            onClick={() => setIsLabelManagerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M7 7h10M7 12h10m-10 5h10" /></svg>
            Etiquetas
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <header className="px-10 py-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {currentView === 'calendar' ? 'Visão Mensal' : 
               currentView === 'notes' ? 'Minhas Notas' :
               activeRange === 'today' ? 'Foco de Hoje' : 
               activeRange === 'tomorrow' ? 'Amanhã' : 'Atrasadas e Passadas'}
            </h2>
            <p className="text-slate-400 font-bold text-sm mt-2">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa' : 'tarefas'} para visualizar.
            </p>
          </div>
          
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-widest flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 5v14M5 12h14"/></svg>
            Nova Tarefa
          </button>
        </header>

        <section className="flex-grow overflow-y-auto px-10 pb-10 custom-scrollbar">
          {currentView === 'calendar' ? (
            <CalendarView tasks={tasks} labels={labels} currentDate={new Date()} onSelectDate={() => {}} onEditTask={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} />
          ) : currentView === 'notes' ? (
            <NotesView tasks={tasks} onUpdateTask={(id, up) => setTasks(prev => prev.map(t => t.id === id ? {...t, ...up} : t))} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTasks.map(task => (
                <div key={task.id} className="task-enter">
                  <TaskItem 
                    task={task} labels={labels} 
                    onToggle={(id) => setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t))} 
                    onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))} 
                    onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} 
                  />
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-300">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-50">
                    <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <p className="text-xl font-bold">Nenhuma tarefa encontrada</p>
                  <p className="text-sm font-medium mt-1 opacity-60">Sua mente está livre por enquanto.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {isTaskModalOpen && <TaskModal task={editingTask} labels={labels} onSave={handleSaveTask} onClose={() => {setIsTaskModalOpen(false); setEditingTask(null);}} />}
      {isLabelManagerOpen && <LabelManager labels={labels} onAdd={(n, c) => setLabels([...labels, {id: Date.now().toString(), name: n, color: c}])} onDelete={(id) => setLabels(labels.filter(l => l.id !== id))} onClose={() => setIsLabelManagerOpen(false)} />}
    </div>
  );
};

export default App;