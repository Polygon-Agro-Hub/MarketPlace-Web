'use client';

import React, { useState } from 'react'
import Head from 'next/head';
import { GoogleLoginButton, FacebookLoginButton } from 'react-social-login-buttons';
import { login } from '@/services/auth-service';
import { useRouter } from 'next/navigation';


const page = () => {
  const router = useRouter();
  const [userType, setUserType] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ email, password });
      console.log('Login success:', data);
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
 
        router.push('/');
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
    {/* Left Panel (Login Form) */}
    <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-16">
      <h1 className="text-2xl font-bold text-purple-800 mb-2 text-center">MyFarm</h1>
      <h2 className="text-lg font-semibold mb-6 text-center">Log in to your Account</h2>

      {/* Buyer Type Toggle */}
      <div className="flex mb-6 space-x-2">
        <button
          onClick={() => setUserType('home')}
          className={`flex-1 px-4 py-2 border rounded-md flex items-center justify-start space-x-2 text-sm sm:text-base ${
            userType === 'home'
              ? 'bg-purple-100 text-purple-800 border-purple-500'
              : 'bg-white text-gray-800 border-gray-300'
          }`}
        >
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            userType === 'home' ? 'border-purple-800' : 'border-gray-400'
          }`}>
            {userType === 'home' && <span className="w-2 h-2 bg-purple-800 rounded-full" />}
          </span>
          <span>I’m Buying for Home</span>
        </button>

        <button
          onClick={() => setUserType('business')}
          className={`flex-1 px-4 py-2 border rounded-md flex items-center justify-start space-x-2 text-sm sm:text-base ${
            userType === 'business'
              ? 'bg-purple-100 text-purple-800 border-purple-500'
              : 'bg-white text-gray-800 border-gray-300'
          }`}
        >
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            userType === 'business' ? 'border-purple-800' : 'border-gray-400'
          }`}>
            {userType === 'business' && <span className="w-2 h-2 bg-purple-800 rounded-full" />}
          </span>
          <span>I’m Buying for Business</span>
        </button>
      </div>


      <p className="mb-4 text-gray-600">Welcome! Select method to log in:</p>

      {/* Social Login Buttons */}
      <div className="flex space-x-4 mb-6">
        <button className="flex-1 py-2 border rounded-md flex items-center justify-center space-x-2">
          <img src="/icons/google.png" className="w-5 h-5" alt="Google" />
          <span>Google</span>
        </button>
        <button className="flex-1 py-2 border rounded-md flex items-center justify-center space-x-2">
          <img src="/icons/facebook.png" className="w-5 h-5" alt="Facebook" />
          <span>Facebook</span>
        </button>
      </div>

      <div className="flex items-center mb-6">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="mx-2 text-sm text-gray-400">or continue with email</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-10 py-2 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <img src="/icons/mail.png" className="w-5 h-5" alt="Google" />
          </span>
        </div>
        <div className="relative">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-10 py-2 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <img src="/icons/Lock.png" className="w-5 h-5" alt="Google" />
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="accent-[#229e11]" />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-[#094EE8] hover:underline">Forgot Password?</a>
        </div>

        <button type="submit" className="w-full bg-[#3E206D] text-white py-2 rounded-md mt-4">
          Log in
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        Don’t have an account?{' '}
        <a href="#" className="text-[#094EE8] hover:underline">Create an account</a>
      </p>
    </div>

    {/* Right Panel (Image) - Hidden on small screens */}
    <div className="hidden md:flex md:w-1/2 items-center justify-center bg-[#3E206D] relative">
      <img src="/images/login.png" alt="Farmer" className="w-full h-full absolute inset object-cover" />
    </div>
  </div>
  )
}

export default page
