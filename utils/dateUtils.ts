
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const taskDate = dateStr.split('T')[0];
  const today = getLocalDateString();
  return taskDate === today;
}

export function isTomorrow(dateStr: string): boolean {
  if (!dateStr) return false;
  const taskDate = dateStr.split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = getLocalDateString(tomorrowDate);
  return taskDate === tomorrow;
}

export function isPast(dateStr: string): boolean {
  if (!dateStr) return false;
  const taskDate = dateStr.split('T')[0];
  const today = getLocalDateString();
  return taskDate < today;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "Sem data";
  const taskDate = dateStr.split('T')[0];
  const today = getLocalDateString();
  
  if (taskDate === today) return "Hoje";
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  if (taskDate === getLocalDateString(tomorrowDate)) return "Amanhã";

  const parts = taskDate.split('-');
  if(parts.length < 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function generateRecurringDates(startDate: string, type: string, until: string): string[] {
  const dates: string[] = [];
  let current = new Date(startDate + 'T00:00:00');
  const endDate = new Date(until + 'T23:59:59');

  // Adiciona a primeira data
  dates.push(getLocalDateString(current));

  while (true) {
    if (type === 'daily') current.setDate(current.getDate() + 1);
    else if (type === 'weekly') current.setDate(current.getDate() + 7);
    else if (type === 'monthly') current.setMonth(current.getMonth() + 1);
    else if (type === 'yearly') current.setFullYear(current.getFullYear() + 1);
    else break;

    if (current > endDate) break;
    dates.push(getLocalDateString(current));
    
    // Safety break to prevent infinite loops (max 366 instances for a year)
    if (dates.length > 366) break;
  }
  return dates;
}
