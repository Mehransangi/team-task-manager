export const validateTaskForm = (form) => {
  const title = form.title?.trim() ?? '';

  if (!form.team_id) return 'Please select a team.';
  if (!title) return 'Please enter a task title.';
  if (title.length > 200) return 'The title must be 200 characters or fewer.';
  if ((form.description ?? '').length > 2000) return 'The description must be 2000 characters or fewer.';

  return '';
};

export const validateTeamForm = (form) => {
  const name = form.name?.trim() ?? '';

  if (name.length < 2) return 'The team name must be at least 2 characters.';
  if (name.length > 100) return 'The team name must be 100 characters or fewer.';
  if ((form.description ?? '').length > 500) return 'The description must be 500 characters or fewer.';

  return '';
};

export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || fallback;
