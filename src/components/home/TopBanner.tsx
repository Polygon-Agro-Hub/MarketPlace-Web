import { getRetaildBanners } from "@/services/product-service";
import {
  getPendingConfirmationOrder,
  type PendingConfirmationOrder,
} from "@/services/retail-service";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { ArrowRight, Check, Clock, Package, ShoppingBag } from "lucide-react";

interface Slide {
  id: number;
  imageUrl: string;
  details?: string;
  type?: string;
  indexId: number;
}

const formatTimeAgo = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const s = Math.max(Math.floor(ms / 1000), 0);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const TopBanner: React.FC = () => {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderNotification, setOrderNotification] =
    useState<PendingConfirmationOrder | null>(null);
  const [showOrderPopup, setShowOrderPopup] = useState(true);

  const buyerType = useSelector(
    (state: RootState) => state.auth.user?.buyerType,
  );
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    document.body.style.margin = "0";
    getBannerDetails();

    return () => {
      document.body.style.margin = "";
    };
  }, [buyerType]);

  useEffect(() => {
    if (!token) {
      setOrderNotification(null);
      return;
    }

    let cancelled = false;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    getPendingConfirmationOrder(token)
      .then((data) => {
        if (cancelled) return;
        setOrderNotification(data);
        setShowOrderPopup(true);

        if (data) {
          hideTimer = setTimeout(
            () => setOrderNotification(null),
            data.msUntilClose,
          );
        }
      })
      .catch((err) => {
        console.error("Error checking pending confirmations:", err);
        if (!cancelled) setOrderNotification(null);
      });

    return () => {
      cancelled = true;
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [token]);

  const [, setTick] = useState(0);
  useEffect(() => {
    if (!orderNotification) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [orderNotification]);

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
          formattedSlides = formattedSlides.filter(
            (slide: Slide) => slide.type === buyerType,
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
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  if (!slides.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        {buyerType
          ? `No banners available for ${buyerType} users`
          : "No banners available"}
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full" style={{ aspectRatio: "8 / 3" }}>
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.details || "Slide image"}
          className="w-full h-full object-fill"
          loading="lazy"
          onError={(e) => {
            console.error("Image failed to load:", currentSlide.imageUrl);
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />

        {orderNotification && showOrderPopup && (
          <div
            className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10
                       w-[190px] sm:w-[280px] md:w-[340px] lg:w-[400px]
                       rounded-2xl sm:rounded-3xl bg-[#1C2536] shadow-xl
                       p-2.5 sm:p-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#A66BFF] sm:mt-1.5 sm:h-3 sm:w-3" />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-white sm:text-base md:text-lg">
                    Ready To Confirm
                  </p>
                  <p className="truncate text-[9px] font-semibold text-white sm:text-xs md:text-sm">
                    Order : #{orderNotification.invoiceNumber}
                  </p>
                </div>
              </div>

              <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#EFE4FF] px-1.5 py-0.5 text-[8px] font-medium text-[#1C2536] sm:px-2.5 sm:py-1 sm:text-xs">
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#3E206D] sm:h-4 sm:w-4">
                  <Clock className="h-2 w-2 text-white sm:h-2.5 sm:w-2.5" />
                </span>
                {formatTimeAgo(orderNotification.visibleSince)}
              </span>
            </div>

            <div
              aria-hidden="true"
              className="mt-3 hidden items-center gap-3 rounded-xl bg-[#EFE4FF] px-3 py-3 sm:flex"
            >
              <Package className="h-8 w-8 shrink-0 text-[#B5834F]" />

              <div className="relative flex flex-1 items-start">
                {/* connecting line */}
                <span className="absolute left-[16%] right-[16%] top-3 h-px bg-gray-500" />

                <div className="relative z-10 flex w-1/3 flex-col items-center gap-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3E206D]">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-center text-[9px] leading-tight text-gray-700">
                    Ready to Confirm
                  </span>
                </div>

                <div className="relative z-10 flex w-1/3 flex-col items-center gap-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                    <Package className="h-3.5 w-3.5 text-gray-700" />
                  </span>
                  <span className="text-center text-[9px] leading-tight text-gray-700">
                    Processing
                  </span>
                </div>

                <div className="relative z-10 flex w-1/3 flex-col items-center gap-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                    <Check
                      className="h-3.5 w-3.5 text-gray-700"
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-center text-[9px] leading-tight text-gray-700">
                    Reached
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                router.push(
                  `/order-confirmation?processedOrderId=${orderNotification.processOrderId}`,
                )
              }
              className="mt-2 flex w-full cursor-pointer items-center justify-between rounded-xl
                         bg-gradient-to-r from-[#3E206D] to-[#6D2DC4] px-3 py-2 text-[11px] font-bold
                         text-white transition hover:brightness-110
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                         sm:mt-3 sm:px-5 sm:py-3 sm:text-base md:text-lg"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>View My Order</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}
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
