import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Invalid username or password");
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);

            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-container">

                <div className="login-intro">

                    <div className="login-logo">
                        🎬
                    </div>

                    <div className="login-brand">
                        SCREENWRITER
                    </div>

                    <h1>
                        Every great story
                        <br />
                        starts with an idea.
                    </h1>

                    <p>
                        Turn your ideas, characters and imagination
                        into stories worth telling.
                    </p>

                    <div className="login-quote">
                        Your next story is waiting to be written.
                    </div>

                </div>

                <div className="login-card">

                    <h2>
                        Welcome back
                    </h2>

                    <p className="login-subtitle">
                        Sign in to continue writing.
                    </p>

                    <form onSubmit={handleLogin}>

                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />

                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In →"}
                        </button>

                    </form>

                    <div className="login-footer">
                        <span>Your stories. Your world. Your voice.</span>

                        <div className="login-register">
                            <span>Don't have an account? </span>
                            <button
                                type="button"
                                className="login-register-button"
                                onClick={() => navigate("/register")}
                            >
                                Register →
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default Login;