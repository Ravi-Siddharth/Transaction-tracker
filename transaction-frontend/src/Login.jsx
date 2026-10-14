import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault(); 

        try {
            const response = await axios.post(
                "http://localhost:5000/api/login",
                {
                    email: email,
                    password: password
                }
            );

            const token = response.data.token;

            localStorage.setItem("token", token);

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            alert(response.data.message);

            navigate("/dashboard");

        } catch (error) {
            alert(
                error.response?.data?.error || "Login failed"
            );
        }
    };

    return (
        <div className="login-container">

            <div className="login-box">

                <h2>Login</h2>

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">
                        Login
                    </button>

                </form>
                <button 
                className="forgot-password-btn"
                onClick={() => navigate("/forgot-password")}
                >Forgot Password?</button>

                <button
                    className="register-btn"
                    onClick={() => navigate("/register")}
                >
                    Create Account
                </button>

            </div>

        </div>
    );
}

export default Login;

