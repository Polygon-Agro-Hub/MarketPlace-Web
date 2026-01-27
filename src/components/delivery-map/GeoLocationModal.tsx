import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, AlertCircle } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GeoLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLocationSelect: (lat: number, lng: number) => void;
    initialCenter?: [number, number];
    savedLocation?: [number, number] | null; // ADD THIS
}

const GeoLocationModal: React.FC<GeoLocationModalProps> = ({
    isOpen,
    onClose,
    onLocationSelect,
    initialCenter = [6.9271, 79.8612],
    savedLocation = null // ADD THIS
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (!isOpen || !mapRef.current) return;

        const map = L.map(mapRef.current).setView(initialCenter, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        mapInstanceRef.current = map;

        // ADD THIS: If there's a saved location, show it immediately
        if (savedLocation) {
            updateMarker(savedLocation[0], savedLocation[1]);
        }

        map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            updateMarker(lat, lng);
            setLocationError('');
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            markerRef.current = null;
        };
    }, [isOpen, savedLocation]);

    // Auto-close success modal after 5 seconds
    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                handleSuccessModalClose();
            }, 5000); // 5 seconds

            return () => clearTimeout(timer);
        }
    }, [showSuccessModal]);

    const updateMarker = (lat: number, lng: number) => {
        if (!mapInstanceRef.current) return;

        // Remove existing marker if any
        if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
        }

        // Create custom icon for selected location
        const customIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Add new marker
        const marker = L.marker([lat, lng], { icon: customIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('Close to Reselect the location ')
            .openPopup();

        markerRef.current = marker;
        setSelectedLocation([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 15);
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser. Please select your location manually on the map.');
            return;
        }

        setIsLocating(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                updateMarker(lat, lng);
                setIsLocating(false);
                setLocationError('');
            },
            (error) => {
                console.error('Geolocation error:', error);
                setIsLocating(false);

                let errorMessage = '';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location permissions in your browser settings and try again, or select your location manually on the map.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable. Please check your device settings and try again, or select your location manually on the map.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again or select your location manually on the map.';
                        break;
                    default:
                        errorMessage = 'Unable to retrieve your location. Please ensure location services are enabled and try again, or select your location manually on the map.';
                }

                setLocationError(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleConfirm = (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (selectedLocation) {
            onLocationSelect(selectedLocation[0], selectedLocation[1]);
            setShowSuccessModal(true);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl text-center w-full max-w-md shadow-xl mx-4">
                        {/* Success Icon with Animation */}
                        <div className="flex justify-center mb-4">
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                                {/* Animated Circle */}
                                <div
                                    className="absolute inset-0 rounded-full border-4 border-purple-500 scale-100 opacity-100 transition-all duration-700 ease-out"
                                    style={{
                                        transformOrigin: 'center',
                                        animationDelay: '0.2s'
                                    }}
                                />

                                {/* Animated Checkmark */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10 sm:w-14 sm:h-14 text-[#8746ff]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            className="opacity-100 transition-all duration-700 ease-out"
                                            d="M20 6L9 17L4 12"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{
                                                strokeDasharray: '20',
                                                strokeDashoffset: '0',
                                                transitionDelay: '0.6s'
                                            }}
                                        />
                                    </svg>
                                </div>

                                {/* Pulse Animation */}
                                <div
                                    className="absolute inset-0 rounded-full bg-[#8746ff] scale-125 opacity-0 transition-all duration-1000"
                                    style={{
                                        animationDelay: '0.8s'
                                    }}
                                />
                            </div>
                        </div>

                        <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">
                            Successful!
                        </h2>
                        <p className="text-sm sm:text-base text-gray-500 mb-6">
                            Your geo location has been attached successfully.
                        </p>

                        <button
                            type="button"
                            onClick={handleSuccessModalClose}
                            className="w-full sm:w-auto px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition cursor-pointer text-gray-700 font-medium text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Main Modal */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
                        <h2 className="text-base sm:text-xl font-bold text-[#252525]">
                            {savedLocation ? 'View & Edit Your Saved Location' : 'Select Your Location'}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                        >
                            <X size={20} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="p-3 sm:p-4 overflow-y-auto flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                            Click on the map to select your location or use the button below to get your current location.
                        </p>

                        {/* Location Error Alert */}
                        {locationError && (
                            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 sm:gap-3">
                                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm text-amber-800">{locationError}</p>
                                    {locationError.includes('denied') && (
                                        <p className="text-xs text-amber-700 mt-2 leading-relaxed">
                                            <strong>To enable location:</strong><br />
                                            • Chrome/Edge: Click the lock icon in the address bar → Site settings → Location → Allow<br />
                                            • Firefox: Click the shield icon → Permissions → Location → Allow<br />
                                            • Safari: Go to Settings → Safari → Location → Allow
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Map Container */}
                        <div
                            ref={mapRef}
                            className="w-full h-[250px] sm:h-[350px] md:h-[400px] rounded-lg border border-gray-300 mb-3 sm:mb-4"
                        />

                        {/* Actions */}
                        <div className="flex flex-col gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={handleGetCurrentLocation}
                                disabled={isLocating}
                                className="w-full flex items-center justify-center gap-2 bg-[#3E206D] text-white font-semibold rounded-lg px-4 py-2.5 sm:py-3 hover:bg-[#2d1850] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
                            >
                                <MapPin size={18} className="sm:w-5 sm:h-5" />
                                <span className="truncate">{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={!selectedLocation}
                                className="w-full bg-[#10B981] text-white font-semibold rounded-lg px-4 py-2.5 sm:py-3 hover:bg-[#059669] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
                            >
                                Confirm Location
                            </button>
                        </div>

                        {selectedLocation && (
                            <div className="mt-3 p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-xs sm:text-sm text-green-800 break-all">
                                    <span className="font-semibold">Selected Location:</span> {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeoLocationModal;