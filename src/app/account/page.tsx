

// 'use client';

// import React from 'react';
// import LeftSidebar from '@/components/profile/LeftSidebar';
// import PersonalDetailsForm from '@/components/profile/PersonalDetailsForm';

// const PersonalDetailsPage = () => {
//   return (

// <div className="flex min-h-screen bg-[#F5F6FA]">
//       {/* Sidebar */}
//       <LeftSidebar />

//       {/* Main Content */}
//       <div className="flex-1 p-0 md:p-3">
//         <PersonalDetailsForm />
      
//       </div>
//     </div>
//   );
// };


// export default PersonalDetailsPage;

'use client';

import React, { useState } from 'react';
import LeftSidebar from '@/components/profile/LeftSidebar';
import PersonalDetailsForm from '@/components/profile/PersonalDetailsForm';
import BillingDetailsForm from '@/components/profile/BillingDetailsForm';

export default function AccountPage() {
  const [selectedMenu, setSelectedMenu] = useState('personalDetails');

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <LeftSidebar selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
      <div className="flex-1">
        {selectedMenu === 'personalDetails' && <PersonalDetailsForm />}
        {selectedMenu === 'billingAddress' && <BillingDetailsForm />}
      </div>
    </div>
  );
}

