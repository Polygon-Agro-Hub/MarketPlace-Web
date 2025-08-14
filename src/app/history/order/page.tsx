
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { FaAngleDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getOrderHistory, getOrderDetails } from '@/services/retail-order-service';
import { useRouter } from 'next/navigation';
import Select, { ActionMeta, SingleValue } from 'react-select'; // Import react-select
import Loader from '@/components/loader-spinner/Loader';


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
  invoiceNo: string;
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
  invoiceNo: string;
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
      return 'bg-[#FFE9E2] text-[#FF5A00]';
    case 'processing':
      return 'bg-[#CFE1FF] text-[#3B82F6]';
    case 'on the way':
      return 'bg-[#F2DDFF] text-[#3E206D]';
    case 'delivered':
      return 'bg-[#DCFCE7] text-[#16A34A]';
    case 'cancelled':
      return 'bg-[#FEE2E2] text-[#DC2626]';
    case 'one time':
      return 'bg-[#DBEAFE] text-[#2563EB]';
    default:
      return 'bg-[#F3F4F6] text-[#4B5563]';
  }
};



// Define filter options for react-select
const filterOptions = [
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'last-2-weeks', label: 'Last 2 Weeks' },
  { value: 'this-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'all', label: 'All' },
];

export default function OrderHistoryPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('this-week');
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const HEADER_HEIGHT = 64;
  const FOOTER_HEIGHT = 64;

  useEffect(() => {
    if (!token) {
      console.error('Token not found in Redux store at 04:37 PM +0530, July 07, 2025');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrderHistory(token);
        console.log('API Response at 04:37 PM +0530, July 07, 2025:', data);

        const orderHistory = data.orderHistory || [];
        if (!Array.isArray(orderHistory)) {
          console.error('orderHistory is not an array at 04:37 PM +0530, July 07, 2025:', orderHistory);
          setOrders([]);
          return;
        }

        const normalizedOrders: OrderSummary[] = orderHistory.map((order: any) => ({
          orderId: order.orderId ? String(order.orderId) : 'N/A',
          invoiceNo: order.invoiceNo ? String(order.invoiceNo) : 'N/A',
          scheduleDate: order.scheduleDate ? formatDateTime(order.scheduleDate, 'date') : 'N/A',
          scheduleTime: order.scheduleTime || 'N/A',
          deliveryType: order.delivaryMethod || 'N/A',
          total: order.fullTotal || 'N/A',
          orderPlaced: order.createdAt ? formatDateTime(order.createdAt, 'date') : 'N/A',
          status: order.processStatus || 'Pending',
        }));

        setOrders(normalizedOrders);
      } catch (err) {
        console.error('Error fetching orders at 04:37 PM +0530, July 07, 2025:', err);
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

  const fetchDetailedOrder = async (orderId: string) => {
    if (!token) return;
    try {
      setIsFetchingDetails(true); // Start loading
      setSelectedOrder(null);
      const { order: orderData, packages: packagesData, additionalItems: additionalItemsData } = await getOrderDetails(token, orderId);
      console.log('Detailed Order Response at 04:32 PM +0530, July 07, 2025:', { orderData, packagesData, additionalItemsData });

      if (orderData.status && orderData.order) {
        const apiOrder = orderData.order;
        const additionalItemsDiscount = additionalItemsData.status && additionalItemsData.data
          ? additionalItemsData.data.reduce((sum: number, item: any) => sum + parseFloat(item.discount || '0'), 0)
          : 0;
        const totalDiscount = parseFloat(apiOrder.discount || '0') + additionalItemsDiscount;

        const detailedOrder: DetailedOrder = {
          orderId: String(apiOrder.id) || 'N/A',
          invoiceNo: String(apiOrder.invoiceNo) || 'N/A',
          scheduleDate: apiOrder.sheduleDate ? formatDateTime(apiOrder.sheduleDate, 'date') : 'N/A',
          scheduleTime: apiOrder.sheduleTime || 'N/A',
          deliveryType: apiOrder.delivaryMethod || 'N/A',
          total: apiOrder.fullTotal ? `Rs. ${parseFloat(apiOrder.fullTotal || '0').toFixed(2)}` : 'Rs. 0.00',
          orderPlaced: apiOrder.createdAt ? formatDateTime(apiOrder.createdAt, 'date') : 'N/A',
          status: apiOrder.processStatus || 'Pending',
          fullName: apiOrder.fullName || 'N/A',
          phonecode1: apiOrder.phonecode1 || '',
          phone1: apiOrder.phone1 || '',
          phonecode2: apiOrder.phonecode2 || '',
          phone2: apiOrder.phone2 || '',
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
      console.error('Error fetching detailed order at 04:32 PM +0530, July 07, 2025:', err);
      setSelectedOrder(null);
    } finally {
      setIsFetchingDetails(false); // Stop loading
    }
  };



  const filteredOrders = filter === 'all' ? orders : orders.filter((order) => {
    const orderDate = new Date(order.orderPlaced !== 'N/A' ? order.orderPlaced : order.scheduleDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay()); // Sunday

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const startOfLast2Weeks = new Date(startOfThisWeek);
    startOfLast2Weeks.setDate(startOfThisWeek.getDate() - 14);

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    switch (filter) {
      case 'this-week':
        return orderDate >= startOfThisWeek && orderDate <= today;
      case 'last-week':
        return orderDate >= startOfLastWeek && orderDate < startOfThisWeek;
      case 'last-2-weeks':
        return orderDate >= startOfLast2Weeks && orderDate < startOfThisWeek;
      case 'this-month':
        return orderDate >= oneMonthAgo && orderDate <= today;
      case 'last-3-months':
        return orderDate >= threeMonthsAgo && orderDate <= today;
      default:
        return true;
    }
  });

  const handleFilterChange = (
    newValue: SingleValue<{ value: string; label: string }>,
    actionMeta: ActionMeta<{ value: string; label: string }>
  ): void => {
    if (newValue) {
      console.log('Filter changed to:', newValue.value, 'at 06:25 PM +0530, June 27, 2025');
      setFilter(newValue.value);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[rgb(255,255,255)] relative">
      <Loader isVisible={loading} />
      <main ref={mainRef} className="flex-1 p-6 z-10 min-h-screen">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center text-[rgb(75,85,99)]">
            <Loader isVisible={loading} />
          </div>
        ) : (
          <>
            <div className="flex flex-row justify-between items-center mb-6 space-x-2 lg:mx-[72px]">
              <h1 className="text-sm lg:text-xl font-bold">
                Your Orders ({filteredOrders.length.toString().padStart(2, '0')})
              </h1>
              <div className="relative w-[140px] sm:w-[180px]">
                <Select
                  instanceId="order-history-filter"
                  options={filterOptions}
                  value={filterOptions.find((option) => option.value === filter)}
                  onChange={handleFilterChange}
                  className="text-xs lg:text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: '1px solid rgb(206,206,206)',
                      borderRadius: '0.25rem',
                      height: '36px',
                      backgroundColor: 'rgb(248,248,248)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center',
                      paddingRight: '1.5rem',
                      boxShadow: 'none',
                      ':hover': {
                        borderColor: 'rgb(62,32,109)',
                        backgroundColor: 'rgb(243,244,246)',
                      },
                    }),
                    option: (base, { isFocused }) => ({
                      ...base,
                      cursor: 'pointer',
                      backgroundColor: isFocused ? 'rgb(243,244,246)' : 'white',
                      color: 'rgb(31,41,55)',
                      textAlign: 'center',
                      padding: '8px 12px',
                    }),
                    menu: (base) => ({
                      ...base,
                      marginTop: '0',
                      borderRadius: '0.25rem',
                      textAlign: 'center',
                      width: '100%',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      textAlign: 'center',
                      width: '100%',
                      color: 'rgb(31,41,55)',


                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: 'rgb(107,114,128)',
                      paddingRight: '8px',
                    }),
                  }}
                  components={{
                    DropdownIndicator: () => (
                      <FaAngleDown className="text-[rgb(107,114,128)] text-xs lg:text-sm" />
                    ),
                    IndicatorSeparator: () => null,
                  }}
                />
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
                        <p className="font-medium">#{order.invoiceNo}</p>
                      </div>
                      <div />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => fetchDetailedOrder(order.orderId)}
                          className="bg-[rgb(255,255,255)] border text-xs lg:text-sm cursor-pointer border-[rgb(209,213,219)] rounded-lg px-4 py-1.5 hover:bg-[rgb(62,32,109)] hover:text-[rgb(255,255,255)]"
                          disabled={isFetchingDetails}
                        >
                          View Order
                        </button>
                        <button
                          onClick={() => router.push(`/history/invoice?orderId=${order.orderId}`)}
                          className="bg-[rgb(255,255,255)] border text-xs lg:text-sm cursor-pointer border-[rgb(209,213,219)] rounded-lg px-4 py-1.5 hover:bg-[rgb(62,32,109)] hover:text-[rgb(255,255,255)]"
                          disabled={isFetchingDetails}
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
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => fetchDetailedOrder(order.orderId)}
                          className="bg-[rgb(255,255,255)] border text-xs cursor-pointer border-[rgb(209,213,219)] rounded-lg px-4 py-1.5 hover:bg-[rgb(62,32,109)] hover:text-[rgb(255,255,255)]"
                          disabled={isFetchingDetails}
                        >
                          View Order
                        </button>
                        <button
                          onClick={() => router.push(`/history/invoice?orderId=${order.orderId}`)}
                          className="bg-[rgb(255,255,255)] border text-xs cursor-pointer border-[rgb(209,213,219)] rounded-lg px-4 py-1.5 hover:bg-[rgb(62,32,109)] hover:text-[rgb(255,255,255)]"
                          disabled={isFetchingDetails}
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
                        <span className={`ml-2 px-2 py-0.5 rounded-full ${getStatusClass(order.status)}`}>
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
                <Image src="/images/History.jpg" alt="No

 Orders" width={200} height={200} />
                <p className="mt-4 text-sm italic">--No orders available here--</p>
              </div>
            )}
          </>
        )}
      </main>

      {(selectedOrder || isFetchingDetails) && (
        <div className="absolute inset-0 bg-[rgba(255,255,255,0.5)] backdrop-blur-sm flex justify-end items-start z-30">
          <div
            ref={modalContentRef}
            className="relative bg-[rgb(255,255,255)] sm:rounded-l-xl w-full max-w-5xl h-full sm:p-8 overflow-y-auto shadow-2xl animate-slideInRight"
          >
            <Loader isVisible={isFetchingDetails} />
            {selectedOrder && !isFetchingDetails && (
              <>
                {selectedOrder.deliveryType.toLowerCase() === 'pickup' ? (
                  <PickupOrderView order={selectedOrder} onClose={() => setSelectedOrder(null)} />
                ) : (
                  <DeliveryOrderView order={selectedOrder} onClose={() => setSelectedOrder(null)} />
                )}
              </>
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
      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-gray-600">
            <span className="text-xl">←</span>
          </button>
          <div className="text-center flex-1">
            <h2 className="text-lg font-semibold">Order ID : #{order.invoiceNo}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusClass(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Header - hidden on mobile */}
      <div className="hidden sm:flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[rgb(31,41,55)] flex items-center gap-5 cursor-pointer" onClick={onClose}>
          <span className="text-[rgb(107,114,128)]">⟶</span>
          <span>Order ID: #{order.invoiceNo}</span>
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Mobile Content */}
      <div className="sm:hidden bg-gray-50 min-h-screen p-4">
        {/* Order Details Grid */}
        <div className="bg-white p-4 space-y-4 text-sm border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 block">Order Placed :</span>
              <span className="font-semibold">{order.orderPlaced || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Scheduled Date :</span>
              <span className="font-semibold">{order.scheduleDate || 'N/A'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 block">Scheduled Time :</span>
              <span className="font-semibold">{order.scheduleTime || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Delivery / Pickup :</span>
              <span className="font-semibold">{order.deliveryType || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Pickup Information */}
        <div className="bg-white mt-2 p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-black">Pickup Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 block text-sm">Centre :</span>
              <div className="mt-1">
                <span className="font-semibold text-black">{order.pickupInfo?.centerName || 'N/A'}</span>
                <div className="text-sm text-gray-700 mt-1">
                  {order.pickupInfo?.city || 'N/A'}, {order.pickupInfo?.district || 'N/A'}, {order.pickupInfo?.province || 'N/A'}
                </div>
              </div>
            </div>
            <div>
              <span className="text-gray-600 block text-sm">Pickup Person Information :</span>
              <div className="mt-1">
                <span className="font-semibold text-black">{order.fullName || 'N/A'}</span>
                <div className="text-sm text-gray-700">
                  {order.phone1 ? `${order.phonecode1 || ''} ${order.phone1}` : ''}
                  {order.phone2 ? `, ${order.phonecode2 || ''} ${order.phone2}` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="bg-white mt-2 rounded-[15px] border border-gray-200 overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-[#F8F8F8] p-4 border-b border-gray-200">
            <div className="flex flex-col space-y-2">
              <span className="font-semibold text-black">Ordered Items</span>
              <span className="font-semibold text-[#3E206D] text-lg">Total Price : Rs. {totalPrice}</span>
            </div>
          </div>

          {/* Family Pack Items */}
          {order.familyPackItems && order.familyPackItems.length > 0 && (
            <div>
              {order.familyPackItems.map((pack, packIndex) => (
                <div key={packIndex} className="border-b border-gray-200 last:border-b-0">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-black">
                        {pack.name} ({pack.items?.length || 0} Items)
                      </span>
                      <span className="font-semibold text-[#3E206D]">
                        Rs. {parseFloat(pack.totalPrice.replace('Rs. ', '') || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {pack.items.map((item, itemIndex) => (
                        <div key={`${packIndex}-${itemIndex}`} className="flex justify-between items-center py-2">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-gray-600 font-medium">{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additional Items */}
          {order.additionalItems && order.additionalItems.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="p-4">
                  <div className="flex flex-col space-y-2 mb-2">
                    <span className="font-medium text-black">
                      Additional Items ({order.additionalItems.length} Items)
                    </span>
                    {order.discount && order.discount !== 'Rs. 0.00' && (
                      <div className="text-sm text-[#3E206D]">
                        You have saved {order.discount} with us!
                      </div>
                    )}
                    <span className="font-semibold text-[#3E206D]">
                      Rs. {additionalItemsTotal}
                    </span>
                  </div>
                <div className="space-y-4 mt-4">
                  {order.additionalItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 py-2">
                      <div className="w-12 h-12 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-orange-200 rounded flex items-center justify-center">
                            <span className="text-orange-600 text-xs">🥭</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black">{item.name}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">{item.quantity}{item.unit}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-black">{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Content - hidden on mobile */}
      <div className="hidden sm:block">
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
        {/* Rest of desktop content remains the same */}
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
              <div>
                <p>
                  {order.phone1
                    ? `${order.phonecode1 || ''} ${order.phone1}`
                    : ''}
                  {order.phone2
                    ? `, ${order.phonecode2 || ''} ${order.phone2}`
                    : ''}
                </p>
              </div>
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
                  <tr></tr>
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
      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-gray-600">
            <span className="text-xl">←</span>
          </button>
          <div className="text-center flex-1">
            <h2 className="text-lg font-semibold">Order ID : #{order.invoiceNo}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusClass(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Header - hidden on mobile */}
      <div className="hidden sm:flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[rgb(31,41,55)] flex items-center gap-5 cursor-pointer" onClick={onClose}>
          <span className="text-[rgb(107,114,128)]">⟶</span>
          <span>Order ID: #{order.invoiceNo}</span>
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Mobile Content */}
      <div className="sm:hidden bg-gray-50 min-h-screen p-4">
        {/* Order Details Grid */}
        <div className="bg-white p-4 space-y-4 text-sm border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 block">Order Placed :</span>
              <span className="font-semibold">{order.orderPlaced || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Scheduled Date :</span>
              <span className="font-semibold">{order.scheduleDate || 'N/A'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 block">Scheduled Time :</span>
              <span className="font-semibold">{order.scheduleTime || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Delivery / Pickup :</span>
              <span className="font-semibold">{order.deliveryType || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white mt-2 p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-black">Delivery Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 block text-sm">Address :</span>
              <div className="mt-1">
                <span className="font-semibold text-black">{order.deliveryInfo?.buildingType || 'N/A'}</span>
                <div className="text-sm text-gray-700 mt-1 space-y-1">
                  <div>House No: {order.deliveryInfo?.houseNo || 'N/A'}</div>
                  <div>Street: {order.deliveryInfo?.street || 'N/A'}</div>
                  <div>City: {order.deliveryInfo?.city || 'N/A'}</div>
                  {order.deliveryInfo?.buildingType === 'Apartment' && (
                    <>
                      <div>Building No: {order.deliveryInfo?.buildingNo || 'N/A'}</div>
                      <div>Building Name: {order.deliveryInfo?.buildingName || 'N/A'}</div>
                      <div>Floor: {order.deliveryInfo?.floorNo || 'N/A'}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              <span className="text-gray-600 block text-sm">Receiving Person Information :</span>
              <div className="mt-1">
                <span className="font-semibold text-black">{order.fullName || 'N/A'}</span>
                <div className="text-sm text-gray-700">
                  {order.phone1 ? `${order.phonecode1 || ''} ${order.phone1}` : ''}
                  {order.phone2 ? `, ${order.phonecode2 || ''} ${order.phone2}` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items - Mobile */}
        <div className="bg-white mt-2 rounded-[15px] border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex flex-col space-y-2">
              <span className="font-semibold text-black">Ordered Items</span>
              <span className="font-semibold text-[#3E206D] text-lg">Total Price : Rs. {totalPrice}</span>
            </div>
          </div>

          {/* Family Pack Items */}
          {order.familyPackItems && order.familyPackItems.length > 0 && (
            <div>
              {order.familyPackItems.map((pack, packIndex) => (
                <div key={packIndex} className="border-b border-gray-200 last:border-b-0">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-black">
                        {pack.name} ({pack.items?.length || 0} Items)
                      </span>
                      <span className="font-semibold text-[#3E206D]">
                        Rs. {parseFloat(pack.totalPrice.replace('Rs. ', '') || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {pack.items.map((item, itemIndex) => (
                        <div key={`${packIndex}-${itemIndex}`} className="flex justify-between items-center py-2">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-gray-600 font-medium">{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Additional Items */}
          {order.additionalItems && order.additionalItems.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="p-4">
                <div className="flex flex-col space-y-2 mb-2">
                  <span className="font-medium text-black">
                    Additional Items ({order.additionalItems.length} Items)
                  </span>
                  {order.discount && order.discount !== 'Rs. 0.00' && (
                    <div className="text-sm text-purple-700">
                      You have saved {order.discount} with us!
                    </div>
                  )}
                  <span className="font-semibold text-purple-700">
                    Rs. {additionalItemsTotal}
                  </span>
                </div>
                <div className="space-y-4 mt-4">
                  {order.additionalItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 py-2">
                      <div className="w-12 h-12 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-orange-200 rounded flex items-center justify-center">
                            <span className="text-orange-600 text-xs">🥭</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black">{item.name}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">{item.quantity}{item.unit}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-black">{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden sm:block">
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
              <p>
                {order.phone1
                  ? `${order.phonecode1 || ''} ${order.phone1}`
                  : ''}
                {order.phone2
                  ? `, ${order.phonecode2 || ''} ${order.phone2}`
                  : ''}
              </p>
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
                  <tr></tr>
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
    </div>
  );
}