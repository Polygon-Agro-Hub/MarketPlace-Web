"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { formatMoney, type OrderSummaryData } from "./UpdatedOrderSummary";

export interface OrderDeliveryAddress {
  buildingType: "House" | "Apartment";
  buildingNo?: string;
  buildingName?: string;
  unitNo?: string;
  floorNo?: string;
  houseNo?: string;
  streetName?: string;
  city?: string;
}

export interface OrderPickupCenter {
  name: string;
  city?: string;
  district?: string;
  province?: string;
}

export interface OrderPackageDetail {
  id: string;
  name: string;
  price: number;
  items: { name: string; qty: number }[];
}

export interface OrderAdditionalItem {
  id: string;
  name: string;
  image: string | null;
  qty: number;
  unit: string;
  amount: number;
}

export interface OrderDetailsData {
  invoiceNumber: string;
  statusLabel: string;
  placedDate: string;
  scheduledDate: string;
  scheduledTime: string;
  receiver: { name: string; phones: string[] };
  address?: OrderDeliveryAddress; // delivery orders
  pickupCenter?: OrderPickupCenter; // pickup orders
  packages: OrderPackageDetail[];
  additionalItems: OrderAdditionalItem[];
  itemsSaved: number;
}

interface ViewOrderComponentProps {
  open: boolean;
  onClose: () => void;
  details: OrderDetailsData;
  summary: OrderSummaryData; 
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const getStatusClass = (status: string): string => {
  switch ((status || "").toLowerCase()) {
    case "ordered":
      return "bg-[#F5FF85] text-[#878216]";
    case "processing":
      return "bg-[#CFE1FF] text-[#3B82F6]";
    case "out for delivery":
      return "bg-[#FCD4FF] text-[#80118A]";
    case "collected":
      return "bg-[#F8FEA5] text-[#7E8700]";
    case "ready to pickup":
      return "bg-[#ACFBFF] text-[#00818A]";
    case "picked up":
      return "bg-[#BBFFC6] text-[#308233]";
    case "on the way":
      return "bg-[#FFEDCF] text-[#D17A00]";
    case "delivered":
      return "bg-[#BBFFC6] text-[#308233]";
    case "hold":
      return "bg-[#FFEDCF] text-[#D17A00]";
    case "return":
    case "return received":
      return "bg-[#FFDCDA] text-[#FF1100]";
    case "one time":
      return "bg-[#DBEAFE] text-[#2563EB]";
    case "cancelled":
      return "bg-[#F2F2F2] text-[#454545]";
    default:
      return "bg-[#F3F4F6] text-[#4B5563]";
  }
};

const MetaField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <p className="whitespace-nowrap text-[13px] text-gray-400">{label} :</p>
    <p className="mt-1 whitespace-nowrap text-[13px] font-semibold text-gray-900">
      {value}
    </p>
  </div>
);

const LineList: React.FC<{ lines: [string, string | undefined][] }> = ({
  lines,
}) => {
  const filled = lines.filter(([, value]) => value);
  return (
    <div className="mt-1.5 space-y-1 text-[13px] text-gray-400">
      {filled.map(([label, value], i) => (
        <p key={label}>
          {label} :{" "}
          <span className="text-gray-800">
            {value}
            {i < filled.length - 1 ? "," : ""}
          </span>
        </p>
      ))}
    </div>
  );
};

const PriceRow: React.FC<{
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
}> = ({ label, value, bold, green }) => (
  <div
    className={`flex items-center justify-between text-[13px] ${
      green ? "text-green-600" : "text-gray-900"
    } ${bold ? "font-semibold" : ""}`}
  >
    <span className={green || bold ? "" : "text-gray-700"}>{label}</span>
    <span>{value}</span>
  </div>
);

const ViewOrderComponent: React.FC<ViewOrderComponentProps> = ({
  open,
  onClose,
  details,
  summary,
}) => {
  const [mounted, setMounted] = useState(open);
  const [show, setShow] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(id);
    }
    setShow(false);
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, onClose]);

  useEffect(() => {
    if (show) closeRef.current?.focus();
  }, [show]);

  if (!mounted) return null;

  const isDelivery = summary.fulfillmentType === "delivery";
  const subTotal = (summary.packagesTotal ?? 0) + (summary.alaCarteTotal ?? 0);
  const creditApplied = summary.creditApplied ?? 0;
  const amountToPay = Math.max(summary.total - creditApplied, 0);
  const payBy = ["COD", "COP", "CASH_CREDIT"].includes(summary.paymentType)
    ? "Cash"
    : "Card";
  const { address, pickupCenter } = details;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          show ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-order-title"
        className={`absolute right-0 top-0 h-full w-full max-w-[600px] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close order details"
              className="rounded-full p-1 text-gray-800 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3E206D]"
            >
              <ArrowRight className="h-6 w-6 cursor-pointer" />
            </button>
            <h2
              id="view-order-title"
              className="truncate text-lg font-bold text-gray-900"
            >
              Order ID : #{details.invoiceNumber}
            </h2>
          </div>
          <span
            className={`shrink-0 rounded-full px-6 py-2 text-sm font-medium ${getStatusClass(
              details.statusLabel,
            )}`}
          >
            {details.statusLabel}
          </span>
        </div>

        <div className="border-t border-gray-100 px-6 pb-10">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 py-5 sm:grid-cols-4">
            <MetaField label="Order Placed" value={details.placedDate} />
            <MetaField label="Scheduled Date" value={details.scheduledDate} />
            <MetaField label="Scheduled Time" value={details.scheduledTime} />
            <MetaField
              label="Delivery / Pickup"
              value={isDelivery ? "Home Delivery" : "Pickup"}
            />
          </div>

          {/* Delivery information */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-base font-bold text-gray-900">
              Delivery Information
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-6">
              <div>
                {isDelivery && address && (
                  <>
                    <p className="text-[13px] text-gray-400">Address :</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {address.buildingType}
                    </p>
                    <LineList
                      lines={
                        address.buildingType === "Apartment"
                          ? [
                              ["No", address.buildingNo],
                              ["Name", address.buildingName],
                              ["Flat", address.unitNo],
                              ["Floor", address.floorNo],
                              ["House No", address.houseNo],
                              ["Street Name", address.streetName],
                              ["City", address.city],
                            ]
                          : [
                              ["House No", address.houseNo],
                              ["Street Name", address.streetName],
                              ["City", address.city],
                            ]
                      }
                    />
                  </>
                )}

                {!isDelivery && pickupCenter && (
                  <>
                    <p className="text-[13px] text-gray-400">Centre :</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {pickupCenter.name}
                    </p>
                    <LineList
                      lines={[
                        ["City", pickupCenter.city],
                        ["District", pickupCenter.district],
                        ["Province", pickupCenter.province],
                      ]}
                    />
                  </>
                )}
              </div>

              <div>
                <p className="text-[13px] text-gray-400">
                  Receiving Person Information :
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {details.receiver.name}
                </p>
                <p className="mt-1.5 text-[13px] text-gray-800">
                  {details.receiver.phones.join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Ordered items */}
          <section className="mt-6 overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between bg-slate-50 px-5 py-3.5 text-[13px]">
              <span className="text-gray-800">Ordered Items</span>
              <span className="font-bold text-[#3E206D]">
                Total Price : {formatMoney(subTotal)}
              </span>
            </div>

            {details.packages.map((pkg) => (
              <div key={pkg.id} className="border-t border-gray-200">
                <div className="flex items-center justify-between px-5 py-3.5 text-[13px]">
                  <span className="text-gray-900">
                    {pkg.name} ({pad2(pkg.items.length)} Items)
                  </span>
                  <span className="font-bold text-[#3E206D]">
                    {formatMoney(pkg.price)}
                  </span>
                </div>
                <ul className="space-y-5 border-t border-gray-200 px-5 py-4 text-[13px] text-gray-700">
                  {pkg.items.map((item) => (
                    <li key={item.name} className="flex">
                      <span className="w-44 shrink-0">{item.name}</span>
                      <span>{pad2(item.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {details.additionalItems.length > 0 && (
              <div className="border-t border-gray-200">
                <div className="flex items-center justify-between gap-2 px-5 py-3.5 text-[13px]">
                  <span className="text-gray-900">
                    Additional Items ({pad2(details.additionalItems.length)}{" "}
                    Items)
                  </span>
                  <span className="flex items-center gap-3 text-right">
                    {details.itemsSaved > 0 && (
                      <span className="text-[11px] text-gray-500">
                        You have saved {formatMoney(details.itemsSaved)} with
                        us!
                      </span>
                    )}
                    <span className="font-bold text-[#3E206D]">
                      {formatMoney(summary.alaCarteTotal ?? 0)}
                    </span>
                  </span>
                </div>

                <ul className="border-t border-gray-200">
                  {details.additionalItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-6 px-5 py-5 text-[13px] text-gray-700"
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 shrink-0 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg font-semibold text-gray-500">
                          {item.name.charAt(0)}
                        </span>
                      )}
                      <span className="w-24 shrink-0 truncate">
                        {item.name}
                      </span>
                      <span className="w-20 shrink-0">
                        {item.qty}
                        {item.unit}
                      </span>
                      <span className="whitespace-nowrap">
                        {formatMoney(item.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Payment summary */}
          <section className="mt-5 overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between bg-slate-50 px-5 py-3.5 text-[13px]">
              <span className="text-gray-800">Payment Summary</span>
              <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                Up-to-date price
              </span>
            </div>

            <div className="space-y-4 border-t border-gray-200 px-5 py-5">
              {summary.packagesTotal !== undefined && (
                <PriceRow
                  label="Package(s)"
                  value={formatMoney(summary.packagesTotal)}
                />
              )}
              {summary.alaCarteTotal !== undefined && (
                <PriceRow
                  label="À la carte"
                  value={formatMoney(summary.alaCarteTotal)}
                />
              )}

              <div className="border-t border-gray-200 pt-4">
                <PriceRow
                  label="Sub Total"
                  value={formatMoney(subTotal)}
                  bold
                />
              </div>

              {summary.discount !== undefined && (
                <PriceRow
                  label="Discount"
                  value={`- ${formatMoney(summary.discount)}`}
                  green
                />
              )}
              {summary.couponDiscount !== undefined && (
                <PriceRow
                  label="Coupon Discount"
                  value={`- ${formatMoney(summary.couponDiscount)}`}
                  green
                />
              )}
              {isDelivery && summary.deliveryFee !== undefined && (
                <PriceRow
                  label={
                    summary.couponApplied
                      ? "Delivery Fee (Coupon Applied)"
                      : "Delivery Fee"
                  }
                  value={`+ ${formatMoney(summary.deliveryFee)}`}
                />
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-5">
                <span className="text-base font-bold text-gray-900">
                  Grand Total
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatMoney(summary.total)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <PriceRow
                  label="Paid Using Credit Balance"
                  value={formatMoney(creditApplied)}
                />
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-5">
                <span className="text-base font-bold text-gray-900">
                  Amount to Pay in {payBy}
                </span>
                <span className="text-xl font-bold text-[#3E206D]">
                  {formatMoney(amountToPay)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};

export default ViewOrderComponent;
