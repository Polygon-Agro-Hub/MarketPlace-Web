
'use client';

import React, { useState, useEffect } from 'react';
import { FaAngleLeft, FaUser, FaAddressCard, FaExclamationTriangle } from 'react-icons/fa';

const LeftSidebar = ({
  selectedMenu,
  setSelectedMenu,
  onComplaintIconClick,
}: {
  selectedMenu: string;
  setSelectedMenu: (menu: string) => void;
  onComplaintIconClick: (isOpen: boolean) => void;
}) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleComplaintClick = () => {
    const nextState = !submenuOpen;
    setSubmenuOpen(nextState);
    if (nextState && !['reportComplaint', 'ComplaintHistory'].includes(selectedMenu)) {
      setSelectedMenu('complaints');
      setSelectedMenu('reportComplaint'); 
    }
    onComplaintIconClick(nextState);
  };

  const handleSubMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    if (!isDesktop) {
      setSubmenuOpen(false);
      onComplaintIconClick(false);
    }
  };

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    if (submenuOpen) {
      setSubmenuOpen(false);
      onComplaintIconClick(false);
    }
  };

  const isActive = (menu: string) => selectedMenu === menu;
  const isComplaintSectionActive = ['complaints', 'reportComplaint', 'ComplaintHistory'].includes(selectedMenu);

  return (
    <div className="w-[70px] md:w-[336px] min-h-full bg-[#E9EBEE]">
      <div className="py-4">
        <div className="items-center gap-4 mb-4 hidden md:flex">
          <div className="w-[44px] h-[42px] border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white ml-4">
            <FaAngleLeft />
          </div>
          <h2 className="font-semibold text-[#233242] text-[16px]">My Account</h2>
        </div>

        <div className="border-t border-[#BDBDBD] mb-6 hidden md:block" />

        <ul className="space-y-6">
          {/* Personal Details */}
          <li onClick={() => handleMenuClick('personalDetails')} className="cursor-pointer">
            <div className={`flex items-center gap-4 px-2 py-2 rounded-md ${isActive('personalDetails') ? 'bg-[#DDDDDD]' : ''}`}>
              <div className="w-[44px] h-[42px] border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white">
                <FaUser className={isActive('personalDetails') ? 'text-[#7C3AED]' : 'text-[#233242]'} />
              </div>
              <span className="hidden md:inline font-medium text-[16px]">Personal Details</span>
            </div>
          </li>

          {/* Billing Address */}
          <li onClick={() => handleMenuClick('billingAddress')} className="cursor-pointer">
            <div className={`flex items-center gap-4 px-2 py-2 rounded-md ${isActive('billingAddress') ? 'bg-[#DDDDDD]' : ''}`}>
              <div className="w-[44px] h-[42px] border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white">
                <FaAddressCard className={isActive('billingAddress') ? 'text-[#7C3AED]' : 'text-[#233242]'} />
              </div>
              <span className="hidden md:inline font-medium text-[16px]">Billing Address</span>
            </div>
          </li>

          {/* Complaints Section */}
          <li className="relative">
            <div className={`w-full ${isComplaintSectionActive ? 'bg-[#DDDDDD]' : ''} rounded-md`}>
              <div className="flex flex-col w-full">
                <div
                  onClick={handleComplaintClick}
                  className={`flex items-center gap-4 px-2 py-2 rounded-md ${
                    isActive('complaints') && !['reportComplaint', 'ComplaintHistory'].includes(selectedMenu)
                    
                      ? 'bg-[#D2D2D2]'
                      : 'bg-transparent'
                  }`}
                >
                  <div className="w-[44px] h-[42px] border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white" style={{ boxShadow: '-4px 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    <FaExclamationTriangle
                      className={isComplaintSectionActive ? 'text-[#7C3AED]' : 'text-[#233242]'}
                    />
                  </div>
                  
                  <span className="hidden md:inline font-[500] text-[16px]">Complaints</span>
                  
                </div>

                {submenuOpen && (
                  <div
                    className={`flex flex-col ${
                      isDesktop
                        ? 'mt-2 w-full'
                        : 'absolute left-[70px] top-[1px] w-[200px] h-[100px] shadow-lg z-10 bg-[#DDDDDD] justify-center rounded-md'
                    }`}
                  >
                    <div
                      onClick={() => handleSubMenuClick('reportComplaint')}
                      className={`cursor-pointer text-[15px] px-2 w-full flex items-center ${
                        isDesktop ? 'py-2' : 'h-[51px]'
                      } ${
                        isActive('reportComplaint')
                          ? 'bg-[#D2D2D2] font-[700] text-[#111]'
                          : 'text-[#233242] font-[500]'
                      }`}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <span className={`${isDesktop ? 'ml-[54px]' : 'pl-0'} text-[14px] leading-tight`}>Report a Complaint</span>
                    </div>
                    <div
                      onClick={() => handleSubMenuClick('ComplaintHistory')}
                      className={`cursor-pointer text-[15px] px-2 w-full flex items-center ${
                        isDesktop ? 'py-2' : 'h-[47px] border-t border-[#C1C1C1]'
                      } ${
                        isActive('ComplaintHistory')
                          ? 'bg-[#D2D2D2] font-[700] text-[#111]'
                          : 'text-[#233242] font-[500]'
                      }`}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <span className={`${isDesktop ? 'ml-[54px]' : 'pl-0'} text-[14px] leading-tight`}>View Complaint History</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LeftSidebar;