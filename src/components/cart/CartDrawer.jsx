"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiChevronLeft, FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export default function CartDrawer({ isOpen, onClose }) {
  const router = useRouter();

  const {
    cartItems,
    isCartLoaded,
    totalPrice,
    increaseQty,
    decreaseQty,
    removeFromCart,
  } = useCart();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    onClose();
    router.push("/checkout");
  };

  const handleContinueShopping = () => {
    onClose();
    router.push("/category/all");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-700">
              Your selection
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
              Shopping bag
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping cart"
            className="grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-900 transition hover:bg-zinc-200"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!isCartLoaded ? (
            <div className="grid min-h-full place-items-center p-8 text-center">
              <p className="text-sm text-zinc-500">Loading your cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="grid min-h-full place-items-center p-8 text-center">
              <div className="mb-5 grid size-16 place-items-center rounded-full bg-zinc-100">
                <FiShoppingBag size={26} className="text-zinc-600" />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-zinc-950">
                Your bag is empty
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-zinc-500">
                Add products you like, and they will appear here for checkout.
              </p>

              <button
                type="button"
                onClick={handleContinueShopping}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-900 underline underline-offset-4 hover:text-zinc-700"
              >
                <FiChevronLeft size={16} />
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col px-6 pb-5 pt-3">
              {cartItems.map((item) => (
                <article
                  key={item._id}
                  className="grid grid-cols-[92px_1fr] gap-4 border-b border-zinc-200 py-5"
                >
                  {/* Image */}
                  <div className="aspect-[1/1.15] overflow-hidden rounded-xl bg-zinc-100">
                    <img
                      src={item.image || "/images/product-placeholder.png"}
                      alt={item.name || "Cart product"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex min-w-0 flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-zinc-500">
                          {item.category || "Roto collection"}
                        </p>

                        <h3 className="truncate text-sm font-semibold text-zinc-950">
                          {item.name}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="grid size-8 place-items-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity */}
                      <div className="inline-grid grid-cols-[30px_34px_30px] items-center overflow-hidden rounded-full border border-zinc-300">
                        <button
                          type="button"
                          onClick={() => decreaseQty(item._id)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="grid size-[30px] place-items-center bg-transparent text-zinc-900 transition hover:bg-zinc-100"
                        >
                          <FiMinus size={14} />
                        </button>

                        <span className="text-center text-xs font-extrabold text-zinc-950">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQty(item._id)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="grid size-[30px] place-items-center bg-transparent text-zinc-900 transition hover:bg-zinc-100"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      <strong className="text-sm font-bold text-zinc-950">
                        {formatPrice(Number(item.price || 0) * item.quantity)}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isCartLoaded && cartItems.length > 0 && (
          <div className="border-t border-zinc-200 bg-white px-6 pb-6 pt-5">
            <div className="mb-3 flex items-center justify-between text-base">
              <span className="text-zinc-600">Subtotal</span>
              <strong className="text-lg font-bold text-zinc-950">
                {formatPrice(totalPrice)}
              </strong>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-zinc-500">
              Delivery charges and applicable taxes will be calculated at
              checkout.
            </p>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-full bg-zinc-950 py-3.5 text-sm font-extrabold text-white transition hover:bg-zinc-800"
            >
              Proceed to checkout
            </button>

            <button
              type="button"
              onClick={handleContinueShopping}
              className="mt-4 w-full text-center text-sm font-bold text-zinc-900 underline underline-offset-4 hover:text-zinc-700"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}