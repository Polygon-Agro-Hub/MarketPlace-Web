import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PackageCard from './PackageCard';

interface Package {
  id: number;
  url: string;
  name: string;
  price: number;
}

// Custom arrow components
const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 focus:outline-none"
      aria-label="Next"
    >
      <ChevronRight className="h-6 w-6 text-[#FF4421]" />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 focus:outline-none"
      aria-label="Previous"
    >
      <ChevronLeft className="h-6 w-6 text-[#FF4421]" />
    </button>
  );
};

const PackageSlider: React.FC = () => {
  const packages: Package[] = [
    {
      id: 1,
      url: 'https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/marketplacepackages/image/b459b785-3cbe-4f15-9e51-920df33389e5.jpeg',
      name: 'Family Pack',
      price: 2000
    },
    {
      id: 2,
      url: 'https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/marketplacepackages/image/b459b785-3cbe-4f15-9e51-920df33389e5.jpeg',
      name: 'Fruity Pack',
      price: 1000
    },
    {
      id: 3,
      url: 'https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/marketplacepackages/image/b459b785-3cbe-4f15-9e51-920df33389e5.jpeg',
      name: 'All Grains',
      price: 2000
    },
    {
      id: 4,
      url: 'https://agroworld-s3-kmtu-hlf64-ituvf.s3.eu-north-1.amazonaws.com/marketplacepackages/image/b459b785-3cbe-4f15-9e51-920df33389e5.jpeg',
      name: 'Premium Pack',
      price: 3000
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,  // Changed from 1 to 2 for mobile
          slidesToScroll: 1,
          centerMode: false, // Disable center mode for better 2-item layout
        }
      }
    ]
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-center gap-2 w-full max-w-4xl mb-8">
        <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
        <span className="bg-[#FF8F6666] text-[#FF4421] rounded-lg text-sm px-6 py-1">
          Packages
        </span>
        <div className="w-1/2 border-t-2 border-[#D7D7D7]"></div>
      </div>

      <div className="w-full relative sm:px-3 md:px-10">
        <Slider {...settings}>
            {packages.map((packageItem) => (
            <div key={packageItem.id} className="md:px-16 sm:px-8 px-4 py-3">
              <PackageCard packageItem={packageItem} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default PackageSlider;