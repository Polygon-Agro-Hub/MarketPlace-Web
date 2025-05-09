import React from 'react';

interface PackageProps {
  packageItem: {
    id: number
    displayName: string
    image: string
    subTotal: number
  };
}

const PackageCard: React.FC<PackageProps> = ({ packageItem }) => {
  return (
    <div className="flex flex-col items-center justify-between w-full h-full border border-[#D7D7D7] rounded-lg shadow-lg py-4 px-2 hover:shadow-xl transition-shadow duration-300 min-h-[320px]">
  <div className="w-full flex-shrink-0">
    <img
      src={packageItem.image}
      alt={packageItem.displayName}
      className="w-full h-auto object-cover rounded-lg"
    />
  </div>
  <div className="flex flex-col items-center justify-center w-full flex-grow px-2">
    <p className="font-bold text-base text-center line-clamp-2">
      {packageItem.displayName}
    </p>
    <p className="text-[#3E206D] font-medium text-sm sm:text-base mt-2">
      Rs.{packageItem.subTotal}
    </p>
  </div>
</div>
  );
};

export default PackageCard;