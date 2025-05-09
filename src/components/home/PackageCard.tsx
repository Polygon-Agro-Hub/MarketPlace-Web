import React from 'react';

interface PackageProps {
  packageItem: {
    id: number;
    url: string;
    name: string;
    price: number;
  };
}

const PackageCard: React.FC<PackageProps> = ({ packageItem }) => {
  return (
    <div className="flex flex-col items-center justify-center md:gap-5 lg:gap-5 gap-3 w-full h-full border border-[#D7D7D7] rounded-lg shadow-lg py-4 px-2 hover:shadow-xl transition-shadow duration-300">
      <img
        src={packageItem.url}
        alt={packageItem.name}
        className="w-full h-28 sm:h-48 object-cover rounded-lg"
      />
      <p className="font-bold text-base sm:text-base text-center">{packageItem.name}</p>
      <p className="text-[#3E206D] font-medium text-sm sm:text-base">Rs. {packageItem.price}</p>
    </div>
  );
};

export default PackageCard;