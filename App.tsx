
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Label, TimeRange, Priority, ViewType } from './types';
import { INITIAL_LABELS, INITIAL_TASKS } from './constants';
import { isToday, isTomorrow, isPast, getLocalDateString, generateRecurringDates } from './utils/dateUtils';
import TaskItem from './components/TaskItem';
import TaskModal from './components/TaskModal';
import LabelManager from './components/LabelManager';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';

interface SidebarItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ active, onClick, icon, label, count, isCollapsed }) => (
  <button 
    onClick={onClick} 
    title={isCollapsed ? label : undefined}
    className={`relative w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${active ? 'bg-[#EEF2FF] text-[#3F51B5]' : 'text-slate-400 hover:bg-slate-50 hover:text-[#2A2A5E]'}`}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#3F51B5] rounded-r-full" />}
    <span className={`${active ? 'text-[#3F51B5]' : 'text-slate-300'} flex-shrink-0`}>{icon}</span>
    {!isCollapsed && <span className="flex-grow text-left font-bold truncate">{label}</span>}
    {!isCollapsed && count !== undefined && (
      <span className={`min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-[10px] font-black ${active ? 'bg-[#3F51B5] text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
    )}
  </button>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tasks_elite_v2');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });
  
  const [labels, setLabels] = useState<Label[]>(() => {
    try {
      const saved = localStorage.getItem('labels_elite_v2');
      return saved ? JSON.parse(saved) : INITIAL_LABELS;
    } catch (e) {
      return INITIAL_LABELS;
    }
  });
  
  const [activeRange, setActiveRange] = useState<TimeRange>('today');
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks_elite_v2', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('labels_elite_v2', JSON.stringify(labels));
  }, [labels]);

  useEffect(() => {
    const todayStr = getLocalDateString();
    const tasksToTrigger = tasks.filter(t => t.webhookEnabled && t.dueDate === todayStr && !t.completed);
    
    tasksToTrigger.forEach(async (task) => {
      try {
        const webhookKey = `webhook_triggered_${task.id}_${todayStr}`;
        if (localStorage.getItem(webhookKey)) return;

        await fetch('https://nen.auto-jornada.space/webhook/calendário', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'task_due_today',
            timestamp: new Date().toISOString(),
            task: task
          })
        });
        localStorage.setItem(webhookKey, 'true');
      } catch (err) {
        console.error('Falha ao disparar webhook:', err);
      }
    });
  }, [tasks]);

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
      if (!titleLower.includes(queryLower)) return false;

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
      const baseId = Math.random().toString(36).substr(2, 9);
      const newTaskTemplate = {
        title: taskData.title || '',
        description: taskData.description || '',
        completed: false,
        priority: taskData.priority || Priority.MEDIUM,
        labelIds: taskData.labelIds || [],
        createdAt: new Date().toISOString(),
        webhookEnabled: taskData.webhookEnabled,
      };

      if (taskData.recurrence && taskData.recurrence.type !== 'none' && taskData.recurrence.until) {
        const recurringDates = generateRecurringDates(taskData.dueDate || getLocalDateString(), taskData.recurrence.type, taskData.recurrence.until);
        const recurringTasks: Task[] = recurringDates.map((date, idx) => ({
          ...newTaskTemplate,
          id: `${baseId}-${idx}`,
          dueDate: date,
          recurrence: taskData.recurrence ? { ...taskData.recurrence, parentId: baseId } : undefined
        }));
        setTasks(prev => [...recurringTasks, ...prev]);
      } else {
        const singleTask: Task = {
          ...newTaskTemplate,
          id: baseId,
          dueDate: taskData.dueDate || getLocalDateString(),
        };
        setTasks(prev => [singleTask, ...prev]);
      }
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const formattedCalendarTitle = useMemo(() => {
    const monthName = calendarDate.toLocaleDateString('pt-BR', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} De ${calendarDate.getFullYear()}`;
  }, [calendarDate]);

  return (
    <div className="flex h-screen bg-[#F8F9FD] overflow-hidden text-[#2A2A5E]">
      <aside className={`fixed inset-y-0 left-0 z-50 ${isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'} bg-white border-r border-slate-100 transition-all duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full relative">
          <div className={`p-8 flex items-center gap-3 transition-all ${isSidebarCollapsed ? 'p-6 justify-center' : ''}`}>
            <div className="w-10 h-10 bg-[#3F51B5] rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-lg font-black text-[#2A2A5E] leading-none">TaskPro <span className="text-[#3F51B5]">AI</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ORGANIZAÇÃO ELITE</p>
              </div>
            )}
          </div>
          <div className="flex-grow px-4 overflow-y-auto pt-4">
            <nav className="space-y-1">
              <SidebarItem isCollapsed={isSidebarCollapsed} active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>} label="Calendário Mensal" />
              <SidebarItem isCollapsed={isSidebarCollapsed} active={currentView === 'list' && activeRange === 'past'} onClick={() => { setCurrentView('list'); setActiveRange('past'); }} icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></svg>} label="Dias Passados" />
              <SidebarItem isCollapsed={isSidebarCollapsed} active={currentView === 'list' && activeRange === 'today'} onClick={() => { setCurrentView('list'); setActiveRange('today'); }} icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M3 10h18" /></svg>} label="Foco de Hoje" count={stats.today} />
              <SidebarItem isCollapsed={isSidebarCollapsed} active={currentView === 'list' && activeRange === 'tomorrow'} onClick={() => { setCurrentView('list'); setActiveRange('tomorrow'); }} icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /></svg>} label="Amanhã" count={stats.tomorrow} />
              <SidebarItem isCollapsed={isSidebarCollapsed} active={currentView === 'notes'} onClick={() => setCurrentView('notes')} icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>} label="Notas" />
            </nav>
          </div>
          <div className="p-6 border-t border-slate-50">
            <button onClick={() => setIsLabelManagerOpen(true)} className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 7h10v10H7z" /></svg>
               {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase">Etiquetas</span>}
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        <header className="px-10 py-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#2A2A5E]">
            {currentView === 'calendar' ? formattedCalendarTitle : currentView === 'notes' ? 'Minhas Notas' : 'Tarefas'}
          </h2>
          <div className="flex items-center gap-3">
            {currentView === 'calendar' && (
              <div className="flex bg-white rounded-xl shadow-sm border border-slate-100">
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="p-2 border-r border-slate-50"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" /></svg></button>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="p-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg></button>
              </div>
            )}
            <button onClick={() => setIsTaskModalOpen(true)} className="bg-[#3F51B5] text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-[#303F9F] transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 5v14M5 12h14" /></svg> NOVO
            </button>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto px-10 pb-10 custom-scrollbar">
          {currentView === 'calendar' ? (
            <CalendarView tasks={tasks} labels={labels} currentDate={calendarDate} onSelectDate={(d) => { setIsTaskModalOpen(true); }} onEditTask={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} />
          ) : currentView === 'notes' ? (
            <NotesView tasks={tasks} onUpdateTask={(id, updates) => setTasks(prev => prev.map(t => t.id === id ? {...t, ...updates} : t))} />
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {filteredTasks.map(task => (
                <TaskItem key={task.id} task={task} labels={labels} onToggle={(id) => setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t))} onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))} onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} />
              ))}
            </div>
          )}
        </div>
      </main>
      {isTaskModalOpen && <TaskModal task={editingTask} labels={labels} onSave={handleSaveTask} onClose={() => {setIsTaskModalOpen(false); setEditingTask(null);}} />}
      {isLabelManagerOpen && <LabelManager labels={labels} onAdd={(n, c) => setLabels([...labels, {id: Date.now().toString(), name: n, color: c}])} onDelete={(id) => setLabels(labels.filter(l => l.id !== id))} onClose={() => setIsLabelManagerOpen(false)} />}
    </div>
  );
};

export default App;
