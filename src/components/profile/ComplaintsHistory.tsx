

'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaAngleDown } from 'react-icons/fa';
import { RootState } from '@/store';
import { fetchComplaints } from '@/services/auth-service';
import EmptyComplaints from '../complaints/No-complaint';
import Select, { ActionMeta, SingleValue } from 'react-select'; // Import react-select
import Loader from '@/components/loader-spinner/Loader';

// Interfaces
interface Complaint {
  id: string;
  category: string;
  date: string;
  status: string;
  description: string;
  images: string[];
  isNew: boolean;
  createdAt: Date;
  reply?: string;
  replyDate?: string | null;
  customerName?: string;
}

// Define filter options for react-select
const filterOptions = [
  { value: 'This Month', label: 'This Month' },
  { value: 'Last Month', label: 'Last Month' },
  { value: 'Last 3 Months', label: 'Last 3 Months' },
  { value: 'All', label: 'All' },
];

const ComplaintsHistory = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('This Month');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const { token, user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  useEffect(() => {
    if (!userId || !token) {
      setError('Please log in to view complaints');
      setLoading(false);
      return;
    }

    const getComplaints = async () => {
      const startTime = Date.now();
      const minimumLoadTime = 2500; // 2.5 seconds minimum loader time

      try {
        setLoading(true);
        const fetchedComplaints = await fetchComplaints({ userId, token });
        setComplaints(fetchedComplaints);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        // Ensure loader shows for minimum duration
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);

        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      }
    };

    getComplaints();
  }, [userId, token]);

  // Scroll to top when popup is opened
  useEffect(() => {
    if (selectedComplaint) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [selectedComplaint]);

  const filteredComplaints = complaints.filter((complaint) => {
    const now = new Date();
    const complaintDate = complaint.createdAt;

    if (filter === 'This Month') {
      return (
        complaintDate.getMonth() === now.getMonth() &&
        complaintDate.getFullYear() === now.getFullYear()
      );
    } else if (filter === 'Last Month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      return (
        complaintDate.getMonth() === lastMonth.getMonth() &&
        complaintDate.getFullYear() === lastMonth.getFullYear()
      );
    } else if (filter === 'Last 3 Months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3);
      return complaintDate >= threeMonthsAgo;
    }
    return true;
  });

  const handleViewReply = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleGoBack = () => {
    setSelectedComplaint(null);
  };

  // Handle filter change for react-select
  const handleFilterChange = (
    newValue: SingleValue<{ value: string; label: string }>,
    actionMeta: ActionMeta<{ value: string; label: string }>
  ): void => {
    if (newValue) {
      setFilter(newValue.value);
    }
  };


  return (
    <div>
      <Loader isVisible={loading} />
      <div
        className={`relative z-10 px-4 sm:px-6 md:px-8 min-h-screen mb-10 ${selectedComplaint ? 'bg-white' : 'bg-white'
          } blur-effect`}
      >
        <h2 className="font-medium text-[14px] text-base md:text-[18px] mb-2 mt-2">
          Complaints History
        </h2>
        <p className="text-[12px] md:text-[16px] text-[#626D76] mb-3">
          A complaint will be visible once the complaint status is closed.
        </p>
        <div className="border-t border-[#BDBDBD] mb-4 sm:mb-6 mt-2" />

        {/* Reply Modal Inside First Div */}
        {selectedComplaint && (
          <div className="absolute inset-0 flex justify-center items-start z-30 pt-10 bg-white/60 backdrop-blur-sm">
            <div className="bg-white/90 p-6 rounded-lg shadow-lg w-full max-w-[560px] mx-auto">
              <div className="flex flex-col items-center">
                <img
                  src="/icons/reply.png"
                  alt="Reply Icon"
                  className="w-8 h-8 mb-2"
                />
                <h3 className="text-lg font-semibold mb-4">Reply for your complaint</h3>
                <div className="w-full border border-gray-300 rounded-md p-4 mb-4">
                  <p className="text-sm mb-2">
                    Dear {selectedComplaint.customerName || 'Customer'},
                  </p>
                  <p className="text-sm mb-4 whitespace-pre-wrap">
                    {selectedComplaint.reply || 'No reply available yet.'}
                  </p>
                  <p className="text-sm">Sincerely,</p>
                  <p className="text-sm">Support Team</p>
                  {/* <p className="text-sm">
                    {selectedComplaint.replyDate}
                  </p> */}
                </div>
                <button
                  onClick={handleGoBack}
                  className="w-24 h-9 text-sm text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300"
                  style={{ backgroundColor: '#F3F4F7' }}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-7xl mx-auto relative">
          <div className="relative z-25">
            <div className="flex flex-row justify-between items-center mb-4 sm:mb-6">
              <div className="text-[14px] text-base md:text-[18px] font-bold">
                All ({String(filteredComplaints.length).padStart(2, '0')})
              </div>
              <div className="relative w-[140px] sm:w-[180px]">
                <Select
                  instanceId="complaints-history-filter"
                  options={filterOptions}
                  value={filterOptions.find((option) => option.value === filter)}
                  onChange={handleFilterChange}
                  className="text-xs sm:text-sm"
                  isSearchable={false} 
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: '1px solid #CECECE',
                      borderRadius: '0.25rem',
                      height: '36px',
                      backgroundColor: '#F3F3F3',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center',
                      paddingRight: '1.5rem',
                      boxShadow: 'none',
                      ':hover': {
                        borderColor: '#3E206D',
                        backgroundColor: '#F3F4F6',
                      },
                    }),
                    option: (base, { isFocused }) => ({
                      ...base,
                      cursor: 'pointer',
                      backgroundColor: isFocused ? '#F3F4F6' : 'white',
                      color: '#1F2937',
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
                      color: '#1F2937',
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: '#6B7280',
                      paddingRight: '8px',
                    }),
                  }}
                  components={{
                    DropdownIndicator: () => (
                      <FaAngleDown className="text-[#6B7280] text-xs sm:text-sm" />
                    ),
                    IndicatorSeparator: () => null,
                  }}
                />
              </div>
            </div>

            {loading && <div className="text-center text-sm text-[#626D76]">Loading complaints...</div>}
            {!loading && error && <div className="text-center text-sm text-red-600">Error: {error}</div>}
            {!loading && !error && filteredComplaints.length === 0 && <EmptyComplaints />}
            {!loading && !error && filteredComplaints.length > 0 && (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="border border-[#CECECE] rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="flex flex-col items-start">
                        <div className="text-[12px] md:text-[16px] text-[#626D76] font-medium">Complaint ID:</div>
                        <div className="text-[12px] md:text-[16px]">{complaint.id}</div>
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="text-[12px] md:text-[16px] text-[#626D76] font-medium">Category:</div>
                        <div className="text-[12px] md:text-[16px]">{complaint.category}</div>
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="text-[12px] md:text-[16px] text-[#626D76] font-medium">Date:</div>
                        <div className="text-[12px] md:text-[16px]">{complaint.date}</div>
                      </div>
                      <div className="flex flex-col items-start sm:items-center">
                        <div className="text-[12px] md:text-[16px] text-[#626D76] font-medium">Status:</div>
                        <div className="flex items-center">
                          <span
                            className={`min-w-[100px] sm:min-w-[120px] text-center px-2 py-1 rounded-full text-[12px] md:text-[16px] ${complaint.status === 'Closed'
                                ? 'bg-[#EDE1FF] text-[#3E206D]'
                                : complaint.status === 'Opened'
                                  ? 'bg-[#CFE1FF] text-[#3B82F6]'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                          >
                            {complaint.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        {complaint.status === 'Closed' && (
                          <div className="flex items-center">
                            <button
                              onClick={() => handleViewReply(complaint)}
                              className="w-20 sm:w-28 h-8 sm:h-9 text-[12px] md:text-[16px] rounded-lg text-white cursor-pointer bg-[#3E206D] hover:bg-[#341a5a] -mt-1 mr-12"
                            >
                              View Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-[#BDBDBD] w-full my-3 sm:my-4" />
                    <p className="text-[12px] md:text-[16px] text-[#626D76] mb-3">{complaint.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {complaint.images.length > 0 ? (
                        complaint.images.map((image, index) => (
                          <img
                            key={`${complaint.id}-image-${index}`}
                            src={image}
                            alt={`Complaint ${complaint.id} image ${index + 1}`}
                            className="w-14 sm:w-16 h-14 sm:h-16 object-cover rounded-md"
                          />
                        ))
                      ) : (
                        <p className="text-[12px] md:text-[16px] text-[#626D76]"></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsHistory;