'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin, ShoppingBag, Truck, X } from 'lucide-react';

type AuthTab = 'login' | 'signup';

interface MainLoginComponentProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: AuthTab;
}

const FEATURES = [
    { id: 1, label: 'Keep delivery details handy', Icon: MapPin },
    { id: 2, label: 'Find your usuals, a little faster', Icon: ShoppingBag },
    { id: 3, label: 'Follow your next delivery', Icon: Truck },
];

const TABS: { id: AuthTab; label: string }[] = [
    { id: 'login', label: 'Log in' },
    { id: 'signup', label: 'Create account' },
];

const MainLoginComponent: React.FC<MainLoginComponentProps> = ({
    isOpen,
    onClose,
    defaultTab = 'login',
}) => {
    const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);

    // Reset to the requested tab each time the modal opens
    useEffect(() => {
        if (isOpen) setActiveTab(defaultTab);
    }, [isOpen, defaultTab]);

    // Close on Escape + lock body scroll while open
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-3 py-4 sm:px-6"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Log in or create an account"
        >
            <div
                className="relative flex h-full max-h-[690px] w-full max-w-[1040px] overflow-hidden rounded-[28px] bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ===== Left: image panel (hidden on mobile) ===== */}
                <div className="relative hidden w-[46%] shrink-0 md:block">
                    <Image
                        src="/images/Authentication_Bg.png"
                        alt="Fresh vegetables in a wooden crate"
                        fill
                        priority
                        sizes="(min-width: 768px) 480px, 0px"
                        className="object-cover"
                    />

                    {/* Dark purple gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2B0B3A] via-[#2B0B3A]/75 to-transparent to-65%" />

                    <div className="absolute inset-x-0 bottom-0 flex flex-col px-8 pb-9 lg:px-9">
                        <h2
                            className="text-[40px] leading-[1.1] font-medium text-white"
                            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
                        >
                            A little ease.
                            <br />
                            Every day.
                        </h2>

                        <p className="mt-4 max-w-[340px] text-sm leading-relaxed text-white/80">
                            A home for your orders, your delivery details and the next good meal.
                        </p>

                        <ul className="mt-6 flex flex-col gap-4">
                            {FEATURES.map(({ id, label, Icon }) => (
                                <li key={id} className="flex items-center gap-3 text-sm text-white">
                                    <Icon className="h-4 w-4 shrink-0 text-white/90" strokeWidth={1.75} />
                                    <span>{label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ===== Right: auth panel ===== */}
                <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto px-5 pb-8 pt-8 sm:px-8 lg:px-12">
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Logo */}
                    <div className="flex justify-center">
                        <Image
                            src="/images/POLYGON_LOGO26.png"
                            alt="Polygon"
                            width={120}
                            height={53}
                            priority
                            className="h-[46px] w-auto"
                        />
                    </div>

                    {/* Tab switcher */}
                    <div
                        role="tablist"
                        aria-label="Authentication"
                        className="mt-6 grid grid-cols-2 rounded-full border-2 border-indigo-100 bg-indigo-50/40 p-1"
                    >
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`cursor-pointer rounded-full py-2.5 text-sm font-medium transition-all focus:outline-none sm:text-base ${
                                        isActive
                                            ? 'bg-white font-bold text-gray-900 shadow-[0_2px_8px_rgba(99,102,241,0.15)]'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab content (form fields go here) */}
                    <div className="mt-8 flex-1">
                        {activeTab === 'login' && (
                            <div role="tabpanel">
                                {/* TODO: <LoginForm /> */}
                            </div>
                        )}

                        {activeTab === 'signup' && (
                            <div role="tabpanel">
                                {/* TODO: <SignupForm /> */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLoginComponent;