import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {
  faAngleDown,
  faMagnifyingGlass,
  faBagShopping,
  faBars,
  faUser,
  faClockRotateLeft,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useDispatch } from "react-redux";
import { logout, updateCreditBalance } from "../../store/slices/authSlice";
import socketService from "@/services/socketService";
import { clearCart } from "@/store/slices/cartSlice";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  ChevronUp,
  ChevronDown,
  MapPin,
} from "lucide-react";
import {
  clearSearch,
  resetAndSearch,
  setSearchTerm,
} from "../../store/slices/searchSlice";
import { X } from "lucide-react";
import Image from "next/image";
import glogo from "../../../public/glogo.png";
import { CreditBalancePill } from "@/components/creditupdate/CreditBalancePill";
import MainLoginComponent from "@/components/main-login-component/MainLoginComponent";

interface HeaderProps {
  onSearch?: (searchTerm: string) => void;
  searchValue?: string;
}

const Header = ({ onSearch, searchValue }: HeaderProps = {}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [isDesktopCategoryOpen, setIsDesktopCategoryOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const [isTokenValid, setIsTokenValid] = useState(true);

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token) as
    | string
    | null;
  const tokenExpiration = useSelector(
    (state: RootState) => state.auth.tokenExpiration,
  );
  const cartState = useSelector((state: RootState) => state.auth.cart) || {
    count: 0,
    price: 0,
    creditBalance: 0,
  };

  const router = useRouter();
  const pathname = usePathname();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedBuyerType, setSelectedBuyerType] = useState("");
  const [isMainLoginOpen, setIsMainLoginOpen] = useState(false);
  const [mainLoginDefaultTab, setMainLoginDefaultTab] = useState<
    "login" | "signup"
  >("login");
  const [activeHeaderSection, setActiveHeaderSection] = useState<string | null>(
    null,
  );

  const dispatch = useDispatch();
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const [localSearchInput, setLocalSearchInput] = useState("");
  const isSearchActive = useSelector(
    (state: RootState) => state.search.isSearchActive,
  );
  const profileImage = useSelector(
    (state: RootState) => state.auth.user?.image || null,
  );
  const [showMobileWallet, setShowMobileWallet] = useState(false);
  const walletRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const publicRoutes = [
      "/signin",
      "/signup",
      "/otp",
      "/forget-password",
      "/reset-password",
      "/error/404",
      "/error/451",
      "/unsubscribe",
      "/",
    ];

    const checkExpiry = () => {
      if (!token || !tokenExpiration) {
        setIsTokenValid(false);
        return;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= tokenExpiration) {
        setIsTokenValid(false);
        dispatch(logout());
        dispatch(clearCart());
        const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`),
        );
        if (!isPublicRoute) {
          router.replace("/signin");
        }
      } else {
        setIsTokenValid(true);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);

    return () => clearInterval(interval);
  }, [token, tokenExpiration, pathname]);

  // Real-time Polygon Wallet
useEffect(() => {
  if (!token || !isTokenValid) {
    socketService.setAuthToken(null); // logged out -> back to guest socket
    return;
  }

  socketService.setAuthToken(token);

  const unsubscribe = socketService.onCreditBalanceUpdate(({ creditBalance }) => {
    dispatch(updateCreditBalance(creditBalance));
  });

  return () => unsubscribe();
}, [token, isTokenValid, dispatch]);

  useEffect(() => {
    setLocalSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsDesktopCategoryOpen(false);
      }
      if (
        walletRef.current &&
        !walletRef.current.contains(event.target as Node)
      ) {
        setShowMobileWallet(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showSignupModal || showLogoutModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showSignupModal, showLogoutModal]);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchInput(e.target.value);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchTerm(localSearchInput.trim()));
  };

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedSearch = localSearchInput.trim();

      if (trimmedSearch) {
        const isWholesaleUser = user?.buyerType === "Wholesale";
        const targetHomePage = isWholesaleUser ? "/wholesale/home" : "/";

        if (pathname !== targetHomePage) {
          router.replace(
            `${targetHomePage}?search=${encodeURIComponent(trimmedSearch)}`,
          );
          return;
        } else {
          dispatch(resetAndSearch(trimmedSearch));
        }
      }

      if (onSearch) {
        onSearch(trimmedSearch);
      }
    },
    [localSearchInput, dispatch, onSearch, router, user?.buyerType, pathname],
  );

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e as any);
    }
  };

  const handleResetSearch = () => {
    setLocalSearchInput("");
    dispatch(clearSearch());
  };

  const formatPrice = (price: number): string => {
    const fixedPrice = Number(price).toFixed(2);
    const [integerPart, decimalPart] = fixedPrice.split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${decimalPart}`;
  };

  const creditBalance = isHydrated ? (cartState.creditBalance ?? 0) : 0;
  const isZeroBalance = creditBalance === 0;
  const isNegativeBalance = creditBalance < 0;

  const balanceColor = isZeroBalance
    ? "#73747D"
    : isNegativeBalance
      ? "#E94C12"
      : "#007E20";

  const walletBgColor = isZeroBalance
    ? "#EAEAEC"
    : isNegativeBalance
      ? "#FCE7E0"
      : "#E4FFEB";

  const formattedBalance = isNegativeBalance
    ? `- Rs. ${formatPrice(Math.abs(creditBalance))}`
    : `Rs. ${formatPrice(creditBalance)}`;

  const toggleDesktopCategory = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsDesktopCategoryOpen(!isDesktopCategoryOpen);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    setShowLogoutModal(false);
    router.replace("/signin");
  };

  const getHomeUrl = () => {
    if (!isHydrated) return "/";
    return user?.buyerType === "Wholesale" ? "/wholesale/home" : "/";
  };
  const homeUrl = getHomeUrl();

  const handleSectionNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    event.preventDefault();
    setIsMenuOpen(false);
    setActiveHeaderSection(sectionId);
    if (isSearchActive) dispatch(clearSearch());

    const section =
      pathname === homeUrl ? document.getElementById(sectionId) : null;
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push(`${homeUrl}#${sectionId}`);
  };

  const isAuthenticated = () => {
    return isHydrated && token && isTokenValid;
  };

  useEffect(() => {
    if (isHydrated && token && isTokenValid) setIsMainLoginOpen(false);
  }, [isHydrated, token, isTokenValid]);

  const getUserInfo = () => {
    return isHydrated ? user : null;
  };

  const handleCategoryClick = (e: React.MouseEvent, buyerType: string) => {
    e.preventDefault();
    setSelectedBuyerType(buyerType);
    setShowSignupModal(true);
    setIsDesktopCategoryOpen(false);
  };

  const confirmSignup = () => {
    setShowSignupModal(false);
    if (selectedBuyerType === "Wholesale") {
      router.replace("/wholesale/home");
    } else {
      router.replace("/");
    }
  };

  const handleMobileCategoryClick = (
    e: React.MouseEvent,
    buyerType: string,
  ) => {
    e.preventDefault();
    setSelectedBuyerType(buyerType);
    setShowSignupModal(true);
    setIsMenuOpen(false);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      router.replace("/signin");
      return;
    }

    if (isNegativeBalance) {
      router.push("/clear-balance-page/");
      return;
    }

    router.push("/cart");
  };


  const openMainLogin = (tab: "login" | "signup") => {
    setMainLoginDefaultTab(tab);
    setIsMainLoginOpen(true);
  };

  const renderAuthButtons = () => {
    return (
      <>
        <button
          type="button"
          onClick={() => openMainLogin("login")}
          className="whitespace-nowrap text-sm font-semibold text-[#252a34] hover:text-[#ff5635]"
        >
          Log in
        </button>
        <span className="text-sm text-[#596579]">/</span>
        <button
          type="button"
          onClick={() => openMainLogin("signup")}
          className="whitespace-nowrap text-sm font-semibold text-[#252a34] hover:text-[#ff5635]"
        >
          Sign up
        </button>
      </>
    );
  };

  const renderMobileAuthButtons = () => {
    if (!isHydrated) {
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              openMainLogin("login");
            }}
            className="py-4 px-6 hover:bg-purple-800 flex items-center gap-2"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              openMainLogin("signup");
            }}
            className="py-4 px-6 hover:bg-purple-800 flex items-center gap-2"
          >
            Signup
          </button>
        </>
      );
    }

    if (getUserInfo()) {
      return (
        <Link
          href="/logout"
          className="py-4 px-6 border-b border-[#828282] hover:bg-purple-800 flex items-center gap-2"
          onClick={handleLogout}
        >
          Logout
        </Link>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={() => {
            setIsMenuOpen(false);
            openMainLogin("login");
          }}
          className="py-4 px-6 border-b border-[#828282] hover:bg- flex items-center gap-2"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setIsMenuOpen(false);
            openMainLogin("signup");
          }}
          className="py-4 px-6 border-b border-[#828282] hover:bg-purple-800 flex items-center gap-2"
        >
          Signup
        </button>
      </>
    );
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 ease-in-out ${showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      <div className="bg-[#171d27] px-4 py-2 text-white md:px-7">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 text-[11px] md:justify-start md:text-sm">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-emerald-400" aria-hidden="true">●</span>
            <span>Call us for any query or help</span>
          </span>
          <a
            href="tel:+94114313433"
            className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap hover:underline md:ml-0 md:gap-2"
          >
            <span aria-hidden="true">☎</span>
            +94 11 431 3433
          </a>
        </div>
      </div>

      <header className="bg-white px-3 py-3 shadow-sm md:px-5 md:py-4">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 md:gap-6">
          <Link href={homeUrl} className="shrink-0">
            <Image
              src={glogo}
              alt="Polygon"
              className="h-12 w-auto object-contain md:h-11"
            />
          </Link>

          {isAuthenticated() && (
            <div className="hidden min-w-[144px] shrink-0 items-center gap-2 rounded-full bg-[#f7f7fc] px-3 py-2 text-xs text-[#46536a] md:flex">
              <MapPin size={17} className="shrink-0 text-[#ff5635]" aria-hidden="true" />
              <span>
                <span className="block leading-none">Deliver To :</span>
                <span className="mt-1 block max-w-36 truncate font-semibold text-[#171d27]">
                  {user?.nearesCity || "Select your city"}
                </span>
              </span>
            </div>
          )}

          {!isMobile && (
            <div className="mx-auto hidden min-w-0 w-full max-w-2xl flex-1 md:block">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Try tomatoes, bananas or broccoli..."
                    value={localSearchInput}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    className="w-full rounded-full border border-[#dedcff] bg-[#f8f7ff] py-2.5 pl-11 pr-10 text-sm text-[#3E206D] placeholder-[#596579] focus:outline-none focus:ring-2 focus:ring-[#dedcff]"
                  />
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#46536a]"
                  />
                  {isSearchActive && searchTerm ? (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3E206D]"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
            {!isAuthenticated() && !isMobile && (
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-sm text-[#171d27]" />
                <div className="flex items-center gap-1">
                  {renderAuthButtons()}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleCartClick}
              className="flex h-10 items-center gap-2 rounded-full bg-[#ff603d] px-3 text-white transition-colors hover:bg-[#ef4d2c] md:h-11 md:px-5 cursor-pointer"
              aria-label={`My Cart, ${isHydrated ? cartState.count || 0 : 0} items`}
            >
              <FontAwesomeIcon icon={faBagShopping} className="text-lg" />
              <span className="text-xs font-semibold md:text-sm">My Cart</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1 text-xs font-bold">
                {isHydrated ? cartState.count || 0 : 0}
              </span>
            </button>

            {isAuthenticated() && (
              <div className="group relative">
                <Link
                  href="/account"
                  className="flex h-10 items-center gap-2 rounded-full border-0 p-0 text-[#171d27] md:h-12 md:border md:py-1 md:pl-1 md:pr-4"
                >
                  {profileImage && (
                    <img
                      src={profileImage}
                      alt=""
                      className="hidden h-9 w-9 rounded-full object-cover md:block"
                    />
                  )}
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#e94c27] text-xs font-bold text-white md:h-9 md:w-9 ${profileImage ? "md:hidden" : ""}`}>
                    {`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`}
                  </span>
                  <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">
                    {[user?.firstName, user?.lastName].filter(Boolean).join(" ")}
                  </span>
                </Link>
                <div className="invisible absolute right-0 top-full z-[70] pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <Link
                    href="/logout"
                    onClick={handleLogout}
                    className="block min-w-32 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#171d27] shadow-lg hover:bg-[#f8f8fc]"
                  >
                    Logout
                  </Link>
                </div>
              </div>
            )}

            {isMobile && (
              <button
                type="button"
                onClick={toggleMenu}
                className="p-2 text-xl text-[#171d27]"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
              </button>
            )}
          </div>
        </div>
        <div className="mx-2 mt-2 md:hidden">
          <form onSubmit={handleMobileSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Try tomatoes, bananas or broccoli..."
                value={localSearchInput}
                onChange={handleSearchChange}
                className="w-full rounded-full border border-[#dedcff] bg-[#f8f7ff] py-2.5 pl-11 pr-10 text-sm text-[#3E206D] placeholder-[#596579] focus:outline-none focus:ring-2 focus:ring-[#dedcff]"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#46536a]"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
              {isSearchActive && searchTerm ? (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3E206D]"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </header>

      <header className="hidden">
        <div className="mx-auto flex justify-between items-center gap-3">
          <div className="text-2xl font-bold flex items-center">
            <Link href={getHomeUrl()}>
              <Image
                src={glogo}
                alt="My Farm Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>
          {!isMobile && (
            <nav className="hidden md:flex space-x-6">
              {/* <Link
                href={getHomeUrl()}
                className={`hover:text-[#383d39] text-[#000000] ${isHydrated && pathname === getHomeUrl()
                  ? "underline underline-offset-4"
                  : ""
                  }`}
              >
                Home
              </Link> */}
              {!isAuthenticated() && (
                <div className="relative cursor-pointer" ref={categoryRef}>
                  <button
                    className="flex items-center gap-2 text-[#000000] hover:text-[#000000] cursor-pointer"
                    onClick={toggleDesktopCategory}
                  >
                    Category
                    <span className="text-[#000000]">
                      <FontAwesomeIcon icon={faAngleDown} />
                    </span>
                  </button>
                  {isDesktopCategoryOpen && (
                    <div className="absolute border border-[#CECECE] shadow-md bg-[#ffffff] text-[#000000] w-32 shadow-lg mt-2 z-10 cursor-pointer">
                      <button
                        onClick={(e) => handleCategoryClick(e, "Retail")}
                        className="cursor-pointer border-b-1 block px-4 py-2 hover:bg-[#ededed] w-full text-left"
                      >
                        Retail
                      </button>
                      <button
                        onClick={(e) => handleCategoryClick(e, "Wholesale")}
                        className="cursor-pointer block px-4 py-2 hover:bg-[#ededed] w-full text-left"
                      >
                        Wholesale
                      </button>
                    </div>
                  )}
                </div>
              )}
            </nav>
          )}
          {isMobile && isAuthenticated() && (
            <div
              className="relative"
              ref={walletRef}
              style={{ position: "relative" }}
            >
              <button
                onClick={() => {
                  if (isZeroBalance) return;
                  if (isNegativeBalance) {
                    router.push("/clear-balance-page");
                    return;
                  }
                  setShowMobileWallet((prev) => !prev);
                }}
                className="flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0 cursor-pointer"
                style={{ backgroundColor: walletBgColor }}
                aria-label="Wallet balance"
              >
                <FontAwesomeIcon
                  icon={faWallet}
                  style={{ color: balanceColor, fontSize: "18px" }}
                />
              </button>

              {showMobileWallet && !isZeroBalance && !isNegativeBalance && (
                <div
                  style={{
                    position: "fixed",
                    top: "85px",
                    right: "16px",
                    zIndex: 60,
                  }}
                >
                  {/* Caret arrow */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingRight: "190px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        background: "#FFFFFF",
                        transform: "rotate(45deg)",
                        marginBottom: "-6px",
                      }}
                    />
                  </div>

                  {/* Popup card */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "16px",
                      boxShadow:
                        "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                      padding: "16px",
                      width: "288px",
                      maxWidth: "calc(100vw - 32px)",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "9999px",
                          border: `2px solid ${balanceColor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          background: "white",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faWallet}
                          style={{ color: balanceColor, fontSize: "16px" }}
                        />
                      </div>

                      <div>
                        <p
                          style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#4C4C4C",
                            margin: 0,
                          }}
                        >
                          Polygon Wallet
                        </p>
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: balanceColor,
                            margin: 0,
                          }}
                        >
                          {formattedBalance}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: walletBgColor,
                        borderRadius: "9999px",
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "9999px",
                          background: balanceColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          style={{
                            width: "12px",
                            height: "12px",
                            color: "#FFFFFF",
                          }}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <span
                        style={{
                          fontSize: "14px",
                          color: balanceColor,
                          fontWeight: 500,
                        }}
                      >
                        Available to use for next order
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {!isMobile && isAuthenticated() && (
            <CreditBalancePill creditBalance={cartState.creditBalance ?? 0} />
          )}
          {!isMobile && (
            <div className="flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for Products.."
                    value={localSearchInput}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    className="italic w-full py-2.5 pl-5 pr-10 rounded-full text-[#3E206D] placeholder-[#3E206D] text-center focus:outline-none bg-[#EFE4FF]"
                  />
                  {isSearchActive && searchTerm ? (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3E206D] hover:opacity-70 transition-opacity"
                    >
                      <X size={16} className="cursor-pointer" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#3E206D] hover:opacity-70"
                    >
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="cursor-pointer"
                      />
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
          <div onClick={handleCartClick} className="cursor-pointer">
            <div className="flex items-center justify-center bg-[#000000] px-4.5 md:px-8 py-2 rounded-full h-12">
              <div className="relative">
                <FontAwesomeIcon className="text-2xl" icon={faBagShopping} />
                <span className="absolute top-3 -right-1 bg-[#FF8F66] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {isHydrated ? cartState.count || 0 : 0}
                </span>
              </div>
              <div className="text-sm hidden md:block md:ml-4">
                Rs. {isHydrated ? formatPrice(cartState.price) : "0.00"}
              </div>
            </div>
          </div>
          {!isMobile && isAuthenticated() && (
            <Link href="/history/order">
              <FontAwesomeIcon
                className="text-4xl text-[#000000]"
                icon={faClockRotateLeft}
              />
            </Link>
          )}
          {isAuthenticated() && (
            <Link
              className="border-2 border-black w-9 h-9 md:w-12 md:h-12 flex justify-center items-center rounded-full overflow-hidden flex-shrink-0"
              href="/account"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FontAwesomeIcon
                  className="text-xl md:text-2xl text-black"
                  icon={faUser}
                />
              )}
            </Link>
          )}
          {isMobile && (
            <button onClick={toggleMenu} className="md:hidden">
              <FontAwesomeIcon
                className="text-2xl text-[#000000]"
                icon={isMenuOpen ? faTimes : faBars}
              />
            </button>
          )}
        </div>
      </header>

      <nav className="bg-white px-2 md:px-6">
        <div className="mx-auto flex min-h-10 max-w-[1600px] items-center gap-2 overflow-x-auto px-2 text-[11px] font-semibold md:gap-6 md:text-sm">
          <a
            href={`${homeUrl}#shop-by-category`}
            onClick={(event) =>
              handleSectionNavigation(event, "shop-by-category")
            }
            className={`shrink-0 border-b-2 py-2 transition-colors ${
              activeHeaderSection === "shop-by-category"
                ? "border-[#ff603d] text-[#ff5635]"
                : "border-transparent text-[#555] hover:text-[#ff5635]"
            }`}
          >
            Fresh produce
          </a>
          <a
            href={`${homeUrl}#how-it-works`}
            onClick={(event) => handleSectionNavigation(event, "how-it-works")}
            className={`shrink-0 border-b-2 py-2 transition-colors ${
              activeHeaderSection === "how-it-works"
                ? "border-[#ff603d] text-[#ff5635]"
                : "border-transparent text-[#555] hover:border-[#ff603d] hover:text-[#ff5635]"
            }`}
          >
            How it works
          </a>
          {user?.buyerType !== "Wholesale" && (
            <a
              href={`${homeUrl}#everyday-bundles`}
              onClick={(event) =>
                handleSectionNavigation(event, "everyday-bundles")
              }
              className={`shrink-0 border-b-2 py-2 transition-colors ${
                activeHeaderSection === "everyday-bundles"
                  ? "border-[#ff603d] text-[#ff5635]"
                  : "border-transparent text-[#555] hover:border-[#ff603d] hover:text-[#ff5635]"
              }`}
            >
              Everyday bundles
            </a>
          )}
          <a
            href={`${homeUrl}#need-a-hand`}
            onClick={(event) => handleSectionNavigation(event, "need-a-hand")}
            className={`ml-auto shrink-0 border-b-2 py-2 transition-colors ${
              activeHeaderSection === "need-a-hand"
                ? "border-[#ff603d] text-[#ff5635]"
                : "border-transparent text-[#555] hover:border-[#ff603d] hover:text-[#ff5635]"
            }`}
          >
            Need a hand?
          </a>
        </div>
        <div className="-mx-4 h-[3px] bg-gradient-to-r from-[#F5F5F5] via-[#F5F5F5] to-[#F5F5F5] sm:-mx-6" />
      </nav>

      {isMobile && isMenuOpen && (
        <div className="relative flex w-full justify-end mobile-menu-container">
          <div className="absolute z-50">
            <div className="bg-[#2D2D2D] text-white w-40 flex flex-col mobile-menu-content">
              <nav className="flex flex-col w-full">
                {renderMobileAuthButtons()}
                <Link
                  href={getHomeUrl()}
                  className="py-4 px-6 border-b border-[#828282] hover:bg-purple-800 text-[#FFFFFF] "
                >
                  Home
                </Link>
                {!isAuthenticated() && (
                  <div className="border-b border-[#828282]">
                    <button
                      className="py-4 px-6 w-full flex justify-between items-center hover:bg-purple-800 text-left"
                      onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                    >
                      Category
                      <span className="text-xs">
                        {isCategoryExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </span>
                    </button>
                    {isCategoryExpanded && (
                      <div className="bg-[#242424]">
                        <button
                          onClick={(e) =>
                            handleMobileCategoryClick(e, "Retail")
                          }
                          className="block py-3 px-8 hover:bg-purple-800 w-full text-left"
                        >
                          • Retail
                        </button>
                        <button
                          onClick={(e) =>
                            handleMobileCategoryClick(e, "Wholesale")
                          }
                          className="block py-3 px-8 hover:bg-purple-800 w-full text-left"
                        >
                          • Wholesale
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {/* <Link
                  href="/promotions"
                  className="py-4 px-6 border-b border-[#828282] hover:bg-purple-800 text-[#FFFFFF]"
                >
                  Promotions
                </Link> */}
                {isAuthenticated() && (
                  <Link
                    href="/history/order"
                    className="py-4 px-6 border-b border-[#828282] hover:bg-purple-800"
                  >
                    Order History
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex min-h-screen items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[25px] shadow-lg w-72 md:w-96 text-center">
            <p className="text-lg font-medium mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2 bg-[#F3F4F7] text-gray-800 hover:bg-gray-300 transition-colors rounded-[15px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-6 py-2 bg-[#E4001A] text-white rounded-[15px] hover:bg-red-700 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {showSignupModal && (
        <div className="fixed min-h-screen inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[25px] shadow-lg md:w-96 text-center">
            <p className="text-lg font-medium mb-5">
              Do you want to SignIn as a {selectedBuyerType} buyer?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowSignupModal(false)}
                className="px-6 py-2 bg-[#F3F4F7] text-gray-800 hover:bg-gray-300 transition-colors rounded-[15px] cursor-pointer w-28 text-center"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignup}
                className="px-6 py-2 bg-[#3E206D] text-white rounded-[15px] hover:bg-[#502496] transition-colors cursor-pointer w-28 text-center"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      <MainLoginComponent
        isOpen={isMainLoginOpen}
        onClose={() => setIsMainLoginOpen(false)}
        defaultTab={mainLoginDefaultTab}
      />
    </div>
  );
};

export default Header;
