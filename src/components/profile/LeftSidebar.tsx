'use client';

import React, { useState, useEffect } from 'react';
import { FaAngleLeft, FaUser, FaAddressCard, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

// Define the props interface
interface LeftSidebarProps {
  selectedMenu: string;
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
  onComplaintIconClick: (isOpen: boolean) => void;
}

// Define RootState interface (adjust according to your store structure)
interface RootState {
  auth: {
    user: {
      buyerType: string;
    } | null;
  };
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedMenu,
  setSelectedMenu,
  onComplaintIconClick,
}) => {
  const [excludeSubmenuOpen, setExcludeSubmenuOpen] = useState(false);
  const [complaintSubmenuOpen, setComplaintSubmenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();

  // Get buyer type from Redux store
  const buyerType = useSelector((state: RootState) => state.auth.user?.buyerType);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleComplaintClick = () => {
    const nextState = !complaintSubmenuOpen;
    setComplaintSubmenuOpen(nextState);
    setExcludeSubmenuOpen(false);
    if (nextState && !['reportComplaint', 'ComplaintHistory'].includes(selectedMenu)) {
      setSelectedMenu('reportComplaint');
    }
    onComplaintIconClick(nextState);
  };

  const handleExcludeClick = () => {
    const nextState = !excludeSubmenuOpen;
    setExcludeSubmenuOpen(nextState);
    setComplaintSubmenuOpen(false);
    if (nextState && !['ViewMyList', 'AddMoreItems'].includes(selectedMenu)) {
      setSelectedMenu('ViewMyList');
    }
    onComplaintIconClick(nextState);
  };

  const handleSubMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    if (!isDesktop) {
      setExcludeSubmenuOpen(false);
      setComplaintSubmenuOpen(false);
      onComplaintIconClick(false);
    }
  };

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    setExcludeSubmenuOpen(false);
    setComplaintSubmenuOpen(false);
    onComplaintIconClick(false);
  };
  
  const handleBackClick = () => {
  if (buyerType === 'Wholesale') {
    router.push('/wholesale/home');
  } else {
    router.push('/');
  }
};

  const isActive = (menu: string) => selectedMenu === menu;
  const isComplaintSectionActive = ['complaints', 'reportComplaint', 'ComplaintHistory'].includes(selectedMenu);
  const isExcludeSectionActive = ['ExcludedItemList', 'ViewMyList', 'AddMoreItems'].includes(selectedMenu);

  return (
    <div className="w-[70px] md:w-[336px] min-h-full bg-[#E9EBEE]">
      <div className="py-4">
        <div className="items-center gap-4 mb-4 hidden md:flex">
          <div
            className="w-[44px] h-[42px] border border-[#D4D8DC] cursor-pointer rounded-[10px] flex items-center justify-center bg-white ml-4"
            onClick={ handleBackClick}
          >
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
                <FaUser className={isActive('personalDetails') ? 'text-[#3E206D]' : 'text-[#233242]'} />
              </div>
              <span className="hidden md:inline font-medium text-[16px]">Personal Details</span>
            </div>
          </li>

          {/* Billing Address */}
          <li onClick={() => handleMenuClick('billingAddress')} className="cursor-pointer">
            <div className={`flex items-center gap-4 px-2 py-2 rounded-md ${isActive('billingAddress') ? 'bg-[#DDDDDD]' : ''}`}>
              <div className="w-[44px] h-[42px] border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white">
                <FaAddressCard className={isActive('billingAddress') ? 'text-[#3E206D]' : 'text-[#233242]'} />
              </div>
              <span className="hidden md:inline font-medium text-[16px]">Billing Address</span>
            </div>
          </li>

          {/* Excluded Item List Section - Only show if buyerType is not 'Wholesale' */}
          {buyerType !== 'Wholesale' && (
            <li className="relative">
              <div className={`w-full ${isExcludeSectionActive ? 'bg-[#DDDDDD]' : ''} rounded-md`}>
                <div className="flex flex-col w-full cursor-pointer">
                  <div
                    onClick={handleExcludeClick}
                    className={`flex items-center gap-4 px-2 py-2 rounded-md ${
                      isActive('ExcludedItemList') && !['ViewMyList', 'AddMoreItems'].includes(selectedMenu)
                        ? 'bg-[#D2D2D2]'
                        : 'bg-transparent'
                    }`}
                  >
                    <div className="w-[44px] h-[42px] cursor-pointer border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white" style={{ boxShadow: '-4px 2px 8px rgba(0, 0, 0, 0.1)' }}>
                      <FaTimes className={isExcludeSectionActive ? 'text-[#3E206D]' : 'text-[#233242]'} />
                    </div>
                    <span className="hidden md:inline font-[500] text-[16px]">Excluded Item List</span>
                  </div>

                  {excludeSubmenuOpen && (
                    <div
                      className={`flex flex-col ${
                        isDesktop
                          ? 'mt-2 w-full'
                          : 'absolute left-[70px] top-[1px] w-[200px] h-[100px] shadow-lg z-10 bg-[#DDDDDD] justify-center rounded-md'
                      }`}
                    >
                      <div
                        onClick={() => handleSubMenuClick('ViewMyList')}
                        className={`cursor-pointer text-[15px] px-2 w-full flex items-center ${
                          isDesktop ? 'py-2' : 'h-[51px]'
                        } ${
                          isActive('ViewMyList')
                            ? 'bg-[#D2D2D2] font-[700] text-[#111]'
                            : 'text-[#233242] font-[500]'
                        }`}
                        style={{
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span className={`${isDesktop ? 'ml-[54px]' : 'pl-0'} text-[14px] leading-tight`}>View My List</span>
                      </div>
                      <div
                        onClick={() => handleSubMenuClick('AddMoreItems')}
                        className={`cursor-pointer text-[15px] px-2 w-full flex items-center ${
                          isDesktop ? 'py-2' : 'h-[47px] border-t border-[#C1C1C1]'
                        } ${
                          isActive('AddMoreItems')
                            ? 'bg-[#D2D2D2] font-[700] text-[#111]'
                            : 'text-[#233242] font-[500]'
                        }`}
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span className={`${isDesktop ? 'ml-[54px]' : 'pl-0'} text-[14px] leading-tight`}>Add More Items</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )}

          {/* Complaints Section */}
          <li className="relative">
            <div className={`w-full ${isComplaintSectionActive ? 'bg-[#DDDDDD]' : ''} rounded-md`}>
              <div className="flex flex-col w-full cursor-pointer">
                <div
                  onClick={handleComplaintClick}
                  className={`flex items-center gap-4 px-2 py-2 rounded-md ${
                    isActive('complaints') && !['reportComplaint', 'ComplaintHistory'].includes(selectedMenu)
                      ? 'bg-[#D2D2D2]'
                      : 'bg-transparent'
                  }`}
                >
                  <div className="w-[44px] h-[42px] cursor-pointer border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white" style={{ boxShadow: '-4px 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    <FaExclamationTriangle className={isComplaintSectionActive ? 'text-[#3E206D]' : 'text-[#233242]'} />
                  </div>
                  <span className="hidden md:inline font-[500] text-[16px]">Complaints</span>
                </div>

                {complaintSubmenuOpen && (
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