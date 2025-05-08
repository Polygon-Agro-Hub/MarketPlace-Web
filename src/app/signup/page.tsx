"use client"
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';


export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHome, setIsHome] = useState(true);

  return (
    <div className="flex w-full bg-gray-100 min-h-screen overflow-auto ">
      <div className="flex min-w-full mx-auto shadow-lg rounded-lg max-h-screen bg-[white] overflow-auto ">
        {/* Left side - Form */}
        <div className="w-full md:w-5/11 px-6 pt-8 md:px-10 md:pt-8 ">
          <h1 className="text-4xl font-bold text-[#3E206D] mb-4 text-center ">MyFarm</h1>

          <h2 className="text-xl font-bold text-center md:text-left text-[#001535] mb-6">Create Your Account</h2>

          {/* Account Type Selection */}
          <div className="flex space-x-3 mb-8 md:mb-10 justify-center">
            <label className="flex flex-nowrap text-[#3F3F3F] font-medium items-center justify-center w-1/2 border rounded-md px-4 py-2 cursor-pointer bg-white hover:text-[#3E206D]">
              <input
                type="radio"
                name="accountType"
                checked={isHome}
                onChange={() => setIsHome(true)}
                className="mr-2 h-4 w-4 accent-[#3E206D]"
              />
              <span className="whitespace-nowrap text-xs md:text-base">I'm Buying for Home</span>
            </label>

            <label className="flex flex-nowrap text-[#3F3F3F] font-medium items-center justify-center w-1/2 border rounded-md px-4 py-2 cursor-pointer bg-white hover:text-[#3E206D]">
              <input
                type="radio"
                name="accountType"
                checked={!isHome}
                onChange={() => setIsHome(false)}
                className="mr-2 h-4 w-4 accent-[#3E206D]"
              />
              <span className="whitespace-nowrap text-xs md:text-base">I'm Buying for Business</span>
            </label>
          </div>


          {/* Social Sign Up - Hidden on mobile, visible on md and up */}
          <div className="hidden md:block">
            <p className="text-[#4C5160] font-medium mb-6 text-center">Welcome! Select method to Signup :</p>

            {/* Social Sign Up */}
            <div className="flex space-x-3 mb-4 hover:text-[#3E206D]">
              <button className="cursor-pointer flex items-center justify-center w-1/2 border rounded-md px-4 py-2 hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button className="cursor-pointer flex items-center justify-center w-1/2 border rounded-md px-4 py-2 hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-4 text-blue-600" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                </svg>
                Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center mt-10 mb-8">
              <div className="flex-grow border-t border-[#8D8D8D]"></div>
              <span className="px-4 text-sm text-gray-500">or continue with email</span>
              <div className="flex-grow border-t border-[#8D8D8D]"></div>
            </div>
          </div>

          <div className="flex items-center mb-4 ">
            <div className="text-[#3E206D] mr-4 whitespace-nowrap">Personal Details</div>
            <div className="flex-grow border-t border-[#E2E2E2]"></div>
          </div>

          <div className="px-2 md:px-0 md:pt-0">


            {/* Personal Details Form */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                {/* Row for Title + First Name */}
                <div className="flex flex-row w-full md:w-5/8 space-x-2">
                  {/* Title */}
                  <div className="w-1/4 md:w-2/5">
                    <select className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500">
                      <option>Title</option>
                      <option>Mr.</option>
                      <option>Mrs.</option>
                      <option>Ms.</option>
                    </select>
                  </div>

                  {/* First Name */}
                  <div className="w-3/4 md:w-3/5">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="w-full md:w-3/8">
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:space-x-3 space-y-4 md:space-y-0">
                {/* Group: +94 + 7XXXXXXXX */}
                <div className="flex flex-row w-full md:w-5/8 space-x-3">
                  {/* +94 Select */}
                  <div className="w-1/4 md:w-2/5">
                    <select className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500">
                      <option>+94</option>
                      <option>--</option>
                      <option>--</option>
                    </select>
                  </div>

                  {/* Phone Number Input */}
                  <div className="w-3/4  md:w-3/5">
                    <input
                      type="text"
                      placeholder="7XXXXXXXX"
                      className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="w-full md:w-3/8">
                  <input
                    type="email"
                    placeholder="Email"
                    className="h-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:space-x-3 space-y-4 md:space-y-0">
                <div className="w-full md:w-1/2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:text-[#3E206D]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} className="text-[#3E206D]" /> : <Eye size={20} className="text-[#3E206D]" />}
                  </button>
                </div>

                <div className="w-full md:w-1/2 relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:text-[#3E206D]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} className="text-[#3E206D]" /> : <Eye size={20} className="text-[#3E206D]" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-600 pl-1 flex flex-row gap-2 md:flex-row items-start md:items-center">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center mb-2 md:mb-0 md:mr-1">
                  <span className="text-xs text-[#ffffff]">i</span>
                </div>
                <div className="text-[#3E206D] text-xs md:text-sm">
                  Your password must contain a minimum of 6 characters with 1 Uppercase, Numbers & Special Characters.
                </div>
              </div>

              <div className="flex items-center mt-8 mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 accent-[#318831] cursor-pointer text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-md text-[#777A7D]">
                  I agree to the Terms & Conditions
                </label>
              </div>

              <div className="flex items-center mb-8 md:mb-10">
                <input
                  type="checkbox"
                  id="marketing"
                  className="h-4 w-4 accent-[#318831] cursor-pointer text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="marketing" className="ml-2 block text-md text-[#777A7D]">
                  I would prefer receiving promotion E-mails
                </label>
              </div>

              <button
                type="submit"
                className="flex w-3/5 md:text-lg items-center justify-center bg-[#3E206D] text-[#FFFFFF] rounded-md py-2 hover:bg-purple-800 transition duration-200 mx-auto"
              >
                Register
              </button>

              <p className="text-center text-md text-[#6B6B6B] mt-4 ">
                Already have an account? <a href="#" className="text-[#094EE8] hover:underline">Login here</a>
              </p>
            </div>

            {/* Right side - Image placeholder */}

          </div>
        </div>

        <div className="hidden md:block md:w-6/11 md:min-h-screen bg-purple-900">
          <img
            src="/profileImage.png"
            alt="Description of image"
            className="w-263 h-222 object-cover"
          />
        </div>

      </div>
    </div>
  );
}