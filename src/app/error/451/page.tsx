import Image from 'next/image';
import Unauthorize from '../../../../public/images/451.jpg'
export default function Error451() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-10 bg-white px-4 text-center">
      <Image src={Unauthorize} alt="Legal Error" width={400} height={400} />

      <h1 className="text-2xl sm:text-4xl font-bold mt-6">
        <span className="whitespace-nowrap">451 : Unavailable due to</span>
        <span className="block sm:inline"> Legal Reasons</span>
      </h1>

   <p className="mt-4 text-[#8492A3] text-xs sm:text-sm">
  It indicates that the server is denying access to a resource
  <span className="block sm:inline"> because of legal restrictions.</span>
</p>

    </div>
  );
}
