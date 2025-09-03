'use client';

import React from 'react';
import Image from 'next/image';
import nocomplaints from '../../../public/icons/no complaints.png'

const EmptyComplaints = () => {
  return (
    <div className="text-center text-[12px] md:text-[16px] italic text-[#717171] flex flex-col items-center mt-20">
      <Image
        src={nocomplaints}
        alt="No complaints"
        className="w-44 h-34 mb-4"
      />
      <p className="text-[12px] md:text-[16px] italic">--You have no added complaints--</p>
    </div>
  );
};

export default EmptyComplaints;