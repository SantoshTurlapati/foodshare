import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FoodDonation } from '../../types';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { formatCategoryName } from '../../utils/formatters';
import { MapPin, Navigation, Utensils } from 'lucide-react';

interface DonationMapViewProps {
  donations: FoodDonation[];
  selectedDonationId?: number;
  center?: [number, number];
  zoom?: number;
}

// Custom Leaflet Pin Icons
function createCustomPin(status: string, category: string) {
  let color = '#10b981'; // green for available
  if (status === 'ACCEPTED' || status === 'PICKUP_ASSIGNED') color = '#3b82f6';
  else if (status === 'COLLECTED') color = '#f59e0b';
  else if (status === 'DISTRIBUTED' || status === 'COMPLETED') color = '#8b5cf6';
  else if (status === 'EXPIRED' || status === 'CANCELLED') color = '#ef4444';

  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    ">
      <div style="transform: rotate(45deg); font-size: 14px; color: white;">
        🍲
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-map-marker',
    html: iconHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

function MapUpdater({ donations }: { donations: FoodDonation[] }) {
  const map = useMap();

  useEffect(() => {
    const validLocations = donations.filter(
      (d) => d.latitude !== null && d.longitude !== null && !isNaN(Number(d.latitude)) && !isNaN(Number(d.longitude))
    );

    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(
        validLocations.map((d) => [Number(d.latitude), Number(d.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [donations, map]);

  return null;
}

export const DonationMapView: React.FC<DonationMapViewProps> = ({
  donations,
  center = [37.7749, -122.4194],
  zoom = 12
}) => {
  const validDonations = donations.filter(
    (d) => d.latitude !== null && d.longitude !== null && !isNaN(Number(d.latitude)) && !isNaN(Number(d.longitude))
  );

  return (
    <div className="w-full h-[550px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater donations={validDonations} />

        {validDonations.map((d) => (
          <Marker
            key={d.id}
            position={[Number(d.latitude), Number(d.longitude)]}
            icon={createCustomPin(d.status, d.food_category)}
          >
            <Popup className="foodshare-map-popup">
              <div className="p-1 min-w-[220px] max-w-[260px] space-y-2">
                {d.image_url && (
                  <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-100">
                    <img src={d.image_url} alt={d.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between gap-1">
                  <StatusBadge status={d.status} size="sm" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {formatCategoryName(d.food_category)}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{d.title}</h4>

                <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-1.5">
                  <span className="flex items-center gap-1 font-semibold text-brand-700">
                    <Utensils className="w-3 h-3" />
                    {d.quantity} {d.quantity_unit}
                  </span>
                  <span>~{d.servings_estimate} Servings</span>
                </div>

                <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{d.pickup_address}, {d.pickup_city}</span>
                </p>

                <Link
                  to={`/donations/${d.id}`}
                  className="block w-full text-center py-1.5 px-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
