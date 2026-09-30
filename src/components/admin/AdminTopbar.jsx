"use client";

import { FiMenu } from "react-icons/fi";

export default function AdminTopbar({ onMenuOpen }) {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur-md lg:hidden">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-amber-700">
          Roto
        </p>

        <h1 className="text-lg font-black tracking-tight text-zinc-950">
          Admin Panel
        </h1>
      </div>

      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Open admin navigation"
        className="grid size-10 place-items-center rounded-xl bg-zinc-950 text-white transition hover:bg-zinc-800"
      >
        <FiMenu size={20} />
      </button>
    </header>
  );
}