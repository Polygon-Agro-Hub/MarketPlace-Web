"use client";

import React, { useState, useEffect } from "react";
import {
  FaAngleLeft,
  FaUser,
  FaExclamationTriangle,
  FaTasks,
  FaTrash,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

interface LeftSidebarProps {
  selectedMenu: string;
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
  onComplaintIconClick: (isOpen: boolean) => void;
}

interface RootState {
  auth: {
    user: {
      buyerType: string;
    } | null;
  };
}

const ICON_ACTIVE = "text-[#3E206D]";
const ICON_INACTIVE = "text-[#6B7683]";

// Space between the sidebar's left edge and the icons (desktop).
// Change this one value to make the gap bigger/smaller:
// md:pl-10 = 40px, md:pl-12 = 48px, md:pl-14 = 56px, md:pl-16 = 64px
const PAD_LEFT = "md:pl-12";
const BACK_MARGIN_LEFT = "md:ml-12"; // keep same size as PAD_LEFT

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedMenu,
  setSelectedMenu,
  onComplaintIconClick,
}) => {
  const [excludeSubmenuOpen, setExcludeSubmenuOpen] = useState(false);
  const [complaintSubmenuOpen, setComplaintSubmenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();

  const buyerType = useSelector(
    (state: RootState) => state.auth.user?.buyerType,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleComplaintClick = () => {
    const nextState = !complaintSubmenuOpen;
    setComplaintSubmenuOpen(nextState);
    setExcludeSubmenuOpen(false);
    if (
      nextState &&
      !["reportComplaint", "ComplaintHistory"].includes(selectedMenu)
    ) {
      setSelectedMenu("reportComplaint");
    }
    onComplaintIconClick(nextState);
  };

  const handleExcludeClick = () => {
    const nextState = !excludeSubmenuOpen;
    setExcludeSubmenuOpen(nextState);
    setComplaintSubmenuOpen(false);
    if (nextState && !["ViewMyList", "AddMoreItems"].includes(selectedMenu)) {
      setSelectedMenu("ViewMyList");
    }
    onComplaintIconClick(nextState);
  };

  const handleSubMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    if (!isDesktop) {
      setExcludeSubmenuOpen(false);
      setComplaintSubmenuOpen(false);
      onComplaintIconClick(false);
    }
  };

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    setExcludeSubmenuOpen(false);
    setComplaintSubmenuOpen(false);
    onComplaintIconClick(false);
  };

  const handleBackClick = () => {
    if (buyerType === "Wholesale") {
      router.push("/wholesale/home");
    } else {
      router.push("/");
    }
  };

  const isActive = (menu: string) => selectedMenu === menu;
  const isComplaintSectionActive = [
    "complaints",
    "reportComplaint",
    "ComplaintHistory",
  ].includes(selectedMenu);
  const isExcludeSectionActive = [
    "ExcludedItemList",
    "ViewMyList",
    "AddMoreItems",
  ].includes(selectedMenu);

  // Padding lives on the ROW (not the <ul>), so the grey highlight is
  // full-width while the icon is pushed away from the left edge.
  const rowBase = `flex items-center justify-center md:justify-start gap-4 px-2 ${PAD_LEFT} md:pr-4 py-2 w-full`;

  // Submenu rows use the same left padding; text is indented past the icon
  // (44px icon + 16px gap = 60px) so it lines up under the parent label.
  const subRowBase = `cursor-pointer text-[15px] px-2 ${PAD_LEFT} md:pr-4 w-full flex items-center`;

  const iconBox =
    "w-[44px] h-[42px] border border-[#D4D8DC] rounded-[10px] flex items-center justify-center bg-white shrink-0";
  const iconShadow = { boxShadow: "-4px 2px 8px rgba(0, 0, 0, 0.1)" };

  const labelClass = "hidden md:inline font-medium text-[16px] text-[#233242]";

  return (
    <div className="w-[70px] md:w-[336px] min-h-full bg-[#E9EBEE]">
      <div className="py-5">
        {/* Header */}
        <div className="items-center gap-4 mb-4 hidden md:flex">
          <div
            className={`w-[44px] h-[42px] border border-[#D4D8DC] cursor-pointer rounded-[10px] flex items-center justify-center bg-white ${BACK_MARGIN_LEFT}`}
            style={iconShadow}
            onClick={handleBackClick}
          >
            <FaAngleLeft className="text-[#233242]" />
          </div>
          <h2 className="font-semibold text-[#233242] text-[16px]">
            My Account
          </h2>
        </div>

        <div className="border-t border-[#BDBDBD] mb-6 hidden md:block" />

        {/* No horizontal padding on the list: rows are full-bleed */}
        <ul className="space-y-1">
          {/* Personal Details */}
          <li
            onClick={() => handleMenuClick("personalDetails")}
            className="cursor-pointer"
          >
            <div
              className={`${rowBase} ${isActive("personalDetails") ? "bg-[#DDDDDD]" : ""}`}
            >
              <div className={iconBox} style={iconShadow}>
                <FaUser
                  className={
                    isActive("personalDetails") ? ICON_ACTIVE : ICON_INACTIVE
                  }
                />
              </div>
              <span className={labelClass}>Personal Details</span>
            </div>
          </li>

          {/* Billing Address */}
          <li
            onClick={() => handleMenuClick("billingAddress")}
            className="cursor-pointer"
          >
            <div
              className={`${rowBase} ${isActive("billingAddress") ? "bg-[#DDDDDD]" : ""}`}
            >
              <div className={iconBox} style={iconShadow}>
                <FaLocationDot
                  className={
                    isActive("billingAddress") ? ICON_ACTIVE : ICON_INACTIVE
                  }
                />
              </div>
              <span className={labelClass}>Billing Address</span>
            </div>
          </li>

          {/* Item Preferences - hidden for Wholesale */}
          {buyerType !== "Wholesale" && (
            <li className="relative">
              <div
                className={`w-full ${isExcludeSectionActive ? "bg-[#DDDDDD]" : ""}`}
              >
                <div className="flex flex-col w-full cursor-pointer">
                  <div
                    onClick={handleExcludeClick}
                    className={`${rowBase} ${
                      isActive("ExcludedItemList") &&
                      !["ViewMyList", "AddMoreItems"].includes(selectedMenu)
                        ? "bg-[#D2D2D2]"
                        : "bg-transparent"
                    }`}
                  >
                    <div className={iconBox} style={iconShadow}>
                      <FaTasks
                        className={
                          isExcludeSectionActive ? ICON_ACTIVE : ICON_INACTIVE
                        }
                      />
                    </div>
                    <span className={labelClass}>Item Preferences</span>
                  </div>

                  {excludeSubmenuOpen && (
                    <div
                      className={`flex flex-col ${
                        isDesktop
                          ? "mt-1 w-full pb-2"
                          : "absolute left-[70px] top-[1px] w-[200px] shadow-lg z-10 bg-[#DDDDDD] justify-center rounded-md"
                      }`}
                    >
                      <div
                        onClick={() => handleSubMenuClick("ViewMyList")}
                        className={`${subRowBase} ${
                          isDesktop
                            ? "py-2 justify-start"
                            : "justify-center h-[51px]"
                        } ${
                          isActive("ViewMyList")
                            ? "bg-[#D2D2D2] font-[700] text-[#111]"
                            : "text-[#233242] font-[500]"
                        }`}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <span
                          className={`${isDesktop ? "ml-[60px]" : "pl-0"} text-[14px] leading-tight ${isDesktop ? "text-left" : "text-center"}`}
                        >
                          View My Preferences
                        </span>
                      </div>
                      <div
                        onClick={() => handleSubMenuClick("AddMoreItems")}
                        className={`${subRowBase} ${
                          isDesktop
                            ? "py-2 justify-start"
                            : "justify-center h-[47px] border-t border-[#C1C1C1]"
                        } ${
                          isActive("AddMoreItems")
                            ? "bg-[#D2D2D2] font-[700] text-[#111]"
                            : "text-[#233242] font-[500]"
                        }`}
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <span
                          className={`${isDesktop ? "ml-[60px]" : "pl-0"} text-[14px] leading-tight ${isDesktop ? "text-left" : "text-center"}`}
                        >
                          Update My Preferences
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )}

          {/* Complaints */}
          <li className="relative">
            <div
              className={`w-full ${isComplaintSectionActive ? "bg-[#DDDDDD]" : ""}`}
            >
              <div className="flex flex-col w-full cursor-pointer">
                <div
                  onClick={handleComplaintClick}
                  className={`${rowBase} ${
                    isActive("complaints") &&
                    !["reportComplaint", "ComplaintHistory"].includes(
                      selectedMenu,
                    )
                      ? "bg-[#D2D2D2]"
                      : "bg-transparent"
                  }`}
                >
                  <div className={iconBox} style={iconShadow}>
                    <FaExclamationTriangle
                      className={
                        isComplaintSectionActive ? ICON_ACTIVE : ICON_INACTIVE
                      }
                    />
                  </div>
                  <span className={labelClass}>Complaints</span>
                </div>

                {complaintSubmenuOpen && (
                  <div
                    className={`flex flex-col ${
                      isDesktop
                        ? "mt-1 w-full pb-2"
                        : "absolute left-[70px] top-[1px] w-[200px] shadow-lg z-10 bg-[#DDDDDD] justify-center rounded-md"
                    }`}
                  >
                    <div
                      onClick={() => handleSubMenuClick("reportComplaint")}
                      className={`${subRowBase} ${
                        isDesktop
                          ? "py-2 justify-start"
                          : "justify-center h-[51px]"
                      } ${
                        isActive("reportComplaint")
                          ? "bg-[#D2D2D2] font-[700] text-[#111]"
                          : "text-[#233242] font-[500]"
                      }`}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <span
                        className={`${isDesktop ? "ml-[60px]" : "pl-0"} text-[14px] leading-tight ${isDesktop ? "text-left" : "text-center"}`}
                      >
                        Report a Complaint
                      </span>
                    </div>
                    <div
                      onClick={() => handleSubMenuClick("ComplaintHistory")}
                      className={`${subRowBase} ${
                        isDesktop
                          ? "py-2 justify-start"
                          : "justify-center h-[47px] border-t border-[#C1C1C1]"
                      } ${
                        isActive("ComplaintHistory")
                          ? "bg-[#D2D2D2] font-[700] text-[#111]"
                          : "text-[#233242] font-[500]"
                      }`}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <span
                        className={`${isDesktop ? "ml-[60px]" : "pl-0"} text-[14px] leading-tight ${isDesktop ? "text-left" : "text-center"}`}
                      >
                        View Complaint History
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>

           {/* Card Details */}
          <li
            onClick={() => handleMenuClick("cardDetails")}
            className="cursor-pointer"
          >
            <div
              className={`${rowBase} ${isActive("cardDetails") ? "bg-[#DDDDDD]" : ""}`}
            >
              <div className={iconBox} style={iconShadow}>
                <FaLocationDot
                  className={
                    isActive("cardDetails") ? ICON_ACTIVE : ICON_INACTIVE
                  }
                />
              </div>
              <span className={labelClass}>Saved Debit / Credit Card</span>
            </div>
          </li>

          {/* Delete Account */}
          <li
            onClick={() => handleMenuClick("deleteAccount")}
            className="cursor-pointer"
          >
            <div
              className={`${rowBase} ${isActive("deleteAccount") ? "bg-[#DDDDDD]" : ""}`}
            >
              <div className={iconBox} style={iconShadow}>
                <FaTrash
                  className={
                    isActive("deleteAccount") ? ICON_ACTIVE : ICON_INACTIVE
                  }
                />
              </div>
              <span className={labelClass}>Delete Account</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LeftSidebar;