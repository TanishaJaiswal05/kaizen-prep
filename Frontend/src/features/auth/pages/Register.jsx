import { useState } from "react"
import { Link, useNavigate } from "react-router"

import "../auth.form.scss"
import { useAuth } from "../hooks/useAuth"

const Register = () => {
    const { loading, error, handleRegister } = useAuth()
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        const didRegister = await handleRegister({ username, email, password })

        if (didRegister) {
            navigate("/", { replace: true })
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Create your account</h1>
                <p className="form-subtitle">Build a tailored interview plan in under a minute.</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            id="username"
                            name="username"
                            autoComplete="username"
                            placeholder="Choose a username"
                            minLength={3}
                            maxLength={30}
                            required
                        />
                    </div>
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
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            minLength={8}
                            required
                        />
                    </div>

                    {error && <p className="form-error" role="alert">{error}</p>}

                    <button className="button primary-button" type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </main>
    )
}

export default Register
