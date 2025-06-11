
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { FaAngleDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getOrderHistory, getOrderDetails } from '@/services/retail-order-service';
import { useRouter } from 'next/navigation';

// Define interfaces based on the API responses
interface DetailedItem {
  id: number;
  name: string;
  weight: string;
  price: string;
  quantity: string;
  unit: string;
  image?: string;
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
  phonecode2?: string;
  phone2?: string;
  pickupInfo?: PickupInfo;
  deliveryInfo?: DeliveryInfo;
  familyPackItems?: DetailedPackage[];
  additionalItems?: DetailedItem[];
  discount?: string;
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

export default function OrderHistoryPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const HEADER_HEIGHT = 64;
  const FOOTER_HEIGHT = 64;

  useEffect(() => {
    if (!token) {
      console.error('Token not found in Redux store at 12:03 PM +0530, June 06, 2025');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrderHistory(token);
        console.log('API Response at 12:03 PM +0530, June 06, 2025:', data);

        const orderHistory = data.orderHistory || [];
        if (!Array.isArray(orderHistory)) {
          console.error('orderHistory is not an array at 12:03 PM +0530, June 06, 2025:', orderHistory);
          setOrders([]);
          return;
        }

        const normalizedOrders: OrderSummary[] = orderHistory.map((order: any) => ({
          orderId: order.orderId ? String(order.orderId) : 'N/A',
          scheduleDate: order.scheduleDate ? formatDateTime(order.scheduleDate, 'date') : 'N/A',
          scheduleTime: order.scheduleTime || 'N/A',
          deliveryType: order.delivaryMethod || 'N/A',
          total: order.fullTotal ? `Rs. ${parseFloat(order.fullTotal || '0').toFixed(2)}` : 'Rs. 0.00',
          orderPlaced: order.createdAt ? formatDateTime(order.createdAt, 'date') : 'N/A',
          status: order.processStatus || 'Pending',
        }));

        setOrders(normalizedOrders);
      } catch (err) {
        console.error('Error fetching orders at 12:03 PM +0530, June 06, 2025:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  useEffect(() => {
    if (selectedOrder && modalContentRef.current && mainRef.current) {
      const modalHeight = modalContentRef.current.scrollHeight;
      mainRef.current.style.minHeight = `${modalHeight}px`;
      mainRef.current.style.overflowY = 'auto';
    } else if (mainRef.current) {
      mainRef.current.style.minHeight = '';
      mainRef.current.style.overflowY = 'auto';
    }
  }, [selectedOrder]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilter(event.target.value);
  };

  const fetchDetailedOrder = async (orderId: string): Promise<void> => {
    if (!token) return;
    try {
      setSelectedOrder(null);
      const { order: orderData, packages: packagesData, additionalItems: additionalItemsData } = await getOrderDetails(token, orderId);
      console.log('Detailed Order Response at 12:03 PM +0530, June 06, 2025:', { orderData, packagesData, additionalItemsData });

      if (orderData.status && orderData.order) {
        const apiOrder = orderData.order;
        const additionalItemsDiscount = additionalItemsData.status && additionalItemsData.data
          ? additionalItemsData.data.reduce((sum: number, item: any) => sum + parseFloat(item.discount || '0'), 0)
          : 0;
        const totalDiscount = parseFloat(apiOrder.discount || '0') + additionalItemsDiscount;

        const detailedOrder: DetailedOrder = {
          orderId: String(apiOrder.id) || 'N/A',
          scheduleDate: apiOrder.sheduleDate ? formatDateTime(apiOrder.sheduleDate, 'date') : 'N/A',
          scheduleTime: apiOrder.sheduleTime || 'N/A',
          deliveryType: apiOrder.delivaryMethod || 'N/A',
          total: apiOrder.fullTotal ? `Rs. ${parseFloat(apiOrder.fullTotal || '0').toFixed(2)}` : 'Rs. 0.00',
          orderPlaced: apiOrder.createdAt ? formatDateTime(apiOrder.createdAt, 'date') : 'N/A',
          status: apiOrder.processStatus || 'Pending',
          fullName: apiOrder.fullName || 'N/A',
          phonecode1: apiOrder.phonecode1 || 'N/A',
          phone1: apiOrder.phone1 || 'N/A',
          phonecode2: apiOrder.phonecode2 || 'N/A',
          phone2: apiOrder.phone2 || 'N/A',
          pickupInfo:
            apiOrder.delivaryMethod?.toLowerCase() === 'pickup' && apiOrder.pickupInfo
              ? {
                  centerName: apiOrder.pickupInfo.centerName || 'N/A',
                  contact01: apiOrder.pickupInfo.contact01 || 'N/A',
                  fullName: apiOrder.pickupInfo.fullName || 'N/A',
                  buildingNumber: apiOrder.pickupInfo.address?.street || 'N/A',
                  street: apiOrder.pickupInfo.address?.street || 'N/A',
                  city: apiOrder.pickupInfo.address?.city || 'N/A',
                  district: apiOrder.pickupInfo.address?.district || 'N/A',
                  province: apiOrder.pickupInfo.address?.province || 'N/A',
                  country: apiOrder.pickupInfo.address?.country || 'N/A',
                  zipCode: apiOrder.pickupInfo.address?.zipCode || 'N/A',
                }
              : undefined,
          deliveryInfo:
            apiOrder.delivaryMethod?.toLowerCase() === 'delivery' && apiOrder.deliveryInfo
              ? {
                  buildingType: apiOrder.deliveryInfo.buildingType || 'N/A',
                  houseNo: apiOrder.deliveryInfo.houseNo || 'N/A',
                  street: apiOrder.deliveryInfo.streetName || 'N/A',
                  city: apiOrder.deliveryInfo.city || 'N/A',
                  buildingNo: apiOrder.deliveryInfo.buildingNo || 'N/A',
                  buildingName: apiOrder.deliveryInfo.buildingName || 'N/A',
                  flatNo: apiOrder.deliveryInfo.unitNo || 'N/A',
                  floorNo: apiOrder.deliveryInfo.floorNo || 'N/A',
                }
              : undefined,
          familyPackItems: packagesData.status && packagesData.data
            ? packagesData.data.map((pack: any, index: number) => ({
                packageId: `${pack.packageId}_${index}`,
                name: pack.displayName || 'Family Pack',
                items: pack.products?.map((item: any) => ({
                  id: item.id || 0,
                  name: item.typeName || 'Unknown',
                  weight: item.weight || '1 kg',
                  price: item.price ? `Rs. ${parseFloat(item.price || '0').toFixed(2)}` : 'Rs. 0.00',
                  quantity: item.qty ? String(item.qty).padStart(2, '0') : '01',
                })) || [],
                totalPrice: pack.productPrice || 'Rs. 0.00',
              }))
            : [],
          additionalItems: additionalItemsData.status && additionalItemsData.data
            ? additionalItemsData.data.map((item: any) => ({
                id: item.id || 0,
                name: item.displayName || 'Unknown',
                quantity: String(item.qty || 1).padStart(2, '0'),
                unit: item.unit || 'kg',
                weight: `${item.qty || '1'} ${item.unit || 'kg'}`,
                price: item.price ? `Rs. ${parseFloat(item.price || '0').toFixed(2)}` : 'Rs. 0.00',
                image: item.image || undefined,
                amount: item.price && item.qty
                  ? `Rs. ${(parseFloat(item.price) * parseFloat(item.qty)).toFixed(2)}`
                  : 'Rs. 0.00',
              }))
            : [],
          discount: totalDiscount > 0 ? `Rs. ${totalDiscount.toFixed(2)}` : 'Rs. 0.00',
        };
        setSelectedOrder(detailedOrder);
      }
    } catch (err) {
      console.error('Error fetching detailed order at 12:03 PM +0530, June 06, 2025:', err);
      setSelectedOrder(null);
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
                      onClick={() => router.push(`/history/invoice?orderId=${order.orderId}`)}
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
                      onClick={() => router.push(`/history/invoice?orderId=${order.orderId}`)}
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
          <div
            ref={modalContentRef}
            className="relative bg-[rgb(255,255,255)] rounded-l-xl w-full max-w-5xl h-full p-8 overflow-y-auto shadow-2xl animate-slideInRight"
          >
            {selectedOrder.deliveryType.toLowerCase() === 'pickup' ? (
              <PickupOrderView order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            ) : (
              <DeliveryOrderView order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PickupOrderView({ order, onClose }: { order: DetailedOrder, onClose: () => void }) {
  const familyPackTotal = order.familyPackItems?.reduce(
    (sum, pack) => sum + parseFloat(pack.totalPrice.replace('Rs. ', '') || '0'),
    0
  ).toFixed(2) || '0.00';
  const additionalItemsTotal = order.additionalItems?.reduce(
    (sum, item) => sum + parseFloat(item.price.replace('Rs. ', '') || '0') * parseFloat(item.quantity),
    0
  ).toFixed(2) || '0.00';
  const totalPrice = (parseFloat(familyPackTotal) + parseFloat(additionalItemsTotal)).toFixed(2);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[rgb(31,41,55)] flex items-center gap-5 cursor-pointer" onClick={onClose}>
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
            <p className="font-semibold">{order.fullName || 'N/A'}</p>
            <p>{order.phone1 ? `+${order.phonecode1 || ''} ${order.phone1}` : 'N/A'},{order.phone2 ? `+${order.phonecode2 || ''} ${order.phone2}` : 'N/A'}</p>
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
              {order.familyPackItems && order.familyPackItems.length > 0 ? (
                order.familyPackItems.map((pack, packIndex) => (
                  <React.Fragment key={packIndex}>
                    <tr className="border-b border-t border-[rgb(229,231,235)]">
                      <td colSpan={3} className="font-medium py-2 p-4">
                        {pack.name} ({pack.items?.length || 0} items)
                      </td>
                    <td className="text-right font-semibold py-2 p-4" style={{ color: 'rgb(62,32,109)' }}>
                        Rs. {parseFloat(pack.totalPrice.replace('Rs. ', '') || '0').toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2">
                        <table className="max-w-[600px] w-full p-4">
                          <tbody>
                            {pack.items.map((item, itemIndex) => (
                              <tr key={`${packIndex}-${itemIndex}`} className="grid grid-cols-[1fr_1fr_1fr] gap-8 text-sm items-center py-4 ml-6">
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-[rgb(75,85,99)] py-2 p-4">
                    No family pack items available.
                  </td>
                </tr>
              )}
              {order.additionalItems && order.additionalItems.length > 0 && (
                <>
                  <tr className="border-b border-t border-[rgb(229,231,235)]">
                    <td colSpan={3} className="font-medium py-2 p-4">
                      Additional Items ({order.additionalItems.length} Items)
                    </td>
                    <td className="text-right font-semibold py-2 p-4">
                      <div className="flex justify-end items-center gap-2">
                        {order.discount && order.discount !== 'Rs. 0.00' && (
                          <span className="text-xs font-normal" style={{ color: 'rgb(62,32,109)' }}>
                            You have saved {order.discount} with us!
                          </span>
                        )}
                        <span style={{ color: 'rgb(62,32,109)' }}>
                          Rs. {additionalItemsTotal}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="py-2">
                      <table className="max-w-[600px] w-full p-4">
                        <tbody>
                          {order.additionalItems.map((item, index) => (
                            <tr key={index} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 text-sm items-center py-3">
                              <td className="flex justify-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-20 h-10 object-cover rounded" />
                                ) : (
                                  <div className="w-20 h-10 bg-gray-200 rounded flex items-center" />
                                )}
                              </td>
                              <td>{item.name}</td>
                              <td>{item.quantity}{item.unit}</td>
                              <td>{item.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DeliveryOrderView({ order, onClose }: { order: DetailedOrder, onClose: () => void }) {
  const familyPackTotal = order.familyPackItems?.reduce(
    (sum, pack) => sum + parseFloat(pack.totalPrice.replace('Rs. ', '') || '0'),
    0
  ).toFixed(2) || '0.00';
  const additionalItemsTotal = order.additionalItems?.reduce(
    (sum, item) => sum + parseFloat(item.price.replace('Rs. ', '') || '0') * parseFloat(item.quantity),
    0
  ).toFixed(2) || '0.00';
  const totalPrice = (parseFloat(familyPackTotal) + parseFloat(additionalItemsTotal)).toFixed(2);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[rgb(31,41,55)] flex items-center gap-5 cursor-pointer" onClick={onClose}>
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
              {order.deliveryInfo?.buildingType === 'Apartment' && (
                <>
                  <div className="flex gap-2">
                    <span className="font-medium text-[rgb(146,146,146)]">Building No:</span>
                    <span>{order.deliveryInfo?.buildingNo || 'N/A'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-[rgb(146,146,146)]">Building Name:</span>
                    <span>{order.deliveryInfo?.buildingName || 'N/A'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-[rgb(146,146,146)]">Floor:</span>
                    <span>{order.deliveryInfo?.floorNo || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-[rgb(55,65,81)] mb-1">Receiving Person Information:</h4>
            <p className="font-semibold">{order.fullName || 'N/A'}</p>
            <p>{order.phone1 ? `+${order.phonecode1 || ''} ${order.phone1}` : 'N/A'},{order.phone2 ? `+${order.phonecode2 || ''} ${order.phone2}` : 'N/A'}</p>
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
              {order.familyPackItems && order.familyPackItems.length > 0 ? (
                order.familyPackItems.map((pack, packIndex) => (
                  <React.Fragment key={packIndex}>
                    <tr className="border-b border-t border-[rgb(229,231,235)]">
                      <td colSpan={3} className="font-medium py-2 p-4">
                        {pack.name} ({pack.items?.length || 0} Items)
                      </td>
                      <td className="text-right font-semibold py-2 p-4" style={{ color: 'rgb(62,32,109)' }}>
                        Rs. {parseFloat(pack.totalPrice.replace('Rs. ', '') || '0').toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2">
                        <table className="max-w-[600px] w-full p-4">
                          <tbody>
                            {pack.items.map((item, itemIndex) => (
                              <tr key={`${packIndex}-${itemIndex}`} className="grid grid-cols-[1fr_1fr_1fr] gap-8 text-sm items-center py-4 ml-6">
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-[rgb(75,85,99)] py-2 p-4">
                    No family pack items available.
                  </td>
                </tr>
              )}
              {order.additionalItems && order.additionalItems.length > 0 && (
                <>
                  <tr className="border-b border-t border-[rgb(229,231,235)]">
                    <td colSpan={3} className="font-medium py-2 p-4">
                      Additional Items ({order.additionalItems.length} Items)
                    </td>
                    <td className="text-right font-semibold py-2 p-4">
                      <div className="flex justify-end items-center gap-2">
                        {order.discount && order.discount !== 'Rs. 0.00' && (
                          <span className="text-xs font-normal" style={{ color: 'rgb(62,32,109)' }}>
                            You have saved {order.discount} with us!
                          </span>
                        )}
                        <span style={{ color: 'rgb(62,32,109)' }}>
                          Rs. {additionalItemsTotal}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="py-2">
                      <table className="max-w-[600px] w-full p-4">
                        <tbody>
                          {order.additionalItems.map((item, index) => (
                            <tr key={index} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 text-sm items-center py-3">
                              <td className="flex justify-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-20 h-10 object-cover rounded" />
                                ) : (
                                  <div className="w-20 h-10 bg-gray-200 rounded flex items-center" />
                                )}
                              </td>
                              <td>{item.name}</td>
                              <td>{item.quantity}{item.unit}</td>
                              <td>{item.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}