import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Define the pickup center interface to match your data structure
interface PickupCenter {
  id: number;
  value: string;
  label: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
}

interface OpenStreetMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  className?: string;
  onCenterSelect?: (centerId: string, centerName: string) => void;
  pickupCenters?: PickupCenter[];
  selectedCenterId?: string;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  center = [6.9271, 79.8612], // Default to Colombo, Sri Lanka
  zoom = 12,
  height = '300px',
  width = '100%',
  className = '',
  onCenterSelect,
  pickupCenters = [],
  selectedCenterId
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current).setView(center, zoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // Clean up global function
      delete (window as any).selectPickupCenter;
      markersRef.current = [];
    };
  }, []); // Only run once on mount

  // Separate effect to handle pickup centers
  useEffect(() => {
  if (!mapInstanceRef.current || !pickupCenters.length) return;

  const map = mapInstanceRef.current;

  // Clear existing markers
  markersRef.current.forEach(marker => {
    map.removeLayer(marker);
  });
  markersRef.current = [];

  // Create custom icons for selected and unselected states
  const defaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const selectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Add pickup center markers
  pickupCenters.forEach(center => {
    const isSelected = selectedCenterId === center.value;
    const marker = L.marker([center.latitude, center.longitude], {
      icon: isSelected ? selectedIcon : defaultIcon
    }).addTo(map);

    // Create popup content with conditional button
    const popupContent = `
      <div style="text-align: center; min-width: 200px;">
        <b style="color: #3E206D; font-size: 14px;">${center.label}</b><br>
        ${center.address ? `<span style="color: #666; font-size: 12px;">${center.address}</span><br>` : ''}
        ${center.phone ? `<span style="color: #666; font-size: 12px;">📞 ${center.phone}</span><br>` : ''}
        ${isSelected ? 
          `<div style="background: #10B981; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 10px; font-size: 12px; font-weight: 600; display: inline-block;">
            ✓ Selected
          </div>` :
          `<button>" 
                  style="background: #3E206D; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 10px; cursor: pointer; font-size: 12px; font-weight: 600;">
            Select This Center
          </button>`
        }
      </div>
    `;

    marker.bindPopup(popupContent);
    markersRef.current.push(marker);

    // Auto-open popup for selected center
    if (isSelected) {
      marker.openPopup();
    }
  });

  // Global function for popup button clicks
  (window as any).selectPickupCenter = (centerId: string, centerName: string) => {
    if (onCenterSelect) {
      onCenterSelect(centerId, centerName);
    }
  };

  // Fit map bounds to show all pickup centers if there are any
  if (pickupCenters.length > 0) {
    const group = new L.FeatureGroup(markersRef.current);
    const bounds = group.getBounds();
    
    // Only fit bounds if we have valid bounds and it's not just a single point
    if (bounds.isValid() && pickupCenters.length > 1) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }

}, [pickupCenters, selectedCenterId, onCenterSelect]);

  // Separate effect to handle center and zoom changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    mapInstanceRef.current.setView(center, zoom);
  }, [center, zoom]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width }} 
        className={`rounded-lg border border-gray-300 ${className}`}
      />
      {pickupCenters.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading pickup centers...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMap;