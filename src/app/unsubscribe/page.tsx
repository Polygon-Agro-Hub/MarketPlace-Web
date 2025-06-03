// "use client";

// import Head from 'next/head';
// import { useState } from 'react';

// export default function Unsubscribe() {
//   const [clickedButton, setClickedButton] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const handleUnsubscribeClick = () => {
//     setClickedButton('unsubscribe');
//     setShowModal(true);
//   };

//   const handleStayClick = () => {
//     setClickedButton('stay');
//     setShowModal(true); // Show modal for stay button as well
//   };

//   return (
//     <>
//       <Head>
//         <title>Unsubscribe</title>
//       </Head>

//       <div className="flex justify-center min-h-screen mt-4 bg-white relative">
//         <div className="bg-white text-center">
//           <img
//             src="/unsubscribe.jpg"
//             alt="Thinking man with question marks"
//             className="mx-auto w-72 h-auto"
//           />
//           <h1 className="text-3xl font-semibold mt-4">
//             Are you sure about unsubscribing?
//           </h1>
//           <p className="text-gray-600 mt-2">
//             If you unsubscribe now, you might miss our nice deals.
//           </p>
//           <div className="mt-8 space-x-4">
//             <button
//               onClick={handleStayClick}
//               className={`w-48 px-4 py-2 rounded-md border ${
//                 clickedButton === 'stay'
//                   ? 'bg-[#3E206D] text-white border-[#3E206D]'
//                   : 'bg-white text-[#3E206D] border-[#3E206D] hover:bg-gray-50'
//               }`}
//             >
//               I’d rather stay
//             </button>
//             <button
//               onClick={handleUnsubscribeClick}
//               className={`w-48 px-4 py-2 rounded-md border ${
//                 clickedButton === 'unsubscribe'
//                   ? 'bg-[#3E206D] text-white border-[#3E206D]'
//                   : 'bg-white text-[#3E206D] border-[#3E206D] hover:bg-gray-50'
//               }`}
//             >
//               Unsubscribe
//             </button>
//           </div>
//         </div>

//         {/* Modal */}
//         {showModal && clickedButton === 'unsubscribe' && (
//           <div className="absolute inset-0 flex justify-center items-center backdrop-blur-sm z-50">
//             <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-md w-98">
//               <img
//                 src="/un.png"
//                 alt="Success Icon"
//                 className="mx-auto w-24 mb-4"
//               />
//               <h2 className="text-lg font-semibold text-black">
//                 You’ve Successfully Unsubscribed!
//               </h2>
//               <p className="text-gray-500 text-sm mt-2">
//                 We’re sorry to see you go! You will no longer <br></br> receive updates from us.
//               </p>
              
//             </div>
//           </div>
//         )}

//         {/* Stay Modal */}
//         {showModal && clickedButton === 'stay' && (
//           <div className="absolute inset-0 flex justify-center items-center backdrop-blur-sm z-50">
//             <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-md w-98">
//               <img
//                 src="\un.png" // Add an appropriate image or reuse one
//                 alt="Stay Icon"
//                 className="mx-auto w-24 mb-4"
//               />
//               <h2 className="text-lg font-semibold text-black">
//                We're Glad You're Staying!
//               </h2>
//               <p className="text-gray-500 text-sm mt-2">
//               Thanks for sticking with us.<br></br>
//        We’ll keep the updates coming your way.
//               </p>
            
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }


"use client";

import Head from 'next/head';
import { useState } from 'react';

export default function Unsubscribe() {
  const [clickedButton, setClickedButton] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleUnsubscribeClick = async () => {
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }), // Replace with dynamic user email
      });
      const data = await response.json();
      if (data.status) {
        setClickedButton('unsubscribe');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  const handleStayClick = () => {
    setClickedButton('stay');
    setShowModal(true);
  };

  return (
    <>
      <Head>
        <title>Unsubscribe</title>
      </Head>

      <div className="flex justify-center min-h-screen mt-4 bg-white relative">
        <div className="bg-white text-center">
          <img
            src="/unsubscribe.jpg"
            alt="Thinking man with question marks"
            className="mx-auto w-72 h-auto"
          />
          <h1 className="text-3xl font-semibold mt-4">
            Are you sure about unsubscribing?
          </h1>
          <p className="text-gray-600 mt-2">
            If you unsubscribe now, you might miss our nice deals.
          </p>
          <div className="mt-8 space-x-4">
            <button
              onClick={handleStayClick}
              className={`w-48 px-4 py-2 rounded-md border ${
                clickedButton === 'stay'
                  ? 'bg-[#3E206D] text-white border-[#3E206D]'
                  : 'bg-white text-[#3E206D] border-[#3E206D] hover:bg-gray-50'
              }`}
            >
              I’d rather stay
            </button>
            <button
              onClick={handleUnsubscribeClick}
              className={`w-48 px-4 py-2 rounded-md border ${
                clickedButton === 'unsubscribe'
                  ? 'bg-[#3E206D] text-white border-[#3E206D]'
                  : 'bg-white text-[#3E206D] border-[#3E206D] hover:bg-gray-50'
              }`}
            >
              Unsubscribe
            </button>
          </div>
        </div>

        {/* Unsubscribe Modal */}
        {showModal && clickedButton === 'unsubscribe' && (
          <div className="absolute inset-0 flex justify-center items-center backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-md w-98">
              <img
                src="/un.png"
                alt="Success Icon"
                className="mx-auto w-24 mb-4"
              />
              <h2 className="text-lg font-semibold text-black">
                You’ve Successfully Unsubscribed!
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                We’re sorry to see you go! You will no longer <br /> receive updates from us.
              </p>
            </div>
          </div>
        )}

        {/* Stay Modal */}
        {showModal && clickedButton === 'stay' && (
          <div className="absolute inset-0 flex justify-center items-center backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-md w-98">
              <img
                src="/un.png"
                alt="Stay Icon"
                className="mx-auto w-24 mb-4"
              />
              <h2 className="text-lg font-semibold text-black">
                We're Glad You're Staying!
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Thanks for sticking with us.<br /> We’ll keep the updates coming your way.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}