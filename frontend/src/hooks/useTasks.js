import { useEffect, useState } from "react";
import api from "../services/api";

export function useTasks() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTasks = async () => {
        try {
            const response = await api.get('/api/tasks')
            setTasks(response.data)
        } catch (error) {
            console.log('Error in fetching tasks: ', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(()=> {
        fetchTasks()
    }, [])

    return { tasks, loading, refetch: fetchTasks}
}