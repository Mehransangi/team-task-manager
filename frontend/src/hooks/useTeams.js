import { useEffect, useState } from 'react'
import api from '../services/api'

export function useTeams() {
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTeams = async () => {
        try {
            const response = await api.get('/api/teams')
            setTeams(response.data)
        } catch (error) {
            console.log('Error in loading teams: ', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeams()
    }, [])
    return { teams, loading, reflect: fetchTeams }
}