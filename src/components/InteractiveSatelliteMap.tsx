import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { 
  Navigation, 
  MapPin, 
  Layers, 
  ExternalLink,
  Compass,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  GOOGLE_MAPS_MAP_ID, 
  MANDATORY_ATTRIBUTION_IDS, 
  DARK_MAP_STYLES,
  reverseGeocodeGoogle 
} from '../lib/googleMaps';
import { AddressDetails } from '../types';

interface InteractiveSatelliteMapProps {
  initialCoords: { lat: number; lng: number } | null;
  selectedAddress: string;
  onSelectLocation: (address: string, coords: { lat: number; lng: number }, details?: AddressDetails) => void;
}

const METRO_HUBS = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, zoom: 14 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, zoom: 14 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, zoom: 14 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, zoom: 14 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, zoom: 14 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 14 }
];

export const InteractiveSatelliteMap: React.FC<InteractiveSatelliteMapProps> = ({
  initialCoords,
  selectedAddress,
  onSelectLocation
}) => {
  const map = useMap();
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(
    initialCoords || { lat: 19.0760, lng: 72.8777 }
  );
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [activeAddressText, setActiveAddressText] = useState<string>(selectedAddress || 'Mumbai, Maharashtra, India');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync when initialCoords change from search or current location button
  useEffect(() => {
    if (initialCoords && (initialCoords.lat !== markerPos.lat || initialCoords.lng !== markerPos.lng)) {
      setMarkerPos(initialCoords);
      if (map) {
        map.panTo(initialCoords);
        map.setZoom(16);
      }
    }
  }, [initialCoords, map]);

  useEffect(() => {
    if (selectedAddress) {
      setActiveAddressText(selectedAddress);
    }
  }, [selectedAddress]);

  // Handle map click or marker drag to pick exact location
  const handleLocationPicked = useCallback(async (lat: number, lng: number) => {
    setMarkerPos({ lat, lng });
    setIsResolving(true);
    setErrorMessage(null);

    try {
      const details = await reverseGeocodeGoogle(lat, lng);
      setActiveAddressText(details.formattedAddress);
      onSelectLocation(details.formattedAddress, { lat, lng }, details);
    } catch (err: any) {
      console.error('Reverse geocode error:', err);
      const fallbackStr = `Pin Location (${lat.toFixed(5)}°, ${lng.toFixed(5)}°), India`;
      setActiveAddressText(fallbackStr);
      onSelectLocation(fallbackStr, { lat, lng });
      setErrorMessage('Could not retrieve full street name, saved exact GPS coordinates.');
    } finally {
      setIsResolving(false);
    }
  }, [onSelectLocation]);

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      handleLocationPicked(lat, lng);
    }
  };

  const handleMarkerDragEnd = (e: any) => {
    if (e.latLng) {
      const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
      const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
      handleLocationPicked(lat, lng);
    }
  };

  const handleMetroJump = (hub: typeof METRO_HUBS[0]) => {
    const coords = { lat: hub.lat, lng: hub.lng };
    setMarkerPos(coords);
    if (map) {
      map.panTo(coords);
      map.setZoom(hub.zoom);
    }
    handleLocationPicked(hub.lat, hub.lng);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${markerPos.lat},${markerPos.lng}`;

  return (
    <div className="space-y-2.5">
      {/* Metro Quick jump bar & Map Type toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
          <span className="text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-300 shrink-0 mr-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-500" />
            Quick Metro:
          </span>
          {METRO_HUBS.map((hub) => (
            <button
              key={hub.name}
              type="button"
              onClick={() => handleMetroJump(hub)}
              className="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-emerald-500 hover:text-white dark:bg-zinc-800 dark:hover:bg-emerald-600 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] transition shrink-0 cursor-pointer"
            >
              {hub.name}
            </button>
          ))}
        </div>

        {/* View mode toggle (Map / Satellite / Hybrid) */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
              mapType === 'roadmap'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapType('hybrid')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
              mapType === 'hybrid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Map Container - explicit height and boundary styling */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner bg-zinc-900">
        <Map
          mapId={GOOGLE_MAPS_MAP_ID}
          defaultCenter={markerPos}
          center={markerPos}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={true}
          mapTypeId={mapType}
          styles={mapType === 'roadmap' ? DARK_MAP_STYLES : undefined}
          onClick={handleMapClick}
          internalUsageAttributionIds={MANDATORY_ATTRIBUTION_IDS}
          className="w-full h-full"
        >
          {/* Draggable and clickable SuperCart Pin */}
          <AdvancedMarker
            position={markerPos}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            title="Drag marker or click anywhere to adjust delivery location"
          >
            <div className="relative flex flex-col items-center cursor-grab active:cursor-grabbing transform -translate-y-full hover:scale-105 transition-transform">
              {/* Pulse effect */}
              <div className="absolute -bottom-1 w-6 h-6 bg-emerald-500/40 rounded-full animate-ping pointer-events-none" />

              {/* Pin bubble */}
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-[11px] shadow-xl border-2 border-white flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>Deliver Here</span>
              </div>

              {/* Arrow stem */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-700 -mt-0.5 filter drop-shadow" />
            </div>
          </AdvancedMarker>
        </Map>

        {/* Top-Right "Expand in Google Maps" button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white text-[11px] font-bold border border-zinc-700 shadow-md backdrop-blur-sm transition"
            title="Open coordinates directly in Google Maps"
          >
            <ExternalLink className="w-3 h-3 text-emerald-400" />
            <span>Expand in Google Maps</span>
          </a>
        </div>

        {/* Bottom banner showing interactive guide */}
        <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none flex items-center justify-between">
          <div className="px-2.5 py-1 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-white text-[10px] font-medium flex items-center gap-1.5 shadow-lg">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Click map or drag marker to set exact doorstep</span>
          </div>

          {isResolving && (
            <div className="px-2.5 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Resolving address...</span>
            </div>
          )}
        </div>
      </div>

      {/* Selected location feedback bar */}
      <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-start gap-2.5">
        <div className="p-1.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Resolved Doorstep Location:
            </span>
            <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
              {markerPos.lat.toFixed(5)}° N, {markerPos.lng.toFixed(5)}° E
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-white leading-tight mt-0.5 break-words">
            {activeAddressText}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
