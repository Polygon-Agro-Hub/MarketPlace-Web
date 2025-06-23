'use client';

import React from 'react';

const EmptyComplaints = () => {
  return (
    <div className="text-center text-[12px] md:text-[16px] italic text-[#717171] flex flex-col items-center mt-20">
      <img
        src="/icons/no complaints.png"
        alt="No complaints"
        className="w-44 h-34 mb-4"
      />
      <p className="text-[12px] md:text-[16px] italic">--You have no added complaints--</p>
    </div>
  );
};

export default EmptyComplaints;