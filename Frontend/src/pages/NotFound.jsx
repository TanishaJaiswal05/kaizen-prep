import { Link } from "react-router"

const NotFound = () => (
    <main className="not-found">
        <p className="not-found__code">404</p>
        <h1>This page does not exist</h1>
        <p className="not-found__copy">
            The link may be broken, or the report you are looking for was removed.
        </p>
        <Link className="button primary-button" to="/">
            Back to dashboard
        </Link>
    </main>
)

export default NotFound
