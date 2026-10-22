import { useCallback, useEffect, useState } from 'react';
import { teamApi } from '../services/teamApi';
import { getErrorMessage } from '../utils/validators';

export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTeams = useCallback(async () => {
    try {
      const response = await teamApi.getAll();
      setTeams(response.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load teams.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refetch: fetchTeams };
}
