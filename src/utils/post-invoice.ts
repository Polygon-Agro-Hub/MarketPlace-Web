import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface PostInvoiceData {
  invoiceNumber: string;
  orderApp: string;
  deliveryMethod: string;
  invoiceDate: string;
  scheduledDate: string;
  paymentMethod: string;
  status?: string;
  grandTotal: string;
  isPaid?: number | null;
  isCoupon?: number | null;
  couponType?: string | null;
  hasFreeDeliveryCoupon?: boolean;
  creditPaid?: string | number | null;
  moneyPaid?: string | number | null;
  familyPackItems: any[];
  additionalItems: any[];
  buildingType: string;
  billingInfo: {
    title: string;
    fullName: string;
    houseNo: string;
    street: string;
    city: string;
    phonecode1: string;
    phone1: string;
    userEmail: string;
    buildingNo?: string;
    buildingName?: string;
    unitNo?: string;
    floorNo?: string;
    couponValue: string;
  };
  pickupInfo?: {
    centerName: string;
    address: {
      city: string;
      district: string;
      province: string;
      country: string;
    };
  };
  familyPackTotal: string;
  additionalItemsTotal: string;
  deliveryFee: string;
  discount: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const parseNum = (value: string | number | null | undefined): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = value
    .toString()
    .replace(/Rs\.?\s?/, "")
    .replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const fmt = (value: string | number | null | undefined): string => {
  const num = parseNum(value);
  return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
};

export const rs = (value: string | number | null | undefined): string =>
  `Rs. ${fmt(value)}`;

export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
  });
};

export const isPickupMethod = (m?: string) => m?.toLowerCase() === "pickup";

export function detectPaymentType(
  payType: string,
  deliveryMethod: string,
  creditPaid: number,
  grandTotal: number,
): string {
  const isPickup = deliveryMethod?.toLowerCase().includes("pickup");
  const hasCredit = creditPaid > 0;
  const fullyCoveredByCredit = hasCredit && creditPaid >= grandTotal - 0.01;

  if (fullyCoveredByCredit) return "Polygon Wallet";

  const normalized = String(payType || "").trim().toLowerCase();
  if (
    normalized.includes("card") ||
    normalized.includes("credit") ||
    normalized.includes("online")
  ) {
    return hasCredit ? "Online Transfer + Polygon Wallet" : "Online Transfer";
  }

  const base = isPickup ? "Cash on Pickup" : "Cash on Delivery";
  return hasCredit ? `${base} + Polygon Wallet` : base;
}

/* ------------------------------------------------------------------ */
/* API response -> PostInvoiceData                                     */
/* ------------------------------------------------------------------ */

export function mapPostInvoiceResponse(
  response: any,
  tableInvoiceNo?: string,
  orderStatus?: string,
): PostInvoiceData {
  const invoiceDetails = response.data?.invoice || {};
  const billingDetails = response.data?.billing || {};
  const familyPacks = response.data?.items?.familyPacks || [];
  const additionalItems = response.data?.items?.additionalItems || [];
  const pickupCenter = response.data?.pickupCenter || null;
  const deliveryCharge = response.data?.invoice?.deliveryFee || "0.00";

  const finalInvoiceNo =
    tableInvoiceNo || invoiceDetails.invoiceNumber || "N/A";
  if (!finalInvoiceNo || finalInvoiceNo === "N/A") {
    throw new Error("Could not determine invoice number");
  }

  const hasFreeDeliveryCoupon =
    Number(invoiceDetails.isCoupon) === 1 &&
    String(invoiceDetails.couponType || "")
      .trim()
      .toLowerCase()
      .includes("free delivery");

  // Delivery fee
  let deliveryFee = "0.00";
  if (invoiceDetails.deliveryMethod === "Pickup") {
    deliveryFee = "0.00";
  } else {
    const effectiveStatus = String(
      orderStatus || invoiceDetails.orderStatus || invoiceDetails.status || "",
    ).trim();
    const currentDeliveryCharge = invoiceDetails.currentDeliveryCharge;

    if (
      String(invoiceDetails.deliveryMethod).trim().toLowerCase() ===
        "delivery" &&
      effectiveStatus.toLowerCase() === "delivered" &&
      currentDeliveryCharge !== null &&
      currentDeliveryCharge !== undefined &&
      String(currentDeliveryCharge).trim() !== ""
    ) {
      deliveryFee = String(currentDeliveryCharge);
    } else {
      deliveryFee = deliveryCharge || "0.00";
    }
  }

  const familyPackTotal = familyPacks.reduce(
    (s: number, p: any) => s + parseFloat(p.amount || "0"),
    0,
  );
  const additionalItemsTotal = additionalItems.reduce(
    (s: number, i: any) => s + parseFloat(i.amount || "0"),
    0,
  );

  return {
    invoiceNumber: finalInvoiceNo,
    orderApp: invoiceDetails.orderApp || "N/A",
    deliveryMethod: invoiceDetails.deliveryMethod || "N/A",
    invoiceDate: invoiceDetails.invoiceDate || "N/A",
    scheduledDate: invoiceDetails.scheduledDate || "N/A",
    paymentMethod: invoiceDetails.paymentMethod || "N/A",
    status:
      orderStatus ||
      invoiceDetails.status ||
      invoiceDetails.orderStatus ||
      response.data?.status ||
      "",
    grandTotal: invoiceDetails.grandTotal || "0.00",
    isPaid: invoiceDetails.isPaid,
    isCoupon: invoiceDetails.isCoupon,
    couponType: invoiceDetails.couponType,
    hasFreeDeliveryCoupon,
    creditPaid: invoiceDetails.creditPaid,
    moneyPaid: invoiceDetails.moneyPaid,
    buildingType: invoiceDetails.buildingType || "House",
    familyPackItems: familyPacks,
    additionalItems,
    deliveryFee,
    discount: invoiceDetails.orderDiscount || "0.00",
    billingInfo: {
      title: billingDetails.title || invoiceDetails.title || "",
      fullName: billingDetails.fullName || invoiceDetails.fullName || "N/A",
      houseNo: billingDetails.houseNo || invoiceDetails.houseNo || "N/A",
      street: billingDetails.street || invoiceDetails.streetName || "N/A",
      city: billingDetails.city || invoiceDetails.city || "N/A",
      phonecode1:
        billingDetails.phoneCode1 || invoiceDetails.phonecode1 || "N/A",
      phone1: billingDetails.phone1 || invoiceDetails.phone1 || "N/A",
      userEmail: invoiceDetails.userEmail || "N/A",
      buildingNo: invoiceDetails.buildingNo || "",
      buildingName: invoiceDetails.buildingName || "",
      unitNo: invoiceDetails.unitNo || "",
      floorNo: invoiceDetails.floorNo || "",
      couponValue: billingDetails.couponValue || "0.00",
    },
    pickupInfo: pickupCenter
      ? {
          centerName: pickupCenter.centerName || "N/A",
          address: {
            city: pickupCenter.city || "",
            district: pickupCenter.district || "",
            province: pickupCenter.province || "",
            country: pickupCenter.country || "",
          },
        }
      : undefined,
    familyPackTotal: familyPackTotal.toFixed(2),
    additionalItemsTotal: additionalItemsTotal.toFixed(2),
  };
}

/* ------------------------------------------------------------------ */
/* Pricing / summary logic (shared by the web view and the PDF)        */
/* ------------------------------------------------------------------ */

export function getPackPricing(pack: any) {
  const reviewValue = parseNum(pack.reviewValue);
  const itemsTotal =
    pack.packageDetails?.reduce(
      (sum: number, d: any) => sum + parseNum(d.price),
      0,
    ) || 0;
  const serviceFee = parseNum(pack.serviceFee);
  const packingFee = parseNum(pack.packingFee);
  const calculatedTotal = itemsTotal + serviceFee + packingFee;
  const packPrice = reviewValue !== 0 ? calculatedTotal : parseNum(pack.amount);
  const strike =
    reviewValue === 0 && Math.abs(calculatedTotal - packPrice) > 0.01;

  const fees: Array<{ label: string; amount: number }> = [];
  if (serviceFee > 0) fees.push({ label: "Service Fee", amount: serviceFee });
  if (packingFee > 0) fees.push({ label: "Packing Fee", amount: packingFee });

  return { reviewValue, packPrice, calculatedTotal, strike, fees };
}

export function getAdditionalItemsLabel(invoice: PostInvoiceData): string {
  const hasPacks = invoice.familyPackItems?.length > 0;
  if (invoice.orderApp === "Marketplace")
    return hasPacks ? "Additional Items" : "Your Selected Items";
  if (invoice.orderApp === "Dash")
    return hasPacks ? "Additional Items" : "Custom Items";
  return "Custom Items";
}

export type SummaryRow =
  | { type: "line"; label: string; amount: number }
  | { type: "note"; text: string }
  | { type: "total"; label: string; amount: number }
  | {
      type: "payment";
      label: string;
      amount: number;
      color: "green" | "orange";
    };

export interface InvoiceSummary {
  rows: SummaryRow[];
  totalIndex: number;
  finalGrandTotal: number;
  paymentTypeLabel: string;
  showDeliveryNote: boolean;
}

export function buildSummary(invoice: PostInvoiceData): InvoiceSummary {
  const rows: SummaryRow[] = [];

  const creditPaidNum = parseNum(invoice.creditPaid as any);
  const finalGrandTotal = parseNum(invoice.grandTotal);

  const paymentTypeLabel =
    detectPaymentType(
      invoice.paymentMethod,
      invoice.deliveryMethod,
      creditPaidNum,
      finalGrandTotal,
    ) || "N/A";

  // Each package individually
  for (const pack of invoice.familyPackItems || []) {
    const { reviewValue, packPrice } = getPackPricing(pack);
    rows.push({
      type: "line",
      label: pack.name || "Package",
      amount: packPrice,
    });

    if (reviewValue > 0) {
      rows.push({
        type: "note",
        text: `An additional Rs. ${fmt(reviewValue)} has been charged for package modifications requested by the customer during the review process.`,
      });
    } else if (reviewValue < 0) {
      rows.push({
        type: "note",
        text: `An amount of Rs. ${fmt(Math.abs(reviewValue))} has been deducted due to package modifications made by the customer during the review process.`,
      });
    }
  }

  const hasAdditional = invoice.additionalItems?.length > 0;
  const hasPacks = invoice.familyPackItems?.length > 0;

  if (hasAdditional) {
    const total = invoice.additionalItems.reduce(
      (t, i) => t + parseFloat(i.normalPrice || "0"),
      0,
    );
    rows.push({
      type: "line",
      label: getAdditionalItemsLabel(invoice),
      amount: total,
    });
  }

  const isPickup = isPickupMethod(invoice.deliveryMethod);
  const deliveryFeeValue = parseNum(invoice.deliveryFee);
  if (!isPickup && deliveryFeeValue > 0) {
    rows.push({ type: "line", label: "Delivery Fee", amount: deliveryFeeValue });
  }

  const discountValue = parseNum(invoice.discount);
  if (discountValue > 0) {
    rows.push({ type: "line", label: "Discount", amount: discountValue });
  }

  // Service fee for non-Marketplace, custom-items-only orders
  const svrFee =
    parseNum(invoice.grandTotal) -
    (invoice.additionalItems || []).reduce(
      (t, i) => t + parseFloat(i.amount || "0"),
      0,
    ) -
    parseNum(invoice.deliveryFee);

  if (invoice.orderApp !== "Marketplace" && hasAdditional && !hasPacks) {
    rows.push({ type: "line", label: "Service Fee", amount: svrFee });
  }

  const couponValue = parseNum(invoice.billingInfo.couponValue);
  if (couponValue > 0) {
    rows.push({ type: "line", label: "Coupon Discount", amount: couponValue });
  }

  const totalIndex = rows.length;
  rows.push({ type: "total", label: "Grand Total", amount: finalGrandTotal });

  // Payment rows
  const normalizedPaymentMethod = String(invoice.paymentMethod || "")
    .trim()
    .toLowerCase();
  const isCardPayment =
    normalizedPaymentMethod.includes("card") ||
    normalizedPaymentMethod.includes("credit") ||
    paymentTypeLabel.includes("Online Transfer");
  const hasCreditPaid =
    invoice.creditPaid !== null &&
    invoice.creditPaid !== undefined &&
    creditPaidNum > 0;
  const remainingAfterCredit = finalGrandTotal - creditPaidNum;

  const rawStatus =
    (invoice as any).status ??
    (invoice as any).orderStatus ??
    (invoice as any).deliveryStatus ??
    "";
  const isDelivered = String(rawStatus).trim().toLowerCase() === "delivered";
  const isFreeDeliveryCouponApplied = !!invoice.hasFreeDeliveryCoupon;
  const cashLabel = isPickup ? "Cash On Pickup" : "Cash On Delivery";

  let showDeliveryNote = false;

  const pushPayment = (
    label: string,
    amount: number,
    color: "green" | "orange",
  ) => rows.push({ type: "payment", label, amount, color });

  const pushCash = (amount: number) => {
    pushPayment(cashLabel, amount, "orange");
    if (!isPickup && !isDelivered && !isFreeDeliveryCouponApplied) {
      showDeliveryNote = true;
    }
  };

  if (hasCreditPaid) {
    pushPayment("Polygon Wallet Used", creditPaidNum, "green");
    if (remainingAfterCredit > 0.01) {
      if (isCardPayment)
        pushPayment("Online Transferred Amount", remainingAfterCredit, "green");
      else pushCash(remainingAfterCredit);
    }
  } else if (isCardPayment) {
    pushPayment("Online Transferred Amount", finalGrandTotal, "green");
  } else {
    pushCash(finalGrandTotal);
  }

  return { rows, totalIndex, finalGrandTotal, paymentTypeLabel, showDeliveryNote };
}

/* ------------------------------------------------------------------ */
/* Logo loader (browser only)                                          */
/* ------------------------------------------------------------------ */

async function getLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch(encodeURI("/POLYGON LOGO26.png"));
    const blob = await res.blob();

    const original: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });

    const img = new Image();
    img.src = original;
    await img.decode();

    const maxW = 780;
    const maxH = 240;
    if (img.width <= maxW && img.height <= maxH) return original;

    const scale = Math.min(maxW / img.width, maxH / img.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("Could not load logo:", e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* PDF                                                                 */
/* ------------------------------------------------------------------ */

export async function generatePostInvoicePDF(
  invoice: PostInvoiceData,
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const at = (opts: any) => autoTable(doc, opts);
  const lastY = () => (doc as any).lastAutoTable.finalY as number;
  const summary = buildSummary(invoice);
  const isPickup = isPickupMethod(invoice.deliveryMethod);

  doc.setTextColor(0, 0, 0);
  doc.setProperties({
    title: `Invoice ${invoice.invoiceNumber || "N/A"}`,
    subject: "Invoice",
    author: "Polygon Holdings",
    keywords: "invoice, receipt",
    creator: "Polygon Holdings",
  });

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(62, 32, 109);
  doc.text("INVOICE", 105, 15, { align: "center" });
  doc.setTextColor(0, 0, 0);

  // Logo
  const logo = await getLogoDataUrl();
  if (logo) {
    try {
      doc.addImage(logo, "PNG", 140, 20, 56, 25);
    } catch (e) {
      console.warn("Could not add logo:", e);
    }
  }

  // Company info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Polygon Holdings (Private) Limited", 15, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Level 2, Building 2, No. 46/42, Nawam Mawatha, Colombo 02.", 15, 30);
  doc.text("Contact No: 011 431 3433", 15, 35);
  doc.text("Email Address: info@polygon.lk", 15, 40);

  // Bill To
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 15, 55);
  doc.setFont("helvetica", "normal");

  const b = invoice.billingInfo;
  const billingName = `${b.title ? `${b.title}. ` : ""}${b.fullName || ""}`.trim();
  doc.text(billingName || "N/A", 15, 60);

  let y = 65;

  const phoneNumber = `${b.phonecode1 || ""} ${b.phone1 || ""}`.trim();
  if (phoneNumber) {
    doc.text(`Mobile: ${phoneNumber}`, 15, y);
    y += 5;
  }
  if (b.userEmail) {
    doc.text(`Email: ${b.userEmail}`.trim(), 15, y);
    y += 5;
  }

  const rightYStart = 55;
  let paymentMethodLabelY: number;
  let paymentMethodValueY: number;

  const drawLabelValue = (line: string) => {
    const colonIndex = line.indexOf(":");
    const label = line.substring(0, colonIndex + 1);
    const value = line.substring(colonIndex + 1);
    doc.setTextColor(146, 146, 146);
    doc.text(label, 15, y);
    const w = doc.getTextWidth(label);
    doc.setTextColor(0, 0, 0);
    doc.text(value, 15 + w, y);
    y += 5;
  };

  if (!isPickup) {
    y += 3;
    paymentMethodLabelY = y;
    paymentMethodValueY = y + 5;

    doc.setFont("helvetica", "bold");
    doc.text("Address:", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");

    const lines =
      invoice.buildingType === "Apartment"
        ? [
            `No : ${b.buildingNo || "N/A"},`,
            `Name : ${b.buildingName || "N/A"},`,
            `Flat : ${b.unitNo || "N/A"},`,
            `Floor : ${b.floorNo || "N/A"},`,
            `Plot No : ${b.houseNo || "N/A"},`,
            `Street Name : ${b.street || "N/A"},`,
            `City : ${b.city || "N/A"}`,
          ]
        : [
            `Plot No : ${b.houseNo || "N/A"},`,
            `Street Name : ${b.street || "N/A"},`,
            `City : ${b.city || "N/A"}`,
          ];
    lines.forEach(drawLabelValue);
    y += 5;
  } else {
    paymentMethodLabelY = rightYStart + 15;
    paymentMethodValueY = rightYStart + 20;
    y += 15;
  }

  y += 3;

  // Invoice No
  const invoiceNoY = y;
  doc.setFont("helvetica", "bold");
  doc.text("Invoice No:", 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber || "N/A", 15, y + 5);
  y += 13;

  // Delivery Method
  const deliveryMethodY = y;
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Method:", 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(isPickup ? "Instore Pickup" : "Delivery", 15, y + 5);
  y += 10;

  if (isPickup && invoice.pickupInfo) {
    y += 5;
    doc.setFont("helvetica", "bold");
    const pickupLabel = "Centre :";
    doc.text(pickupLabel, 15, y);
    const spaceWidth = 2;
    doc.text(
      invoice.pickupInfo.centerName || "",
      15 + doc.getTextWidth(pickupLabel) + spaceWidth,
      y,
    );

    let addressY = y + 5;
    const addr = invoice.pickupInfo.address;
    const addressLines: Array<{ label: string; value: string }> = [];
    if (addr?.city) addressLines.push({ label: "City :", value: addr.city });
    if (addr?.district)
      addressLines.push({ label: "District :", value: addr.district });
    if (addr?.province)
      addressLines.push({ label: "Province :", value: addr.province });

    addressLines.forEach(({ label, value }) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(146, 146, 146);
      doc.text(label, 15, addressY);
      const w = doc.getTextWidth(label);
      doc.setTextColor(0, 0, 0);
      doc.text(value, 15 + w + spaceWidth, addressY);
      addressY += 5;
    });
    doc.setTextColor(0, 0, 0);
    y = addressY + 10;
  }

  y += 10;

  // Right column
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total:", 140, rightYStart);
  doc.setFontSize(11);
  doc.text(rs(invoice.grandTotal), 140, rightYStart + 5);
  doc.setFontSize(9);

  doc.setFont("helvetica", "bold");
  doc.text("Payment Method:", 140, paymentMethodLabelY);
  doc.setFont("helvetica", "normal");
  doc.text(summary.paymentTypeLabel, 140, paymentMethodValueY);

  doc.setFont("helvetica", "bold");
  doc.text("Ordered Date:", 140, invoiceNoY);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(invoice.invoiceDate), 140, invoiceNoY + 5);

  doc.setFont("helvetica", "bold");
  doc.text("Scheduled Date:", 140, deliveryMethodY);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(invoice.scheduledDate), 140, deliveryMethodY + 5);

  /* ---------------- Family packs ---------------- */
  for (const pack of invoice.familyPackItems || []) {
    const estimatedPackHeight = 15 + (pack.packageDetails?.length || 0) * 8;
    if (y + estimatedPackHeight > 250) {
      doc.addPage();
      y = 20;
    }

    const count = String(pack.packageDetails?.length || 0).padStart(2, "0");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${pack.name || "N/A"} (${count} Items)`, 15, y);

    const { packPrice, calculatedTotal, strike, fees } = getPackPricing(pack);

    const packPriceText = rs(packPrice);
    doc.setFont("helvetica", "bold");
    doc.text(packPriceText, 195, y, { align: "right" });
    const packPriceWidth = doc.getTextWidth(packPriceText);

    if (strike) {
      const oldText = rs(calculatedTotal);
      const oldRightX = 195 - packPriceWidth - 3;
      doc.setFont("helvetica", "normal");
      doc.text(oldText, oldRightX, y, { align: "right" });
      const oldWidth = doc.getTextWidth(oldText);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(oldRightX - oldWidth, y - 1.1, oldRightX, y - 1.1);
      doc.setFont("helvetica", "bold");
    }
    y += 5;

    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 5;

    const headCell = (content: string) => ({
      content,
      styles: { fillColor: [248, 248, 248], fontStyle: "bold" },
    });

    const body = (pack.packageDetails || []).map((d: any, i: number) => [
      `${i + 1}.`,
      d.typeName || "N/A",
      d.productName || "N/A",
      `${Number(d.qty) || 0}\u00A0Kg`,
      rs(d.price || 0),
    ]);

    const TABLE_X = 15;
    const TABLE_W = 180;
    const tableTopY = y;

    at({
      startY: y,
      head: [
        [
          headCell("Index"),
          headCell("Category"),
          headCell("Item Description"),
          headCell("QTY (Kg)"),
          headCell("Amount (Rs.)"),
        ],
      ],
      body,
      margin: { left: TABLE_X, right: 15 },
      styles: {
        fontSize: 9,
        cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
        textColor: [0, 0, 0],
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [248, 248, 248],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      bodyStyles: { textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 16, halign: "left" },
        1: { cellWidth: 40, overflow: "linebreak" },
        2: { cellWidth: 50, overflow: "linebreak" },
        3: { cellWidth: 30, overflow: "visible", halign: "left" },
        4: { cellWidth: 44, halign: "left" },
      },
      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 1) {
          data.cell.styles.textColor = [103, 103, 103];
        }
      },
      didDrawCell: (data: any) => {
        if (data.section === "head") {
          doc.setDrawColor(215, 215, 215);
          doc.setLineWidth(0.3);
          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height,
          );
        }
      },
    });

    let tableBottomY = lastY();

    // Additional Charges box
    if (fees.length > 0) {
      const ROW_H = 9;
      const boxH = Math.max(fees.length * ROW_H + 8, 22);
      const boxX = TABLE_X + 5;
      const boxW = TABLE_W - 10;

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(boxX, tableBottomY + 2, boxX + boxW, tableBottomY + 2);

      const boxY = tableBottomY + 5;
      doc.setFillColor(242, 246, 254);
      doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, "F");

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Additional Charges", boxX + 6, boxY + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Service Fee & Packing Fee*", boxX + 6, boxY + 13);

      doc.setDrawColor(128, 151, 199);
      doc.setLineWidth(0.3);
      doc.line(121, boxY + 4, 121, boxY + boxH - 4);

      doc.setFontSize(9);
      fees.forEach((fee, i) => {
        const textY = boxY + 9 + i * ROW_H;
        doc.text(fee.label, 125, textY);
        doc.text(rs(fee.amount), 155, textY);
      });

      tableBottomY = boxY + boxH + 4;
    }

    // Outer rounded border
    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.3);
    doc.roundedRect(TABLE_X, tableTopY, TABLE_W, tableBottomY - tableTopY, 3, 3, "S");

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    y = tableBottomY + 10;
  }

  /* ---------------- Additional items ---------------- */
  if (invoice.additionalItems?.length > 0) {
    y += 5;
    if (y + (15 + invoice.additionalItems.length * 8) > 250) {
      doc.addPage();
      y = 20;
    }

    const total = invoice.additionalItems.reduce(
      (t, i) => t + parseFloat(i.normalPrice || "0"),
      0,
    );
    const itemCount = invoice.additionalItems.length;
    const formattedCount = String(itemCount).padStart(2, "0");
    const itemLabel = itemCount === 1 ? "Item" : "Items";
    const addTitle = ` ${getAdditionalItemsLabel(invoice)} (${formattedCount} ${itemLabel})`;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(addTitle, 15, y);
    doc.text(rs(total.toFixed(2)), 195, y, { align: "right" });
    y += 5;

    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 5;

    const hc = (content: string) => ({
      content,
      styles: { fillColor: [243, 244, 246], fontStyle: "bold" },
    });

    const body = invoice.additionalItems.map((it, i) => {
      const rawQty = parseFloat(it.quantity || "1") || 1;
      const quantity = it.quantity === "0.00" ? 1 : rawQty;
      const amount = parseNum(it.normalPrice);
      const isGrams = String(it.unit || "").trim().toLowerCase() === "g";
      const qtyInBase = isGrams ? quantity / 1000 : quantity;
      const unitPrice = amount / qtyInBase;

      return [
        `${i + 1}.`,
        it.name || "N/A",
        rs(unitPrice),
        `${quantity} ${it.unit || ""}`.trim(),
        rs(amount),
      ];
    });

    at({
      startY: y,
      head: [
        [
          hc("Index"),
          hc("Item Description"),
          hc("Unit Price (Rs.)"),
          hc("QTY"),
          hc("Amount (Rs.)"),
        ],
      ],
      body,
      margin: { left: 15, right: 15 },
      columnStyles: { 3: { overflow: "visible" } },
      styles: {
        fontSize: 9,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      bodyStyles: { textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      tableLineColor: [209, 213, 219],
      tableLineWidth: 0.5,
    });

    y = lastY() + 10;
  }

  /* ---------------- Grand total section ---------------- */
  if (y + (30 + (invoice.familyPackItems?.length || 0) * 5) > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total for all items", 15, y);
  y += 5;
  doc.setDrawColor(215, 215, 215);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 5;

  const GREEN: [number, number, number] = [22, 163, 74];
  const ORANGE: [number, number, number] = [217, 119, 6];
  const BLUE: [number, number, number] = [11, 85, 221];

  const gtBody: any[] = summary.rows.map((row) => {
    switch (row.type) {
      case "line":
        return [
          row.label,
          { content: rs(row.amount.toFixed(2)), styles: { halign: "right" } },
        ];
      case "note":
        return [
          {
            content: row.text,
            colSpan: 2,
            styles: { textColor: BLUE, fontStyle: "normal", fontSize: 8 },
          },
        ];
      case "total":
        return [
          { content: row.label, styles: { fontStyle: "bold", textColor: [0, 0, 0] } },
          {
            content: rs(row.amount.toFixed(2)),
            styles: { fontStyle: "bold", textColor: [0, 0, 0] },
          },
        ];
      case "payment": {
        const c = row.color === "green" ? GREEN : ORANGE;
        return [
          { content: row.label, styles: { fontStyle: "bold", textColor: c } },
          {
            content: rs(row.amount.toFixed(2)),
            styles: { fontStyle: "bold", textColor: c },
          },
        ];
      }
    }
  });

  const borderRowIndex = summary.totalIndex - 1;
  const isNoteText = (t: string) =>
    t.startsWith("An additional Rs.") || t.startsWith("An amount of Rs.");

  at({
    startY: y,
    body: gtBody,
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 130, halign: "left" },
      1: { cellWidth: 50, halign: "right" },
    },
    styles: {
      fontSize: 9,
      cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
      lineWidth: 0,
    },
    bodyStyles: { lineWidth: 0 },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    didParseCell: (data: any) => {
      if (data.section !== "body") return;
      const raw =
        typeof data.cell.raw === "object" ? data.cell.raw.content : data.cell.raw;
      const text = String(raw || "");

      if (isNoteText(text)) {
        data.cell.styles.cellPadding = { top: 1, right: 2, bottom: 5, left: 7 };
      } else if (data.column.index === 0) {
        data.cell.styles.cellPadding = { top: 2, right: 2, bottom: 1, left: 2 };
      }
    },
    didDrawCell: (data: any) => {
      if (data.row.index === borderRowIndex) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height,
        );
      }

      if (data.section === "body" && data.column.index === 0) {
        const raw =
          typeof data.cell.raw === "object" ? data.cell.raw.content : data.cell.raw;
        const text = String(raw || "");

        if (isNoteText(text)) {
          doc.setFillColor(255, 255, 255);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F");

          const iconX = data.cell.x + 2.2;
          const iconY = data.cell.y + 3.2;
          doc.setFillColor(11, 85, 221);
          doc.setDrawColor(11, 85, 221);
          doc.circle(iconX, iconY, 1.35, "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(5);
          doc.setTextColor(255, 255, 255);
          doc.text("i", iconX, iconY + 0.8, { align: "center" });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(11, 85, 221);
          const noteLines = doc.splitTextToSize(text, data.cell.width - 9);
          doc.text(noteLines, iconX + 3.2, data.cell.y + 4.2);
        }
      }
    },
  });

  y = lastY() + 2;

  if (summary.showDeliveryNote) {
    const noteText =
      "The delivery charges might be different on the day of delivery. Your Grand Total might be changed then.";
    const iconX = 16;
    const iconRadius = 1.6;
    const textX = iconX + iconRadius + 2.5;
    const iconY = y - 1;

    doc.setDrawColor(80, 80, 80);
    doc.setFillColor(30, 30, 30);
    doc.circle(iconX, iconY, iconRadius, "F");

    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("i", iconX, iconY + 0.9, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 90, 90);
    doc.text(noteText, textX, y);

    doc.setTextColor(0, 0, 0);
    y += 6;
  }

  y += 4;

  /* ---------------- Remarks + footer ---------------- */
  if (y + 50 > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Remarks:", 15, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const remarks = [
    "Kindly inspect all goods at the time of delivery to ensure accuracy and condition.",
    "",
    "Polygon does not accept returns under any circumstances.",
    "",
    "Please report any issues or discrepancies within 24 hours of delivery to ensure prompt attention.",
    "",
    "For any assistance, feel free to contact our customer service team.",
  ];
  remarks.forEach((r) => {
    if (r) doc.text(r, 15, y);
    y += 4;
  });

  y += 20;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bolditalic");
  doc.text("Thank you for shopping with us!", 105, y, { align: "center" });

  y += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    "WE WILL SEND YOU MORE OFFERS , LOWEST PRICED VEGGIES FROM US.",
    105,
    y,
    { align: "center" },
  );

  y += 15;
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.text(
    "- THIS IS A COMPUTER GENERATED INVOICE, THUS NO SIGNATURE REQUIRED -",
    105,
    y,
    { align: "center" },
  );

  y += 5;
  const now = new Date();
  const generatedTime = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Colombo",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const generatedDate = now.toLocaleDateString("en-US", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`- GENERATED AT : ${generatedTime}, ${generatedDate} -`, 105, y, {
    align: "center",
  });

  doc.save(`Post_Invoice_${invoice.invoiceNumber || "unknown"}.pdf`);
}