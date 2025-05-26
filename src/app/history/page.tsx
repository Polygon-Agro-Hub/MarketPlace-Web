
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaAngleDown } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from '@/store';

interface Order {
  orderId: number;
  scheduleDate: string;
  scheduleTime: string;
  deliveryType: string;
  total: string;
  orderPlaced: string;
  status: string | null;
}

function formatDateTime(dateTimeStr: string) {
  if (!dateTimeStr) return "N/A";
  const date = new Date(dateTimeStr);
  return date.toLocaleString();
}

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "ordered":
      return "bg-[#FFE9E2] text-[#FF5A00]";
    case "processing":
      return "bg-[#CFE1FF] text-[#3B82F6]";
    case "ready to go":
      return "bg-[#F2DDFF] text-[#3E206D]";
    case "delivered":
      return "bg-green-100 text-green-600";
    case "cancelled":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function OrderHistoryPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!token) {
      console.error("Token not found in Redux store");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3200/api/retail-order/order-history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("API error:", errorData);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const normalizedOrders: Order[] = (data.orderHistory || []).map((order: any) => ({
          orderId: order.orderId,
          scheduleDate: formatDateTime(order.sheduleDate),
          scheduleTime: formatDateTime(order.sheduleTime),
          deliveryType: order.delivaryMethod || "N/A",
          total: order.total,
          orderPlaced: formatDateTime(order.orderPlacedTime),
          status: order.status || "Pending",
        }));

        setOrders(normalizedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-white">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-6 space-x-2 lg:mx-[72px]">
        <h1 className="text-sm lg:text-xl font-bold">
          Your Orders ({orders.length})
        </h1>
        <div className="relative w-[140px] sm:w-[180px]">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="border border-[#CECECE] rounded p-1 pr-6 w-full text-xs lg:text-sm h-[36px] appearance-none bg-[#F8F8F8] cursor-pointer text-center focus:outline-none"
          >
            <option value="all">All</option>
            <option value="this-week">This Week</option>
            <option value="last-week">Last Week</option>
            <option value="this-month">This Month</option>
          </select>
          <FaAngleDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs lg:text-sm pointer-events-none" />
        </div>
      </div>

      {/* Orders */}
      {orders.length > 0 ? (
        <div className="lg:mx-[72px] space-y-4">
          {orders.map((order) => (
            <div key={order.orderId} className="border rounded-xl overflow-hidden" style={{ borderColor: "#D7D7D7" }}>
              {/* Desktop: 2-row layout | Mobile: stacked blocks */}
              {/* Top row (gray) */}
              <div className="hidden sm:grid grid-cols-5 gap-4 p-4 bg-[#F8F8F8] text-xs lg:text-sm">
                <div>
                  <span className="text-gray-500">Scheduled Date:</span>
                  <p className="font-medium">{order.scheduleDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <p className="font-medium">{order.total}</p>
                </div>
                <div>
                  <span className="text-gray-500">Order ID:</span>
                  <p className="font-medium">#{order.orderId}</p>
                </div>
                <div />
                <div className="flex gap-2 justify-end">
                  <button className="bg-white border text-xs lg:text-sm border-gray-300 rounded-lg px-4 py-1.5 hover:bg-[#3E206D] hover:text-white">
                    View Order
                  </button>
                  <button className="bg-white border text-xs lg:text-sm border-gray-300 rounded-lg px-4 py-1.5 hover:bg-[#3E206D] hover:text-white">
                    View Invoice
                  </button>
                </div>
              </div>

              {/* Top row for mobile */}
              <div className="sm:hidden bg-[#F8F8F8] p-4 space-y-2 text-sm ">
                <div><strong>Scheduled Date:</strong> {order.scheduleDate}</div>
                <div><strong>Total:</strong> {order.total}</div>
                <div><strong>Order ID:</strong> #{order.orderId}</div>
<div className="flex flex-col gap-2">
  <button className="bg-white border border-gray-300 rounded px-4 py-1 
    hover:bg-[#3E206D] hover:text-white 
    focus:bg-[#3E206D] focus:text-white 
    active:bg-[#3E206D] active:text-white">
    View Order
  </button>
  <button className="bg-white border border-gray-300 rounded px-4 py-1 
    hover:bg-[#3E206D] hover:text-white 
    focus:bg-[#3E206D] focus:text-white 
    active:bg-[#3E206D] active:text-white">
    View Invoice
  </button>
</div>


              </div>

              {/* Divider */}
              <div className="border-t" style={{ borderColor: "#D7D7D7" }} />

              {/* Bottom row (white) */}
              <div className="hidden sm:grid grid-cols-5 gap-4 p-4 bg-white text-xs lg:text-sm sm:h-25 mt-4">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p>
                    <span className={`inline-flex justify-center items-center font-medium px-3 py-0.5 rounded-full text-xs min-w-[100px] ${getStatusClass(order.status || "")}`}>
                      {order.status}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Order Placed:</span>
                  <p className="text-black">{order.orderPlaced}</p>
                </div>
                <div>
                  <span className="text-gray-500">Scheduled Time:</span>
                  <p className="text-black">{order.scheduleTime}</p>
                </div>
                <div>
                  <span className="text-gray-500">Delivery / Pickup:</span>
                  <p className="text-black">{order.deliveryType}</p>
                </div>
                <div />
              </div>

              {/* Bottom row for mobile */}
              <div className="sm:hidden p-4 bg-white space-y-2 text-sm">
                <div><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-0.5 rounded-full ${getStatusClass(order.status || "")}`}>
                    {order.status}
                  </span>
                </div>
                <div><strong>Order Placed:</strong> {order.orderPlaced}</div>
                <div><strong>Scheduled Time:</strong> {order.scheduleTime}</div>
                <div><strong>Delivery / Pickup:</strong> {order.deliveryType}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-600 -mt-32">
          <Image src="/images/History.jpg" alt="No Orders" width={200} height={200} />
          <p className="mt-4 text-sm italic">--No orders available here--</p>
        </div>
      )}
    </div>
  );
}

