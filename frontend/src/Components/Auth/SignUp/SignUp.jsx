// src/components/SignUp.js
import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../../Api/authApi';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    if (!name || !email || password.length < 6) {
      toast.error('Please fill out all fields correctly!');
      return;
    }

    try {
      const data = await authApi.signUp(name, email, password);
      localStorage.setItem('token', data.access_token);
      toast.success('Account created successfully!');
      navigate('/otp-verification');
    } catch (error) {
      toast.error(error);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <ToastContainer position="top-right" />
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-900 text-white p-6 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mt-4 text-center">Information Security Project</h2>
          <p className="text-center text-sm mt-2">Your data is safe with us. Sign up to protect your digital world.</p>
        </div>

        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create Account</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />


              {showPassword ? (
                <AiOutlineEyeInvisible
                  className="absolute right-3 top-11 text-xl text-gray-600 cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <AiOutlineEye
                  className="absolute right-3 top-11 text-xl text-gray-600 cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Sign Up
            </button>
          </form>

          <div className="my-4 text-center text-gray-500">or</div>

          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
