// import Image from 'next/image';
// import Link from 'next/link';

// export default function Error404() {
//   return (
//     <div className="flex flex-col items-center justify-start min-h-screen pt-10 bg-white px-4 text-center">
//       <Image src="/404.jpg" alt="Page Not Found" width={400} height={400} />

//       <h1 className="text-4xl font-bold mt-6">Page Not Found!</h1>

//       <p className="mt-4 text-sm text-[#8492A3]">
//         Looks like you have knocked on the wrong
//         <span className="block sm:inline"> door.</span>
//       </p>
//     </div>
//   );
// }

// pages/404.js
import Image from 'next/image';


export default function Error404() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 bg-white px-4 text-center">
      <Image src="/404.jpg" alt="Page Not Found" width={400} height={400} />
      <h1 className="text-4xl font-bold mt-6">Page Not Found!</h1>
      <p className="mt-4 text-sm text-[#8492A3]">
        Looks like you have knocked on the wrong
        <span className="block sm:inline"> door.</span>
      </p>
      
    </div>
  );
}