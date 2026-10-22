"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Stethoscope,
  Users,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLogoutMutation, useMeQuery } from "@/lib/api";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me, isLoading, isError } = useMeQuery();
  const [logout] = useLogoutMutation();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("doctor-tracker-theme");
    const enabled = saved === "dark";
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("doctor-tracker-theme", next ? "dark" : "light");
  }

  async function handleLogout() {
    try {
      await logout().unwrap();
    } finally {
      router.replace("/login");
    }
  }

  if (isLoading) {
    return <div className="p-12 text-center muted">Checking session...</div>;
  }

  return (
    <div className="min-h-screen">
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col text-white lg:flex"
        style={{ background: "var(--sidebar)" }}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
          <div className="rounded-xl bg-blue-500 p-2.5">
            <Activity size={21} />
          </div>
          <div>
            <p className="font-bold">Doctor Tracker</p>
            <p className="mt-1 text-[10px] tracking-widest text-slate-400">
              ADMIN PORTAL
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 pt-8">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Workspace
          </p>
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href === "/doctors" && pathname.startsWith("/doctors/"));

            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="nav-link w-full"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div
            className="flex h-full w-64 flex-col p-4"
            style={{ background: "var(--sidebar)" }}
          >
            <button
              className="mb-5 self-end text-white"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
            >
              <X />
            </button>
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="nav-link"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-screen lg:pl-60">
        <header
          className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b px-4 sm:px-8"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <span className="text-sm font-semibold">
              {links.find((link) => link.href === pathname)?.label ??
                (pathname.startsWith("/doctors/")
                  ? "Doctor details"
                  : "Doctor Tracker")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="btn-secondary !p-2.5"
              onClick={toggleTheme}
              aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200"
              title={me?.name || me?.user?.name || "Administrator"}
            >
              {String(me?.name || me?.user?.name || "AD")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}