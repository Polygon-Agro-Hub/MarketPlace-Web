'use client';
import React, { useState } from 'react';
import LeftSidebar from '@/components/profile/LeftSidebar';
import PersonalDetailsForm from '@/components/profile/PersonalDetailsForm';
import BillingDetailsForm from '@/components/profile/BillingDetailsForm';
import ReportComplaintForm from '@/components/profile/reportComplaint';
import ComplaintsHistory from '@/components/profile/ComplaintsHistory'; // Import ComplaintsHistory
import ViewMyList from '@/components/profile/ViewMyList';

export default function AccountPage() {
  const [selectedMenu, setSelectedMenu] = useState('personalDetails');
  const [isRightContentVisible, setIsRightContentVisible] = useState(true);

  const handleComplaintIconClick = (isOpen: boolean) => {
    if (window.innerWidth < 768) { // Apply only on mobile
      setIsRightContentVisible(!isOpen); // Hide right content when submenu opens, show when closed
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <LeftSidebar
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
        onComplaintIconClick={handleComplaintIconClick}
      />
      {isRightContentVisible && (
        <div className="flex-1">
          {selectedMenu === 'personalDetails' && <PersonalDetailsForm />}
          {selectedMenu === 'billingAddress' && <BillingDetailsForm />}
           {selectedMenu === 'Complaints' && <ReportComplaintForm />}
          {selectedMenu === 'reportComplaint' && <ReportComplaintForm />}
          {selectedMenu === 'ComplaintHistory' && <ComplaintsHistory />}
           {selectedMenu === 'ExcludedItemList' && <ViewMyList />}
          {selectedMenu === 'ViewMyList' && <ViewMyList />}
          {/* {selectedMenu === 'AddMoreItems' && <AddMoreItems />} Add this line */}
        </div>
      )}
    </div>
  );
}