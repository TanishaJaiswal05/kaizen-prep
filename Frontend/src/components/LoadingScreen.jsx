const LoadingScreen = ({ message = "Loading..." }) => (
    <main className="loading-screen">
        <span className="loading-screen__spinner" aria-hidden="true" />
        <p>{message}</p>
    </main>
)

export default LoadingScreen
