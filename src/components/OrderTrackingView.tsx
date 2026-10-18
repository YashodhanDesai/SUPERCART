import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Navigation,
  Sparkles,
  Receipt,
  FileText,
  Compass,
  Layers,
  ExternalLink,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Order, OrderStatus } from '../types';
import { OrderFeedbackSection } from './OrderFeedbackSection';
import { 
  GOOGLE_MAPS_MAP_ID, 
  MANDATORY_ATTRIBUTION_IDS, 
  DARK_MAP_STYLES,
  computeDrivingRoute,
  forwardGeocodeGoogle,
  RouteComputationResult
} from '../lib/googleMaps';

interface OrderTrackingViewProps {
  order: Order;
  onBack: () => void;
  onViewInvoice: (order: Order) => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; description: string; icon: any }[] = [
  { status: 'Placed', label: 'Order Placed', description: 'Your order was verified and sent to the local fulfillment hub', icon: Package },
  { status: 'Processing', label: 'Packing Fresh Items', description: 'Grocery picker is packing quality items and double-checking freshness', icon: ChefHat },
  { status: 'Out for Delivery', label: 'Out for Delivery', description: 'SuperCart express courier is on the road with your groceries', icon: Bike },
  { status: 'Delivered', label: 'Delivered', description: 'Groceries safely handed over at your doorstep', icon: CheckCircle2 },
];

// Inner helper component to render Google Maps Polyline and manage view bounds
function GoogleMapsRouteOverlay({
  origin,
  destination,
  routePoints,
  courierPos
}: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  routePoints: { lat: number; lng: number }[];
  courierPos: { lat: number; lng: number };
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || routePoints.length < 2) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // High contrast glowing emerald delivery route
    const polyline = new google.maps.Polyline({
      path: routePoints,
      geodesic: true,
      strokeColor: '#10b981',
      strokeOpacity: 0.95,
      strokeWeight: 6,
      map: map
    });
    polylineRef.current = polyline;

    try {
      const bounds = new google.maps.LatLngBounds();
      routePoints.forEach((pt) => bounds.extend(pt));
      bounds.extend(origin);
      bounds.extend(destination);
      bounds.extend(courierPos);
      map.fitBounds(bounds, { top: 45, right: 45, bottom: 45, left: 45 });
    } catch (e) {
      // Map bounds fallback
    }

    return () => {
      polyline.setMap(null);
    };
  }, [map, routePoints, origin, destination]);

  return null;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order,
  onBack,
  onViewInvoice
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  // Customer destination coords
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>(
    order.deliveryCoords || { lat: 19.0760, lng: 72.8777 }
  );

  // Store Hub origin coords (located ~2.5km from customer destination in the same city)
  const storeOriginCoords = useMemo<{ lat: number; lng: number }>(() => {
    return {
      lat: destCoords.lat + 0.018,
      lng: destCoords.lng - 0.015
    };
  }, [destCoords]);

  // Route details
  const [routeData, setRouteData] = useState<RouteComputationResult | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [courierProgress, setCourierProgress] = useState(0.55); // 0 (Store) -> 1 (Customer)
  const [isComputingRoute, setIsComputingRoute] = useState(true);

  // Geocode address if coords were missing on legacy orders
  useEffect(() => {
    if (!order.deliveryCoords && order.deliveryAddress) {
      forwardGeocodeGoogle(order.deliveryAddress).then((geo) => {
        if (geo) {
          setDestCoords({ lat: geo.lat, lng: geo.lng });
        }
      });
    }
  }, [order.deliveryCoords, order.deliveryAddress]);

  // Compute realistic driving route from Store Hub to Customer Doorstep
  useEffect(() => {
    let isCancelled = false;
    setIsComputingRoute(true);

    computeDrivingRoute(storeOriginCoords, destCoords).then((res) => {
      if (!isCancelled) {
        setRouteData(res);
        setEstimatedMinutes(res.durationMinutes);
        setIsComputingRoute(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [storeOriginCoords, destCoords]);

  // Animate courier vehicle along the route
  useEffect(() => {
    if (order.status === 'Delivered') {
      setCourierProgress(1.0);
      setEstimatedMinutes(0);
      return;
    }
    if (order.status === 'Placed') {
      setCourierProgress(0.05);
      return;
    }
    if (order.status === 'Confirmed') {
      setCourierProgress(0.08);
      return;
    }
    if (order.status === 'Packed' || order.status === 'Processing') {
      setCourierProgress(0.20);
      return;
    }

    // Out for delivery: smoothly pulse courier progress between 0.3 and 0.85
    const interval = setInterval(() => {
      setCourierProgress((prev) => {
        const next = prev + 0.02;
        return next > 0.92 ? 0.35 : next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [order.status]);

  // Compute current courier coordinates based on route points and progress
  const courierCoords = useMemo<{ lat: number; lng: number }>(() => {
    if (!routeData || routeData.points.length === 0) {
      return {
        lat: storeOriginCoords.lat + (destCoords.lat - storeOriginCoords.lat) * courierProgress,
        lng: storeOriginCoords.lng + (destCoords.lng - storeOriginCoords.lng) * courierProgress
      };
    }
    const idx = Math.min(
      routeData.points.length - 1,
      Math.max(0, Math.floor(courierProgress * (routeData.points.length - 1)))
    );
    return routeData.points[idx];
  }, [routeData, storeOriginCoords, destCoords, courierProgress]);

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Placed': return 0;
      case 'Confirmed': return 0;
      case 'Packed':
      case 'Processing': return 1;
      case 'Out for Delivery': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${storeOriginCoords.lat},${storeOriginCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&travelmode=driving`;

  return (
    <div id="order-tracking-view" className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store / Orders
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewInvoice(order)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-750 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>View Receipt & Invoice</span>
          </button>
        </div>
      </div>

      {/* Main ETA Hero Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-emerald-950 shadow-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Live SuperCart Tracking
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-sm">
                <Zap className="w-3 h-3 mr-1 text-amber-300" />
                15-Min Express
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {order.status === 'Delivered'
                ? 'Package Delivered Successfully!'
                : `Estimated Arrival: ~${estimatedMinutes} mins`}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              Order #{order.id.slice(0, 10).toUpperCase()} • Google Maps Live Dispatch Route
            </p>
          </div>

          {/* Delivery Location badge */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-xs text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-200 font-bold">
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>Destination Doorstep</span>
            </div>
            {order.customerPhone && (
              <div className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-300" />
                <span>{order.customerPhone}</span>
              </div>
            )}
            <p className="text-white line-clamp-2 leading-snug font-medium">
              {order.deliveryAddress}
            </p>
            {destCoords && (
              <span className="text-[10px] text-emerald-300 font-mono block pt-0.5">
                Pin: {destCoords.lat.toFixed(4)}° N, {destCoords.lng.toFixed(4)}° E
              </span>
            )}
          </div>
        </div>
      </div>

      {/* REALISTIC GOOGLE MAPS DELIVERY TRACKING RADAR */}
      <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900 text-white shadow-xl border border-zinc-800 space-y-4">
        {/* Radar Map Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Live Google Maps Delivery Route</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  REAL-TIME GPS
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                SuperCart Dark Store Hub &rarr; Your Doorstep
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-zinc-800 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  mapType === 'roadmap' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setMapType('hybrid')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  mapType === 'hybrid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
            </div>

            {/* External Google Maps Route Deep Link */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold border border-zinc-700 transition"
              title="Open turn-by-turn driving route in Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Route in Maps</span>
            </a>
          </div>
        </div>

        {/* Live Route Telemetry Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Route Distance</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
              {routeData?.distanceKm || 2.4} km
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Est. Travel Time</span>
            <span className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
              {estimatedMinutes} mins
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Courier Speed</span>
            <span className="text-base font-extrabold text-cyan-400 font-mono mt-0.5">
              {order.status === 'Delivered' ? '0 km/h' : '28 km/h'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Dispatch Status</span>
            <span className="text-base font-extrabold text-white mt-0.5 truncate">
              {order.status}
            </span>
          </div>
        </div>

        {/* Interactive Google Map Container */}
        <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-zinc-800 shadow-inner bg-zinc-950">
          <Map
            mapId={GOOGLE_MAPS_MAP_ID}
            defaultCenter={destCoords}
            center={courierCoords}
            defaultZoom={14}
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl={true}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={true}
            mapTypeId={mapType}
            styles={mapType === 'roadmap' ? DARK_MAP_STYLES : undefined}
            internalUsageAttributionIds={MANDATORY_ATTRIBUTION_IDS}
            className="w-full h-full"
          >
            {/* 1. Store Hub Origin Marker */}
            <AdvancedMarker position={storeOriginCoords} title="SuperCart Fulfillment Hub">
              <div className="flex flex-col items-center transform -translate-y-full hover:scale-110 transition-transform">
                <div className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] shadow-lg border border-white flex items-center gap-1 whitespace-nowrap">
                  <Package className="w-3 h-3" />
                  <span>Store Hub</span>
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-emerald-600 -mt-0.5" />
              </div>
            </AdvancedMarker>

            {/* 2. Customer Doorstep Destination Marker */}
            <AdvancedMarker position={destCoords} title="Customer Doorstep">
              <div className="flex flex-col items-center transform -translate-y-full hover:scale-110 transition-transform">
                <div className="px-2.5 py-1 rounded-full bg-amber-500 text-zinc-950 font-black text-[10px] shadow-lg border border-white flex items-center gap-1 whitespace-nowrap">
                  <MapPin className="w-3 h-3" />
                  <span>Your Doorstep</span>
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-500 -mt-0.5" />
              </div>
            </AdvancedMarker>

            {/* 3. Animated Courier Delivery Vehicle Marker */}
            <AdvancedMarker position={courierCoords} title="Live Courier Delivery Van">
              <div className="relative flex flex-col items-center transform -translate-y-full">
                <div className="absolute -bottom-1 w-7 h-7 bg-emerald-400/50 rounded-full animate-ping pointer-events-none" />
                <div className="p-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xl border-2 border-white flex items-center gap-1.5 scale-110">
                  <Bike className="w-4 h-4 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {order.driverName?.split(' ')[0] || 'Courier'}
                  </span>
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-emerald-600 -mt-0.5" />
              </div>
            </AdvancedMarker>

            {/* 4. Real Driving Route Polyline and Bounds Renderer */}
            {routeData && (
              <GoogleMapsRouteOverlay
                origin={storeOriginCoords}
                destination={destCoords}
                routePoints={routeData.points}
                courierPos={courierCoords}
              />
            )}
          </Map>

          {/* Floating Live Tracking Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Express Delivery Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress Steps Bar */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-6">
          Delivery Progress Timeline
        </h3>

        <div className="relative">
          {/* Desktop/Tablet Horizontal Steps */}
          <div className="hidden sm:grid grid-cols-4 gap-4 relative">
            {/* Connecting bar */}
            <div className="absolute top-6 left-12 right-12 h-1 bg-zinc-200 dark:bg-zinc-800 -z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-700 ease-in-out"
                style={{ width: `${(currentIndex / 3) * 100}%` }}
              />
            </div>

            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 scale-110 shadow-emerald-500/30'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4
                    className={`mt-3 text-xs font-bold ${
                      isCurrent || isPast ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Steps */}
          <div className="block sm:hidden space-y-6">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isCurrent || isPast ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Driver Card & Safety Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Driver Contact Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-3">
              Delivery Partner
            </span>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Driver"
                className="w-12 h-12 rounded-2xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {order.driverName || 'Rohan Sharma'}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {order.driverVehicle || 'SuperCart Eco Electric Van'}
                </p>
              </div>
            </div>
          </div>

          <a
            href={`tel:${order.driverPhone || '+919876543210'}`}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Call Driver ({order.driverPhone || '+91 98765 43210'})</span>
          </a>
        </div>

        {/* Safe Doorstep Promise */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-zinc-900 text-white shadow-sm flex flex-col justify-between border border-zinc-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe & Contactless Doorstep Delivery</span>
            </div>
            <h4 className="text-base font-bold text-white">
              Temperature-Controlled insulated containers
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your dairy, fresh greens, and bakery goods are packed at 4°C in dedicated climate-sealed bags. The delivery executive will ring your bell and place the groceries safely at your doorstep.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Instant refund on any damaged item</span>
            <span className="text-emerald-400 font-bold">100% On-Time Guarantee</span>
          </div>
        </div>
      </div>

      {/* Items in this order */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
          Order Summary ({order.items.length} items)
        </h4>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {order.items.map(({ product, quantity }) => (
            <div key={product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white block">
                    {product.name}
                  </span>
                  <span className="text-zinc-400 text-[11px]">
                    Qty: {quantity} • ₹{product.price.toFixed(2)} / {product.unit}
                  </span>
                </div>
              </div>

              <span className="font-bold font-mono text-zinc-900 dark:text-white">
                ₹{(product.price * quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-baseline font-bold text-sm text-zinc-900 dark:text-white">
          <span>Total Paid ({order.paymentMethod})</span>
          <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{order.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Customer Feedback Card Connected to Supabase */}
      <OrderFeedbackSection order={order} />
    </div>
  );
};
