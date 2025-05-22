import React, { useState, useEffect } from 'react';

type ErrorPopupProps = {
    isVisible: boolean;
    onClose?: () => void;
    title?: string;
    description?: string;
    duration?: number;
};

const ErrorPopup = ({
    isVisible,
    onClose,
    title = "Oops!",
    description = "Incorrect password, Please try again!",
    duration = 3000
}: ErrorPopupProps) => {
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
                className={`relative bg-white rounded-3xl p-12 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-500 ease-out ${animate
                    ? 'scale-100 opacity-100 translate-y-0'
                    : 'scale-75 opacity-0 translate-y-8'
                    }`}
            >
                {/* Error Icon with Animation */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-24 h-24">
                        {/* Animated Circle Background */}
                        <div
                            className={`absolute inset-0 rounded-full bg-red-500 transition-all duration-700 ease-out ${animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                                }`}
                            style={{
                                transformOrigin: 'center',
                                animationDelay: '0.2s'
                            }}
                        />

                        {/* Animated X Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="w-16 h-16 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    className={`transition-all duration-700 ease-out ${animate ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    d="M18 6L6 18M6 6L18 18"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        strokeDasharray: '24',
                                        strokeDashoffset: animate ? '0' : '24',
                                        transitionDelay: '0.6s'
                                    }}
                                />
                            </svg>
                        </div>

                        {/* Pulse Animation */}
                        <div
                            className={`absolute inset-0 rounded-full bg-red-500 transition-all duration-1000 ${animate ? 'scale-125 opacity-0' : 'scale-100 opacity-20'
                                }`}
                            style={{
                                animationDelay: '0.8s'
                            }}
                        />
                    </div>
                </div>

                {/* Title and Description */}
                <div
                    className={`text-center transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    style={{ transitionDelay: '0.4s' }}
                >
                    <h2 className="text-4xl font-bold text-black mb-4">
                        {title}
                    </h2>

                    {description && (
                        <p className="text-xl text-gray-500 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className={`absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 ${animate ? 'opacity-60 hover:opacity-100' : 'opacity-0'
                        }`}
                    style={{ transitionDelay: '0.8s' }}
                >
                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none">
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

export default ErrorPopup;