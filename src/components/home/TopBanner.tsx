import { getRetaildBanners } from "@/services/product-service";
import React, { useEffect, useState } from "react";

interface Slide {
  id: number;
  imageUrl: string;
  details?: string;
  type?: string;
}

const TopBanner: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Remove default body margin to prevent white gap
    document.body.style.margin = "0";
    getBannerDetails()

    return () => {
      document.body.style.margin = "";
    };
  }, []);

  async function getBannerDetails() {
    const data = await getRetaildBanners()
    console.log(data, "banner data");

    const formattedSlides = data.slides.map((slide: any) => ({
      id: slide.id,
      imageUrl: slide.image,
      details: slide.details,
      type: slide.type,
    }));
    setSlides(formattedSlides);
    setLoading(false);
  }

  // Auto-play slides every 4 seconds
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides]);

  if (loading) return <div className="flex justify-center py-8">Loading slides...</div>;
  if (error) return <div className="text-red-600 text-center py-4">{error}</div>;
  if (!slides.length) return <div className="text-center py-4">No slides available.</div>;

  const currentSlide = slides[currentIndex];

  return (
    <div className="w-full flex flex-col">
      {/* Banner container with responsive height and full width */}
      <div className="w-full relative h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden bg-gray-100">
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.details || "Slide image"}
          className="w-full h-full object-cover sm:object-fill md:object-cover"
          style={{
            objectPosition: 'center center'
          }}
          loading="lazy"
        />
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center mt-3 sm:mt-4 space-x-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(idx)}
            className={`rounded-full transition-all duration-200 ${
              idx === currentIndex 
                ? "bg-[#3E206D] w-3 h-3 sm:w-4 sm:h-4" 
                : "bg-gray-300 hover:bg-gray-400 w-2 h-2 sm:w-3 sm:h-3"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TopBanner;