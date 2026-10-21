import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = async () => {
        try {
            const response = await api.get('/api/auth/me')
            setUser(response.data.user)
        } catch (error) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const login = async (credentials) => {
        await api.post('/api/auth/login', credentials)
        await fetchUser()
    }

    const register = async (credentials) => {
        await api.post('/api/auth/register', credentials)
    }

    const logout = async () => {
        try {
            await api.post('/api/auth/logout')
        } finally {
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>{children}</AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if(!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}