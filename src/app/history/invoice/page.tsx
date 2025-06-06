'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getInvoice, getOrderDetails } from '@/services/retail-order-service';
import { useRouter, useSearchParams } from 'next/navigation';

// Define interfaces based on the API responses
interface InvoiceItem {
  id: number;
  name: string;
  unitPrice: string;
  quantity: string;
  unit: string;
  amount: string;
  image?: string;
}

interface BillingInfo {
  title: string;
  fullName: string;
  buildingType: string;
  houseNo: string;
  street: string;
  city: string;
  phone: string;
}

interface PickupInfo {
  centerId?: number;
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

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  scheduledDate: string;
  deliveryMethod: string;
  paymentMethod: string;
  amountDue: string;
  familyPackItems: InvoiceItem[];
  additionalItems: InvoiceItem[];
  familyPackTotal: string;
  additionalItemsTotal: string;
  deliveryFee: string;
  grandTotal: string;
  discount: string;
  billingInfo: BillingInfo;
  pickupInfo?: PickupInfo;
}

function formatDateTime(dateTimeStr: string, type: 'date' | 'time' = 'date'): string {
  if (!dateTimeStr || dateTimeStr === 'N/A') return 'N/A';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) {
    if (type === 'time' && dateTimeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return dateTimeStr.slice(0, 5);
    }
    return 'N/A';
  }
  if (type === 'time') {
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Colombo',
      timeStyle: 'short',
    });
  }
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Colombo',
    dateStyle: 'medium',
  });
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
  if (!invoice) {
    return (
      <div className="w-full p-8">
        <p className="text-[rgb(220,38,38)] text-center">Loading...</p>
      </div>
    );
  }

  // Utility to parse currency values
  const parseCurrency = (value: string): number => {
    if (value === 'Rs. NaN' || !value) return 0;
    return parseFloat(value.replace('Rs. ', '')) || 0;
  };

  // Get unique package names for the title
  const uniquePackageNames = [...new Set(invoice.familyPackItems.map(item => item.name))];
  const packageTitle = uniquePackageNames.length === 1
    ? `${uniquePackageNames[0]} (${invoice.familyPackItems.length} Items)`
    : `Family Packs (${invoice.familyPackItems.length} Items)`;

  return (
    <div className="w-[794px] mx-auto p-8 bg-white" ref={invoiceRef}>
      <h1 className="text-2xl font-bold text-center" style={{ color: 'rgb(62,32,109)' }}>
        INVOICE
      </h1>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-l font-semibold">Polygon Holdings (Pvt) Ltd</p>
          <div className="text-sm">
            <p className="flex items-center font-normal">No. 614, Nawam Mawatha, Colombo 02</p>
            <p className="flex items-center font-normal">
              <span className="mr-1">Contact No :</span> +94 112 700 900
            </p>
            <p className="flex items-center font-normal">
              <span className="mr-1">Email Address:</span> info@polygon.lk
            </p>
          </div>
        </div>
        <div>
          <img
            src="/POLYGON ORIGINAL LOGO.png"
            alt="Polygon Logo"
            width={150}
            height={150}
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="font-semibold">Bill To:</p>
          <p>
            {invoice.billingInfo.title} {invoice.billingInfo.fullName}
          </p>
          <p> No,
      {invoice.billingInfo.houseNo}
          </p>
          <p>{invoice.billingInfo.street}</p>
          <p>{invoice.billingInfo.city}</p>
          <p>{invoice.billingInfo.phone}</p>
          <div>
            <p className="font-semibold mt-5">Invoice No: </p>
            <p>{invoice.invoiceNumber}</p>
            <p className="font-semibold mt-5">Delivery Method: </p>
            <p>{invoice.deliveryMethod}</p>

            {invoice.deliveryMethod?.toLowerCase() === 'pickup' && invoice.pickupInfo && (
              <div className="mt-3 text-sm">
                <p className="font-semibold">
                  Center: {invoice.pickupInfo.centerName || 'N/A'}
                </p>
                <p>
                  {invoice.pickupInfo.address?.city || 'N/A'}, {invoice.pickupInfo.address?.district || 'N/A'}
                </p>
                <p>
                  {invoice.pickupInfo.address?.province || 'N/A'}, {invoice.pickupInfo.address?.country || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="text-left ml-53">
          <p className="font-semibold mt-5">Grand Total: </p>
          <p className="text font-extrabold">Rs. {parseCurrency(invoice.grandTotal).toFixed(2)}</p>
          <p className="font-semibold mt-5">Payment Method: </p>
          <p>{invoice.paymentMethod}</p>
          <p className="font-semibold mt-5">Ordered Date: </p>
          <p>{formatDateTime(invoice.invoiceDate, 'date')}</p>
          <p className="font-semibold mt-5">Scheduled Date: </p>
          <p>{formatDateTime(invoice.scheduledDate, 'date')}</p>
        </div>
      </div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">
            {packageTitle}
          </h2>
          <span className="font-semibold">
            Rs. {parseCurrency(invoice.familyPackTotal).toFixed(2)}
          </span>
        </div>
        <div className="border-t mb-4 mt-4" style={{ borderColor: 'rgb(215,215,215)' }} />
        <div className="mb-4" style={{ border: '1px solid rgb(215,215,215)', borderRadius: '0.5rem' }}>
          <table className="w-full text-sm">
            <thead>
              <tr
                className="w-full text-sm font-light border-b"
                style={{ backgroundColor: 'rgb(248,248,248)', borderColor: 'rgb(215,215,215)' }}
              >
                <th className="p-3 text-left font-extralight">Index</th>
                <th className="p-3 text-left font-extralight">Item Description</th>
                <th className="p-3 pl-28 text-left font-extralight">QTY</th>
                <th className="p-3 text-left font-extralight">{/* blank header */}</th>
                <th className="p-3 text-left font-extralight">{/* blank header */}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.familyPackItems.length > 0 ? (
                invoice.familyPackItems.map((item, index) => (
                  <tr key={item.id} className="border-b border-[rgb(229,231,235)]">
                    <td className="p-5 text-left">{index + 1}.</td>
                    <td className="p-3 text-left">{item.name}</td>
                    <td className="p-3 text-left pl-28">{`${item.quantity} `}</td>
                    <td className="p-3 text-left">{/* blank cell */}</td>
                    <td className="p-3 text-left">{/* blank cell */}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-[rgb(75,85,99)]">
                    No family pack items available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">
            Additional Items ({invoice.additionalItems.length} Items)
          </h2>
          <span className="font-semibold">
            Rs. {parseCurrency(invoice.additionalItemsTotal).toFixed(2)}
          </span>
        </div>
        <div className="border-t mb-4 mt-4" style={{ borderColor: 'rgb(215,215,215)' }} />
        <div className="mb-4" style={{ border: '1px solid rgb(215,215,215)', borderRadius: '0.5rem' }}>
          <table className="w-full border rounded-lg overflow-hidden">
            <thead>
              <tr className="w-full text-sm border-b" style={{ backgroundColor: 'rgb(248,248,248)', borderColor: 'rgb(215,215,215)' }}>
                <th className="p-3 text-left font-extralight">Index</th>
                <th className="p-3 text-left font-extralight">Item Description</th>
                <th className="p-3 text-left font-extralight">Unit Price (Rs.)</th>
                <th className="p-3 text-left font-extralight">QTY</th>
                <th className="p-3 text-left font-extralight">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.additionalItems.map((item, index) => (
                <tr key={item.id} className="justify-center">
                  <td className="p-5 text-left">{index + 1}.</td>
                  <td className="p-3 text-left">{item.name}</td>
                  <td className="p-3 text-left">{item.unitPrice}</td>
                  <td className="p-3 text-left">{`${item.quantity} ${item.unit}`}</td>
                  <td className="p-3 text-left">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold">Grand Total for all items</h2>
        <div className="border-t mb-4 mt-4" style={{ borderColor: 'rgb(215,215,215)' }} />
        <table className="w-full">
          <tbody>
            <tr>
              <td className="p-2 mt-5">{packageTitle}</td>
              <td className="p-2 text-right">
                Rs. {parseCurrency(invoice.familyPackTotal).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="p-2">Additional Items</td>
              <td className="p-2 text-right">
                Rs. {parseCurrency(invoice.additionalItemsTotal).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="p-2">Delivery Fee</td>
              <td className="p-2 mb-3 text-right">
                Rs. {parseCurrency(invoice.deliveryFee).toFixed(2)}
              </td>
            </tr>
            <tr className="font-bold" style={{ borderTop: '3px solid black' }}>
              <td className="p-4">Grand Total</td>
              <td className="p-2 text-right">
                Rs. {(
                  parseCurrency(invoice.familyPackTotal) +
                  parseCurrency(invoice.additionalItemsTotal) +
                  parseCurrency(invoice.deliveryFee)
                ).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-sm">
        <p className="mb-2 font-bold">Remarks: </p>
        <p className="mb-2">Kindly inspect all goods at the time of delivery to ensure accuracy and condition.</p>
        <p className="mb-2">Polygon does not accept returns under any circumstances.</p>
        <p className="mb-2">Please contact our customer service team within 24 hours of delivery.</p>
        <p className="mb-2">For any assistance, feel free to contact our customer service team.</p>
        <p className="font-semibold text-center italic mt-9">Thank you for shopping with us!</p>
        <p className="text-center italic mt-3">
          WE WILL SEND YOU MORE OFFERS, LOWEST PRICED VEGGIES FROM US
        </p>
        <p className="text-center italic mt-10" style={{ color: 'rgb(132,146,163)' }}>
          -THIS IS A COMPUTER GENERATED INVOICE, THUS NO SIGNATURE REQUIRED-
        </p>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useSelector((state: RootState) => state.auth.token);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const canvasPreviewRef = useRef<HTMLCanvasElement>(null); // For debugging

  const orderId = searchParams.get('orderId');

  const parseCurrency = (value: string): string => {
    if (value === 'Rs. NaN' || !value) return 'Rs. 0.00';
    return value.startsWith('Rs. ') ? value : `Rs. ${value || '0.00'}`;
  };

  const fetchInvoice = async (orderId: string): Promise<void> => {
    if (!token) {
      console.error('No token available for fetching invoice at 05:12 PM +0530, June 06, 2025');
      setSelectedInvoice(null);
      setLoading(false);
      return;
    }

    try {
      setSelectedInvoice(null);
      const data = await getInvoice(token, orderId);
      const orderDetails = await getOrderDetails(token, orderId);
      console.log('Invoice Response at 05:12 PM +0530, June 06, 2025:', data);
      console.log('Order Details for Discount at 05:12 PM +0530, June 06, 2025:', orderDetails);

      if (data.status && data.invoice) {
        const apiInvoice = data.invoice.invoice || data.invoice;
        const additionalItemsDiscount = orderDetails.additionalItemsData?.status && orderDetails.additionalItemsData.data
          ? orderDetails.additionalItemsData.data.reduce((sum: number, item: any) => {
              const qty = parseFloat(item.qty || '1');
              const discount = parseFloat(item.discount || '0');
              return sum + (discount * qty);
            }, 0)
          : 0;
        const totalDiscount = parseFloat(orderDetails.order?.order?.discount || '0') + additionalItemsDiscount;

        const familyPackTotal = parseFloat(apiInvoice.familyPackTotal.replace('Rs. ', '') || '0');
        const additionalItemsTotal = parseFloat(apiInvoice.additionalItemsTotal.replace('Rs. ', '') || '0');
        const deliveryFee = parseFloat(apiInvoice.deliveryFee.replace('Rs. ', '') || '0');
        const grandTotal = (familyPackTotal + additionalItemsTotal + deliveryFee - totalDiscount).toFixed(2);

        const invoiceData: InvoiceData = {
          invoiceNumber: apiInvoice.invoiceNumber || 'N/A',
          invoiceDate: apiInvoice.invoiceDate || 'N/A',
          scheduledDate: apiInvoice.scheduledDate || 'N/A',
          deliveryMethod: apiInvoice.deliveryMethod || 'N/A',
          paymentMethod: apiInvoice.paymentMethod || 'N/A',
          amountDue: parseCurrency(apiInvoice.amountDue),
          familyPackItems: apiInvoice.familyPackItems?.map((item: any) => ({
            id: item.id ?? 0,
            name: item.name || 'Unknown',
            unitPrice: parseCurrency(item.unitPrice),
            quantity: item.quantity || '1',
            unit: item.unit || 'units',
            amount: parseCurrency(item.amount),
          })) || [],
          additionalItems: apiInvoice.additionalItems?.map((item: any) => ({
            id: item.id ?? 0,
            name: item.name || 'Unknown',
            unitPrice: parseCurrency(item.unitPrice),
            quantity: item.quantity || '1',
            unit: item.unit || 'units',
            amount: parseCurrency(item.amount),
            image: item.image || undefined,
          })) || [],
          familyPackTotal: parseCurrency(apiInvoice.familyPackTotal),
          additionalItemsTotal: parseCurrency(apiInvoice.additionalItemsTotal),
          deliveryFee: parseCurrency(apiInvoice.deliveryFee),
          discount: totalDiscount > 0 ? `Rs. ${totalDiscount.toFixed(2)}` : 'Rs. 0.00',
          grandTotal: `Rs. ${grandTotal}`,
          billingInfo: {
            title: apiInvoice.billingInfo?.title || 'N/A',
            fullName: apiInvoice.billingInfo?.fullName || 'N/A',
            buildingType: apiInvoice.billingInfo?.buildingType || 'N/A',
            houseNo: apiInvoice.billingInfo?.houseNo || 'N/A',
            street: apiInvoice.billingInfo?.street || 'N/A',
            city: apiInvoice.billingInfo?.city || 'N/A',
            phone: apiInvoice.billingInfo?.phone || 'N/A',
          },
          pickupInfo: apiInvoice.pickupInfo
            ? {
                centerId: apiInvoice.pickupInfo.centerId ?? undefined,
                centerName: apiInvoice.pickupInfo.centerName || 'N/A',
                contact01: apiInvoice.pickupInfo.contact01 || 'N/A',
                address: {
                  street: apiInvoice.pickupInfo.address?.street || 'N/A',
                  city: apiInvoice.pickupInfo.address?.city || 'N/A',
                  district: apiInvoice.pickupInfo.address?.district || 'N/A',
                  province: apiInvoice.pickupInfo.address?.province || 'N/A',
                  country: apiInvoice.pickupInfo.address?.country || 'N/A',
                  zipCode: apiInvoice.pickupInfo.address?.zipCode || 'N/A',
                },
              }
            : undefined,
        };

        if (
          parseFloat(invoiceData.amountDue.replace('Rs. ', '')) !==
          parseFloat(invoiceData.grandTotal.replace('Rs. ', ''))
        ) {
          console.warn('Amount due and grand total mismatch:', invoiceData);
        }

        setSelectedInvoice(invoiceData);

        // Wait for image and DOM to be ready
        if (imageLoaded) {
          setTimeout(() => {
            if (invoiceRef.current && invoiceRef.current.innerHTML.trim() !== '') {
              try {
                console.log('Generating PDF for invoice at 05:12 PM +0530, June 06, 2025:', invoiceData.invoiceNumber);
                html2canvas(invoiceRef.current, {
                  scale: 1,
                  useCORS: true,
                  logging: true, // Enable logging for debugging
                  width: 794, // A4 width in pixels
                  height: invoiceRef.current.scrollHeight, // Full content height
                })
                  .then((canvas) => {
                    if (!canvas) throw new Error('Canvas generation failed');
                    console.log('Canvas generated: ', canvas.width, canvas.height);

                    // Debug: Preview canvas in browser
                    if (canvasPreviewRef.current) {
                      canvasPreviewRef.current.width = canvas.width;
                      canvasPreviewRef.current.height = canvas.height;
                      const ctx = canvasPreviewRef.current.getContext('2d');
                      ctx?.drawImage(canvas, 0, 0);
                    }

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgWidth = 190; // 10mm margins on each side
                    const pageHeight = 297;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 15; // Increased top margin

                    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
                    heightLeft -= pageHeight - 30; // Account for margins

                    while (heightLeft >= 0) {
                      position = heightLeft - imgHeight + 15;
                      pdf.addPage();
                      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
                      heightLeft -= pageHeight - 30;
                    }

                    console.log('PDF generated, triggering download at 05:12 PM +0530, June 06, 2025...');
                    pdf.save(`invoice_${invoiceData.invoiceNumber}.pdf`);
                  })
                  .catch((error) => {
                    console.error('Error in canvas or PDF generation at 05:12 PM +0530, June 06, 2025:', error);
                    alert('Failed to generate PDF. Please try again.');
                  });
              } catch (error) {
                console.error('Error generating PDF at 05:12 PM +0530, June 06, 2025:', error);
                alert('Failed to generate PDF. Please try again.');
              }
            } else {
              console.error('invoiceRef.current is null or empty at 05:12 PM +0530, June 06, 2025');
              alert('Failed to generate PDF. Invoice not rendered.');
            }
          }, 500); // Small delay to ensure DOM rendering
        }
      } else {
        console.error('Invalid invoice data received at 05:12 PM +0530, June 06, 2025:', data);
        setSelectedInvoice(null);
        alert('Invalid invoice data received. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching invoice at 05:12 PM +0530, June 06, 2025:', err);
      setSelectedInvoice(null);
      alert('Failed to fetch invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Preload logo image
  useEffect(() => {
    const img = new window.Image();
    img.src = '/POLYGON ORIGINAL LOGO.png';
    img.crossOrigin = 'anonymous'; // Ensure CORS compatibility
    img.onload = () => {
      console.log('Logo image loaded at 05:12 PM +0530, June 06, 2025');
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load logo image at 05:12 PM +0530, June 06, 2025');
      setImageLoaded(true); // Proceed to avoid hanging
    };
  }, []);

  useEffect(() => {
    if (orderId && imageLoaded) {
      fetchInvoice(orderId);
    } else if (!orderId) {
      setLoading(false);
      alert('No order ID provided.');
    }
  }, [orderId, token, imageLoaded]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[rgb(255,255,255)] relative">
      <main className="flex-1 p-6 z-10 min-h-screen">
        <InvoiceView
          invoice={selectedInvoice}
          onClose={() => router.push('/history/order')}
          invoiceRef={invoiceRef as any}
        />
        {/* Debug: Canvas preview */}
        <canvas ref={canvasPreviewRef} style={{ display: 'none' }} />
      </main>
    </div>
  );
}