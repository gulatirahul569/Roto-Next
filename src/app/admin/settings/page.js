"use client";

import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiGlobe,
  FiLoader,
  FiSave,
  FiSettings,
  FiShoppingBag,
  FiTruck,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import {
  getStoreSettings,
  updateStoreSettings,
} from "../../../services/settingsService";

const defaultSettings = {
  storeName: "Roto",
  shippingCharge: 0,
  taxPercent: 0,
  paymentCOD: true,
  paymentOnline: false,
};

function Toggle({
  name,
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300">
      <span>
        <span className="block text-sm font-extrabold text-zinc-950">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      </span>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
      />

      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-zinc-300 transition peer-checked:bg-zinc-950 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
    </label>
  );
}

function NumberInput({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  prefix,
  suffix,
  min = 0,
  max,
  hint,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-extrabold text-zinc-800"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />
        )}

        {prefix && (
          <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
            {prefix}
          </span>
        )}

        <input
          id={name}
          name={name}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white ${
            prefix ? "pl-16" : Icon ? "pl-11" : "pl-4"
          } ${suffix ? "pr-12" : "pr-4"}`}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
            {suffix}
          </span>
        )}
      </div>

      {hint && <p className="mt-2 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { token, user, isAuthLoaded } = useAuth();

  const [settings, setSettings] = useState(defaultSettings);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setErrorMessage("");

        const data = await getStoreSettings(token);

        setSettings({
          ...defaultSettings,
          ...data,
        });
      } catch (error) {
        console.error("Unable to load store settings:", error);

        setErrorMessage(
          error.message ||
            "Settings could not be loaded. Please refresh and try again."
        );
      } finally {
        setIsReady(true);
      }
    }

    if (!isAuthLoaded) {
      return;
    }

    if (!token || user?.role !== "admin") {
      setErrorMessage("Admin access is required to view store settings.");
      setIsReady(true);
      return;
    }

    loadSettings();
  }, [token, user, isAuthLoaded]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSave = async () => {
    const normalizedSettings = {
      ...settings,
      storeName: String(settings.storeName || "").trim(),
      shippingCharge: Math.max(0, Number(settings.shippingCharge || 0)),
      taxPercent: Math.min(
        100,
        Math.max(0, Number(settings.taxPercent || 0))
      ),
    };

    if (!normalizedSettings.storeName) {
      setErrorMessage("Please enter a store name before saving.");
      return;
    }

    if (!normalizedSettings.paymentCOD && !normalizedSettings.paymentOnline) {
      setErrorMessage("Keep at least one payment method enabled.");
      return;
    }

    try {
      setIsSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const savedSettings = await updateStoreSettings(
        normalizedSettings,
        token
      );

      setSettings({
        ...defaultSettings,
        ...savedSettings,
      });

      setSuccessMessage("Store settings saved successfully.");
    } catch (error) {
      console.error("Unable to save admin settings:", error);

      setErrorMessage(
        error.message || "Settings could not be saved. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="animate-pulse">
          <div className="h-4 w-36 rounded bg-zinc-200" />
          <div className="mt-4 h-10 w-64 rounded bg-zinc-200" />
          <div className="mt-3 h-5 w-96 max-w-full rounded bg-zinc-100" />

          <div className="mt-8 h-64 rounded-3xl border border-zinc-200 bg-white" />
          <div className="mt-6 h-64 rounded-3xl border border-zinc-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-10">
      {/* Header */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
            Store configuration
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Settings.
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Configure store identity, checkout charges, and the payment methods
            shown to customers.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-extrabold text-zinc-600 shadow-sm">
          <FiSettings size={15} />
          Database-backed settings
        </div>
      </section>

      {/* Database settings notice */}
      <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <div className="flex items-start gap-3">
          <FiAlertCircle size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-extrabold">Shared store settings</p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              These settings are securely stored in the database and shared
              across admin devices. Customer checkout will use them once
              checkout pricing is connected to the Settings API.
            </p>
          </div>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <div className="flex items-start gap-3">
            <FiCheckCircle size={19} className="mt-0.5 shrink-0" />
            <p className="text-sm font-bold">{successMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Close success message"
            className="shrink-0"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <FiAlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="text-sm font-bold">{errorMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setErrorMessage("")}
            aria-label="Close error message"
            className="shrink-0"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      <div className="mt-7 space-y-6">
        {/* Store settings */}
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-start gap-4 border-b border-zinc-100 p-5 sm:p-6">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white">
              <FiShoppingBag size={19} />
            </div>

            <div>
              <h2 className="text-lg font-black tracking-tight text-zinc-950">
                Store profile
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                The name used to identify your store in the admin panel.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <label
              htmlFor="storeName"
              className="mb-2 block text-sm font-extrabold text-zinc-800"
            >
              Store name
            </label>

            <div className="relative">
              <FiGlobe
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                id="storeName"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                placeholder="For example, Roto"
                maxLength={80}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* Checkout settings */}
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-start gap-4 border-b border-zinc-100 p-5 sm:p-6">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800">
              <FiTruck size={20} />
            </div>

            <div>
              <h2 className="text-lg font-black tracking-tight text-zinc-950">
                Delivery and tax
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Set the base delivery charge and tax percentage stored for
                future checkout pricing.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <NumberInput
              label="Shipping charge"
              name="shippingCharge"
              value={settings.shippingCharge}
              onChange={handleChange}
              icon={FiTruck}
              prefix="₹"
              min="0"
              hint="Use 0 to offer free delivery."
            />

            <NumberInput
              label="Tax percentage"
              name="taxPercent"
              value={settings.taxPercent}
              onChange={handleChange}
              icon={FiDollarSign}
              suffix="%"
              min="0"
              max="100"
              hint="Enter a value from 0 to 100."
            />
          </div>
        </section>

        {/* Payment settings */}
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-start gap-4 border-b border-zinc-100 p-5 sm:p-6">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-800">
              <FiCreditCard size={20} />
            </div>

            <div>
              <h2 className="text-lg font-black tracking-tight text-zinc-950">
                Payment methods
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Choose which payment options should be available to customers.
              </p>
            </div>
          </div>

          <div className="space-y-3 p-5 sm:p-6">
            <Toggle
              name="paymentCOD"
              checked={settings.paymentCOD}
              onChange={handleChange}
              label="Cash on Delivery"
              description="Allow customers to pay when their order is delivered."
            />

            <Toggle
              name="paymentOnline"
              checked={settings.paymentOnline}
              onChange={handleChange}
              label="Online payment"
              description="Show the online payment option at checkout when your payment gateway is configured."
            />
          </div>
        </section>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-extrabold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <FiLoader size={18} className="animate-spin" />
              Saving settings...
            </>
          ) : (
            <>
              <FiSave size={18} />
              Save settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}