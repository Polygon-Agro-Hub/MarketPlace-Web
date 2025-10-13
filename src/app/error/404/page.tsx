import Image from 'next/image';
import NotFound from '../../../../public/404.jpg'


export default function Error404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
      <Image
        src={NotFound}
        alt="Page Not Found"
        width={500}
        height={500}
        priority // Add this if it's above the fold
      />
      <h1 className="text-4xl font-bold mt-6">Page Not Found!</h1>
      <p className="mt-4 text-sm text-[#8492A3]">
        Looks like you have knocked on the wrong door.
      </p>

    </div>
  );
}