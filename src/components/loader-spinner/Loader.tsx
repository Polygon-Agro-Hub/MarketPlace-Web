
'use client'; // Add this if using in app router (Next.js 13+)

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LoaderProps {
  isVisible: boolean;
  overlayClassName?: string;
  portal?: boolean;
}

const LoaderOverlay: React.FC<{ overlayClassName: string }> = ({ overlayClassName }) => (
  <div
    data-loader-overlay="true"
    className={`fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm ${overlayClassName}`}
  >
    <div className="w-16 h-16 border-4 border-t-[#3E206D] border-gray-200 rounded-full animate-spin"></div>
  </div>
);

const PortaledLoader: React.FC<{ overlayClassName: string }> = ({ overlayClassName }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const pageElements = Array.from(document.body.children).filter(
      (element) => !element.hasAttribute("data-loader-overlay"),
    ) as HTMLElement[];
    const originalFilters = pageElements.map((element) => element.style.filter);

    pageElements.forEach((element) => {
      element.style.filter = element.style.filter
        ? `${element.style.filter} blur(8px)`
        : "blur(8px)";
    });

    return () => {
      pageElements.forEach((element, index) => {
        element.style.filter = originalFilters[index];
      });
    };
  }, [mounted]);

  if (!mounted) return null;
  return createPortal(<LoaderOverlay overlayClassName={overlayClassName} />, document.body);
};

const Loader: React.FC<LoaderProps> = ({
  isVisible,
  overlayClassName = "",
  portal = false,
}) => {
  if (!isVisible) return null;
  if (portal) return <PortaledLoader overlayClassName={overlayClassName} />;
  return <LoaderOverlay overlayClassName={overlayClassName} />;
};

export default Loader;