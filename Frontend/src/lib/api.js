import axios from "axios"

// Production is same-origin: an empty base makes axios emit relative "/api/..."
// URLs. The dev server runs on a different port, so it needs the explicit host.
const API_BASE_URL =
    import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : "")

// One instance for every feature so the cookie is always sent and the base URL
// is decided in exactly one place.
export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})
