import { escapeLike } from './sanitize.js';

export function buildTaskFilter(filters = {}) {
  const clauses = [];
  const params = [];

  const addParam = (value) => {
    params.push(value);
    return `$${params.length + 1}`;
  };

  if (filters.team_id) {
    clauses.push(`t.team_id = ${addParam(Number(filters.team_id))}`);
  }

  if (filters.assignee_id === 'me') {
    clauses.push('t.assignee_id = $1');
  } else if (filters.assignee_id === 'unassigned') {
    clauses.push('t.assignee_id IS NULL');
  } else if (filters.assignee_id) {
    clauses.push(`t.assignee_id = ${addParam(Number(filters.assignee_id))}`);
  }

  if (filters.status) {
    clauses.push(`t.status = ${addParam(filters.status)}`);
  }

  if (filters.priority) {
    clauses.push(`t.priority = ${addParam(filters.priority)}`);
  }

  if (filters.search) {
    const placeholder = addParam(`%${escapeLike(filters.search)}%`);
    clauses.push(`(t.title ILIKE ${placeholder} OR t.description ILIKE ${placeholder})`);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}
