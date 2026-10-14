import React from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import "./Login.css"
import { useState } from 'react';

function OtpVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const[otp, setOtp] = useState("");
    const[loading, setLoading] = useState();
    const userId = location.state?.userId;
    const email = location.state?.email;
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            alert("Please enter a 6-digit OTP");
            return;
        }
        if (!userId) {
            alert("User information is missing. Please request OTP again");
            return;
        }
        try{
            setLoading(true);
            const response = await axios.post("/api/verify-otp", {userId: userId, otp: otp});
            alert(response.data.message);
            navigate("/reset-password", {
                state: {
                    userId: userId,
                    otp: otp,
                    email: email
                }
            });
        }catch (error) {
            alert(
                error.response?.data?.error || "OTP verification failed"
            );
        }finally {
            setLoading(false);
        }
    };
  return (
    <div className='login-container'>
        <div className='login-box'>
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit OTP sent </p>
            {email && (
                <p>
                    <strong>{email}</strong>
                </p>
            )}
            <form onSubmit={handleVerifyOtp}>
                <input 
                type= "text"
                placeholder='Enter 6-digit OTP'
                value={otp}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0,6)
                    setOtp(value);
                }}
                maxLength="6"
                inputMode='numeric'
                required />
                <button type='submit' disabled={loading}>
                    {loading ? "Verifying..." : "Verify Otp"}
                </button>
            </form>
            <button className='register-btn' onClick={() => navigate("/forgot-password")}>Back</button>

        </div>
    </div>
  );
}

export default OtpVerification;