"use client";

// app/history/post-invoice/page.tsx
// Usage: /history/post-invoice?orderId=<processOrderId>&invoiceNo=<optional>&status=<optional>
// The PDF is downloaded automatically once the invoice has loaded.

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import NextImage from "next/image";
import { RootState } from "@/store";
import Loader from "@/components/loader-spinner/Loader";
import Logo from "../../../../public/POLYGON LOGO26.png";
import { getPostInvoice } from "@/services/retail-order-service";
import {
  PostInvoiceData,
  buildSummary,
  formatDate,
  generatePostInvoicePDF,
  getAdditionalItemsLabel,
  getPackPricing,
  isPickupMethod,
  mapPostInvoiceResponse,
  parseNum,
  rs,
} from "@/utils/post-invoice";

const GREY = { color: "#929292" };

function InvoiceView({
  invoice,
  onClose,
}: {
  invoice: PostInvoiceData;
  onClose: () => void;
}) {
  const summary = buildSummary(invoice);
  const isPickup = isPickupMethod(invoice.deliveryMethod);
  const b = invoice.billingInfo;
  const phone = `${b.phonecode1 || ""} ${b.phone1 || ""}`.trim();
  const name = `${b.title ? `${b.title}. ` : ""}${b.fullName || ""}`.trim();

  const addressLines: Array<[string, string]> =
    invoice.buildingType === "Apartment"
      ? [
          ["No", b.buildingNo || "N/A"],
          ["Name", b.buildingName || "N/A"],
          ["Flat", b.unitNo || "N/A"],
          ["Floor", b.floorNo || "N/A"],
          ["Plot No", b.houseNo || "N/A"],
          ["Street Name", b.street || "N/A"],
          ["City", b.city || "N/A"],
        ]
      : [
          ["Plot No", b.houseNo || "N/A"],
          ["Street Name", b.street || "N/A"],
          ["City", b.city || "N/A"],
        ];

  const additionalTotal = invoice.additionalItems.reduce(
    (t, i) => t + parseFloat(i.normalPrice || "0"),
    0,
  );

  const rowGrid =
    "mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10";

  return (
    <div className="mx-auto w-full max-w-[794px] bg-white p-4 sm:p-6 lg:p-8">
      {/* Title */}
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

      {/* Company + logo */}
      <div className={rowGrid}>
        <div>
          <p className="text-base font-semibold sm:text-lg">
            Polygon Holdings (Private) Limited
          </p>
          <div className="text-xs sm:text-sm">
            <p>Level 2, Building 2, No. 46/42, Nawam Mawatha, Colombo 02.</p>
            <p>Contact No: 011 431 3433</p>
            <p>Email Address: info@polygon.lk</p>
          </div>
        </div>
        <div className="flex justify-start lg:pl-12">
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

      <div className="text-xs sm:text-sm">
        {/* Bill to + grand total */}
        <div className={rowGrid}>
          <div>
            <p className="font-bold">Bill To:</p>
            <p>{name || "N/A"}</p>
            {phone && <p>Mobile: {phone}</p>}
            {b.userEmail && <p className="break-all">Email: {b.userEmail}</p>}
          </div>
          <div className="lg:pl-12">
            <p className="font-bold">Grand Total:</p>
            <p className="text-lg font-extrabold sm:text-xl">
              {rs(invoice.grandTotal)}
            </p>
          </div>
        </div>

        {/* Address + payment method */}
        <div className={rowGrid}>
          <div className="space-y-1">
            {!isPickup && (
              <>
                <p className="font-bold">Address:</p>
                {addressLines.map(([label, value], i) => (
                  <p key={label}>
                    <span style={GREY}>{label} :</span> {value}
                    {i < addressLines.length - 1 ? "," : ""}
                  </p>
                ))}
              </>
            )}
          </div>
          <div className="lg:pl-12">
            <p className="font-bold">Payment Method:</p>
            <p>{summary.paymentTypeLabel}</p>
          </div>
        </div>

        {/* Invoice no + ordered date */}
        <div className={rowGrid}>
          <div>
            <p className="font-bold">Invoice No:</p>
            <p>{invoice.invoiceNumber}</p>
          </div>
          <div className="lg:pl-12">
            <p className="font-bold">Ordered Date:</p>
            <p>{formatDate(invoice.invoiceDate)}</p>
          </div>
        </div>

        {/* Delivery method + scheduled date */}
        <div className={rowGrid}>
          <div>
            <p className="font-bold">Delivery Method:</p>
            <p>{isPickup ? "Instore Pickup" : "Delivery"}</p>
          </div>
          <div className="lg:pl-12">
            <p className="font-bold">Scheduled Date:</p>
            <p>{formatDate(invoice.scheduledDate)}</p>
          </div>
        </div>

        {/* Pickup centre */}
        {isPickup && invoice.pickupInfo && (
          <div className="mb-4 space-y-1">
            <p>
              <span className="font-bold">Centre :</span>{" "}
              <span className="font-bold">{invoice.pickupInfo.centerName}</span>
            </p>
            {invoice.pickupInfo.address.city && (
              <p>
                <span style={GREY}>City :</span>{" "}
                {invoice.pickupInfo.address.city}
              </p>
            )}
            {invoice.pickupInfo.address.district && (
              <p>
                <span style={GREY}>District :</span>{" "}
                {invoice.pickupInfo.address.district}
              </p>
            )}
            {invoice.pickupInfo.address.province && (
              <p>
                <span style={GREY}>Province :</span>{" "}
                {invoice.pickupInfo.address.province}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {/* Family packs */}
        {invoice.familyPackItems.map((pack, pi) => {
          const { packPrice, calculatedTotal, strike, fees } =
            getPackPricing(pack);
          const count = String(pack.packageDetails?.length || 0).padStart(
            2,
            "0",
          );

          return (
            <div key={`${pack.id}-${pi}`}>
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold sm:text-base">
                  {`${pack.name || "N/A"} (${count} Items)`}
                </h2>
                <span className="text-lg font-semibold">
                  {strike && (
                    <span className="mr-2 text-sm font-normal line-through">
                      {rs(calculatedTotal)}
                    </span>
                  )}
                  {rs(packPrice)}
                </span>
              </div>
              <div className="mb-3 border-t border-gray-300" />

              <div className="overflow-hidden rounded-xl border border-gray-300">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-xs sm:min-w-0 sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-300 bg-[#F8F8F8]">
                        <th className="w-14 p-2 text-left sm:p-3">Index</th>
                        <th className="p-2 text-left sm:p-3">Category</th>
                        <th className="p-2 text-left sm:p-3">
                          Item Description
                        </th>
                        <th className="p-2 text-left sm:p-3">QTY (Kg)</th>
                        <th className="p-2 text-left sm:p-3">Amount (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pack.packageDetails || []).length > 0 ? (
                        pack.packageDetails.map((d: any, i: number) => (
                          <tr key={i}>
                            <td className="p-2 sm:p-3">{`${i + 1}.`}</td>
                            <td className="p-2 text-[#676767] sm:p-3">
                              {d.typeName || "N/A"}
                            </td>
                            <td className="p-2 sm:p-3">
                              {d.productName || "N/A"}
                            </td>
                            <td className="p-2 sm:p-3">
                              {Number(d.qty) || 0}&nbsp;Kg
                            </td>
                            <td className="p-2 sm:p-3">{rs(d.price || 0)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-3 text-center text-gray-600"
                          >
                            No package details available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {fees.length > 0 && (
                  <div className="mx-3 mb-3 mt-1 border-t border-gray-200 pt-3">
                    <div className="flex rounded-xl bg-[#F2F6FE] p-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold">Additional Charges</p>
                        <p className="text-[11px]">
                          Service Fee &amp; Packing Fee*
                        </p>
                      </div>
                      <div className="border-l border-[#8097C7] pl-4">
                        {fees.map((f) => (
                          <div
                            key={f.label}
                            className="flex min-w-[200px] justify-between gap-6 text-xs"
                          >
                            <span>{f.label}</span>
                            <span>{rs(f.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Additional items */}
        {invoice.additionalItems.length > 0 && (
          <div>
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold sm:text-base">
                {`${getAdditionalItemsLabel(invoice)} (${String(
                  invoice.additionalItems.length,
                ).padStart(2, "0")} ${
                  invoice.additionalItems.length === 1 ? "Item" : "Items"
                })`}
              </h2>
              <span className="text-lg font-semibold">
                {rs(additionalTotal)}
              </span>
            </div>
            <div className="mb-3 border-t border-gray-300" />
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-xs sm:min-w-0 sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-100">
                      <th className="w-14 p-2 text-left sm:p-3">Index</th>
                      <th className="p-2 text-left sm:p-3">Item Description</th>
                      <th className="p-2 text-left sm:p-3">Unit Price (Rs.)</th>
                      <th className="p-2 text-left sm:p-3">QTY</th>
                      <th className="p-2 text-left sm:p-3">Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.additionalItems.map((it, i) => {
                      const rawQty = parseFloat(it.quantity || "1") || 1;
                      const quantity = it.quantity === "0.00" ? 1 : rawQty;
                      const amount = parseNum(it.normalPrice);
                      const isGrams =
                        String(it.unit || "").trim().toLowerCase() === "g";
                      const unitPrice =
                        amount / (isGrams ? quantity / 1000 : quantity);
                      return (
                        <tr key={it.id ?? i}>
                          <td className="p-2 sm:p-3">{`${i + 1}.`}</td>
                          <td className="p-2 sm:p-3">{it.name || "N/A"}</td>
                          <td className="p-2 sm:p-3">{rs(unitPrice)}</td>
                          <td className="p-2 sm:p-3">
                            {`${quantity} ${it.unit || ""}`.trim()}
                          </td>
                          <td className="p-2 sm:p-3">{rs(amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Grand total summary */}
        <div>
          <h2 className="text-sm font-semibold sm:text-base">
            Grand Total for all items
          </h2>
          <div className="mb-3 mt-3 border-t border-gray-300" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-xs sm:min-w-0 sm:text-sm">
              <tbody>
                {summary.rows.map((row, i) => {
                  if (row.type === "note") {
                    return (
                      <tr key={i}>
                        <td
                          colSpan={2}
                          className="px-2 pb-2 pt-0 text-[11px] text-[#0B55DD]"
                        >
                          <span className="mr-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0B55DD] text-[9px] text-white">
                            i
                          </span>
                          {row.text}
                        </td>
                      </tr>
                    );
                  }
                  if (row.type === "total") {
                    return (
                      <tr key={i} className="border-t border-black font-bold">
                        <td className="p-2">{row.label}</td>
                        <td className="p-2 text-right">{rs(row.amount)}</td>
                      </tr>
                    );
                  }
                  if (row.type === "payment") {
                    const cls =
                      row.color === "green"
                        ? "text-green-600"
                        : "text-amber-600";
                    return (
                      <tr key={i}>
                        <td className={`p-2 font-bold ${cls}`}>{row.label}</td>
                        <td className={`p-2 text-right font-bold ${cls}`}>
                          {rs(row.amount)}
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={i}>
                      <td className="p-2 text-[#212121]">{row.label}</td>
                      <td className="p-2 text-right text-[#212121]">
                        {rs(row.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {summary.showDeliveryNote && (
            <p className="mt-1 flex items-center gap-1 text-xs leading-4 text-gray-500">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-800 text-[9px] text-white">
                i
              </span>
              The delivery charges might be different on the day of delivery.
              Your Grand Total might be changed then.
            </p>
          )}
        </div>

        {/* Remarks + footer */}
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

function PostInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useSelector((state: RootState) => state.auth.token);

  const [invoice, setInvoice] = useState<PostInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoDownloaded = useRef(false);

  const processOrderId = searchParams.get("orderId");
  const invoiceNo = searchParams.get("invoiceNo") || undefined;
  const status = searchParams.get("status") || undefined;

  useEffect(() => {
    if (!processOrderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await getPostInvoice(token, processOrderId);
        const mapped = mapPostInvoiceResponse(response, invoiceNo, status);
        if (cancelled) return;
        setInvoice(mapped);
        setLoading(false);

        // Auto-download the PDF once (guards against React strict-mode double run)
        if (!autoDownloaded.current) {
          autoDownloaded.current = true;
          try {
            await generatePostInvoicePDF(mapped);
          } catch (e) {
            console.error("PDF generation failed:", e);
            alert("Failed to generate invoice. Please try again.");
          }
        }
      } catch (e: any) {
        console.error("Error fetching post invoice:", e);
        if (!cancelled) {
          setError(e?.message || "Failed to fetch invoice.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, processOrderId]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 p-6">
        {loading ? (
          <div className="flex h-[70vh] flex-col items-center justify-center text-center text-[rgb(75,85,99)]">
            <Loader isVisible={true} />
          </div>
        ) : error || !invoice ? (
          <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center text-[rgb(75,85,99)]">
            <p>{error || "Invoice not found."}</p>
            <button
              onClick={() => router.back()}
              className="rounded-md bg-[rgb(62,32,109)] px-4 py-2 text-sm text-white"
            >
              Go back
            </button>
          </div>
        ) : (
          <InvoiceView invoice={invoice} onClose={() => router.back()} />
        )}
      </main>
    </div>
  );
}

export default function PostInvoicePage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading invoice data...</div>}
    >
      <PostInvoiceContent />
    </Suspense>
  );
}