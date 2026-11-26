"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, MapPin, ShoppingBag, Truck, X } from "lucide-react";
import LoginComponent from "@/components/main-login-component/LoginComponent";
import CitySelection from "@/components/main-login-component/NewCitySelection";
import type { CityResult } from "@/services/auth-service";

type AuthTab = "login" | "signup";
type SignupStep = "city" | "details";

interface MainLoginComponentProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
}

const FEATURES = [
  { id: 1, label: "Keep delivery details handy", Icon: MapPin },
  { id: 2, label: "Find your usuals, a little faster", Icon: ShoppingBag },
  { id: 3, label: "Follow your next delivery", Icon: Truck },
];

const TABS: { id: AuthTab; label: string }[] = [
  { id: "login", label: "Log in" },
  { id: "signup", label: "Create account" },
];

const MainLoginComponent: React.FC<MainLoginComponentProps> = ({
  isOpen,
  onClose,
  defaultTab = "login",
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [signupStep, setSignupStep] = useState<SignupStep>("city");
  const [confirmedCity, setConfirmedCity] = useState<CityResult | null>(null);

  // Reset to the requested tab and first signup step each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSignupStep("city");
      setConfirmedCity(null);
    }
  }, [isOpen, defaultTab]);

  // Close on Escape + lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const handleCityConfirmed = (city: CityResult) => {
    setConfirmedCity(city);
    setSignupStep("details");
  };

  if (!isOpen) return null;

  return (
    // Mobile: full screen. Desktop (md+): centered modal with dark backdrop.
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 md:px-6 md:py-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Log in or create an account"
    >
      {/* Mobile: one scrollable column (auth on top, image card below), full height.
          Desktop: two columns (image left, auth right) with FLEXIBLE height:
          grows with content, capped at the viewport height, scrolls only past that. */}
      <div
        className="relative flex h-full w-full flex-col overflow-y-auto bg-white md:h-auto md:min-h-[700px] md:max-h-[calc(100vh-2rem)] md:max-w-[1040px] md:flex-row md:overflow-hidden md:rounded-[28px] md:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Image panel: card below the form on mobile, left column on desktop ===== */}
        <div className="relative order-2 mx-5 mb-6 mt-6 h-[360px] shrink-0 overflow-hidden rounded-[28px] md:order-1 md:m-0 md:h-auto md:w-[46%] md:rounded-none">
          {/* Mobile background */}
          <Image
            src="/images/MobileResponsiveBg.png"
            alt="Fresh vegetables in a wooden crate"
            fill
            sizes="100vw"
            className="object-cover object-center md:hidden"
          />

          {/* Desktop background */}
          <Image
            src="/images/AuthenticationBg.png"
            alt="Fresh vegetables in a wooden crate"
            fill
            sizes="480px"
            className="hidden object-cover md:block"
          />

          {/* Dark purple gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B0B3A] via-[#2B0B3A]/75 to-transparent to-65%" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col px-6 pb-7 md:px-8 md:pb-9 lg:px-9">
            {/* Mobile heading (sans, bold) */}
            <h2 className="text-[24px] leading-[1.15] font-bold text-white md:hidden">
              A little ease.
              <br />
              Every day.
            </h2>

            {/* Desktop heading (serif) */}
            <h2
              className="hidden text-[40px] leading-[1.1] font-medium text-white md:block"
              style={{
                fontFamily:
                  "'Playfair Display', Georgia, 'Times New Roman', serif",
              }}
            >
              A little ease.
              <br />
              Every day.
            </h2>

            <p className="mt-3 max-w-[340px] text-[13px] leading-relaxed text-white/80 md:mt-4 md:text-sm">
              A home for your orders, your delivery details and the next good
              meal.
            </p>

            <ul className="mt-4 flex flex-col gap-3 border-t border-white/20 pt-4 md:mt-6 md:gap-4 md:border-0 md:pt-0">
              {FEATURES.map(({ id, label, Icon }) => (
                <li
                  key={id}
                  className="flex items-center gap-3 text-[13px] text-white md:text-sm"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-white/90"
                    strokeWidth={1.75}
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== Auth panel: top on mobile, right column on desktop ===== */}
        <div className="relative order-1 flex shrink-0 flex-col px-5 pb-0 pt-5 sm:px-8 md:order-2 md:min-h-0 md:min-w-0 md:flex-1 md:shrink md:overflow-y-auto md:pb-8 md:pt-8 lg:px-12">
          {/* Top bar: close (left) + logo (right) on mobile; centered logo on desktop */}
          <div className="flex items-center justify-between md:justify-center">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-600 text-white transition hover:bg-slate-700 focus:outline-none md:absolute md:right-4 md:top-4 md:h-8 md:w-8 md:bg-transparent md:text-gray-400 md:hover:bg-gray-100 md:hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Image
              src="/images/POLYGON LOGO26.png"
              alt="Polygon"
              width={120}
              height={53}
              priority
              className="h-[40px] w-auto md:h-[46px]"
            />
          </div>

          {/* Tab switcher */}
          <div
            role="tablist"
            aria-label="Authentication"
            className="mt-5 grid grid-cols-2 rounded-full border-2 border-indigo-100 bg-indigo-50/40 p-1 md:mt-6"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer rounded-full py-2.5 text-sm font-medium transition-all focus:outline-none sm:text-base ${
                    isActive
                      ? "bg-white font-bold text-gray-900 shadow-[0_2px_8px_rgba(99,102,241,0.15)]"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {/* Login: bordered rounded card on mobile, plain on desktop.
              Signup: no card, because CitySelection already has its own cards. */}
          <div
            className={
              activeTab === "login"
                ? "mt-5 rounded-[24px] border border-indigo-100 bg-white p-5 shadow-[0_4px_20px_rgba(99,102,241,0.08)] md:mt-8 md:flex-1 md:rounded-none md:border-0 md:p-0 md:shadow-none"
                : "mt-5 pb-6 md:mt-8 md:flex-1 md:pb-0"
            }
          >
            {activeTab === "login" && (
              <div role="tabpanel">
                <LoginComponent />
              </div>
            )}

            {activeTab === "signup" && (
              <div role="tabpanel">
                {signupStep === "city" && (
                  <CitySelection onCityConfirmed={handleCityConfirmed} />
                )}

                {signupStep === "details" && confirmedCity && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setSignupStep("city")}
                      className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-800"
                    >
                      <ArrowLeft size={16} />
                      Change city
                    </button>

                    <p className="mb-4 text-sm text-gray-600">
                      Delivering to{" "}
                      <strong className="text-gray-900">
                        {confirmedCity.city}
                      </strong>
                    </p>

                    {/* TODO: <PersonalDetailsForm city={confirmedCity} /> */}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLoginComponent;
