"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LocationContext = createContext(null);

function getStoredLocation() {
  try {
    const savedLocation = localStorage.getItem("roto_location");
    return savedLocation ? JSON.parse(savedLocation) : null;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocation(getStoredLocation());
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          if (!response.ok) {
            throw new Error("Unable to find your address.");
          }

          const data = await response.json();
          const address = data.address || {};

          const savedLocation = {
            lat: latitude,
            lon: longitude,
            city:
              address.city ||
              address.town ||
              address.village ||
              address.county ||
              "Unknown",
            area: address.suburb || address.neighbourhood || "",
            pincode: address.postcode || "",
          };

          setLocation(savedLocation);
          localStorage.setItem(
            "roto_location",
            JSON.stringify(savedLocation)
          );
        } catch {
          setError("Could not fetch your address.");
        } finally {
          setLoading(false);
        }
      },
      (positionError) => {
        setLoading(false);

        setError(
          positionError.code === 1
            ? "Location permission denied."
            : "Unable to fetch your location."
        );
      }
    );
  }, []);

  const value = useMemo(
    () => ({
      location,
      loading,
      error,
      detectLocation,
    }),
    [location, loading, error, detectLocation]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used inside LocationProvider.");
  }

  return context;
}