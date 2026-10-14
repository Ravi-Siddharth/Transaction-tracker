import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import { useState } from 'react';

function ForgotPassword() {
  const navigate = useNavigate();
  const[email, setEmail] = useState("");
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try{
      const response = await axios.post(
        "/api/forgot-password",
        {
          email: email
        }
      );
      alert(response.data.message);
      navigate("/verify-otp", {
        state: {
          userId: response.data.userId,
          email: email
        }
      })
    }catch (error){
      alert(error.response?.data?.error || "something went wrong")
    }
  };
  return (
     <div className="login-container">

            <div className="login-box">

                <h2>Forgot Password</h2>

                <p>
                    Enter your registered email address
                </p>

                <form onSubmit={handleForgotPassword}>

                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Reset Password
                    </button>

                </form>

                <button
                    className="register-btn"
                    onClick={() => navigate("/")}
                >
                    Back to Login
                </button>

            </div>

        </div>
  )
}

export default ForgotPassword