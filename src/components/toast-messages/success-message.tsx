import React, { useState, useEffect } from 'react';

type SuccessPopupProps = {
    isVisible: boolean;
    onClose?: () => void;
    title?: string;
    description?: string;
    duration?: number;
};

const SuccessPopup = ({
    isVisible,
    onClose,
    title = "Your account created successfully!",
    description = "",
    duration = 3000
}: SuccessPopupProps) => {
    const [show, setShow] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            // Trigger animation after component mounts
            setTimeout(() => setAnimate(true), 50);

            // Auto close after duration
            if (duration > 0) {
                setTimeout(() => {
                    handleClose();
                }, duration);
            }
        }
    }, [isVisible, duration]);

    const handleClose = () => {
        setAnimate(false);
        setTimeout(() => {
            setShow(false);
            onClose?.();
        }, 300);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${animate ? 'opacity-40' : 'opacity-0'
                    }`}
                onClick={handleClose}
            />

            {/* Popup Container */}
            <div
                className={`relative bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-500 ease-out ${animate
                    ? 'scale-100 opacity-100 translate-y-0'
                    : 'scale-75 opacity-0 translate-y-8'
                    }`}
            >
                {/* Success Icon with Animation */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24">
                        {/* Animated Circle */}
                        <div
                            className={`absolute inset-0 rounded-full border-4 border-purple-500 transition-all duration-700 ease-out ${animate ? 'scale-100 opacity-100 rotate-360' : 'scale-50 opacity-0 rotate-0'
                                }`}
                            style={{
                                transformOrigin: 'center',
                                animationDelay: '0.2s'
                            }}
                        />

                        {/* Animated Checkmark */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-[#8746ff]"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    className={`transition-all duration-700 ease-out ${animate ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        strokeDasharray: '20',
                                        strokeDashoffset: animate ? '0' : '20',
                                        transitionDelay: '0.6s'
                                    }}
                                />
                            </svg>
                        </div>

                        {/* Pulse Animation */}
                        <div
                            className={`absolute inset-0 rounded-full bg-[#8746ff] transition-all duration-1000 ${animate ? 'scale-125 opacity-0' : 'scale-100 opacity-20'
                                }`}
                            style={{
                                animationDelay: '0.8s'
                            }}
                        />
                    </div>
                </div>

                {/* Title */}
                <div
                    className={`text-center transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    style={{ transitionDelay: '0.4s' }}
                >
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-2 text-gray-600">
                            {description}
                        </p>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 ${animate ? 'opacity-60 hover:opacity-100' : 'opacity-0'
                        }`}
                    style={{ transitionDelay: '0.8s' }}
                >
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M18 6L6 18M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default SuccessPopup;