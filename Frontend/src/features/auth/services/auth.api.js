import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
})

function toError(err, fallback) {
    // Prefer the API's field-level message, then its top-level message.
    const body = err.response?.data

    return new Error(body?.errors?.[0]?.message || body?.message || fallback)
}

export async function register({ username, email, password }) {
    try {
        const { data } = await api.post("/api/auth/register", { username, email, password })
        return data
    } catch (err) {
        throw toError(err, "Unable to create your account. Please try again.")
    }
}

export async function login({ email, password }) {
    try {
        const { data } = await api.post("/api/auth/login", { email, password })
        return data
    } catch (err) {
        throw toError(err, "Unable to sign in. Please try again.")
    }
}

export async function logout() {
    try {
        const { data } = await api.post("/api/auth/logout")
        return data
    } catch (err) {
        throw toError(err, "Unable to sign out. Please try again.")
    }
}

export async function getMe() {
    try {
        const { data } = await api.get("/api/auth/get-me")
        return data
    } catch (err) {
        throw toError(err, "Unable to restore your session.")
    }
}
