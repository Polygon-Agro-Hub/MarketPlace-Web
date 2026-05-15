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
  
  const buyerType = useSelector((state: RootState) => state.auth.user?.buyerType);

  useEffect(() => {
    document.body.style.margin = "0";
    getBannerDetails();

    return () => {
      document.body.style.margin = "";
    };
  }, [buyerType]);

  async function getBannerDetails() {
    try {
      setLoading(true);
      const data = await getRetaildBanners();

      if (data && data.slides) {
        let formattedSlides = data.slides.map((slide: any) => ({
          id: slide.id,
          imageUrl: slide.image,
          details: slide.details,
          type: slide.type,
          indexId: slide.indexId,
        }));

        if (buyerType) {
          formattedSlides = formattedSlides.filter((slide: Slide) => 
            slide.type === buyerType
          );
        }

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

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides]);

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
      {/* 8:3 aspect ratio container — image never crops */}
      <div className="w-full" style={{ aspectRatio: "8 / 3" }}>
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.details || "Slide image"}
          className="w-full h-full object-fill"
          loading="lazy"
          onError={(e) => {
            console.error("Image failed to load:", currentSlide.imageUrl);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

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