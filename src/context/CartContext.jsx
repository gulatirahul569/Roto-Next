"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

function getStoredCart() {
  try {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
}

/*
  A cart line is identified by product id + selected size.

  T-Shirt / M and T-Shirt / L are separate lines.
  Products without sizes use an empty string, so they behave as before.
*/
function isSameLine(item, id, size = "") {
  return item._id === id && (item.selectedSize || "") === (size || "");
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  useEffect(() => {
    setCartItems(getStoredCart());
    setIsCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!isCartLoaded) {
      return;
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems, isCartLoaded]);

  const addToCart = (product) => {
    const size = product.selectedSize || "";

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) =>
        isSameLine(item, product._id, size)
      );

      if (existingItem) {
        return currentItems.map((item) =>
          isSameLine(item, product._id, size)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { ...product, selectedSize: size, quantity: 1 }];
    });
  };

  const increaseQty = (id, size = "") => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        isSameLine(item, id, size)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id, size = "") => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          isSameLine(item, id, size)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id, size = "") => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => !isSameLine(item, id, size))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price || 0) * item.quantity,
    0
  );

  const value = useMemo(
    () => ({
      cartItems,
      isCartLoaded,
      totalQuantity,
      totalPrice,
      addToCart,
      increaseQty,
      decreaseQty,
      removeFromCart,
      clearCart,
    }),
    [cartItems, isCartLoaded, totalQuantity, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}