import { useCallback, useEffect, useRef, useState } from 'react';
import { taskApi } from '../services/taskApi';
import { getErrorMessage } from '../utils/validators';

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const latestRequest = useRef(0);

  const filterKey = JSON.stringify(filters);

  const fetchTasks = useCallback(async () => {
    const requestId = ++latestRequest.current;
    const params = JSON.parse(filterKey);

    try {
      const response = await taskApi.getAll(params);
      if (requestId !== latestRequest.current) return;
      setTasks(response.data);
      setError('');
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setError(getErrorMessage(err, 'Failed to load tasks.'));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}
