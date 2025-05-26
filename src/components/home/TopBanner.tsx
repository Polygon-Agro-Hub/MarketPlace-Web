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

    const apiUrl = "http://localhost:3200/api/product/slides";

    fetch(apiUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Error fetching slides: ${response.statusText}`);
        }
        const data = await response.json();
        const formattedSlides = data.slides.map((slide: any) => ({
          id: slide.id,
          imageUrl: slide.image,
          details: slide.details,
          type: slide.type,
        }));
        setSlides(formattedSlides);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch slides");
        setLoading(false);
      });

    return () => {
      document.body.style.margin = "";
    };
  }, []);

  // Auto-play slides every 4 seconds
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides]);

  if (loading) return <div>Loading slides...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!slides.length) return <div>No slides available.</div>;

  const currentSlide = slides[currentIndex];

  return (
    <div className="w-auto flex flex-col">
      <div
        className="w-full"
        style={{
          position: "relative",
          height: "45vh", // Reduced height on desktop
        }}
      >
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.details || "Slide image"}
          className="absolute top-0 left-0 w-full h-full object-cover m-0 p-0"
        />
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(idx)}
            className={`rounded-full w-2 h-2 sm:w-3 sm:h-3 ${idx === currentIndex ? "bg-[#3E206D]" : "bg-gray-300"
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TopBanner;
