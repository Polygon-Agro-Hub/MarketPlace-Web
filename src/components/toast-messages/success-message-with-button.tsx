import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import checkMark from '../../../public/images/correct.png';

type SuccessPopupProps = {
    isVisible: boolean;
    onClose?: () => void;
    onCancel?: () => void;
    title?: string;
    description?: string;
    duration?: number;
    path?: string; // Optional path prop for future use
};

const SuccessPopup = ({
    isVisible,
    onClose,
    onCancel,
    title = "Email has been sent!",
    description = "Please check your emails, a password reset link has been sent.",
    duration = 0, // Changed to 0 to not auto-close when there's a cancel button
    path
}: SuccessPopupProps) => {
    const [show, setShow] = useState(false);
    const [animate, setAnimate] = useState(false);
    const router = useRouter();

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

    const handleCancel = () => {
        setAnimate(false);
        setTimeout(() => {
            setShow(false);
            if (onCancel) {
                onCancel();
            } else {
                onClose?.();
            }
        }, 300);
    };

    const handleOk = () => {
        setAnimate(false);
        setTimeout(() => {
            setShow(false);
            onClose?.();
        }, 300);
        router.push(`${path}`);
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
                        {/* Checkmark Image */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`transition-all duration-700 ease-out ${animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                                style={{ transitionDelay: '0.4s' }}>
                                <Image
                                    src={checkMark}
                                    alt="Success"
                                    width={120}
                                    height={90}
                                    className="w-30 h-23"
                                />
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
                        onClick={handleCancel}
                        className="px-8 py-3 bg-[#F3F4F7] text-[#757E87] font-medium text-lg rounded-lg hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessPopup;