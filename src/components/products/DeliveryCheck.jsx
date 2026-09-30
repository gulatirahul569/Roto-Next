"use client";

import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiMapPin,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";
import { useLocation } from "../../context/LocationContext";

export default function DeliveryCheck({ product }) {
  const { location } = useLocation();

  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (location?.pincode && !pincode) {
      setPincode(location.pincode);
    }
  }, [location, pincode]);

  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setStatus("invalid");
      return;
    }

    const allowedPincodes = product?.deliverablePincodes || [];

    if (allowedPincodes.length === 0) {
      setStatus("available");
      return;
    }

    setStatus(
      allowedPincodes.includes(pincode) ? "available" : "unavailable"
    );
  };

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-sm">
          <FiMapPin size={18} className="text-zinc-900" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-zinc-950">
            Check delivery availability
          </h3>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Enter your pincode to check if this product can be delivered to
            your location.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={pincode}
          maxLength={6}
          placeholder="Enter 6-digit pincode"
          onChange={(event) => {
            const onlyNumbers = event.target.value
              .replace(/\D/g, "")
              .slice(0, 6);

            setPincode(onlyNumbers);
            setStatus(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              checkDelivery();
            }
          }}
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950"
        />

        <button
          type="button"
          onClick={checkDelivery}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
        >
          <FiTruck size={16} />
          Check
        </button>
      </div>

      {status === "available" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <FiCheckCircle size={18} />
          Delivery is available in your area.
        </div>
      )}

      {status === "unavailable" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <FiXCircle size={18} />
          Sorry, we do not deliver to this pincode yet.
        </div>
      )}

      {status === "invalid" && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Please enter a valid 6-digit pincode.
        </div>
      )}
    </div>
  );
}