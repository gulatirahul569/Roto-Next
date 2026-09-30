"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

function getStoredWishlist(storageKey) {
  try {
    const savedWishlist = localStorage.getItem(storageKey);
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { user, isAuthLoaded } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [activeWishlistKey, setActiveWishlistKey] = useState("");
  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    const storageKey = user ? `wishlist_${user._id}` : "wishlist_guest";

    setIsWishlistLoaded(false);
    setActiveWishlistKey(storageKey);
    setWishlist(getStoredWishlist(storageKey));
    setIsWishlistLoaded(true);
  }, [user, isAuthLoaded]);

  useEffect(() => {
    if (!isWishlistLoaded || !activeWishlistKey) {
      return;
    }

    localStorage.setItem(activeWishlistKey, JSON.stringify(wishlist));
  }, [wishlist, activeWishlistKey, isWishlistLoaded]);

  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const exists = currentWishlist.some(
        (item) => item._id === product._id
      );

      if (exists) {
        return currentWishlist.filter((item) => item._id !== product._id);
      }

      return [...currentWishlist, product];
    });
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item._id === id);
  };

  const value = useMemo(
    () => ({
      wishlist,
      isWishlistLoaded,
      toggleWishlist,
      isInWishlist,
    }),
    [wishlist, isWishlistLoaded]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider.");
  }

  return context;
}