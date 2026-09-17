import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectEditor from "./pages/ProjectEditor";
import CharacterReport from "./pages/CharacterReport";
import Register from "./pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import SessionExpiredModal from "./components/SessionExpiredModal";

function App() {

    const [sessionExpired, setSessionExpired] = useState(false);

    /*
     * Listen for session-expired events coming from auth.js
     */
    useEffect(() => {

        const handleSessionExpired = () => {
            setSessionExpired(true);
        };

        window.addEventListener(
            "session-expired",
            handleSessionExpired
        );

        return () => {
            window.removeEventListener(
                "session-expired",
                handleSessionExpired
            );
        };

    }, []);

    /*
     * Automatically detect JWT expiration
     */
    useEffect(() => {

        const checkTokenExpiration = () => {

            if (sessionExpired) {
                return;
            }

            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            try {

                const parts = token.split(".");

                if (parts.length !== 3) {
                    return;
                }

                const payload = JSON.parse(
                    atob(
                        parts[1]
                            .replace(/-/g, "+")
                            .replace(/_/g, "/")
                    )
                );

                if (!payload.exp) {
                    return;
                }

                const expirationTime =
                    payload.exp * 1000;

                if (Date.now() >= expirationTime) {

                    window.dispatchEvent(
                        new CustomEvent("session-expired")
                    );

                }

            } catch (error) {

                console.error(
                    "JWT expiration check failed:",
                    error
                );

            }
        };

        checkTokenExpiration();

        const interval = setInterval(
            checkTokenExpiration,
            1000
        );

        return () => {
            clearInterval(interval);
        };

    }, [sessionExpired]);
    /*
     * User clicks "Sign In →"
     */
    const handleSessionLogin = () => {

        setSessionExpired(false);

        /*
         * Remove the expired token only now,
         * after the popup has been displayed.
         */
        localStorage.removeItem("token");

        window.location.href = "/";

    };

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    element={<ProtectedRoute />}
                >

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/project/:id"
                        element={<ProjectEditor />}
                    />

                    <Route
                        path="/project/:id/characters"
                        element={<CharacterReport />}
                    />

                </Route>

            </Routes>

            {sessionExpired && (
                <SessionExpiredModal
                    onLogin={handleSessionLogin}
                />
            )}

        </BrowserRouter>
    );
}

export default App;