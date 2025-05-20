'use client';

import React, { useState } from 'react';
import { FaAngleLeft, FaUser, FaAddressCard } from 'react-icons/fa';


const LeftSidebar = ({ selectedMenu, setSelectedMenu }) => {
  const [backClicked, setBackClicked] = useState(false);

  const handleBackClick = () => {
    setBackClicked(true);
    setTimeout(() => setBackClicked(false), 300);
    // Optional: Add router.back() if needed
  };

  return (
    <div className="w-[70px] md:w-[336px] min-h-full bg-[#E9EBEE]">
      <div className=" py-4">
        {/* Back Button & Title */}
        <div className="items-center gap-4 mb-4 hidden md:flex">
          <div
            onClick={handleBackClick}
            className={`w-[44px] h-[42px] rounded-[10px] border border-[#D4D8DC] flex items-center justify-center bg-white ml-2 md:ml-4 cursor-pointer ${
              backClicked ? 'text-purple-700' : 'text-gray-600'
            }`}
            style={{ boxShadow: '-4px 2px 8px rgba(0, 0, 0, 0.1)' }}
          >
              <FaAngleLeft />
          </div>
          <h2 className="font-[500] mt-1 text-[#233242] text-[16px] font-inter">
            My Account
          </h2>
        </div>

        <div className="w-full border-t border-[#BDBDBD] mb-6 hidden md:block"></div>

        {/* Menu Items */}
        <ul className="space-y-6">
          <li>
            <div
              onClick={() => setSelectedMenu('personalDetails')}
              className={`cursor-pointer flex items-center gap-4 text-[#233242] font-[500] text-[16px] font-inter px-2 py-2 rounded-md ${
                selectedMenu === 'personalDetails' ? 'bg-[#DDDDDD]' : ''
              }`}
            >
              <div
                className="w-[44px] h-[42px] border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white"
                style={{ boxShadow: '-4px 2px 8px rgba(0, 0, 0, 0.1)' }}
              >
                <FaUser className="text-[#233242]" />
              </div>
              <span className="hidden md:inline">Personal Details</span>
            </div>
          </li>

          <li>
            <div
              onClick={() => setSelectedMenu('billingAddress')}
              className={`cursor-pointer flex items-center gap-4 text-[#233242] font-[500] text-[16px] font-inter px-2 py-2 rounded-md ${
                selectedMenu === 'billingAddress' ? 'bg-[#DDDDDD]' : ''
              }`}
            >
              <div
                className="w-[44px] h-[42px] border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white"
                style={{ boxShadow: '-4px 2px 8px rgba(0, 0, 0, 0.1)' }}
              >
                <FaAddressCard className="text-[#233242]" />
              </div>
              <span className="hidden md:inline">Billing Address</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LeftSidebar;
