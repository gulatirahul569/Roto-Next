"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiMail,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { getAllUsers } from "../../../services/userService";

function formatDate(date) {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function UserAvatar({ user, size = "size-10" }) {
  const firstLetter = String(user?.name || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div
      className={`grid ${size} shrink-0 place-items-center rounded-full bg-zinc-100 text-sm font-black text-zinc-700`}
    >
      {firstLetter}
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "admin";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${
        isAdmin
          ? "bg-violet-50 text-violet-700"
          : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {isAdmin ? <FiShield size={13} /> : <FiUser size={13} />}
      {isAdmin ? "Admin" : "Customer"}
    </span>
  );
}

function UserDetailsModal({ user, onClose }) {
  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="size-14" />

            <div className="min-w-0">
              <h2 className="truncate text-xl font-black tracking-tight text-zinc-950">
                {user.name || "Unnamed user"}
              </h2>

              <p className="mt-1 truncate text-sm text-zinc-500">
                {user.email || "Email unavailable"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close user details"
            className="grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-950 transition hover:bg-zinc-200"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="mt-7 space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
            <span className="text-sm font-semibold text-zinc-500">Role</span>
            <RoleBadge role={user.role} />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
            <span className="text-sm font-semibold text-zinc-500">
              Total orders
            </span>

            <span className="inline-flex items-center gap-2 text-sm font-black text-zinc-950">
              <FiPackage size={16} />
              {Number(user.orderCount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
            <span className="text-sm font-semibold text-zinc-500">
              Account status
            </span>

            <span className="inline-flex items-center gap-2 text-sm font-black text-emerald-700">
              <FiCheckCircle size={16} />
              Active
            </span>
          </div>

          {user.createdAt && (
            <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
              <span className="text-sm font-semibold text-zinc-500">
                Joined
              </span>

              <span className="text-sm font-bold text-zinc-950">
                {formatDate(user.createdAt)}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-xl bg-zinc-950 py-3.5 text-sm font-extrabold text-white transition hover:bg-zinc-800"
        >
          Close details
        </button>
      </div>
    </div>
  );
}

function UserTableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-2xl bg-zinc-100"
        />
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const loadUsers = async ({ showRefreshState = false } = {}) => {
    try {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage("");

      const data = await getAllUsers(token);
      const userList = data?.users || data || [];

      setUsers(Array.isArray(userList) ? userList : []);
    } catch (error) {
      console.error("Admin users error:", error);

      setErrorMessage(
        error.message || "Unable to load registered users. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      const name = String(user.name || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const role = String(user.role || "").toLowerCase();

      return (
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        role.includes(normalizedSearch)
      );
    });
  }, [users, searchTerm]);

  const customerCount = users.filter((user) => user.role !== "admin").length;
  const adminCount = users.filter((user) => user.role === "admin").length;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
            Customer management
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Registered users.
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Review customer accounts, admin roles, and total order activity.
          </p>
        </div>

        <div className="flex w-fit gap-2">
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-zinc-500">
              Customers
            </p>

            <p className="mt-1 text-lg font-black text-zinc-950">
              {customerCount}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-zinc-500">
              Admins
            </p>

            <p className="mt-1 text-lg font-black text-zinc-950">
              {adminCount}
            </p>
          </div>
        </div>
      </section>

      {/* Error */}
      {errorMessage && (
        <div className="mt-7 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <FiAlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="text-sm font-bold">{errorMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setErrorMessage("")}
            aria-label="Close error message"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* Search toolbar */}
      <section className="mt-7 flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
          />
        </div>

        <button
          type="button"
          onClick={() => loadUsers({ showRefreshState: true })}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-extrabold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </section>

      {/* User table */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <UserTableSkeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="grid min-h-80 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-zinc-100 text-zinc-500">
                <FiUsers size={25} />
              </div>

              <h2 className="mt-5 text-xl font-black tracking-tight text-zinc-950">
                No users found.
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Try a different search term.
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-5 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Orders</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className="cursor-pointer transition hover:bg-zinc-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />

                          <div className="min-w-0">
                            <p className="max-w-64 truncate text-sm font-bold text-zinc-950">
                              {user.name || "Unnamed user"}
                            </p>

                            <p className="mt-1 flex max-w-64 items-center gap-1.5 truncate text-xs text-zinc-500">
                              <FiMail size={13} />
                              {user.email || "Email unavailable"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm font-black text-zinc-950">
                          <FiPackage size={16} className="text-zinc-500" />
                          {Number(user.orderCount || 0)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                          <FiCheckCircle size={13} />
                          Active
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-extrabold text-zinc-700 transition hover:bg-zinc-200"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 md:hidden">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:bg-zinc-100"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar user={user} size="size-12" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-zinc-950">
                        {user.name || "Unnamed user"}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {user.email || "Email unavailable"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <RoleBadge role={user.role} />

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-zinc-600">
                          <FiPackage size={13} />
                          {Number(user.orderCount || 0)} orders
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Details modal */}
      <UserDetailsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}