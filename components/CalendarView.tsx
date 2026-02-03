
import React from 'react';
import { Task, Label } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, getLocalDateString } from '../utils/dateUtils';

interface CalendarViewProps {
  tasks: Task[];
  labels: Label[];
  currentDate: Date;
  onSelectDate: (date: string) => void;
  onEditTask: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, labels, currentDate, onSelectDate, onEditTask }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const getTasksForDay = (day: number) => {
    const dateStr = getLocalDateString(new Date(year, month, day));
    return tasks.filter(t => t.dueDate.startsWith(dateStr));
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-full w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-7 border-b border-slate-50">
        {weekDays.map(wd => (
          <div key={wd} className="py-6 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">{wd}</div>
        ))}
      </div>
      
      <div className="flex-grow grid grid-cols-7 auto-rows-fr">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="border-r border-b border-slate-50 last:border-r-0" />;
          
          const dayTasks = getTasksForDay(day);
          const isToday = getLocalDateString() === getLocalDateString(new Date(year, month, day));
          
          return (
            <div 
              key={day} 
              onClick={() => onSelectDate(getLocalDateString(new Date(year, month, day)))}
              className={`p-4 border-r border-b border-slate-50 last:border-r-0 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col gap-2 group min-h-[120px] relative overflow-hidden`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-black transition-all ${isToday ? 'text-[#3F51B5] scale-125' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {day}
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5 overflow-hidden">
                {dayTasks.map(t => (
                  <div 
                    key={t.id}
                    onClick={(e) => { e.stopPropagation(); onEditTask(t); }}
                    className={`text-[9px] px-2.5 py-1.5 rounded-lg truncate font-bold border transition-all ${
                      t.completed 
                        ? 'bg-slate-50 text-slate-300 border-slate-100 opacity-60' 
                        : 'bg-[#EEF2FF] text-[#3F51B5] border-indigo-100 hover:shadow-md hover:bg-white'
                    }`}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
