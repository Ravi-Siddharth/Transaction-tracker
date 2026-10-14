import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import "./Login.css";

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const userId = location.state?.userId;
    const otp = location.state?.otp;
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if(!userId || !otp) {
            alert("Session expired. please request OTP again.");
            navigate("/forgot-password");
            return;
        }
        if (newPassword.length < 6) {
            alert("Password must be atleast 6 digits");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try{
            setLoading(true);
            const response =  await axios.post("http://localhost:5000/api/reset-password", {
                userId: userId,
                otp: otp,
                newPassword: newPassword
            });
            alert(response.data.message);
            navigate("/");
        }catch (error) {
            alert(error.response?.data?.error || "Password reset failed");
        }finally {
            setLoading(false);
        }
    };
  return (
    <div className='login-container'>
        <div className='login-box'>
            <h2>Reset Password</h2>
            <p>Enter Your New Password</p>
            <form onSubmit={handleResetPassword}>
                <input 
                type='password'
                placeholder='Enter new password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required />
                <input 
                type='password'
                placeholder='Confirm new password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required />
                <button type='submit' disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
            <button className='register-btn' onClick={() => navigate("/")}>
                Back to Login
            </button>
        </div>
    </div>
  );
}

export default ResetPassword;