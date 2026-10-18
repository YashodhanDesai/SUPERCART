import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Search, 
  AlertCircle, 
  Compass, 
  CheckCircle2, 
  Building2, 
  Flag,
  Loader2,
  ChevronDown,
  ChevronUp,
  Phone
} from 'lucide-react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { searchIndianLocationsWithNearby, LocalityItem } from '../data/indianLocations';
import { InteractiveSatelliteMap } from './InteractiveSatelliteMap';
import { reverseGeocodeGoogle, forwardGeocodeGoogle, parseGoogleAddressComponents } from '../lib/googleMaps';
import { AddressDetails } from '../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateDeliveryAddress, updateUserProfileInfo } = useAuth();
  const { t } = useLanguage();
  const placesLib = useMapsLibrary('places');

  const [searchInput, setSearchInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>(userProfile?.address || '');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    userProfile?.deliveryCoords || null
  );
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(
    userProfile?.addressDetails || null
  );

  // Manual additional fields for doorstep precision
  const [houseNumberInput, setHouseNumberInput] = useState<string>('');
  const [landmarkInput, setLandmarkInput] = useState<string>('');
  const [showAddressFields, setShowAddressFields] = useState<boolean>(false);

  // Phone number state with 10 digits
  const [phoneInput, setPhoneInput] = useState<string>(() => {
    const raw = userProfile?.phone || '';
    let digits = raw.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits.slice(-10);
  });

  // Places Autocomplete suggestions
  const [placesSuggestions, setPlacesSuggestions] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState<boolean>(false);
  const sessionTokenRef = useRef<any>(null);

  // Status & notifications - if location is not set, default directly to Google Maps
  const [activeTab, setActiveTab] = useState<'map' | 'search'>('map');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Initialize or restore active location and coords
  useEffect(() => {
    if (userProfile?.address) {
      setSelectedLocation(userProfile.address);
      if (userProfile.deliveryCoords) {
        setSelectedCoords(userProfile.deliveryCoords);
      } else {
        // Fallback default coordinates if not saved yet
        setSelectedCoords({ lat: 19.0760, lng: 72.8777 });
      }
      if (userProfile.addressDetails) {
        setAddressDetails(userProfile.addressDetails);
        if (userProfile.addressDetails.houseNumber) {
          setHouseNumberInput(userProfile.addressDetails.houseNumber);
        }
      }
    } else {
      setSelectedLocation('');
      setSelectedCoords({ lat: 19.0760, lng: 72.8777 });
      // If no location set yet, always direct user to map view
      setActiveTab('map');
    }

    if (userProfile?.phone && (!phoneInput || phoneInput.length !== 10)) {
      let digits = userProfile.phone.replace(/\D/g, '');
      if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
      if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
      const clean10 = digits.slice(-10);
      if (clean10) setPhoneInput(clean10);
    }
  }, [userProfile?.address, userProfile?.deliveryCoords, userProfile?.addressDetails, userProfile?.phone, isOpen]);

  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    setPhoneInput(digits.slice(0, 10));
  };

  // Google Places API Autocomplete Suggestions
  useEffect(() => {
    if (!placesLib || !searchInput.trim() || searchInput.trim().length < 2) {
      setPlacesSuggestions([]);
      setIsSearchingPlaces(false);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib as any;

    if (!sessionTokenRef.current && AutocompleteSessionToken) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        if (AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
          const req: any = {
            input: searchInput.trim(),
            includedRegionCodes: ['IN'],
            sessionToken: sessionTokenRef.current
          };

          const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions(req);
          if (res && res.suggestions) {
            setPlacesSuggestions(res.suggestions);
          } else {
            setPlacesSuggestions([]);
          }
        }
      } catch (err) {
        console.warn('Autocomplete fetch note:', err);
        setPlacesSuggestions([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput, placesLib]);

  // Fallback / Supplementary Indexed Indian Localities suggestions
  const indexedSuggestions = useMemo(() => {
    if (!searchInput.trim() || searchInput.trim().length < 2) {
      return { matches: [], nearbySuggestions: [] };
    }
    return searchIndianLocationsWithNearby(searchInput);
  }, [searchInput]);

  // Handle selection of a Google Places suggestion
  const handleSelectPlaceSuggestion = async (suggestion: any) => {
    try {
      setIsSearchingPlaces(true);
      setErrorMessage(null);

      if (suggestion.placePrediction?.toPlace) {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'addressComponents']
        });

        const lat = place.location?.lat ? place.location.lat() : 19.0760;
        const lng = place.location?.lng ? place.location.lng() : 72.8777;
        const formatted = place.formattedAddress || place.displayName || `${searchInput.trim()}, India`;

        const details = place.addressComponents
          ? parseGoogleAddressComponents(place.addressComponents, formatted, { lat, lng })
          : { formattedAddress: formatted, lat, lng, country: 'India' };

        setSelectedCoords({ lat, lng });
        setSelectedLocation(formatted);
        setAddressDetails(details);
        setSearchInput('');
        setPlacesSuggestions([]);

        // Reset session token
        sessionTokenRef.current = null;

        await updateDeliveryAddress(formatted, { lat, lng }, details);

        setSuccessToast(`Location set to ${place.displayName || formatted.split(',')[0]}!`);
        setActiveTab('map');
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch (err: any) {
      console.error('Place selection error:', err);
      setErrorMessage('Could not load place details. Using typed address.');
      handleSearchSubmitFallback(searchInput);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  // Quick select an indexed Indian locality from local database
  const handleSelectLocality = async (loc: LocalityItem) => {
    const address = `${loc.name} (${loc.pincode}), India`;
    const coords = { lat: loc.lat, lng: loc.lng };
    setSelectedLocation(address);
    setSelectedCoords(coords);
    setSearchInput('');
    setErrorMessage(null);

    const details: AddressDetails = {
      formattedAddress: address,
      lat: loc.lat,
      lng: loc.lng,
      street: loc.locality,
      city: loc.city,
      state: loc.state,
      postalCode: loc.pincode,
      country: 'India'
    };
    setAddressDetails(details);

    setSuccessToast(`Location set to ${loc.name}!`);
    setActiveTab('map');
    setTimeout(() => setSuccessToast(null), 3000);
    await updateDeliveryAddress(address, coords, details);
  };

  // Quick select nearby suggestion
  const handleSelectNearby = async (nearby: { name: string; fullAddress: string; parentLocality?: string }) => {
    setSelectedLocation(nearby.fullAddress);
    setSearchInput('');
    setErrorMessage(null);

    // Forward geocode with Google to get exact coordinates
    const geo = await forwardGeocodeGoogle(nearby.fullAddress);
    const coords = geo ? { lat: geo.lat, lng: geo.lng } : { lat: 19.0760, lng: 72.8777 };

    setSelectedCoords(coords);
    setAddressDetails(geo || { formattedAddress: nearby.fullAddress, ...coords, country: 'India' });

    setSuccessToast(`Location set to ${nearby.name}!`);
    setActiveTab('map');
    setTimeout(() => setSuccessToast(null), 3000);
    await updateDeliveryAddress(nearby.fullAddress, coords, geo || undefined);
  };

  // Use browser geolocation GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };

        try {
          const details = await reverseGeocodeGoogle(latitude, longitude);
          setSelectedCoords(coords);
          setSelectedLocation(details.formattedAddress);
          setAddressDetails(details);
          await updateDeliveryAddress(details.formattedAddress, coords, details);

          setSuccessToast('Exact GPS location detected!');
          setTimeout(() => setSuccessToast(null), 3000);
        } catch (err: any) {
          console.warn('Geolocation reverse geocoding note:', err);
          const fallbackStr = `Current GPS Location (${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°), India`;
          setSelectedCoords(coords);
          setSelectedLocation(fallbackStr);
          await updateDeliveryAddress(fallbackStr, coords);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Location permission was denied. Please allow location access in your browser or search your locality/pincode below.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMessage('Location information is currently unavailable. Please select your locality or city below.');
        } else if (error.code === error.TIMEOUT) {
          setErrorMessage('Location request timed out. Please try again or search your locality.');
        } else {
          setErrorMessage('Unable to retrieve GPS coordinates. Please search your address below.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Search submission fallback
  const handleSearchSubmitFallback = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingPlaces(true);
    setErrorMessage(null);

    try {
      const geo = await forwardGeocodeGoogle(query.trim());
      if (geo) {
        setSelectedCoords({ lat: geo.lat, lng: geo.lng });
        setSelectedLocation(geo.formattedAddress);
        setAddressDetails(geo);
        await updateDeliveryAddress(geo.formattedAddress, { lat: geo.lat, lng: geo.lng }, geo);
        setSuccessToast(`Found: ${geo.formattedAddress.split(',')[0]}!`);
        setTimeout(() => setSuccessToast(null), 3000);
      } else {
        const fallbackAddress = `${query.trim()}, India`;
        setSelectedLocation(fallbackAddress);
        await updateDeliveryAddress(fallbackAddress, selectedCoords || { lat: 19.0760, lng: 72.8777 });
      }
    } catch (err) {
      setErrorMessage('Could not geocode address. Please select on the map.');
    } finally {
      setIsSearchingPlaces(false);
      setSearchInput('');
      setPlacesSuggestions([]);
    }
  };

  // Handle selection from interactive Google Map click or pin drag
  const handleSelectFromMap = useCallback(async (
    address: string, 
    coords: { lat: number; lng: number },
    details?: AddressDetails
  ) => {
    setSelectedCoords(coords);
    setSelectedLocation(address);
    if (details) {
      setAddressDetails(details);
    }
    await updateDeliveryAddress(address, coords, details || null);
    setSuccessToast(`Pin placed: ${address.split(',')[0]}`);
    setTimeout(() => setSuccessToast(null), 3000);
  }, [updateDeliveryAddress]);

  // Apply manual doorstep details (Flat/House number, Landmark)
  const handleApplyDoorstepDetails = async () => {
    let finalAddress = selectedLocation;
    const extraParts: string[] = [];

    if (houseNumberInput.trim()) {
      extraParts.push(`Flat/House: ${houseNumberInput.trim()}`);
    }
    if (landmarkInput.trim()) {
      extraParts.push(`Near: ${landmarkInput.trim()}`);
    }

    if (extraParts.length > 0) {
      // Avoid duplicating prefix
      const cleanBase = selectedLocation.replace(/\(Flat\/House:.*?\)/g, '').trim();
      finalAddress = `${extraParts.join(', ')}, ${cleanBase}`;
    }

    setSelectedLocation(finalAddress);
    const updatedDetails: AddressDetails = {
      ...(addressDetails || {
        formattedAddress: finalAddress,
        lat: selectedCoords?.lat || 19.0760,
        lng: selectedCoords?.lng || 72.8777,
        country: 'India'
      }),
      houseNumber: houseNumberInput.trim() || undefined,
      formattedAddress: finalAddress
    };

    setAddressDetails(updatedDetails);
    await updateDeliveryAddress(finalAddress, selectedCoords, updatedDetails);
    setSuccessToast('Doorstep details saved!');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleConfirmLocationAndSave = async () => {
    if (!selectedLocation || selectedLocation.trim().length < 3) {
      setActiveTab('map');
      setErrorMessage('Please pick or click your doorstep location on the Google Map first.');
      return;
    }

    // Save contact phone if entered
    let cleanPhone = phoneInput.trim().replace(/\D/g, '');
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) cleanPhone = cleanPhone.slice(2);
    if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
    const clean10 = cleanPhone.slice(-10);
    if (clean10 && clean10.length === 10) {
      updateUserProfileInfo({ phone: clean10 }).catch(() => {});
    }

    await updateDeliveryAddress(selectedLocation, selectedCoords, addressDetails);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        id="location-picker-modal"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 overflow-hidden text-zinc-900 dark:text-zinc-100 flex flex-col my-auto max-h-[95vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {t('locationTitle') || 'Select Delivery Location'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                15-minute grocery delivery across India via Google Maps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
            aria-label="Close location modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3.5 pt-3 overflow-y-auto pr-1">
          {/* Active Delivery Location Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  {selectedLocation ? 'Active Delivery Location:' : 'Delivery Location:'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate block">
                  {selectedLocation || 'Location Not Set — Please Pick on Google Maps'}
                </span>
                {selectedCoords && (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                    GPS: {selectedCoords.lat.toFixed(5)}° N, {selectedCoords.lng.toFixed(5)}° E
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddressFields(!showAddressFields)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1 shrink-0 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              <span>{showAddressFields ? 'Hide Details' : '+ Doorstep No.'}</span>
              {showAddressFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Optional Doorstep Details Fields */}
          <AnimatePresence>
            {showAddressFields && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5"
              >
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  Doorstep Precision Details (Optional):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative flex items-center">
                    <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={houseNumberInput}
                      onChange={(e) => setHouseNumberInput(e.target.value)}
                      placeholder="Flat, House no., Floor, Wing"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="relative flex items-center">
                    <Flag className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={landmarkInput}
                      onChange={(e) => setLandmarkInput(e.target.value)}
                      placeholder="Nearby landmark, gate number"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyDoorstepDetails}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Save Doorstep Details
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success toast */}
          <AnimatePresence>
            {successToast && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode Switcher: Google Maps View vs Search Address View */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200/80 dark:border-zinc-700">
            <button
              id="tab-google-maps-btn"
              type="button"
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>🗺️ Select on Google Maps</span>
            </button>
            <button
              id="tab-search-address-btn"
              type="button"
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>🔍 Search Locality / PIN</span>
            </button>
          </div>

          {/* TAB 1: INTERACTIVE GOOGLE MAPS VIEW */}
          {activeTab === 'map' && (
            <div className="space-y-2.5">
              {/* Quick instructions and GPS Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Click anywhere on the map or drag pin to your doorstep</span>
                </div>
                <button
                  id="map-detect-gps-btn"
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-700 hover:bg-emerald-50 dark:hover:bg-zinc-650 border border-zinc-300 dark:border-zinc-600 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Detecting GPS...' : '🎯 Use Current GPS'}</span>
                </button>
              </div>

              {/* Official Google Maps Interactive Picker */}
              <InteractiveSatelliteMap
                initialCoords={selectedCoords}
                selectedAddress={selectedLocation}
                onSelectLocation={handleSelectFromMap}
              />

              {/* Explicit Set Location button directly on map */}
              <button
                id="set-location-from-map-pin-btn"
                type="button"
                onClick={async () => {
                  if (selectedLocation) {
                    await updateDeliveryAddress(selectedLocation, selectedCoords, addressDetails);
                    setSuccessToast(`Location set to: ${selectedLocation.split(',')[0]}!`);
                    setTimeout(() => setSuccessToast(null), 3000);
                  } else {
                    handleUseCurrentLocation();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Set Location from This Map Pin</span>
              </button>
            </div>
          )}

          {/* TAB 2: SEARCH LOCALITIES & GOOGLE PLACES VIEW */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              {/* Primary Action: USE CURRENT LOCATION */}
              <button
                id="use-current-gps-location-btn"
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-75 cursor-pointer"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? (t('detectingLocation') || 'Detecting exact GPS location...') : (t('useCurrentLocation') || 'Use my current GPS location')}</span>
              </button>

              {/* Search Bar with Google Places API Real-Time Autocomplete */}
              <div className="relative space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchSubmitFallback(searchInput);
                  }}
                  className="relative"
                >
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 pointer-events-none" />
                    <input
                      id="location-search-input"
                      type="text"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Search locality, street, landmark, pincode (e.g., Koramangala, Bandra)..."
                      className="w-full pl-10 pr-24 py-2.5 sm:py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border-2 border-emerald-500/40 focus:border-emerald-600 dark:border-zinc-700 dark:focus:border-emerald-500 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition shadow-2xs"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer flex items-center gap-1"
                    >
                      {isSearchingPlaces && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Search</span>
                    </button>
                  </div>
                </form>

                {/* LIVE AUTOCOMPLETE DROPDOWN */}
                {searchInput.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-white dark:bg-zinc-800/95 rounded-2xl border-2 border-emerald-500/40 shadow-xl space-y-3 max-h-72 overflow-y-auto z-20 relative"
                  >
                    {/* 1. Google Places Live Suggestions */}
                    {placesSuggestions.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Google Places Results ({placesSuggestions.length}):
                          </span>
                        </div>
                        {placesSuggestions.map((sug, idx) => {
                          const mainText = sug.placePrediction?.mainText?.text || sug.placePrediction?.text?.text || 'Address';
                          const secondaryText = sug.placePrediction?.secondaryText?.text || '';

                          return (
                            <button
                              key={sug.placePrediction?.placeId || idx}
                              type="button"
                              onClick={() => handleSelectPlaceSuggestion(sug)}
                              className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-zinc-700/70 border border-transparent hover:border-emerald-200 dark:hover:border-zinc-600 transition flex items-center justify-between group cursor-pointer"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                  {mainText}
                                </span>
                                {secondaryText && (
                                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">
                                    {secondaryText}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                                Select
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* 2. Exact Localities from Indian Database */}
                    {indexedSuggestions.matches.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-700/70">
                        <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-1">
                          <MapPin className="w-3 h-3" />
                          <span>Matching Indian Hubs:</span>
                        </div>
                        {indexedSuggestions.matches.slice(0, 4).map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => handleSelectLocality(loc)}
                            className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-zinc-700/70 border border-transparent hover:border-emerald-200 dark:hover:border-zinc-600 transition flex items-center justify-between group cursor-pointer"
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-zinc-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                {loc.name}
                              </span>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {loc.city}, {loc.state} • PIN: {loc.pincode}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 text-white shrink-0">
                              Select
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 3. Nearby Localities */}
                    {indexedSuggestions.nearbySuggestions.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-700/70">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-1">
                          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                          <span>Nearby Popular Hubs:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {indexedSuggestions.nearbySuggestions.slice(0, 6).map((nearby, idx) => (
                            <button
                              key={`${nearby.name}-${idx}`}
                              type="button"
                              onClick={() => handleSelectNearby(nearby)}
                              className="text-left p-2 rounded-xl bg-zinc-50 dark:bg-zinc-700/50 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-zinc-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-700 transition flex items-center justify-between group cursor-pointer"
                            >
                              <div className="min-w-0 pr-1">
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                                  {nearby.name}
                                </span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                                  near {nearby.parentLocality}
                                </span>
                              </div>
                              <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                                {nearby.distance}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Contact Mobile Number Input Required with Delivery Address */}
          <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="modal-contact-phone-input" className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Contact Phone for Delivery (+91 Required):</span>
              </label>
              {phoneInput.length === 10 ? (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Valid 10 Digits
                </span>
              ) : (
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {phoneInput.length}/10 digits
                </span>
              )}
            </div>

            <div className="flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 shadow-2xs">
              <span className="px-2.5 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs border-r border-zinc-200 dark:border-zinc-600 flex items-center gap-1 select-none shrink-0">
                <span>🇮🇳</span>
                <span>+91</span>
              </span>
              <input
                id="modal-contact-phone-input"
                type="tel"
                inputMode="numeric"
                maxLength={16}
                value={phoneInput}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="e.g. 9876543210"
                className="flex-1 min-w-0 px-3 py-2 bg-transparent text-xs sm:text-sm font-mono font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer with Smart Action */}
        <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
              Selected Address:
            </span>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
              {selectedLocation || 'No location selected yet'}
            </p>
          </div>

          {!selectedLocation ? (
            <button
              id="modal-select-maps-btn"
              type="button"
              onClick={() => {
                setActiveTab('map');
                setErrorMessage('Please click or drag the pin anywhere on Google Maps to select your location.');
              }}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-amber-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Select on Google Maps</span>
            </button>
          ) : (
            <button
              id="modal-confirm-location-btn"
              type="button"
              onClick={handleConfirmLocationAndSave}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Set Location</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
