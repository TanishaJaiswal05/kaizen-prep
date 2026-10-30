import axios from "axios"

// Production is same-origin: an empty base makes axios emit relative "/api/..."
// URLs. The dev server runs on a different port, so it needs the explicit host.
const API_BASE_URL =
    import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : "")

const api = axios.create({
    baseURL: API_BASE_URL,
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
