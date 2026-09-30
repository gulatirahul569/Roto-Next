"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/authService";
import AuthLayout from "../../components/auth/AuthLayout";

export default function RegisterPage() {
  const router = useRouter();

  const { user, isAuthLoaded } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isAuthLoaded && user) {
      router.replace("/");
    }
  }, [isAuthLoaded, user, router]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password and confirm password do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await registerUser({
        name,
        email,
        password,
      });

      setSuccessMessage(
        "Account created successfully. Redirecting you to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1400);
    } catch (error) {
      setErrorMessage(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthLoaded) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-950">
        <p className="text-sm font-semibold text-zinc-300">
          Loading account...
        </p>
      </main>
    );
  }

  return (
    <AuthLayout
      title="Create account."
      subtitle="Create your Roto account to save products, track orders, and checkout faster."
      footerText="Already have an account?"
      footerLinkText="Login"
      footerLinkHref="/login"
    >
      {errorMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
          <FiCheckCircle size={18} className="mt-0.5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-zinc-100">
            Full name
          </span>

          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />

            <input
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-400 focus:border-white/50 focus:bg-white/15"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-zinc-100">
            Email address
          </span>

          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />

            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-400 focus:border-white/50 focus:bg-white/15"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-zinc-100">
            Password
          </span>

          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-400 focus:border-white/50 focus:bg-white/15"
            />

            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-zinc-100">
            Confirm password
          </span>

          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />

            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-400 focus:border-white/50 focus:bg-white/15"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={isLoading || Boolean(successMessage)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiUserPlus size={17} />
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}