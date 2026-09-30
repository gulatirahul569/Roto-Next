"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import {
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiLogIn,
  FiMail,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/auth/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login, googleLogin, user, isAuthLoaded } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const redirectPath = searchParams.get("next") || "/";

  useEffect(() => {
    if (isAuthLoaded && user) {
      router.replace(redirectPath);
    }
  }, [isAuthLoaded, user, router, redirectPath]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setErrorMessage("Please enter your email address and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await login({
        email,
        password,
      });

      router.push(redirectPath);
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setErrorMessage("Google login could not be completed.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await googleLogin(credentialResponse.credential);
      router.push(redirectPath);
    } catch (error) {
      setErrorMessage(
        error.message || "Google login failed. Please try again."
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
      title="Welcome back."
      subtitle="Login to access your wishlist, orders, and checkout."
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerLinkHref="/register"
    >
      {errorMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
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

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiLogIn size={17} />
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/20" />
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
          Or
        </span>
        <div className="h-px flex-1 bg-white/20" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() =>
            setErrorMessage("Google login failed. Please try again.")
          }
          theme="filled_black"
          shape="pill"
          text="continue_with"
        />
      </div>

      <Link
        href="/"
        className="mt-7 block text-center text-xs font-semibold text-zinc-400 transition hover:text-white"
      >
        Continue browsing as guest
      </Link>
    </AuthLayout>
  );
}