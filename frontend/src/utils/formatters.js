export const STATUS_LABELS = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const parseDateOnly = (value) => {
  if (!value) return null;

  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

export const formatDate = (value) => {
  const date = parseDateOnly(value);
  if (!date) return '';

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const daysUntil = (value, now = new Date()) => {
  const date = parseDateOnly(value);
  if (!date) return null;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date - today) / 86400000);
};

export const isOverdue = (task, now = new Date()) => {
  const days = daysUntil(task.due_date, now);
  return task.status !== 'done' && days !== null && days < 0;
};

export const describeDue = (value, now = new Date()) => {
  const days = daysUntil(value, now);
  if (days === null) return '';
  if (days < 0) return `${Math.abs(days)} day${days === -1 ? '' : 's'} overdue`;
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  return `due in ${days} days`;
};
