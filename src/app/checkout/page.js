"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLocation } from "../../context/LocationContext";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../services/paymentService";
import { createOrder } from "../../services/orderService";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("razorpay-checkout-script");

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");

    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();

  const { user, token, isAuthLoaded } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { location } = useLocation();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shippingCharge = useMemo(() => {
    return totalPrice > 5000 ? 0 : 199;
  }, [totalPrice]);

  const total = totalPrice + shippingCharge;

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!user) {
      router.replace("/login?next=/checkout");
    }
  }, [isAuthLoaded, user, router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setShipping((currentShipping) => ({
      ...currentShipping,
      fullName: currentShipping.fullName || user.name || "",
      pincode: currentShipping.pincode || location?.pincode || "",
      city: currentShipping.city || location?.city || "",
    }));
  }, [user, location]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    let updatedValue = value;

    if (name === "phone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pincode") {
      updatedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setShipping((currentShipping) => ({
      ...currentShipping,
      [name]: updatedValue,
    }));

    setErrorMessage("");
  };

  const validateCheckout = () => {
    if (!user) {
      setErrorMessage("Please login before placing an order.");
      return false;
    }

    if (cartItems.length === 0) {
      setErrorMessage("Your shopping bag is empty.");
      return false;
    }

    const itemsMissingSize = cartItems.filter(
      (item) =>
        Array.isArray(item.sizes) && item.sizes.length > 0 && !item.selectedSize
    );

    if (itemsMissingSize.length > 0) {
      setErrorMessage(
        `Please remove and re-add these products with a size selected: ${itemsMissingSize
          .map((item) => item.name)
          .join(", ")}`
      );
      return false;
    }

    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    const missingField = requiredFields.some(
      (field) => !String(shipping[field] || "").trim()
    );

    if (missingField) {
      setErrorMessage("Please fill all shipping details.");
      return false;
    }

    if (!/^\d{6}$/.test(shipping.pincode)) {
      setErrorMessage("Please enter a valid 6-digit pincode.");
      return false;
    }

    const undeliverableItems = cartItems.filter((item) => {
      const allowedPincodes = item.deliverablePincodes || [];

      return (
        allowedPincodes.length > 0 &&
        !allowedPincodes.includes(shipping.pincode)
      );
    });

    if (undeliverableItems.length > 0) {
      const productNames = undeliverableItems
        .map((item) => item.name)
        .join(", ");

      setErrorMessage(
        `These products cannot be delivered to pincode ${shipping.pincode}: ${productNames}`
      );

      return false;
    }

    return true;
  };

  const placeOrder = async ({
    selectedPaymentMethod,
    paymentStatus,
    paymentId = "",
    razorpayOrderId = "",
  }) => {
    const orderData = {
      userId: user._id,
      items: cartItems,
      shippingAddress: shipping,
      subtotal: totalPrice,
      shippingCharge,
      total,
      paymentMethod: selectedPaymentMethod,
      paymentStatus,
      paymentId,
      razorpayOrderId,
    };

    await createOrder(orderData, token);

    clearCart();

    setSuccessMessage(
      selectedPaymentMethod === "online"
        ? "Payment successful. Your order has been placed."
        : "Your order has been placed successfully."
    );

    setShipping({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

    setTimeout(() => {
      router.push("/my-orders");
    }, 1800);
  };

  const startRazorpayPayment = async () => {
    const isRazorpayLoaded = await loadRazorpayScript();

    if (!isRazorpayLoaded) {
      throw new Error(
        "Unable to load Razorpay. Please check your internet connection and try again."
      );
    }

    const paymentOrderResponse = await createRazorpayOrder(total, token);

    const razorpayOrder = paymentOrderResponse?.order;
    const razorpayKey = paymentOrderResponse?.key;

    if (!razorpayOrder?.id || !razorpayKey) {
      throw new Error("Unable to create a secure payment order.");
    }

    const options = {
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || "INR",
      name: "Roto",
      description: "Roto order payment",
      order_id: razorpayOrder.id,

      prefill: {
        name: shipping.fullName || user?.name || "",
        contact: shipping.phone,
        email: user?.email || "",
      },

      theme: {
        color: "#18181b",
      },

      handler: async (response) => {
        try {
          const verificationResponse = await verifyRazorpayPayment(
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            token
          );

          if (!verificationResponse?.success) {
            throw new Error(
              "Payment verification failed. Please contact support if money was deducted."
            );
          }

          await placeOrder({
            selectedPaymentMethod: "online",
            paymentStatus: "Paid",
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          });
        } catch (error) {
          console.error("Payment verification error:", error);

          setErrorMessage(
            error.message ||
              "Payment verification failed. Please contact support if money was deducted."
          );
        } finally {
          setIsLoading(false);
        }
      },

      modal: {
        ondismiss: () => {
          setIsLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", () => {
      setErrorMessage("Payment failed. Please try again.");
      setIsLoading(false);
    });

    razorpay.open();
  };

  const handlePlaceOrder = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateCheckout()) {
      return;
    }

    setIsLoading(true);

    try {
      if (paymentMethod === "online") {
        await startRazorpayPayment();
        return;
      }

      await placeOrder({
        selectedPaymentMethod: "cod",
        paymentStatus: "Pending",
      });
    } catch (error) {
      console.error("Checkout error:", error);

      setErrorMessage(
        error.message || "Unable to place your order. Please try again."
      );
    } finally {
      if (paymentMethod === "cod") {
        setIsLoading(false);
      }
    }
  };

  if (!isAuthLoaded) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50">
        <p className="text-sm font-semibold text-zinc-500">
          Preparing checkout...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50">
        <p className="text-sm font-semibold text-zinc-500">
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
              Secure checkout
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Complete your order.
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Review your items, add shipping details, and choose a payment
              method.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 self-start rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm md:self-auto">
            <div className="grid size-9 place-items-center rounded-full bg-zinc-100">
              <FiLock size={16} />
            </div>

            <div>
              <p className="text-sm font-bold text-zinc-950">
                Secure checkout
              </p>
              <p className="text-xs text-zinc-500">
                Your details are protected
              </p>
            </div>
          </div>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="mb-7 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <FiCheckCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-bold">{successMessage}</p>
              <p className="mt-1 text-sm">
                Redirecting you to your orders...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <FiXCircle size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm font-semibold">{errorMessage}</p>
          </div>
        )}

        {cartItems.length === 0 && !successMessage ? (
          <section className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm sm:p-16">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-zinc-100">
              <FiShoppingBag size={27} className="text-zinc-700" />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight text-zinc-950">
              Your bag is empty.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Add products to your shopping bag before continuing to checkout.
            </p>

            <Link
              href="/category/all"
              className="mt-7 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
            >
              Browse products
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
            {/* Left side */}
            <div className="space-y-8">
              {/* Shipping details */}
              <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-8 flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-2xl bg-zinc-950 text-white">
                    <FiMapPin size={21} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                      Shipping details
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Enter the address where you want your order delivered.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-zinc-700">
                      Full name
                    </span>

                    <input
                      name="fullName"
                      value={shipping.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-zinc-700">
                      Phone number
                    </span>

                    <input
                      name="phone"
                      inputMode="numeric"
                      value={shipping.phone}
                      onChange={handleChange}
                      placeholder="10-digit phone number"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-zinc-700">
                      City
                    </span>

                    <input
                      name="city"
                      value={shipping.city}
                      onChange={handleChange}
                      placeholder="Your city"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-zinc-700">
                      State
                    </span>

                    <input
                      name="state"
                      value={shipping.state}
                      onChange={handleChange}
                      placeholder="Your state"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-zinc-700">
                      Pincode
                    </span>

                    <input
                      name="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      value={shipping.pincode}
                      onChange={handleChange}
                      placeholder="Enter 6-digit pincode"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-zinc-700">
                      Full address
                    </span>

                    <textarea
                      name="address"
                      rows={4}
                      value={shipping.address}
                      onChange={handleChange}
                      placeholder="House number, street, locality, landmark"
                      className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
                    />
                  </label>
                </div>
              </section>

              {/* Payment method */}
              <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7 flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-950">
                    <FiCreditCard size={21} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                      Payment method
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Choose how you would like to pay.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-5 transition ${
                      paymentMethod === "cod"
                        ? "border-zinc-950 bg-zinc-50"
                        : "border-zinc-200 bg-white hover:border-zinc-400"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-zinc-950">
                        Cash on delivery
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        Pay when your order arrives.
                      </p>
                    </div>

                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="size-4 accent-zinc-950"
                    />
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-5 transition ${
                      paymentMethod === "online"
                        ? "border-zinc-950 bg-zinc-50"
                        : "border-zinc-200 bg-white hover:border-zinc-400"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-zinc-950">
                        Online payment
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        Pay securely using Razorpay.
                      </p>
                    </div>

                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="size-4 accent-zinc-950"
                    />
                  </label>
                </div>
              </section>
            </div>

            {/* Order summary */}
            <aside className="h-fit rounded-3xl border border-zinc-200 bg-white shadow-sm xl:sticky xl:top-24">
              <div className="border-b border-zinc-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-zinc-100">
                    <FiPackage size={18} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black tracking-tight text-zinc-950">
                      Order summary
                    </h2>

                    <p className="text-sm text-zinc-500">
                      {cartItems.length} item
                      {cartItems.length === 1 ? "" : "s"} in your bag
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-80 divide-y divide-zinc-100 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={`${item._id}-${item.selectedSize || ""}`}
                    className="flex gap-4 p-5"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-zinc-950">
                        {item.name}
                      </h3>

                      {item.selectedSize && (
                        <p className="mt-1 text-xs font-semibold text-zinc-600">
                          Size: {item.selectedSize}
                        </p>
                      )}

                      <p className="mt-1 text-xs font-medium text-zinc-500">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-2 text-sm font-black text-zinc-950">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-semibold text-zinc-950">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Shipping</span>
                    <span className="font-semibold text-zinc-950">
                      {shippingCharge === 0
                        ? "Free"
                        : formatPrice(shippingCharge)}
                    </span>
                  </div>

                  {totalPrice <= 5000 && (
                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                      Add {formatPrice(5001 - totalPrice)} more for free
                      shipping.
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-lg">
                    <span className="font-bold text-zinc-950">Total</span>
                    <span className="font-black text-zinc-950">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoading || Boolean(successMessage)}
                  onClick={handlePlaceOrder}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-4 text-sm font-extrabold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  <FiLock size={16} />
                  {isLoading
                    ? paymentMethod === "online"
                      ? "Opening payment..."
                      : "Placing order..."
                    : paymentMethod === "online"
                      ? `Pay ${formatPrice(total)}`
                      : "Place order"}
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs leading-5 text-zinc-500">
                  <FiTruck size={15} className="shrink-0" />
                  Delivery availability is checked using your pincode.
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}