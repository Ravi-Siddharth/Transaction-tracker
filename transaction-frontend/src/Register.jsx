import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });
    const handleChange = (e) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        });
    };
    const handleRegister = async (e) => {
        e.preventDefault();
        try{
            const response = await axios.post(
                "/api/register",
                formData
            );
            alert(response.data.message);
            navigate("/");
        }catch(error){
            console.log(error);
            
            alert(
                error.response?.data?.error || "Registration failed"
            );
        }
    };
  return (
    <div>
        <h2>Registration</h2>
        <form onSubmit={handleRegister}>
            <input 
            type='text'
            name='firstName'
            placeholder='Enter First Name'
            value={formData.firstName}
            onChange={handleChange} />
            <br />
            <br />
            <input 
            type='text'
            name='lastName'
            placeholder='Enter Last name'
            value={formData.lastName} 
            onChange={handleChange} />
            <br />
            <br />
            <input 
            type='text'
            name='email'
            placeholder='Enter Email'
            value={formData.email}
            onChange={handleChange} />
            <br />
            <br />
            <input 
            type='password'
            name='password'
            placeholder='Enter Password'
            value={formData.password}
            onChange={handleChange} />
            <br />
            <br />
            <button type='submit'>Register</button>
        </form>
        <br />
        <button onClick={() => navigate("/")}> Alredy have an account? Login</button>
    </div>
  );
}

export default Register;