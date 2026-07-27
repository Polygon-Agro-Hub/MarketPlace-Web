"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter, useSearchParams } from "next/navigation";
import { getInvoice, getOrderDetails } from "@/services/retail-order-service";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = (pdfFonts as any).vfs;
import { Suspense } from "react";
import Loader from "@/components/loader-spinner/Loader";
import NextImage from "next/image";
import Logo from "../../../../public/glogo.png";

// Define interfaces based on the API responses
export interface InvoiceItem {
  id: number;
  name: string;
  unitPrice: string;
  quantity: string;
  unit: string;
  amount: string;
  image?: string;
  packageDetails?: {
    packageId: number;
    productTypeId: number;
    typeName: string;
    qty: number;
  }[];
}

interface BillingInfo {
  title: string;
  fullName: string;
  email: string;
  buildingType: string;
  houseNo: string;
  street: string;
  city: string;
  phone: string;
  buildingNo?: string;
  apartmentName?: string;
  flatNo?: string;
  floorNo?: string;
}

interface PickupInfo {
  centerId?: string;
  centerName: string;
  contact01: string;
  address: {
    street: string;
    city: string;
    district: string;
    province: string;
    country: string;
    zipCode: string;
  };
}

// 2. Updated InvoiceData interface to include couponDiscount
interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  scheduledDate: string;
  deliveryMethod: string;
  paymentMethod: string;
  isPaid?: number | null;
  creditPaid?: string | number | null;
  moneyPaid?: string | number | null;
  amountDue: string;
  familyPackItems: InvoiceItem[];
  additionalItems: InvoiceItem[];
  familyPackTotal: string;
  additionalItemsTotal: string;
  deliveryFee: string;
  discount: string;
  couponDiscount: string; // Added couponDiscount
  grandTotal: string;
  billingInfo: BillingInfo;
  pickupInfo?: PickupInfo;
}

function formatDateTime(
  dateTimeStr: string,
  type: "date" | "time" = "date",
): string {
  if (!dateTimeStr || dateTimeStr === "N/A") return "N/A";
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) {
    if (type === "time" && dateTimeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return dateTimeStr.slice(0, 5);
    }
    return "N/A";
  }
  if (type === "time") {
    return date.toLocaleString("en-US", {
      timeZone: "Asia/Colombo",
      timeStyle: "short",
    });
  }
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
  });
}

// Helper function to format quantity - removes unnecessary decimal zeros
function formatQuantity(quantity: string | number, unit: string = ""): string {
  const numQty = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  if (isNaN(numQty)) return `${quantity}${unit}`;

  // If it's a whole number, display without decimals
  const formattedQty =
    numQty % 1 === 0
      ? numQty.toString()
      : numQty.toFixed(2).replace(/\.?0+$/, "");
  return `${formattedQty}${unit}`;
}

// Helper function to format item count - singular vs plural
function formatItemCount(count: number): string {
  return count === 1 ? "01 Item" : `${count.toString().padStart(2, "0")} Items`;
}

// Horizontal Scrollable Table Component with visible scroll indicators
const ScrollableTable = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftShadow(scrollLeft > 0);
      setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      handleScroll();
      container.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, []);

  return (
    <div className="relative">
      {/* Scroll indicator shadows */}
      {showLeftShadow && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 hidden sm:block" />
      )}
      {showRightShadow && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 hidden sm:block" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className={`overflow-x-auto scrollbar-visible ${className}`}
        style={{
          scrollbarWidth: "thin",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>

      {/* Scroll hint for mobile */}
      <div className="sm:hidden text-center mt-2 text-xs text-gray-400 flex items-center justify-center gap-1">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span>Swipe to see more</span>
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </div>
    </div>
  );
};

function parseAmount(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = value
    .toString()
    .replace(/Rs\.?\s?/, "")
    .replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function detectPaymentType(
  payType: string,
  deliveryMethod: string,
  credit: number | null,
  cash: number | null,
): string {
  const isPickup = deliveryMethod?.toLowerCase().includes("pickup");

  if (credit !== null && cash === null) {
    return "Credit Balance";
  }

  if (payType === "Card") {
    if (credit === null && cash !== null && cash > 0) return "Online Transfer";
    if (credit !== null && cash !== null)
      return "Online Transfer + Credit Balance";
  } else if (payType === "Cash") {
    if (credit === null && cash !== null && cash > 0) {
      return isPickup ? "Cash on Pickup" : "Cash on Delivery";
    }
    if (credit !== null && cash !== null) {
      return isPickup
        ? "Cash on Pickup + Credit Balance"
        : "Cash on Delivery + Credit Balance";
    }
  }

  return payType === "Card" ? "Debit/Credit Card" : "Cash On Delivery";
}

interface PaymentStatusRow {
  label: string;
  amount: number;
  status: "paid" | "pending";
}

function getPaymentStatusInfo(
  invoice: InvoiceData,
  grandTotal: number,
): { rows: PaymentStatusRow[]; showDeliveryNote: boolean } {
  const rows: PaymentStatusRow[] = [];
  let showDeliveryNote = false;

  const isPaid = Number(invoice.isPaid) === 1;
  const creditPaidNum = parseAmount(invoice.creditPaid);
  const hasCreditPaid =
    invoice.creditPaid !== null &&
    invoice.creditPaid !== undefined &&
    creditPaidNum > 0;
  const remainingAfterCredit = grandTotal - creditPaidNum;
  const isPickup = invoice.deliveryMethod?.toLowerCase().includes("pickup");

  const push = (label: string, amount: number, status: "paid" | "pending") => {
    rows.push({ label, amount, status });
  };

  if (hasCreditPaid) {
    push("Credit Balance Used", creditPaidNum, "paid");

    if (remainingAfterCredit > 0.01) {
      if (isPaid) {
        push("Online Transferred Amount", remainingAfterCredit, "paid");
      } else if (isPickup) {
        push("Cash On Pickup (Pending)", remainingAfterCredit, "pending");
      } else {
        push("Cash On Delivery (Pending)", remainingAfterCredit, "pending");
        showDeliveryNote = true;
      }
    }
  } else {
    if (isPaid) {
      push("Online Transferred Amount", grandTotal, "paid");
    } else if (isPickup) {
      push("Cash On Pickup (Pending)", grandTotal, "pending");
    } else {
      push("Cash On Delivery (Pending)", grandTotal, "pending");
      showDeliveryNote = true;
    }
  }

  return { rows, showDeliveryNote };
}

function InvoiceView({
  invoice,
  onClose,
  invoiceRef,
}: {
  invoice: InvoiceData | null;
  onClose: () => void;
  invoiceRef: React.RefObject<HTMLDivElement>;
}) {
  const user = useSelector((state: RootState) => state.auth.user);
  const buyerType = user?.buyerType || "Retail";

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center text-[rgb(75,85,99)]">
        <Loader isVisible={true} />
      </div>
    );
  }

  const creditForType =
    parseAmount(invoice.creditPaid) > 0
      ? parseAmount(invoice.creditPaid)
      : null;
  const cashForType =
    parseAmount(invoice.moneyPaid) > 0 ? parseAmount(invoice.moneyPaid) : null;
  const paymentTypeLabel =
    detectPaymentType(
      invoice.paymentMethod,
      invoice.deliveryMethod,
      creditForType,
      cashForType,
    ) || "N/A";

  function formatCurrencyWithCommas(value: string | number): string {
    const numValue = typeof value === "string" ? parseCurrency(value) : value;
    return `Rs. ${numValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Update the parseCurrency function to work with the new formatter
  function parseCurrency(value: string): number {
    if (value === "Rs. NaN" || !value) return 0;
    return parseFloat(value.replace("Rs. ", "").replace(/,/g, "")) || 0;
  }

  return (
    <div
      className="mx-auto w-full max-w-[794px] bg-white p-4 sm:p-6 lg:p-8"
      ref={invoiceRef}
    >
      <div className="relative mb-7 flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute left-0 cursor-pointer text-[rgb(107,114,128)] hover:text-[rgb(62,32,109)]"
        >
          <span className="text-xl sm:text-2xl">⟵</span>
        </button>
        <h1
          className="text-xl font-bold tracking-[0.2em] sm:text-2xl"
          style={{ color: "rgb(62,32,109)" }}
        >
          INVOICE
        </h1>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div className="order-2 lg:order-1">
          <p className="text-base font-semibold sm:text-lg">
            Polygon Holdings (Private) Ltd
          </p>
          <div className="text-xs sm:text-sm">
            <p>No. 42/46, Nawam Mawatha, Colombo 02.</p>
            <p>Contact No: +94 770 111 999</p>
            <p>Email Address: info@polygon.lk</p>
          </div>
        </div>
        <div className="order-1 flex justify-start lg:order-2 lg:pl-12">
          <NextImage
            src={Logo}
            alt="Polygon Logo"
            width={140}
            height={140}
            className="h-auto w-[112px] sm:w-[140px]"
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 text-xs sm:text-sm lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div>
          <p className="font-bold">Bill To:</p>
          <p>{`${invoice.billingInfo.title}. ${invoice.billingInfo.fullName}`}</p>
          <p className="break-all">{invoice.billingInfo.email}</p>
          <p>{invoice.billingInfo.phone}</p>

          {!invoice.deliveryMethod?.toLowerCase().includes("pickup") && (
            <div className="mt-4 space-y-1">
              {invoice.billingInfo.buildingType === "House" ? (
                <>
                  <p className="font-bold">House Address :</p>
                  <p>
                    <span style={{ color: "#929292" }}>House No :</span>{" "}
                    {invoice.billingInfo.houseNo},
                  </p>
                  <p>
                    <span style={{ color: "#929292" }}>Street Name :</span>{" "}
                    {invoice.billingInfo.street},
                  </p>
                  <p>
                    <span style={{ color: "#929292" }}>City :</span>{" "}
                    {invoice.billingInfo.city}
                  </p>
                </>
              ) : invoice.billingInfo.buildingType === "Apartment" ? (
                <>
                  <p className="font-bold">Apartment Address :</p>
                  <p>
                    <span style={{ color: "#929292" }}>No :</span>{" "}
                    {invoice.billingInfo.buildingNo || "N/A"},
                  </p>
                  <p>
                    <span style={{ color: "#929292" }}>Name :</span>{" "}
                    {invoice.billingInfo.apartmentName || "N/A"},
                  </p>
                  <p>
                    <span style={{ color: "#929292" }}>Flat :</span>{" "}
                    {invoice.billingInfo.flatNo || "N/A"},
                  </p>
                  <p>
                    <span style={{ color: "#929292" }}>Floor :</span>{" "}
                    {invoice.billingInfo.floorNo || "N/A"},
                  </p>
                  <p>
                    <span style={{ color: "#929292" }}>House No :</span>{" "}
                    {invoice.billingInfo.houseNo},
                  </p>
                  <p>
                    <span style={{ color: "#929292" }}>Street Name :</span>{" "}
                    {invoice.billingInfo.street}
                  </p>
                  <p>
                    <span style={{ color: "#929292" }}>City :</span>{" "}
                    {invoice.billingInfo.city}
                  </p>
                </>
              ) : (
                <>
                  <p>{`No. ${invoice.billingInfo.houseNo}`}</p>
                  <p>{invoice.billingInfo.street}</p>
                  <p>{invoice.billingInfo.city}</p>
                </>
              )}
            </div>
          )}

          <div className="mt-5 space-y-1">
            <p className="font-bold">Invoice No:</p>
            <p>{invoice.invoiceNumber}</p>
          </div>

          <div className="mt-5 space-y-1">
            <p className="font-bold">Delivery Method:</p>
            <p>
              {invoice.deliveryMethod?.toLowerCase().includes("pickup")
                ? "Instore Pickup"
                : "Home Delivery"}
            </p>
          </div>

          {invoice.deliveryMethod?.toLowerCase().includes("pickup") &&
            invoice.pickupInfo && (
              <div className="mt-3 space-y-1">
                <p className="font-bold">
                  Centre: {invoice.pickupInfo.centerName || "N/A"}
                </p>
                <p>{`${invoice.pickupInfo.address?.city || "N/A"}, ${invoice.pickupInfo.address?.district || "N/A"}`}</p>
                <p>{`${invoice.pickupInfo.address?.province || "N/A"}, ${invoice.pickupInfo.address?.country || "N/A"}`}</p>
              </div>
            )}
        </div>

        <div className="lg:pl-12 lg:pt-10">
          <div>
            <p className="font-bold">Grand Total:</p>
            <p className="text-lg font-extrabold sm:text-xl">
              {formatCurrencyWithCommas(invoice.grandTotal)}
            </p>
          </div>

          <div className="mt-5">
            <p className="font-bold">Payment Method:</p>
            <p>{paymentTypeLabel}</p>
          </div>

          <div className="mt-5">
            <p className="font-bold">Ordered Date:</p>
            <p>{formatDateTime(invoice.invoiceDate, "date")}</p>
          </div>

          <div className="mt-5">
            <p className="font-bold">Scheduled Date:</p>
            <p>{formatDateTime(invoice.scheduledDate, "date")}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {invoice.familyPackItems && invoice.familyPackItems.length > 0 && (
          <div>
            {invoice.familyPackItems.map((pack) => (
              <div key={pack.id} className="mb-6">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-semibold sm:text-base">
                    {`${pack.name} (${formatItemCount(pack.packageDetails?.reduce((sum, detail) => sum + (detail.qty || 0), 0) || 0)})`}
                  </h2>
                  <span className="text-lg font-semibold">
                    {formatCurrencyWithCommas(pack.amount)}
                  </span>
                </div>
                <div className="mb-4 border-t border-gray-300" />
                <div className="overflow-hidden rounded-lg border border-gray-300">
                  <ScrollableTable>
                    <table className="w-full min-w-[520px] text-xs sm:min-w-0 sm:text-sm">
                      <thead>
                        <tr className="border-b border-gray-300 bg-gray-100">
                          <th className="w-16 p-2 text-left sm:p-3">Index</th>
                          <th className="p-2 text-left sm:p-3">
                            Item Description
                          </th>
                          <th className="w-20 p-2 text-left sm:p-3">QTY</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pack.packageDetails &&
                        pack.packageDetails.length > 0 ? (
                          pack.packageDetails.map((detail, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200 last:border-b-0"
                            >
                              <td className="p-2 text-left sm:p-3">{`${index + 1}.`}</td>
                              <td className="p-2 text-left sm:p-3">
                                {detail.typeName}
                              </td>
                              <td className="p-2 text-left sm:p-3">
                                {detail.qty}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              className="p-3 text-center text-gray-600"
                            >
                              No package details available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </ScrollableTable>
                </div>
              </div>
            ))}
          </div>
        )}

        {invoice.additionalItems && invoice.additionalItems.length > 0 && (
          <div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold sm:text-base">
                {`${buyerType === "Wholesale" ? "Selected Items" : "Additional Items"} (${formatItemCount(invoice.additionalItems.length)})`}
              </h2>
              <span className="text-lg font-semibold">
                {formatCurrencyWithCommas(invoice.additionalItemsTotal)}
              </span>
            </div>
            <div className="mb-4 border-t border-gray-300" />
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <ScrollableTable>
                <table className="w-full min-w-[620px] text-xs sm:min-w-0 sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-100">
                      <th className="w-16 p-2 text-left sm:p-3">Index</th>
                      <th className="p-2 text-left sm:p-3">Item Description</th>
                      <th className="p-2 text-left sm:p-3">Unit Price (Rs.)</th>
                      <th className="w-20 p-2 text-left sm:p-3">QTY</th>
                      <th className="p-2 text-left sm:p-3">Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.additionalItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        <td className="p-2 text-left sm:p-3">{`${index + 1}.`}</td>
                        <td className="p-2 text-left sm:p-3">{item.name}</td>
                        <td className="p-2 text-left sm:p-3">
                          {formatCurrencyWithCommas(item.unitPrice)}
                        </td>
                        <td className="p-2 text-left sm:p-3">
                          {formatQuantity(item.quantity, item.unit)}
                        </td>
                        <td className="p-2 text-left sm:p-3">
                          {formatCurrencyWithCommas(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollableTable>
            </div>
          </div>
        )}

        <div>
          {(() => {
            const finalGrandTotal = (() => {
              let total = 0;
              if (
                invoice.familyPackItems &&
                invoice.familyPackItems.length > 0
              ) {
                total += parseCurrency(invoice.familyPackTotal);
              }
              if (
                invoice.additionalItems &&
                invoice.additionalItems.length > 0
              ) {
                total += parseCurrency(invoice.additionalItemsTotal);
              }
              if (!invoice.deliveryMethod?.toLowerCase().includes("pickup")) {
                total += parseCurrency(invoice.deliveryFee);
              }
              total -= parseCurrency(invoice.discount);
              total -= parseCurrency(invoice.couponDiscount);
              return Math.max(total, 0);
            })();

            const { rows: paymentStatusRows, showDeliveryNote } =
              getPaymentStatusInfo(invoice, finalGrandTotal);

            return (
              <>
                <h2 className="text-sm font-semibold sm:text-base">
                  Grand Total for all items
                </h2>
                <div className="mb-3 mt-3 border-t border-gray-300" />
                <ScrollableTable>
                  <table className="w-full min-w-[400px] text-xs sm:min-w-0 sm:text-sm">
                    <tbody>
                      {invoice.familyPackItems &&
                        invoice.familyPackItems.length > 0 && (
                          <tr>
                            <td className="p-2 text-[#212121]">
                              Total Price for Packages
                            </td>
                            <td className="p-2 text-right text-[#212121]">
                              {formatCurrencyWithCommas(
                                invoice.familyPackTotal,
                              )}
                            </td>
                          </tr>
                        )}
                      {invoice.additionalItems &&
                        invoice.additionalItems.length > 0 && (
                          <tr>
                            <td className="p-2 text-[#212121]">
                              {buyerType === "Wholesale"
                                ? "Selected Items"
                                : "Additional Items"}
                            </td>
                            <td className="p-2 text-right text-[#212121]">
                              {formatCurrencyWithCommas(
                                invoice.additionalItemsTotal,
                              )}
                            </td>
                          </tr>
                        )}
                      {!invoice.deliveryMethod
                        ?.toLowerCase()
                        .includes("pickup") &&
                        parseCurrency(invoice.deliveryFee) > 0 && (
                          <tr>
                            <td className="p-2 text-[#212121]">
                              Delivery Charges
                            </td>
                            <td className="p-2 text-right text-[#212121]">
                              {formatCurrencyWithCommas(invoice.deliveryFee)}
                            </td>
                          </tr>
                        )}
                      {parseCurrency(invoice.discount) > 0 && (
                        <tr>
                          <td className="p-2 text-[#212121]">Discount</td>
                          <td className="p-2 text-right text-[#212121]">
                            {formatCurrencyWithCommas(invoice.discount)}
                          </td>
                        </tr>
                      )}
                      {parseCurrency(invoice.couponDiscount) > 0 && (
                        <tr>
                          <td className="p-2 text-[#212121]">
                            Coupon Discount
                          </td>
                          <td className="p-2 text-right text-[#212121]">
                            {formatCurrencyWithCommas(invoice.couponDiscount)}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t border-black font-bold">
                        <td className="p-2">Grand Total</td>
                        <td className="p-2 text-right">
                          {formatCurrencyWithCommas(finalGrandTotal)}
                        </td>
                      </tr>

                      {paymentStatusRows.map((row, idx) => (
                        <tr key={idx}>
                          <td
                            className={`p-2 font-bold ${
                              row.status === "paid"
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {row.label}
                          </td>
                          <td
                            className={`p-2 text-right font-bold ${
                              row.status === "paid"
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {formatCurrencyWithCommas(row.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollableTable>

                {showDeliveryNote && (
                  <p className="mt-1 flex items-center gap-1 text-xs leading-4 text-gray-500">
                    <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-800 text-[9px] text-white">
                      i
                    </span>
                    The delivery charges might be different on the day of
                    delivery. Your Grand Total might be changed then.
                  </p>
                )}
              </>
            );
          })()}
        </div>

        <div className="text-xs sm:text-sm">
          <p className="mb-2 font-bold">Remarks:</p>
          <p className="mb-2">
            Kindly inspect all goods at the time of delivery to ensure accuracy
            and condition.
          </p>
          <p className="mb-2">
            Polygon does not accept returns under any circumstances.
          </p>
          <p className="mb-2">
            Please report any issues or discrepancies within 24 hours of
            delivery to ensure prompt attention.
          </p>
          <p className="mb-2">
            For any assistance, feel free to contact our customer service team.
          </p>
          <p className="mt-6 text-center font-semibold italic sm:mt-9">
            Thank you for shopping with us!
          </p>
          <p className="mt-3 text-center italic">
            WE WILL SEND YOU MORE OFFERS, LOWEST PRICED VEGGIES FROM US
          </p>
          <p className="mt-6 text-center text-xs italic text-gray-400 sm:mt-10">
            -THIS IS A COMPUTER GENERATED INVOICE, THUS NO SIGNATURE REQUIRED-
          </p>
        </div>
      </div>
    </div>
  );
}

function InvoicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useSelector((state: RootState) => state.auth.token);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pdfMakeLoaded, setPdfMakeLoaded] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const buyerType = user?.buyerType || "Retail";
  const orderId = searchParams.get("orderId");

  const parseCurrency = (value: string): string => {
    if (value === "Rs. NaN" || !value) return "Rs. 0.00";
    return value.startsWith("Rs. ") ? value : `Rs. ${value || "0.00"}`;
  };

  // Load pdfmake, vfs_fonts scripts, and logo image
  useEffect(() => {
    if (typeof window === "undefined") return; // Skip on server

    const loadScripts = async () => {
      try {
        // Check if pdfMake is already loaded
        if (window.pdfMake) {
          setPdfMakeLoaded(true);
        } else {
          const loadScript = (
            src: string,
            isCritical: boolean,
          ): Promise<void> =>
            new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = src;
              script.async = true;
              script.onload = () => {
                resolve();
              };
              script.onerror = () => {
                console.error(
                  `Failed to load ${src} at 01:20 PM +0530, July 08, 2025`,
                );
                if (isCritical) reject(new Error(`Failed to load ${src}`));
                else resolve();
              };
              document.body.appendChild(script);
            });

          await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js",
            true,
          );
          await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js",
            false,
          );
          setPdfMakeLoaded(true);
        }

        // Load logo image as base64 - FIXED: Use HTMLImageElement explicitly
        const img = new (window as any).Image() as HTMLImageElement;

        img.src = `${window.location.origin}/glogo.png`;
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL("image/png");
            setLogoBase64(base64);
            setImageLoaded(true);
          }
        };
        img.onerror = () => {
          console.error(
            "Failed to load logo image at 01:20 PM +0530, July 08, 2025",
          );
          setImageLoaded(true); // Proceed even if image fails
        };
      } catch (error) {
        console.error(
          "Error loading scripts at 01:20 PM +0530, July 08, 2025:",
          error,
        );
        alert("Failed to load PDF library. Please try again later.");
        setLoading(false);
      }
    };

    loadScripts();
  }, []);

  const generatePDF = (invoice: InvoiceData, buyerType: string) => {
    const parseNum = (value: string): number => {
      if (typeof value === "number") return value;
      if (!value) return 0;
      const cleaned = value.replace(/Rs\.?\s?/, "").replace(/,/g, "");
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const creditForType =
      parseNum(String(invoice.creditPaid ?? "")) > 0
        ? parseNum(String(invoice.creditPaid ?? ""))
        : null;
    const cashForType =
      parseNum(String(invoice.moneyPaid ?? "")) > 0
        ? parseNum(String(invoice.moneyPaid ?? ""))
        : null;
    const paymentTypeLabel =
      detectPaymentType(
        invoice.paymentMethod,
        invoice.deliveryMethod,
        creditForType,
        cashForType,
      ) || "N/A";

    // Add this new function for formatting currency with commas in PDF
    const formatCurrencyForPDF = (value: string | number): string => {
      const numValue = typeof value === "string" ? parseNum(value) : value;
      return `Rs. ${numValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr: string): string => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString("en-US", {
        timeZone: "Asia/Colombo",
        dateStyle: "medium",
      });
    };

    // Family Pack Sections - only include if familyPackItems exist
    const familyPackSections =
      invoice.familyPackItems && invoice.familyPackItems.length > 0
        ? invoice.familyPackItems
            .map((pack) => [
              {
                columns: [
                  {
                    text: `${pack.name} (${formatItemCount(pack.packageDetails?.reduce((sum, detail) => sum + (detail.qty || 0), 0) || 0)})`,
                    bold: true,
                    fontSize: 9,
                    margin: [0, 8, 0, 4],
                  },
                  {
                    text: formatCurrencyForPDF(pack.amount),
                    bold: true,
                    fontSize: 9,
                    alignment: "right",
                    margin: [0, 8, 0, 4],
                  },
                ],
              },
              {
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: 0,
                    x2: 545,
                    y2: 0,
                    lineWidth: 0.5,
                    lineColor: "#D7D7D7",
                  },
                ],
                margin: [0, 4, 0, 4],
              },
              {
                table: {
                  widths: ["10%", "70%", "20%"],
                  body: [
                    [
                      {
                        text: "Index",
                        style: "tableHeader",
                        fillColor: "#F8F8F8",
                      },
                      {
                        text: "Item Description",
                        style: "tableHeader",
                        fillColor: "#F8F8F8",
                      },
                      {
                        text: "QTY",
                        style: "tableHeader",
                        fillColor: "#F8F8F8",
                      },
                    ],
                    ...(pack.packageDetails?.map((detail, i) => [
                      `${i + 1}.`,
                      detail.typeName,
                      detail.qty,
                    ]) || []),
                  ],
                },
                margin: [0, 4, 0, 4],
                layout: {
                  fillColor: (row: number) => (row === 0 ? "#F8F8F8" : null),
                  hLineWidth: (i: number, node: any) => {
                    return i === 0 || i === node.table.body.length ? 0.5 : 0;
                  },
                  vLineWidth: (i: number, node: any) => {
                    return i === 0 || i === node.table.widths.length ? 0.5 : 0;
                  },
                  hLineColor: () => "#D1D5DB",
                  vLineColor: () => "#D1D5DB",
                  paddingLeft: () => 6,
                  paddingRight: () => 6,
                  paddingTop: () => 8,
                  paddingBottom: () => 8,
                },
              },
            ])
            .flat()
        : [];

    // Additional Items Section - only include if additionalItems exist
    const additionalItemsSection =
      invoice.additionalItems && invoice.additionalItems.length > 0
        ? [
            {
              columns: [
                {
                  text: `${buyerType === "Wholesale" ? "Selected Items" : "Additional Items"} (${formatItemCount(invoice.additionalItems.length)})`,
                  bold: true,
                  fontSize: 9,
                  margin: [0, 8, 0, 4],
                },
                {
                  text: formatCurrencyForPDF(invoice.additionalItemsTotal),
                  bold: true,
                  fontSize: 9,
                  alignment: "right",
                  margin: [0, 8, 0, 4],
                },
              ],
            },
            {
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: 0,
                  x2: 545,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: "#D7D7D7",
                },
              ],
              margin: [0, 4, 0, 4],
            },
            {
              table: {
                widths: ["10%", "40%", "20%", "15%", "15%"],
                body: [
                  [
                    {
                      text: "Index",
                      style: "tableHeader",
                      fillColor: "#F3F4F6",
                    },
                    {
                      text: "Item Description",
                      style: "tableHeader",
                      fillColor: "#F3F4F6",
                    },
                    {
                      text: "Unit Price (Rs.)",
                      style: "tableHeader",
                      fillColor: "#F3F4F6",
                    },
                    { text: "QTY", style: "tableHeader", fillColor: "#F3F4F6" },
                    {
                      text: "Amount (Rs.)",
                      style: "tableHeader",
                      fillColor: "#F3F4F6",
                    },
                  ],
                  ...invoice.additionalItems.map((it, i) => [
                    `${i + 1}.`,
                    it.name,
                    formatCurrencyForPDF(it.unitPrice), // Updated to use comma formatting
                    formatQuantity(it.quantity, it.unit),
                    formatCurrencyForPDF(it.amount), // Updated to use comma formatting
                  ]),
                ],
              },
              margin: [0, 4, 0, 4],
              layout: {
                fillColor: (row: number) => (row === 0 ? "#F8F8F8" : null),
                hLineWidth: (i: number, node: any) => {
                  return i === 0 || i === node.table.body.length ? 0.5 : 0;
                },
                vLineWidth: (i: number, node: any) => {
                  return i === 0 || i === node.table.widths.length ? 0.5 : 0;
                },
                hLineColor: () => "#D1D5DB",
                vLineColor: () => "#D1D5DB",
                paddingLeft: () => 6,
                paddingRight: () => 6,
                paddingTop: () => 8,
                paddingBottom: () => 8,
              },
            },
          ]
        : [];

    const grandTotalRows = [];

    // Calculate subtotal
    let subtotal = 0;
    if (invoice.familyPackItems && invoice.familyPackItems.length > 0) {
      subtotal += parseNum(invoice.familyPackTotal);
      grandTotalRows.push([
        { text: "Total Price for Packages", fontSize: 9, color: "#212121" },
        {
          text: formatCurrencyForPDF(invoice.familyPackTotal),
          fontSize: 9,
          alignment: "right",
          color: "#212121",
        },
      ]);
    }

    if (invoice.additionalItems && invoice.additionalItems.length > 0) {
      subtotal += parseNum(invoice.additionalItemsTotal);
      grandTotalRows.push([
        {
          text:
            buyerType === "Wholesale" ? "Selected Items" : "Additional Items",
          fontSize: 9,
          color: "#212121",
        },
        {
          text: formatCurrencyForPDF(invoice.additionalItemsTotal),
          fontSize: 9,
          alignment: "right",
          color: "#212121",
        },
      ]);
    }

    // Add delivery fee if not pickup — label changed to "Delivery Charges"
    if (
      !invoice.deliveryMethod?.toLowerCase().includes("pickup") &&
      parseNum(invoice.deliveryFee) > 0
    ) {
      subtotal += parseNum(invoice.deliveryFee);
      grandTotalRows.push([
        { text: "Delivery Charges", fontSize: 9, color: "#212121" },
        {
          text: formatCurrencyForPDF(invoice.deliveryFee),
          fontSize: 9,
          alignment: "right",
          color: "#212121",
        },
      ]);
    }

    // Subtract discounts
    if (parseNum(invoice.discount) > 0) {
      subtotal -= parseNum(invoice.discount);
      grandTotalRows.push([
        { text: "Discount", fontSize: 9, color: "#212121" },
        {
          text: formatCurrencyForPDF(invoice.discount),
          fontSize: 9,
          alignment: "right",
          color: "#212121",
        },
      ]);
    }

    if (parseNum(invoice.couponDiscount) > 0) {
      subtotal -= parseNum(invoice.couponDiscount);
      grandTotalRows.push([
        { text: "Coupon Discount", fontSize: 9, color: "#212121" },
        {
          text: formatCurrencyForPDF(invoice.couponDiscount),
          fontSize: 9,
          alignment: "right",
          color: "#212121",
        },
      ]);
    }

    const finalTotal = Math.max(subtotal, 0);
    grandTotalRows.push([
      { text: "Grand Total", bold: true, fontSize: 9, color: "#000000" },
      {
        text: formatCurrencyForPDF(finalTotal),
        bold: true,
        fontSize: 10,
        alignment: "right",
        color: "#000000",
      },
    ]);

    const grandTotalLineIndex = grandTotalRows.length - 1;

    const { rows: paymentStatusRows, showDeliveryNote } = getPaymentStatusInfo(
      invoice,
      finalTotal,
    );

    const paymentStatusStartIndex = grandTotalRows.length;

    paymentStatusRows.forEach((row) => {
      const color = row.status === "paid" ? "#16A34A" : "#D97706";
      grandTotalRows.push([
        { text: row.label, bold: true, fontSize: 9, color },
        {
          text: formatCurrencyForPDF(row.amount),
          bold: true,
          fontSize: 9,
          alignment: "right",
          color,
        },
      ]);
    });

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [24, 32, 24, 32],
      content: [
        // INVOICE Title
        {
          text: "INVOICE",
          fontSize: 14,
          bold: true,
          color: "#3E206D",
          alignment: "center",
          margin: [0, 0, 0, 16],
        },

        // Company Info and Logo
        {
          columns: [
            [
              {
                text: "Polygon Holdings (Private) Ltd",
                bold: true,
                fontSize: 11,
              },
              {
                text: "No. 42/46, Nawam Mawatha, Colombo 02",
                fontSize: 9,
                margin: [0, 1, 0, 0],
              },
              {
                text: "Contact No: +94 770 111 999",
                fontSize: 9,
                margin: [0, 1, 0, 0],
              },
              {
                text: "Email Address : info@polygon.lk",
                fontSize: 9,
                margin: [0, 1, 0, 0],
              },
            ],
            [
              {
                image: "logo",
                width: 80,
                alignment: "left",
                margin: [60, 0, 0, 0],
              },
            ],
          ],
          columnGap: 24,
          margin: [0, 0, 0, 8],
        },

        // Two-column Info
        ...(() => {
          const isPickupTbl = invoice.deliveryMethod
            ?.toLowerCase()
            .includes("pickup");

          const grey = "#929292";
          const labeled = (label: string, value: string) => ({
            text: [
              { text: `${label} : `, fontSize: 9, color: grey },
              { text: value, fontSize: 9 },
            ],
          });

          const leftRows: any[] = [];
          leftRows.push({ text: "Bill To:", bold: true, fontSize: 9 });

          leftRows.push({
            text: [
              `${invoice.billingInfo.title}. ${invoice.billingInfo.fullName}\n`,
              `Mobile: ${invoice.billingInfo.phone}\n`,
              `Email: ${invoice.billingInfo.email}`,
            ],
            fontSize: 9,
          });

          if (!isPickupTbl) {
            if (invoice.billingInfo.buildingType === "House") {
              leftRows.push({
                text: "House Address:",
                bold: true,
                fontSize: 9,
                margin: [0, 6, 0, 0],
              });
              leftRows.push(
                labeled("House No", `${invoice.billingInfo.houseNo},`),
              );
              leftRows.push(
                labeled("Street Name", `${invoice.billingInfo.street},`),
              );
              leftRows.push(labeled("City", invoice.billingInfo.city));
            } else if (invoice.billingInfo.buildingType === "Apartment") {
              leftRows.push({
                text: "Apartment Address:",
                bold: true,
                fontSize: 9,
                margin: [0, 6, 0, 0],
              });
              leftRows.push(
                labeled("No", `${invoice.billingInfo.buildingNo || "N/A"},`),
              );
              leftRows.push(
                labeled(
                  "Name",
                  `${invoice.billingInfo.apartmentName || "N/A"},`,
                ),
              );
              leftRows.push(
                labeled("Flat", `${invoice.billingInfo.flatNo || "N/A"},`),
              );
              leftRows.push(
                labeled("Floor", `${invoice.billingInfo.floorNo || "N/A"},`),
              );
              leftRows.push(
                labeled("House No", `${invoice.billingInfo.houseNo},`),
              );
              leftRows.push(
                labeled("Street Name", `${invoice.billingInfo.street},`),
              );
              leftRows.push(labeled("City", invoice.billingInfo.city));
            } else {
              leftRows.push({
                text: `No. ${invoice.billingInfo.houseNo}`,
                fontSize: 9,
              });
              leftRows.push({ text: invoice.billingInfo.street, fontSize: 9 });
              leftRows.push({ text: invoice.billingInfo.city, fontSize: 9 });
            }
          }

          const leftAnchor1 = leftRows.length;

          leftRows.push({
            text: "Invoice No:",
            bold: true,
            fontSize: 9,
            margin: [0, 12, 0, 2],
          });

          leftRows.push({
            text: invoice.invoiceNumber,
            fontSize: 9,
          });

          leftRows.push({
            text: "Delivery Method:",
            bold: true,
            fontSize: 9,
            margin: [0, 8, 0, 2],
          });

          leftRows.push({
            text: isPickupTbl ? "Instore Pickup" : "Home Delivery",
            fontSize: 9,
          });

          if (isPickupTbl && invoice.pickupInfo) {
            leftRows.push({
              text: `Centre: ${invoice.pickupInfo.centerName}`,
              bold: true,
              fontSize: 9,
            });
            leftRows.push({
              text: `${invoice.pickupInfo.address.city}, ${invoice.pickupInfo.address.district}`,
              fontSize: 9,
            });
            leftRows.push({
              text: `${invoice.pickupInfo.address.province}, ${invoice.pickupInfo.address.country}`,
              fontSize: 9,
            });
          }

          const rightRows: any[] = [];
          rightRows.push({ text: "Grand Total:", bold: true, fontSize: 9 });
          rightRows.push({
            text: formatCurrencyForPDF(invoice.grandTotal),
            bold: true,
            fontSize: 11,
          });
          rightRows.push({
            text: "Payment Method:",
            bold: true,
            fontSize: 9,
            margin: [0, 10, 0, 0],
          });
          rightRows.push({ text: paymentTypeLabel, fontSize: 9 });

          const rightAnchor1 = rightRows.length;

          const pad = leftAnchor1 - rightAnchor1;
          if (pad > 0) {
            for (let i = 0; i < pad; i++) rightRows.push({ text: "" });
          } else if (pad < 0) {
            for (let i = 0; i < Math.abs(pad); i++)
              leftRows.splice(leftAnchor1, 0, { text: "" });
          }

          rightRows.push({
            text: "Ordered Date:",
            bold: true,
            fontSize: 9,
            margin: [0, 12, 0, 2],
          });

          rightRows.push({
            text: formatDate(invoice.invoiceDate),
            fontSize: 9,
          });

          rightRows.push({
            text: "Scheduled Date:",
            bold: true,
            fontSize: 9,
            margin: [0, 6, 0, 2],
          });

          rightRows.push({
            text: formatDate(invoice.scheduledDate),
            fontSize: 9,
          });

          const rowCount = Math.max(leftRows.length, rightRows.length);
          const body: any[] = [];
          for (let i = 0; i < rowCount; i++) {
            body.push([
              leftRows[i] || { text: "" },
              rightRows[i] || { text: "" },
            ]);
          }

          return [
            {
              table: {
                widths: ["60%", "40%"],
                body,
              },
              layout: {
                hLineWidth: () => 0,
                vLineWidth: () => 0,
                paddingLeft: (i: number) => (i === 1 ? 16 : 0),
                paddingRight: () => 0,
                paddingTop: () => 2,
                paddingBottom: () => 2,
              },
              margin: [0, 0, 0, 18],
            },
          ];
        })(),

        // Family Pack Sections - conditional
        ...familyPackSections,

        // Additional Items Section - conditional
        ...additionalItemsSection,

        // Grand Total Table
        {
          text: "Grand Total for all items",
          bold: true,
          fontSize: 9,
          margin: [0, 12, 0, 4],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 545,
              y2: 0,
              lineWidth: 0.5,
              lineColor: "#D7D7D7",
            },
          ],
          margin: [0, 4, 0, 4],
        },
        {
          table: {
            widths: ["80%", "20%"],
            body: grandTotalRows,
          },
          layout: {
            hLineWidth: function (i: number, node: any) {
              return i === grandTotalLineIndex ? 2 : 0;
            },
            vLineWidth: function () {
              return 0;
            },
            hLineColor: function (i: number, node: any) {
              return i === grandTotalLineIndex ? "black" : "white";
            },
            paddingLeft: function () {
              return 6;
            },
            paddingRight: function () {
              return 6;
            },
            paddingTop: function (i: number) {
              return i === paymentStatusStartIndex ? 12 : 4;
            },
            paddingBottom: function () {
              return 4;
            },
          },
          margin: [0, 0, 0, 12],
        },

        ...(showDeliveryNote
          ? [
              {
                columns: [
                  {
                    width: 10,
                    svg: `<svg width="10" height="10" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="6" fill="#1a1a1a"/>
            <text x="6" y="8.7" font-size="8" font-family="Helvetica" 
                  fill="white" text-anchor="middle">i</text>
          </svg>`,
                  },
                  {
                    width: "*",
                    text: "The delivery charges might be different on the day of delivery. Your Grand Total might be changed then.",
                    fontSize: 8,
                    color: "#000000",
                    italics: true,
                  },
                ],
                columnGap: 3,
                margin: [0, -4, 0, 10],
              },
            ]
          : []),

        // Remarks
        {
          text: [
            { text: "Remarks:\n", bold: true, fontSize: 9 },
            {
              text: "Kindly inspect all goods at the time of delivery to ensure accuracy and condition.\n",
              fontSize: 9,
            },
            {
              text: "Polygon does not accept returns under any circumstances.\n",
              fontSize: 9,
            },
            {
              text: "Please report any issues or discrepancies within 24 hours of delivery to ensure prompt attention.\n",
              fontSize: 9,
            },
            {
              text: "For any assistance, feel free to contact our customer service team.",
              fontSize: 9,
            },
          ],
          lineHeight: 1.5,
          margin: [0, 6, 0, 6],
        },

        // Footer
        {
          text: "Thank you for shopping with us!",
          italics: true,
          bold: true,
          alignment: "center",
          fontSize: 9,
          lineHeight: 1.5,
          margin: [0, 10, 0, 2],
        },
        {
          text: "WE WILL SEND YOU MORE OFFERS, LOWEST PRICED VEGGIES FROM US",
          italics: true,
          alignment: "center",
          fontSize: 9,
          lineHeight: 1.5,
        },
        {
          text: "-THIS IS A COMPUTER GENERATED INVOICE, THUS NO SIGNATURE REQUIRED-",
          italics: true,
          alignment: "center",
          color: "gray",
          fontSize: 8,
          margin: [0, 8, 0, 0],
        },
        {
          text: `-GENERATED AT: ${new Date().toLocaleString("en-US", {
            timeZone: "Asia/Colombo",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}, ${new Date()
            .toLocaleString("en-US", {
              timeZone: "Asia/Colombo",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            .toUpperCase()}-`,
          italics: true,
          alignment: "center",
          color: "gray",
          fontSize: 8,
        },
      ].filter((item) => item !== null),

      images: { logo: logoBase64 || "" },
      defaultStyle: { font: "Roboto", fontSize: 9 },
      styles: {
        tableHeader: { bold: true, fontSize: 9 },
      },
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  const fetchInvoice = async (orderId: string): Promise<void> => {
    if (!token) {
      console.error("No token available");
      setSelectedInvoice(null);
      setLoading(false);
      return;
    }

    try {
      setSelectedInvoice(null);

      const data = await getInvoice(token, orderId);

      // FIXED: Handle the nested structure - data.invoice.invoice
      if (data.status && data.invoice && data.invoice.invoice) {
        const apiInvoice = data.invoice.invoice; // Access the nested invoice object

        const invoiceData: InvoiceData = {
          invoiceNumber: apiInvoice.invoiceNumber || "N/A",
          invoiceDate: apiInvoice.invoiceDate || "N/A",
          scheduledDate: apiInvoice.scheduledDate || "N/A",
          deliveryMethod: apiInvoice.deliveryMethod || "N/A",
          paymentMethod: apiInvoice.paymentMethod || "N/A",
          isPaid: apiInvoice.isPaid,
          creditPaid: apiInvoice.creditPaid,
          moneyPaid: apiInvoice.moneyPaid,
          amountDue: parseCurrency(apiInvoice.amountDue),

          familyPackItems: Array.isArray(apiInvoice.familyPackItems)
            ? apiInvoice.familyPackItems.map((item: any) => ({
                id: item.id ?? 0,
                name: item.name || "Unknown",
                unitPrice: parseCurrency(item.unitPrice),
                quantity: item.quantity || "1",
                unit: item.unit || "units",
                amount: parseCurrency(item.amount),
                packageDetails: Array.isArray(item.packageDetails)
                  ? item.packageDetails.map((detail: any) => ({
                      packageId: detail.packageId,
                      productTypeId: detail.productTypeId,
                      typeName: detail.typeName,
                      qty: detail.qty,
                    }))
                  : [],
              }))
            : [],

          additionalItems: Array.isArray(apiInvoice.additionalItems)
            ? apiInvoice.additionalItems.map((item: any) => ({
                id: item.id ?? 0,
                name: item.name || "Unknown",
                unitPrice: parseCurrency(item.unitPrice),
                quantity: item.quantity || "1",
                unit: item.unit || "units",
                amount: parseCurrency(item.amount),
                image: item.image || undefined,
              }))
            : [],

          familyPackTotal: parseCurrency(apiInvoice.familyPackTotal),
          additionalItemsTotal: parseCurrency(apiInvoice.additionalItemsTotal),
          deliveryFee: parseCurrency(apiInvoice.deliveryFee),
          discount: parseCurrency(apiInvoice.discount),
          couponDiscount: parseCurrency(apiInvoice.couponDiscount),
          grandTotal: parseCurrency(apiInvoice.grandTotal),

          billingInfo: {
            title: apiInvoice.billingInfo?.title || "N/A",
            fullName: apiInvoice.billingInfo?.fullName || "N/A",
            email: apiInvoice.billingInfo?.email || "N/A",
            buildingType: apiInvoice.billingInfo?.buildingType || "N/A",
            houseNo: apiInvoice.billingInfo?.houseNo || "N/A",
            street: apiInvoice.billingInfo?.street || "N/A",
            city: apiInvoice.billingInfo?.city || "N/A",
            phone: apiInvoice.billingInfo?.phone || "N/A",
            buildingNo: apiInvoice.billingInfo?.buildingNo || undefined,
            apartmentName: apiInvoice.billingInfo?.buildingName || undefined,
            flatNo: apiInvoice.billingInfo?.flatNo || undefined,
            floorNo: apiInvoice.billingInfo?.floorNo || undefined,
          },

          pickupInfo: apiInvoice.pickupInfo
            ? {
                centerId: apiInvoice.pickupInfo.centerId ?? undefined,
                centerName: apiInvoice.pickupInfo.centerName || "N/A",
                contact01: apiInvoice.pickupInfo.contact01 || "N/A",
                address: {
                  street: apiInvoice.pickupInfo.address?.street || "N/A",
                  city: apiInvoice.pickupInfo.address?.city || "N/A",
                  district: apiInvoice.pickupInfo.address?.district || "N/A",
                  province: apiInvoice.pickupInfo.address?.province || "N/A",
                  country: apiInvoice.pickupInfo.address?.country || "N/A",
                  zipCode: apiInvoice.pickupInfo.address?.zipCode || "N/A",
                },
              }
            : undefined,
        };

        setSelectedInvoice(invoiceData);

        // Generate PDF automatically
        if (imageLoaded && pdfMakeLoaded) {
          setTimeout(() => {
            if (invoiceData) {
              generatePDF(invoiceData, buyerType);
            } else {
              console.error("No invoice data available for PDF generation");
              alert("Failed to generate PDF. Invoice data not available.");
            }
          }, 500);
        }
      } else {
        console.error("Invalid invoice data received:", data);
        setSelectedInvoice(null);
        alert("Invalid invoice data received. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setSelectedInvoice(null);
      alert("Failed to fetch invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    if (orderId) {
      fetchInvoice(orderId);
    } else {
      setLoading(false);
      alert("No order ID provided.");
    }
  }, [token, imageLoaded, pdfMakeLoaded]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 p-6">
        {loading || !imageLoaded || !pdfMakeLoaded ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center text-[rgb(75,85,99)]">
            <Loader isVisible={true} />
          </div>
        ) : (
          <InvoiceView
            invoice={selectedInvoice}
            onClose={() => router.push("/history/order")}
            invoiceRef={invoiceRef as any}
          />
        )}
      </main>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading invoice data...</div>}
    >
      <InvoicePageContent />
    </Suspense>
  );
}
