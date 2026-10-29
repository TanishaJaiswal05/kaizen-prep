import { useCallback, useContext, useEffect } from "react"

import { AuthContext } from "../auth.context"
import { getMe, login, logout, register } from "../services/auth.api"

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading, error, setError } = context

    const run = useCallback(
        async (request, fallbackMessage) => {
            setLoading(true)
            setError(null)

            try {
                const data = await request()
                return data
            } catch (err) {
                setError(err.message || fallbackMessage)
                return null
            } finally {
                setLoading(false)
            }
        },
        [setError, setLoading]
    )

    const handleLogin = async ({ email, password }) => {
        const data = await run(() => login({ email, password }), "Unable to sign in.")

        if (!data) return false

        setUser(data.user)
        return true
    }

    const handleRegister = async ({ username, email, password }) => {
        const data = await run(
            () => register({ username, email, password }),
            "Unable to create your account."
        )

        if (!data) return false

        setUser(data.user)
        return true
    }

    const handleLogout = async () => {
        try {
            await logout()
        } catch {
            // The cookie is cleared server-side; ignore network failures so the
            // user can always sign out locally.
        }

        setUser(null)
        return true
    }

    // Rehydrate the session from the cookie on first load.
    useEffect(() => {
        let cancelled = false

        const loadUser = async () => {
            try {
                const data = await getMe()
                if (!cancelled) setUser(data.user)
            } catch {
                // Not signed in: this is an expected state, not an error.
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadUser()

        return () => {
            cancelled = true
        }
    }, [setUser, setLoading])

    return { user, loading, error, setError, handleRegister, handleLogin, handleLogout }
}
