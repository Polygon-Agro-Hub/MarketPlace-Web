import React, { useState, useEffect } from "react";

type SuccessPopupProps = {
  isVisible: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  duration?: number;
};

const Sparkle = ({
  className = "",
  delay = "0s",
}: {
  className?: string;
  delay?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    className={`absolute fill-[#ff9a1f] ${className}`}
    style={{
      animation: "sparkle-twinkle 1.8s ease-in-out infinite",
      animationDelay: delay,
    }}
    aria-hidden="true"
  >
    {/* 4-point star */}
    <path d="M12 0 C12.8 7.5 16.5 11.2 24 12 C16.5 12.8 12.8 16.5 12 24 C11.2 16.5 7.5 12.8 0 12 C7.5 11.2 11.2 7.5 12 0 Z" />
  </svg>
);

const SuccessPopup = ({
  isVisible,
  onClose,
  title = "Successful!",
  description = "Your Polygon account created successfully.",
  duration = 3000,
}: SuccessPopupProps) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    setShow(true);
    const animateTimer = setTimeout(() => setAnimate(true), 50);
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    if (duration > 0) {
      closeTimer = setTimeout(() => handleClose(), duration);
    }

    return () => {
      clearTimeout(animateTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, duration]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      setShow(false);
      onClose?.();
    }, 300);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
    >
      <style>{`
        @keyframes sparkle-twinkle {
          0%, 100% { transform: scale(0.6); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          animate ? "opacity-40" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`relative w-full max-w-[460px] transform rounded-[28px] bg-white px-8 pb-9 pt-7 text-center shadow-2xl transition-all duration-500 ease-out ${
          animate
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-75 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className={`absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:bg-gray-200 ${
            animate ? "opacity-60 hover:opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "0.6s" }}
        >
          <svg
            className="h-4 w-4 text-gray-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Title */}
        <h2
          className={`text-xl font-bold text-black transition-all duration-500 ease-out ${
            animate ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: "0.15s" }}
        >
          {title}
        </h2>

        {/* Badge icon */}
        <div className="mt-6 flex justify-center">
          <div className="relative h-[88px] w-[88px] rounded-full bg-[#f7f7f9]">
            {/* Sparkles */}
            <Sparkle className="-left-2 top-0 h-2.5 w-2.5" delay="0s" />
            <Sparkle className="-top-1 right-1 h-2 w-2" delay="0.4s" />
            <Sparkle className="-right-3 top-[44px] h-3.5 w-3.5" delay="0.8s" />
            <Sparkle className="-left-3 bottom-0 h-3.5 w-3.5" delay="1.2s" />
            <Sparkle className="-bottom-1 right-2 h-1.5 w-1.5" delay="0.6s" />

            {/* Outer thin ring */}
            <div
              className={`absolute inset-[6px] rounded-full border-[1.5px] border-[#ff9a1f] transition-all duration-700 ease-out ${
                animate ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
              style={{ transitionDelay: "0.25s" }}
            />

            {/* Solid orange badge */}
            <div
              className={`absolute inset-[11px] flex items-center justify-center rounded-full bg-[#ff9a1f] transition-all duration-500 ease-out ${
                animate ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
              style={{ transitionDelay: "0.35s" }}
            >
              {/* Inner white ring */}
              <div className="absolute inset-[3px] rounded-full border-2 border-white/90" />

              {/* Checkmark */}
              <svg
                className="relative h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 24,
                    strokeDashoffset: animate ? 0 : 24,
                    transition: "stroke-dashoffset 0.6s ease-out 0.7s",
                  }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p
            className={`mx-auto mt-6 max-w-[280px] text-lg leading-snug text-[#46536a] transition-all duration-500 ease-out ${
              animate ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: "0.45s" }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default SuccessPopup;
