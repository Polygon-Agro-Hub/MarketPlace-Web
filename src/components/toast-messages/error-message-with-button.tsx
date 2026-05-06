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
    title = "Something went wrong!",
    description = "It Seems you don't have a account with us using this email",
    duration = 0 // Set to 0 to disable auto-close like in the image
}: ErrorPopupProps) => {
    const [show, setShow] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            // Trigger animation after component mounts
            setTimeout(() => setAnimate(true), 50);

            // Auto close after duration (only if duration > 0)
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
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-20 h-20">
                        {/* Red Circle Background */}
                        <div
                            className={`absolute inset-0 rounded-full bg-red-500 transition-all duration-700 ease-out ${animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                                }`}
                            style={{
                                transformOrigin: 'center',
                                animationDelay: '0.2s'
                            }}
                        />

                        {/* Exclamation Mark Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-white"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    className={`transition-all duration-700 ease-out ${animate ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-12h2v10h-2V5z"
                                    style={{
                                        transitionDelay: '0.6s'
                                    }}
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Title and Description */}
                <div
                    className={`text-center transition-all duration-500 ease-out mb-8 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    style={{ transitionDelay: '0.4s' }}
                >
                    <h2 className="text-2xl font-bold text-black mb-4">
                        {title}
                    </h2>

                    {description && (
                        <p className="text-base text-gray-500 leading-relaxed px-2">
                            {description}
                        </p>
                    )}
                </div>

                {/* Cancel Button */}
                <div
                    className={`flex justify-center transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    style={{ transitionDelay: '0.6s' }}
                >
                    <button
                        onClick={handleClose}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 min-w-24 cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorPopup;