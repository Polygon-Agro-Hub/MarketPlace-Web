import Image from 'next/image';
import NotFound from '../../../../public/404.jpg'


export default function Error404() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 bg-white px-4 text-center">
      <Image
        src={NotFound}
        alt="Page Not Found"
        width={400}
        height={400}
        priority // Add this if it's above the fold
      />
      <h1 className="text-4xl font-bold mt-6">Page Not Found!</h1>
      <p className="mt-4 text-sm text-[#8492A3]">
        Looks like you have knocked on the wrong
        <span className="block sm:inline"> door.</span>
      </p>

    </div>
  );
}