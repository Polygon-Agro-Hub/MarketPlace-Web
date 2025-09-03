import { getRetaildBanners } from "@/services/product-service";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface Slide {
  id: number;
  imageUrl: string;
  details?: string;
  type?: string;
  indexId: number;
}

interface RootState {
  auth: {
    user: {
      buyerType: string;
    } | null;
  };
}

const TopBanner: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get buyerType from Redux store
  const buyerType = useSelector((state: RootState) => state.auth.user?.buyerType);

  useEffect(() => {
    // Remove default body margin to prevent white gap
    document.body.style.margin = "0";
    getBannerDetails();

    return () => {
      document.body.style.margin = "";
    };
  }, [buyerType]); // Re-fetch when buyerType changes

  async function getBannerDetails() {
    try {
      setLoading(true);
      const data = await getRetaildBanners();
      console.log(data, "banner data");

      if (data && data.slides) {
        // Map the response data to the expected format
        let formattedSlides = data.slides.map((slide: any) => ({
          id: slide.id,
          imageUrl: slide.image,
          details: slide.details,
          type: slide.type,
          indexId: slide.indexId,
        }));

        // Filter slides based on buyerType if user is logged in
        if (buyerType) {
          formattedSlides = formattedSlides.filter((slide: Slide) => 
            slide.type === buyerType
          );
        }

        // Sort slides by indexId in ascending order
        formattedSlides.sort((a: Slide, b: Slide) => a.indexId - b.indexId);

        setSlides(formattedSlides);
        setError(null);
      } else {
        setSlides([]);
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError("Failed to load banners");
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }

  // Auto-play slides every 4 seconds
  useEffect(() => {
    if (slides.length <= 1) return; // Don't auto-play if there's only one slide or no slides

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides]);

  // Reset current index when slides change
  useEffect(() => {
    setCurrentIndex(0);
  }, [slides]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse">Loading slides...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        {error}
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        {buyerType ? `No banners available for ${buyerType} users` : "No banners available"}
      </div>
    );
  }

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
          onError={(e) => {
            console.error("Image failed to load:", currentSlide.imageUrl);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        
      </div>

      {/* Pagination dots - only show if there are multiple slides */}
      {slides.length > 1 && (
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
      )}
    </div>
  );
};

export default TopBanner;