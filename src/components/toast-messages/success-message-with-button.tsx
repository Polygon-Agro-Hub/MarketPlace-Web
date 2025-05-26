import React, { useState, useEffect } from 'react';

type SuccessPopupProps = {
    isVisible: boolean;
    onClose?: () => void;
    onCancel?: () => void;
    title?: string;
    description?: string;
    duration?: number;
};

const SuccessPopup = ({
    isVisible,
    onClose,
    onCancel,
    title = "Email has been sent!",
    description = "Please check your emails, a password reset link has been sent.",
    duration = 0 // Changed to 0 to not auto-close when there's a cancel button
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
                className={`relative bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-500 ease-out ${animate
                    ? 'scale-100 opacity-100 translate-y-0'
                    : 'scale-75 opacity-0 translate-y-8'
                    }`}
            >
                {/* Success Icon with Animation */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24">
                        {/* Blue Square Background */}
                        <div
                            className={`absolute inset-0 rounded-lg bg-blue-100 border-2 border-blue-400 transition-all duration-700 ease-out ${animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                                }`}
                            style={{
                                transformOrigin: 'center',
                                animationDelay: '0.2s'
                            }}
                        />

                        {/* Purple Circle with Checkmark */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center transition-all duration-700 ease-out ${animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                                style={{ transitionDelay: '0.4s' }}>
                                <svg
                                    className="w-8 h-8 text-white"
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
                        <p className="text-base text-gray-500 leading-relaxed">
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
                        onClick={onCancel || handleClose}
                        className="px-8 py-3 text-gray-500 font-medium text-lg hover:text-gray-700 transition-colors duration-200"
                    >
                        Cancel
                    </button>
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

export default SuccessPopup;