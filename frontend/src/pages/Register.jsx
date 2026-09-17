import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        email: email.trim(),
                        password: password,
                    }),
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Registration failed");
            }

            setSuccess("Registration successful!");

            setTimeout(() => {
                navigate("/");
            }, 1000);

        } catch (error) {
            console.error("Registration error:", error);
            setError(
                error.message || "Unable to create account."
            );
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
                        Your story
                        <br />
                        starts here.
                    </h1>

                    <p>
                        Create your account and start turning
                        your ideas into stories worth telling.
                    </p>

                    <div className="login-quote">
                        Every great story starts with an idea.
                    </div>

                </div>

                <div className="login-card">

                    <h2>
                        Create account
                    </h2>

                    <p className="login-subtitle">
                        Start writing your story.
                    </p>

                    <form onSubmit={handleRegister}>

                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                required
                            />

                        </div>
                        <div className="form-group">
                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
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
                                placeholder="Create a password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                required
                            />

                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="login-success">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Account →"}
                        </button>

                    </form>

                    <div className="register-signin">
                        <span>Already have an account?</span>

                        <button
                            type="button"
                            className="register-signin-button"
                            onClick={() => navigate("/")}
                        >
                            Sign In →
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;