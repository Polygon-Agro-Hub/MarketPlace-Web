
'use client';

import React, { useEffect, useState, useRef, RefObject } from 'react';
import Image from 'next/image';
import { FaAngleDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define interfaces based on the API responses
interface DetailedItem {
  id: number;
  name: string;
  weight: string;
  price: string;
  quantity: number;
}

interface DetailedPackage {
  packageId: number;
  name: string;
  items: DetailedItem[];
  totalPrice: string;
}

interface PickupInfo {
  centerName: string;
  contact01: string;
  fullName?: string;
  buildingNumber: string;
  street: string;
  city: string;
  district: string;
  province: string;
  country: string;
  zipCode: string;
}

interface DeliveryInfo {
  buildingType: string;
  houseNo: string;
  street: string;
  city: string;
  buildingNo: string;
  buildingName: string;
  flatNo: string;
  floorNo: string;
}

interface OrderSummary {
  orderId: string;
  scheduleDate: string;
  scheduleTime: string;
  deliveryType: string;
  total: string;
  orderPlaced: string;
  status: string;
}

interface DetailedOrder {
  orderId: string;
  scheduleDate: string;
  scheduleTime: string;
  deliveryType: string;
  total: string;
  orderPlaced: string;
  status: string;
  fullName?: string;
  phonecode1?: string;
  phone1?: string;
  pickupInfo?: PickupInfo;
  deliveryInfo?: DeliveryInfo;
  familyPackItems?: DetailedPackage[];
  additionalItems?: DetailedItem[];
  discount?: string;
}

interface InvoiceItem {
  id: number;
  name: string;
  unitPrice: string;
  quantity: string;
  amount: string;
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
  billingInfo: BillingInfo;
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

const getStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'ordered':
      return 'bg-[rgb(255,233,226)] text-[rgb(255,90,0)]';
    case 'processing':
      return 'bg-[rgb(207,225,255)] text-[rgb(59,130,246)]';
    case 'ready to go':
      return 'bg-[rgb(242,221,255)] text-[rgb(62,32,109)]';
    case 'delivered':
      return 'bg-[rgb(220,252,231)] text-[rgb(22,163,74)]';
    case 'cancelled':
      return 'bg-[rgb(254,226,226)] text-[rgb(220,38,38)]';
    case 'one time':
      return 'bg-[rgb(219,234,254)] text-[rgb(37,99,235)]';
    default:
      return 'bg-[rgb(243,244,246)] text-[rgb(75,85,99)]';
  }
};

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
        <button
          className="absolute top-4 right-4 text-[rgb(75,85,99)] hover:text-[rgb(0,0,0)] text-lg font-bold"
          onClick={onClose}
        >
          ✕
        </button>
        <p className="text-[rgb(220,38,38)] text-center">Failed to load invoice data.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-8" ref={invoiceRef}>
      <button
        className="absolute top-4 right-4 text-[rgb(75,85,99)] hover:text-[rgb(0,0,0)] text-lg font-bold"
        onClick={onClose}
      >
        ✕
      </button>
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
        <div className="text-right">
          <Image
            src="/POLYGON ORIGINAL LOGO.png"
            alt="Polygon Logo"
            width={250}
            height={250}
            className="object-contain"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="font-semibold">Bill To:</p>
          <p>
            {invoice.billingInfo.title} {invoice.billingInfo.fullName}
          </p>
          <p>
            {invoice.billingInfo.buildingType}, {invoice.billingInfo.houseNo}
          </p>
          <p>{invoice.billingInfo.street}</p>
          <p>{invoice.billingInfo.city}</p>
          <p>{invoice.billingInfo.phone}</p>
          <div>
            <p className="font-semibold mt-5">Invoice No: </p>
            <p>{invoice.invoiceNumber}</p>
            <p className="font-semibold mt-5">Delivery Method: </p>
            <p>{invoice.deliveryMethod}</p>
          </div>
        </div>
        <div className="text-left ml-50">
          <p className="font-semibold mt-5">Balance Due: </p>
          <p className="text font-extrabold">Rs. {parseFloat(invoice.amountDue).toFixed(2)}</p>
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
            Family Pack for 2 ({invoice.familyPackItems.length} Items)
          </h2>
          <span className="font-semibold">
            Rs. {parseFloat(invoice.familyPackTotal).toFixed(2)}
          </span>
        </div>
        <div className="border-t mb-4 mt-4" style={{ borderColor: 'rgb(215,215,215)' }} />
        <div className="mb-4" style={{ border: '1px solid rgb(215,215,215)', borderRadius: '0.5rem' }}>
          <table className="w-full text-sm" >
            <thead>
               <tr className="w-full text-sm border-b" style={{ backgroundColor: 'rgb(248,248,248)',borderColor: 'rgb(215,215,215)' }}>
                <th className="p-3 text-left">Index</th>
                <th className="p-3 text-left">Item Description</th>
                <th className="p-3 text-left">Unit Price (Rs.)</th>
                <th className="p-3 text-left">Qty</th>
                <th className="p-3 text-left">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.familyPackItems.map((item, index) => (
                <tr key={item.id} >
                  <td className="p-3 text-left">{index + 1}.</td>
                  <td className="p-3 text-left">{item.name}</td>
                  <td className="p-3 text-left">{item.unitPrice}</td>
                  <td className="p-3 text-left">{item.quantity}</td>
                  <td className="p-3 text-left">{item.amount}</td>
                </tr>
              ))}
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
            Rs. {parseFloat(invoice.additionalItemsTotal).toFixed(2)}
          </span>
        </div>
        <div className="border-t mb-4 mt-4" style={{ borderColor: 'rgb(215,215,215)' }} />
        <div className="mb-4" style={{ border: '1px solid rgb(215,215,215)', borderRadius: '0.5rem' }}>
          <table className="w-full border  rounded-lg overflow-hidden" >
            <thead>
             <tr className="w-full text-sm border-b" style={{ backgroundColor: 'rgb(248,248,248)',borderColor: 'rgb(215,215,215)' }}>
                <th className="p-3 text-left">Index</th>
                <th className="p-3 text-left">Item Description</th>
                <th className="p-3 text-left">Unit Price (Rs.)</th>
                <th className="p-3 text-left">Qty</th>
                <th className="p-3 text-left">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.additionalItems.map((item, index) => (
                <tr key={item.id} className=" justify-center">
                  <td className="p-5 text-left">{index + 1}.</td>
                  <td className="p-3 text-left">{item.name}</td>
                  <td className="p-3 text-left">{item.unitPrice}</td>
                  <td className="p-3 text-left">{item.quantity}</td>
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
              <td className="p-2 mt-5">Family Pack for 2</td>
              <td className="p-2 text-right">
                Rs. {parseFloat(invoice.familyPackTotal).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="p-2">Additional Items</td>
              <td className="p-2 text-right">
                Rs. {parseFloat(invoice.additionalItemsTotal).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="p-2">Delivery Fee</td>
              <td className="p-2 mb-3 text-right">
                Rs. {parseFloat(invoice.deliveryFee).toFixed(2)}
              </td>
            </tr>
              <tr className="font-bold " style={{ borderTop: '3px solid black' }}>
        <td className="p-4">Grand Total</td>
        <td className="p-2 text-right">
          Rs. {(
            parseFloat(invoice.familyPackTotal) +
            parseFloat(invoice.additionalItemsTotal) +
            parseFloat(invoice.deliveryFee)
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

export default function OrderHistoryPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const HEADER_HEIGHT = 64;
  const FOOTER_HEIGHT = 64;

  useEffect(() => {
    if (!token) {
      console.error('Token not found in Redux store at 01:31 PM +0530, May 27, 2025');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3200/api/retail-order/order-history', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error('API error at 01:31 PM +0530, May 27, 2025:', errorData);
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log('API Response at 01:31 PM +0530, May 27, 2025:', data);

        const orderHistory = data.orderHistory || [];
        console.log('Is orderHistory an array?', Array.isArray(orderHistory));
        console.log('orderHistory contents:', orderHistory);

        if (!Array.isArray(orderHistory)) {
          console.error('orderHistory is not an array at 01:31 PM +0530, May 27, 2025:', orderHistory);
          setOrders([]);
          setLoading(false);
          return;
        }

        const normalizedOrders: OrderSummary[] = orderHistory.map((order: any) => ({
          orderId: order.orderId ? String(order.orderId) : 'N/A',
          scheduleDate: order.sheduleDate ? formatDateTime(order.sheduleDate, 'date') : 'N/A',
          scheduleTime: order.sheduleTime ? formatDateTime(order.sheduleTime, 'time') : 'N/A',
          deliveryType: order.delivaryMethod || 'N/A',
          total: order.total ? `Rs. ${parseFloat(order.total || '0').toFixed(2)}` : 'Rs. 0.00',
          orderPlaced: order.orderPlacedTime ? formatDateTime(order.orderPlacedTime, 'date') : 'N/A',
          status: order.status || 'Pending',
        }));

        console.log('Normalized Orders at 01:31 PM +0530, May 27, 2025:', normalizedOrders);
        setOrders(normalizedOrders);
      } catch (err) {
        console.error('Error fetching orders at 01:31 PM +0530, May 27, 2025:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  useEffect(() => {
    if ((selectedOrder || selectedInvoice) && modalContentRef.current && mainRef.current) {
      const modalHeight = modalContentRef.current.scrollHeight;
      mainRef.current.style.minHeight = `${modalHeight}px`;
      mainRef.current.style.overflowY = 'auto';
    } else if (mainRef.current) {
      mainRef.current.style.minHeight = '';
      mainRef.current.style.overflowY = 'auto';
    }
  }, [selectedOrder, selectedInvoice]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilter(event.target.value);
  };

  const fetchDetailedOrder = async (orderId: string): Promise<void> => {
  try {
    setSelectedOrder(null);
    setSelectedInvoice(null);
    const res = await fetch(`http://localhost:3200/api/retail-order/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch order details');
    }

    const data = await res.json();
    console.log('Detailed Order Response at 04:00 PM +0530, May 26, 2025:', data); // Timestamp for debugging
    if (data.status && data.order) {
      const apiOrder = data.order;
      const detailedOrder: DetailedOrder = {
        orderId: String(apiOrder.id),
        scheduleDate: apiOrder.sheduleDate ? formatDateTime(apiOrder.sheduleDate, 'date') : 'N/A',
        scheduleTime: apiOrder.sheduleTime ? formatDateTime(apiOrder.sheduleTime, 'time') : 'N/A',
        deliveryType: apiOrder.delivaryMethod || 'N/A',
        total: apiOrder.total ? `Rs. ${parseFloat(apiOrder.total || '0').toFixed(2)}` : 'Rs. 0.00',
        orderPlaced: apiOrder.createdAt ? formatDateTime(apiOrder.createdAt, 'date') : 'N/A',
        status: apiOrder.sheduleType || 'Pending',
        fullName: apiOrder.fullName || 'N/A',
        phonecode1: apiOrder.phonecode1 || 'N/A',
        phone1: apiOrder.phone1 || 'N/A',
        pickupInfo:
          apiOrder.delivaryMethod?.toLowerCase() === 'pickup'
            ? {
                centerName: apiOrder.pickupInfo?.centerName || 'N/A',
                contact01: apiOrder.pickupInfo?.contact01 || 'N/A',
                fullName: apiOrder.pickupInfo?.fullName || 'N/A',
                buildingNumber: apiOrder.pickupInfo?.buildingNumber || 'N/A',
                street: apiOrder.pickupInfo?.street || 'N/A',
                city: apiOrder.pickupInfo?.city || 'N/A',
                district: apiOrder.pickupInfo?.district || 'N/A',
                province: apiOrder.pickupInfo?.province || 'N/A',
                country: apiOrder.pickupInfo?.country || 'N/A',
                zipCode: apiOrder.pickupInfo?.zipCode || 'N/A',
              }
            : undefined,
        deliveryInfo:
          apiOrder.delivaryMethod?.toLowerCase() === 'delivery'
            ? {
                buildingType: apiOrder.deliveryAddress?.buildingType || 'N/A',
                houseNo: apiOrder.deliveryAddress?.houseNo || 'N/A',
                street: apiOrder.deliveryAddress?.street || 'N/A',
                city: apiOrder.deliveryAddress?.city || 'N/A',
                buildingNo: apiOrder.deliveryAddress?.buildingNo || 'N/A',
                buildingName: apiOrder.deliveryAddress?.buildingName || 'N/A',
                flatNo: apiOrder.deliveryAddress?.flatNo || 'N/A',
                floorNo: apiOrder.deliveryAddress?.floorNo || 'N/A',
              }
            : undefined,
        familyPackItems: apiOrder.packages?.map((pack: any) => ({
          packageId: pack.packageId,
          name: pack.name || 'Family Pack',
          items: pack.items?.map((item: any) => ({
            id: item.id,
            name: item.itemDetails?.displayName || ` ${item.name || 'Unknown'}`, // Explicitly use displayName
            weight: item.weight || pack.unitType || '1 kg', // Use weight or package unitType
            price: item.price || 'Rs. 0.00',
            quantity: item.quantity || 1,
          })) || [],
          totalPrice: pack.items
            ? `Rs. ${pack.items
                .reduce((sum: number, item: any) => sum + parseFloat(item.price.replace('Rs. ', '') || '0'), 0)
                .toFixed(2)}`
            : 'Rs. 0.00',
        })) || [],
        additionalItems: apiOrder.additionalItems?.map((item: any) => ({
          id: item.id,
          name: item.itemDetails?.displayName || ` ${item.name || 'Unknown'}`, // Explicitly use displayName
          weight: item.weight || '1 kg', // Use weight if available
          price: item.price || 'Rs. 0.00',
          quantity: item.quantity || 1,
        })) || [],
        discount: apiOrder.discount ? `Rs. ${parseFloat(apiOrder.discount || '0').toFixed(2)}` : 'Rs. 0.00',
      };
      setSelectedOrder(detailedOrder);
    }
  } catch (err) {
    console.error('Error fetching detailed order at 04:00 PM +0530, May 26, 2025:', err);
    setSelectedOrder(null);
  }
};
  const fetchInvoice = async (orderId: string): Promise<void> => {
    try {
      setSelectedOrder(null);
      setSelectedInvoice(null);
      const res = await fetch(`http://localhost:3200/api/retail-order/invoice/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch invoice');
      }

      const data = await res.json();
      console.log('Invoice Response at 01:31 PM +0530, May 27, 2025:', data);
      if (data.status && data.invoice) {
        const apiInvoice = data.invoice;
        const invoiceData: InvoiceData = {
          invoiceNumber: apiInvoice.invoiceNumber || 'N/A',
          invoiceDate: apiInvoice.invoiceDate || 'N/A',
          scheduledDate: apiInvoice.scheduledDate || 'N/A',
          deliveryMethod: apiInvoice.deliveryMethod || 'N/A',
          paymentMethod: apiInvoice.paymentMethod || 'N/A',
          amountDue: apiInvoice.amountDue || '0.00',
          familyPackItems: apiInvoice.familyPackItems?.map((item: any) => ({
            id: item.id,
            name: item.name,
            unitPrice: `Rs. ${parseFloat(item.unitPrice || '0').toFixed(2)}`,
            quantity: item.quantity,
            amount: `Rs. ${parseFloat(item.amount || '0').toFixed(2)}`,
          })) || [],
          additionalItems: apiInvoice.additionalItems?.map((item: any) => ({
            id: item.id,
            name: item.name,
            unitPrice: `Rs. ${parseFloat(item.unitPrice || '0').toFixed(2)}`,
            quantity: item.quantity,
            amount: `Rs. ${parseFloat(item.amount || '0').toFixed(2)}`,
          })) || [],
          familyPackTotal: apiInvoice.familyPackTotal || '0.00',
          additionalItemsTotal: apiInvoice.additionalItemsTotal || '0.00',
          deliveryFee: apiInvoice.deliveryFee || '0.00',
          grandTotal: apiInvoice.grandTotal || '0.00',
          billingInfo: {
            title: apiInvoice.billingInfo?.title || '',
            fullName: apiInvoice.billingInfo?.fullName || '',
            buildingType: apiInvoice.billingInfo?.buildingType || '',
            houseNo: apiInvoice.billingInfo?.houseNo || '',
            street: apiInvoice.billingInfo?.street || '',
            city: apiInvoice.billingInfo?.city || '',
            phone: apiInvoice.billingInfo?.phone || '',
          },
        };
        setSelectedInvoice(invoiceData);

        requestAnimationFrame(() => {
          if (invoiceRef.current) {
            try {
              console.log('Generating PDF for invoice at 01:31 PM +0530, May 27, 2025:', invoiceData.invoiceNumber);
              html2canvas(invoiceRef.current, {
                scale: 1, // Reduced scale from 2 to 1 for lower resolution
                useCORS: true,
                logging: false, // Disabled logging to reduce overhead
                ignoreElements: (element) => {
                  const style = window.getComputedStyle(element);
                  const color = style.color || style.backgroundColor;
                  return color.includes('oklch');
                },
              })
                .then((canvas) => {
                  if (!canvas) throw new Error('Canvas generation failed');
                  console.log('Canvas generated successfully');

                  // Convert canvas to JPEG with compression
                  const imgData = canvas.toDataURL('image/jpeg', 0.5); // JPEG with 50% quality
                  const pdf = new jsPDF('p', 'mm', 'a4');
                  const imgWidth = 210; // A4 width in mm
                  const pageHeight = 295; // A4 height in mm
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;
                  let heightLeft = imgHeight;
                  let position = 0;

                  // Add image with JPEG compression
                  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST'); // Using 'FAST' compression
                  heightLeft -= pageHeight;

                  while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                    heightLeft -= pageHeight;
                  }

                  console.log('PDF generated, triggering download at 01:31 PM +0530, May 27, 2025...');
                  pdf.save(`invoice_${invoiceData.invoiceNumber}.pdf`);
                })
                .catch((error) => {
                  console.error('Error in canvas or PDF generation at 01:31 PM +0530, May 27, 2025:', error);
                });
            } catch (error) {
              console.error('Error generating PDF at 01:31 PM +0530, May 27, 2025:', error);
            }
          } else {
            console.error('invoiceRef.current is null at 01:31 PM +0530, May 27, 2025');
          }
        });
      }
    } catch (err) {
      console.error('Error fetching invoice at 01:31 PM +0530, May 27, 2025:', err);
      setSelectedInvoice(null);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const filteredOrders = filter === 'all' ? orders : orders.filter((order) => {
    const orderDate = new Date(order.orderPlaced !== 'N/A' ? order.orderPlaced : order.scheduleDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    switch (filter) {
      case 'this-week':
        return orderDate >= oneWeekAgo && orderDate <= today;
      case 'last-week':
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const lastWeekEnd = new Date(oneWeekAgo);
        lastWeekEnd.setDate(oneWeekAgo.getDate() + 6);
        return orderDate >= oneWeekAgo && orderDate <= lastWeekEnd;
      case 'this-month':
        return orderDate >= oneMonthAgo && orderDate <= today;
      default:
        return true;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-[rgb(255,255,255)] relative">
      <div>
      <main ref={mainRef} className="flex-1 p-6 z-10 min-h-screen">
        <div className="flex flex-row justify-between items-center mb-6 space-x-2 lg:mx-[72px]">
          <h1 className="text-sm lg:text-xl font-bold">
            Your Orders ({filteredOrders.length})
          </h1>
          <div className="relative w-[140px] sm:w-[180px]">
            <select
              value={filter}
              onChange={handleFilterChange}
              className="border border-[rgb(206,206,206)] rounded p-1 pr-6 w-full text-xs lg:text-sm h-[36px] appearance-none bg-[rgb(248,248,248)] cursor-pointer text-center focus:outline-none"
            >
              <option value="all">All</option>
              <option value="this-week">This Week</option>
              <option value="last-week">Last Week</option>
              <option value="this-month">This Month</option>
            </select>
            <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[rgb(107,114,128)] text-xs lg:text-sm pointer-events-none" />
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="lg:mx-[72px] space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="border rounded-xl overflow-hidden"
                style={{ borderColor: 'rgb(215,215,215)' }}
              >
                <div className="hidden sm:grid grid-cols-5 gap-4 p-4 bg-[rgb(248,248,248)] text-xs lg:text-sm">
                  <div>
                    <span className="text-[rgb(107,114,128)]">Scheduled Date:</span>
                    <p className="font-medium">{order.scheduleDate}</p>
                  </div>
                  <div>
                    <span className="text-[rgb(107,114,128)]">Total:</span>
                    <p className="font-medium">{order.total}</p>
                  </div>
                  <div>
                    <span className="text-[rgb(107,114,128)]">Order ID:</span>
                    <p className="font-medium">#{order.orderId}</p>
                  </div>
                  <div />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => fetchDetailedOrder(order.orderId)}
                      className="bg-[rgb(255,255,255)] border text-xs lg:text-sm border-[rgb(209,213,219)] rounded-lg px-4 py-1.5 hover:bg-[rgb(62,32,109)] hover:text-[rgb(255,255,255)]"
                    >
                      View Order
                    </button>
                    <button
                      onClick={() => fetchInvoice(order.orderId)}
                      className="bg-[rgb(255,255,255)] border text-xs lg:text-sm border-[rgb(209,213,219)] rounded-lg px-4 py-1.5 hover:bg-[rgb(62,32,109)] hover:text-[rgb(255,255,255)]"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>

                <div className="sm:hidden bg-[rgb(248,248,248)] p-4 space-y-2 text-sm">
                  <div>
                    <strong>Scheduled Date:</strong> {order.scheduleDate}
                  </div>
                  <div>
                    <strong>Total:</strong> {order.total}
                  </div>
                  <div>
                    <strong>Order ID:</strong> #{order.orderId}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => fetchDetailedOrder(order.orderId)}
                      className="bg-[rgb(255,255,255)] border border-[rgb(209,213,219)] rounded px-4 py-1 hover:bg-[rgb(62,32,109)] hover:text-[rgb(255,255,255)]"
                    >
                      View Order
                    </button>
                    <button
                      onClick={() => fetchInvoice(order.orderId)}
                      className="bg-[rgb(255,255,255)] border border-[rgb(209,213,219)] rounded px-4 py-1 hover:bg-[rgb(62,32,109)] hover:text-[rgb(255,255,255)]"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>

                <div className="border-t" style={{ borderColor: 'rgb(215,215,215)' }} />
                <div className="hidden sm:grid grid-cols-5 gap-4 p-4 bg-[rgb(255,255,255)] text-xs lg:text-sm mt-4">
                  <div>
                    <span className="text-[rgb(107,114,128)]">Status:</span>
                    <p>
                      <span
                        className={`inline-flex justify-center items-center font-medium px-3 py-0.5 rounded-full text-xs min-w-[100px] ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[rgb(107,114,128)]">Order Placed:</span>
                    <p className="text-[rgb(0,0,0)]">{order.orderPlaced}</p>
                  </div>
                  <div>
                    <span className="text-[rgb(107,114,128)]">Scheduled Time:</span>
                    <p className="text-[rgb(0,0,0)]">{order.scheduleTime}</p>
                  </div>
                  <div>
                    <span className="text-[rgb(107,114,128)]">Delivery / Pickup:</span>
                    <p className="text-[rgb(0,0,0)]">{order.deliveryType}</p>
                  </div>
                </div>

                <div className="sm:hidden p-4 bg-[rgb(255,255,255)] space-y-2 text-sm">
                  <div>
                    <strong>Status:</strong>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full ${getStatusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <strong>Order Placed:</strong> {order.orderPlaced}
                  </div>
                  <div>
                    <strong>Scheduled Time:</strong> {order.scheduleTime}
                  </div>
                  <div>
                    <strong>Delivery / Pickup:</strong> {order.deliveryType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center text-[rgb(75,85,99)] -mt-32">
            <Image src="/images/History.jpg" alt="No Orders" width={200} height={200} />
            <p className="mt-4 text-sm italic">--No orders available here--</p>
          </div>
        )}
      </main>

      {selectedOrder && (
        <div className="absolute inset-0 bg-[rgba(255,255,255,0.5)] backdrop-blur-sm flex justify-end items-start z-30">
          <div className="relative bg-[rgb(255,255,255)] rounded-l-xl w-full max-w-5xl h-full p-8 overflow-y-auto shadow-2xl animate-slideInRight">
            <button
              className="absolute top-4 right-4 text-[rgb(75,85,99)] hover:text-[rgb(0,0,0)] text-lg font-bold"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>
            {selectedOrder.deliveryType.toLowerCase() === 'pickup' ? (
              <PickupOrderView order={selectedOrder} />
            ) : (
              <DeliveryOrderView order={selectedOrder} />
            )}
          </div>
        </div>
      )}

      {selectedInvoice !== null && (
        <div className="fixed inset-0 bg-[rgba(255,255,255,0.5)] backdrop-blur-sm flex justify-end z-30 h-screen">
          <div
            ref={modalContentRef}
            className="relative bg-[rgb(255,255,255)] rounded-l-xl w-full max-w-5xl h-full p-8 overflow-y-auto shadow-2xl animate-slideInRight"
          >
            <InvoiceView
              invoice={selectedInvoice}
              onClose={() => setSelectedInvoice(null)}
              // invoiceRef={invoiceRef}
              invoiceRef={invoiceRef as RefObject<HTMLDivElement>}

            />
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

function PickupOrderView({ order }: { order: DetailedOrder }) {
  const familyPackTotal = order.familyPackItems?.reduce(
    (sum, pack) => sum + parseFloat(pack.totalPrice.replace('Rs. ', '') || '0'),
    0
  ).toFixed(2) || '0.00';
  const additionalItemsTotal = order.additionalItems?.reduce(
    (sum, item) => sum + parseFloat(item.price.replace('Rs. ', '') || '0') * item.quantity,
    0
  ).toFixed(2) || '0.00';
  const totalPrice = (parseFloat(familyPackTotal) + parseFloat(additionalItemsTotal)).toFixed(2);

  return (
    <div className="w-full">
     <div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-bold text-[rgb(31,41,55)] flex items-center gap-5">
    <span className="text-[rgb(107,114,128)]">⟶</span>
    <span>Order ID: #{order.orderId}</span>
  </h2>
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
    {order.status}
  </span>
</div>
      <div className="border-t border-[rgb(0,0,0)] mb-4 mt-4" />
      <div className="grid grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Order Placed:</h4>
          <p className="font-semibold">{order.orderPlaced || 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Scheduled Date:</h4>
          <p className="font-semibold">{order.scheduleDate || 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Scheduled Time:</h4>
          <p className="font-semibold">{order.scheduleTime || 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Delivery / Pickup:</h4>
          <p className="font-semibold">{order.deliveryType || 'N/A'}</p>
        </div>
      </div>
      <div className="border-t border-[rgb(229,231,235)] mb-4" />
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-[rgb(31,41,55)]">Pickup Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1 text-sm text-[rgb(31,41,55)]">
            <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Centre:</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-semibold">{order.pickupInfo?.centerName || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm items-center">
                <span>{order.pickupInfo?.buildingNumber || 'N/A'}</span>
                <span>{order.pickupInfo?.street || 'N/A'}</span>
                <span>{order.pickupInfo?.city || 'N/A'}</span>
                <span>{order.pickupInfo?.district || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Pickup Person Information:</h4>
            <p className="font-semibold">{order.pickupInfo?.fullName || 'N/A'}</p>
            <h4 className="font-medium mb-1 mt-1">{order.pickupInfo?.contact01 || 'N/A'}</h4>
          </div>
        </div>
      </div>
      <div className="border-[rgb(229,231,235)] mb-8" />
      <div className="mb-4">
        <div className="mb-4" style={{ border: '1px solid rgb(215,215,215)', borderRadius: '0.5rem' }}>
          <table className="w-full text-sm">
            <tbody>
              <tr className="w-full border-b border-[rgb(229,231,235)]" style={{ backgroundColor: 'rgb(248,248,248)' }}>
                <td colSpan={3} className="font-semibold text-[rgb(31,41,55)] py-2 p-4">
                  Ordered Items
                </td>
                <td className="text-right font-semibold py-2 p-4" style={{ color: 'rgb(62,32,109)', fontSize: '16px' }}>
                  Total Price: Rs. {totalPrice}
                </td>
              </tr>
              <tr className="border-b border-[rgb(229,231,235)]">
                <td colSpan={3} className="font-medium py-2 p-4">
                  Family Pack for 2 ({order.familyPackItems?.reduce((sum, pack) => sum + (pack.items?.length || 0), 0) || 0} Items)
                </td>
                <td className="text-right font-semibold py-2 p-4" style={{ color: 'rgb(62,32,109)' }}>
                  Rs. {familyPackTotal}
                </td>
              </tr>
              <tr className={order.additionalItems && order.additionalItems.length > 0 ? 'border-b border-[rgb(229,231,235)]' : ''}>
                <td colSpan={4} className="py-2">
                  {order.familyPackItems && order.familyPackItems.length > 0 ? (
                    <table className="max-w-[600px] w-full p-4">
                      <tbody>
                        {order.familyPackItems.flatMap((pack, packIndex) =>
                          pack.items.map((item, itemIndex) => (
                            <tr key={`${packIndex}-${itemIndex}`} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 text-sm items-center py-3">
                              <td className="flex justify-center"></td>
                              <td>{item.name}</td>
                              <td>{item.quantity}{item.weight}</td>
                              <td>{item.price}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-[rgb(75,85,99)] py-2 p-4">No family pack items available.</p>
                  )}
                </td>
              </tr>
              {order.additionalItems && order.additionalItems.length > 0 && (
                <tr className="border-b border-[rgb(229,231,235)]">
                  <td colSpan={3} className="font-medium py-2 p-4">
                    Additional Items ({order.additionalItems.length} Items)
                  </td>
                  <td className="text-right font-semibold py-2 p-4" style={{ color: 'rgb(62,32,109)' }}>
                    Rs. {additionalItemsTotal}
                  </td>
                </tr>
              )}
              {order.additionalItems && order.additionalItems.length > 0 && (
                <tr>
                  <td colSpan={4} className="py-2">
                    <table className="max-w-[600px] w-full p-4">
                      <tbody>
                        {order.additionalItems.map((item, index) => (
                          <tr key={index} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 text-sm items-center py-3">
                            <td className="flex justify-center"></td>
                            <td>{item.name}</td>
                            <td>{item.quantity}{item.weight}</td>
                            <td>{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {order.discount && order.discount !== 'Rs. 0.00' && (
            <p className="text-[rgb(22,163,74)] text-right mt-2">You have saved {order.discount} with us!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DeliveryOrderView({ order }: { order: DetailedOrder }) {
  const familyPackTotal = order.familyPackItems?.reduce(
    (sum, pack) => sum + parseFloat(pack.totalPrice.replace('Rs. ', '') || '0'),
    0
  ).toFixed(2) || '0.00';
  const additionalItemsTotal = order.additionalItems?.reduce(
    (sum, item) => sum + parseFloat(item.price.replace('Rs. ', '') || '0') * item.quantity,
    0
  ).toFixed(2) || '0.00';
  const totalPrice = (parseFloat(familyPackTotal) + parseFloat(additionalItemsTotal)).toFixed(2);

  return (
    <div className="w-full">
   <div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-bold text-[rgb(31,41,55)] flex items-center gap-5">
    <span className="text-[rgb(107,114,128)]">⟶</span>
    <span>Order ID: #{order.orderId}</span>
  </h2>
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
    {order.status}
  </span>
</div>
      <div className="border-t border-[rgb(0,0,0)] mb-4 mt-4"></div>
      <div className="grid grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Order Placed:</h4>
          <p className="font-semibold">{order.orderPlaced || 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Scheduled Date:</h4>
          <p className="font-semibold">{order.scheduleDate || 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Scheduled Time:</h4>
          <p className="font-semibold">{order.scheduleTime || 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Delivery / Pickup:</h4>
          <p className="font-semibold">{order.deliveryType || 'N/A'}</p>
        </div>
      </div>
      <div className="border-t border-[rgb(229,231,235)] mb-4"></div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-[rgb(31,41,55)]">Delivery Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1 text-sm text-[rgb(31,41,55)]">
            <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Address:</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-semibold">{order.deliveryInfo?.buildingType || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-[rgb(146,146,146)]">No:</span>
                <span>{order.deliveryInfo?.buildingNo || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-[rgb(146,146,146)]">Name:</span>
                <span>{order.deliveryInfo?.buildingName || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-[rgb(146,146,146)]">Flat:</span>
                <span>{order.deliveryInfo?.flatNo || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-[rgb(146,146,146)]">Floor:</span>
                <span>{order.deliveryInfo?.floorNo || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-[rgb(146,146,146)]">House No:</span>
                <span>{order.deliveryInfo?.houseNo || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-[rgb(146,146,146)]">Street:</span>
                <span>{order.deliveryInfo?.street || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-[rgb(146,146,146)]">City:</span>
                <span>{order.deliveryInfo?.city || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Receiving Person Information:</h4>
            <p className="font-semibold">{order.fullName || 'N/A'}</p>
            <p>{order.phone1 ? `+${order.phonecode1 || ''} ${order.phone1}` : 'N/A'}</p>
          </div>
        </div>
      </div>
      <div className="border-[rgb(229,231,235)] mb-8"></div>
      <div className="mb-4" style={{ borderColor: 'rgb(215,215,215)' }}>
        <div className="mb-4" style={{ border: '1px solid rgb(215,215,215)', borderRadius: '0.5rem' }}>
          <table className="w-full text-sm" style={{ borderColor: 'rgb(215,215,215)' }}>
            <tbody>
              <tr className="w-full border-b border-[rgb(229,231,235)]" style={{ backgroundColor: 'rgb(248,248,248)' }}>
                <td colSpan={3} className="font-semibold text-[rgb(31,41,55)] py-2 p-4">
                  Ordered Items
                </td>
                <td className="text-right font-semibold py-2 p-4" style={{ color: 'rgb(62,32,109)', fontSize: '16px' }}>
                  Total Price: Rs. {totalPrice}
                </td>
              </tr>
              <tr className="border-b border-[rgb(229,231,235)]">
                <td colSpan={3} className="font-medium py-2 p-4">
                  Family Pack for 2 ({order.familyPackItems?.reduce((sum, pack) => sum + (pack.items?.length || 0), 0) || 0} Items)
                </td>
                <td className="text-right font-semibold py-2 p-4" style={{ color: 'rgb(62,32,109)' }}>
                  Rs. {familyPackTotal}
                </td>
              </tr>
              <tr className={order.additionalItems && order.additionalItems.length > 0 ? 'border-b border-[rgb(229,231,235)]' : ''}>
                <td colSpan={4} className="py-2">
                  {order.familyPackItems && order.familyPackItems.length > 0 ? (
                    <table className="max-w-[600px] w-full p-4">
                      <tbody>
                        {order.familyPackItems.flatMap((pack, packIndex) =>
                          pack.items.map((item, itemIndex) => (
                            <tr key={`${packIndex}-${itemIndex}`} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 text-sm items-center py-3">
                              <td className="flex justify-center"></td>
                              <td>{item.name}</td>
                              <td>{item.quantity}{item.weight}</td>
                              <td>{item.price}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-[rgb(75,85,99)] py-2 p-4">No family pack items available.</p>
                  )}
                </td>
              </tr>
             {order.additionalItems && order.additionalItems.length > 0 && (
  <tr className="border-b border-[rgb(229,231,235)]">
    <td colSpan={3} className="font-medium py-2 p-4">
      Additional Items ({order.additionalItems.length} Items)
    </td>
    <td className="text-right font-semibold py-2 p-4">
      <div className="flex justify-end items-center gap-2">
        {order.discount && order.discount !== 'Rs. 0.00' && (
          <span className="text-xs font-normal" style={{color: 'rgb(62,32,109)'}}>
            You have saved {order.discount} with us!
          </span>
        )}
        <span style={{ color: 'rgb(62,32,109)' }}>
          Rs. {additionalItemsTotal}
        </span>
      </div>
    </td>
  </tr>
)}
              {order.additionalItems && order.additionalItems.length > 0 && (
                <tr>
                  <td colSpan={4} className="py-2">
                    <table className="max-w-[600px] w-full p-4">
                      <tbody>
                        {order.additionalItems.map((item, index) => (
                          <tr key={index} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 text-sm items-center py-3">
                            <td className="flex justify-center"></td>
                            <td>{item.name}</td>
                            <td>{item.quantity}{item.weight}</td>
                            <td>{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
         
        </div>
      </div>
    </div>
  );
}

export { PickupOrderView, DeliveryOrderView }; 