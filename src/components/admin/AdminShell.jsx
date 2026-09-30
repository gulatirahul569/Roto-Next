"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({ children }) {
  const router = useRouter();

  const { user, isAuthLoaded } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!user || user.role !== "admin") {
      router.replace("/");
    }
  }, [isAuthLoaded, user, router]);

  if (!isAuthLoaded) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-100">
        <p className="text-sm font-semibold text-zinc-500">
          Checking admin access...
        </p>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-100">
        <p className="text-sm font-semibold text-zinc-500">
          Redirecting to the store...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:pl-[280px]">
        <AdminTopbar onMenuOpen={() => setIsSidebarOpen(true)} />

        <main className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}