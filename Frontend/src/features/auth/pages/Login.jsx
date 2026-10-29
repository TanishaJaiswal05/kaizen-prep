import { useState } from "react"
import { Link, useNavigate } from "react-router"

import "../auth.form.scss"
import { useAuth } from "../hooks/useAuth"

const Login = () => {
    const { loading, error, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        const didSignIn = await handleLogin({ email, password })

        if (didSignIn) {
            navigate("/", { replace: true })
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Welcome back</h1>
                <p className="form-subtitle">Sign in to see your interview plans.</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <p className="form-error" role="alert">{error}</p>}

                    <button className="button primary-button" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p>Don't have an account? <Link to="/register">Create one</Link></p>
            </div>
        </main>
    )
}

export default Login
