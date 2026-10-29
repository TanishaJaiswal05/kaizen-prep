import { Navigate } from "react-router"

import LoadingScreen from "../../../components/LoadingScreen"
import { useAuth } from "../hooks/useAuth"

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return <LoadingScreen message="Checking your session..." />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected
