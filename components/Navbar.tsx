"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, User as UserIcon, LogOut, Compass, LayoutDashboard, Key, ClipboardList, Heart, X, Sparkles, LogIn } from "lucide-react";
import { useStore } from "@/lib/store";

export default function Navbar() {
  const {
    currentUser,
    loadingUser,
    theme,
    toggleTheme,
    switchRole,
    logout,
  } = useStore();

  const router = useRouter();
  const pathname = usePathname();
  const [isOpenAuthModal, setIsOpenAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authRole, setAuthRole] = useState<"TRAVELER" | "PROVIDER">("TRAVELER");
  const [authError, setAuthError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoadingAuth(true);

    try {
      const payload =
        authMode === "login"
          ? { action: "login", email: authEmail, password: authPassword }
          : { action: "register", name: authName, email: authEmail, password: authPassword, role: authRole };

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
      } else {
        setIsOpenAuthModal(false);
        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
        // Reload page or force router refresh to sync layouts
        window.location.reload();
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication services.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
    setAuthError("");
  };

  return (
    <header id="main-header" className="sticky top-0 z-50 w-full nav-frost transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-x-2">
        {/* Logo */}
        <Link id="nav-logo-link" href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-[var(--glow-brand)] transition-transform group-hover:scale-105">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div className="shrink-0">
            <span className="font-display text-base sm:text-xl font-bold tracking-tight text-foreground block whitespace-nowrap">
              Wander<span className="text-brand">Lodge</span>
            </span>
            <div className="hidden text-[10px] font-mono tracking-[0.18em] text-muted-foreground sm:block uppercase">
              Elite Lodging
            </div>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            id="nav-link-explore"
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/" ? "text-brand" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Explore Lodges
          </Link>
          {currentUser && currentUser.role === "PROVIDER" && (
            <Link
              id="nav-link-provider"
              href="/provider"
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith("/provider") ? "text-brand" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Provider Area
            </Link>
          )}
          {currentUser && currentUser.role === "TRAVELER" && (
            <Link
              id="nav-link-trips"
              href="/trips"
              className={`text-sm font-medium transition-colors ${
                pathname === "/trips" ? "text-brand" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Journeys
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            data-testid="theme-toggle"
            onClick={toggleTheme}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border text-foreground hover:bg-muted transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle Theme Mode"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* Session Actions */}
          {loadingUser ? (
            <div className="h-10 w-24 animate-pulse rounded-2xl bg-muted shrink-0" />
          ) : currentUser ? (
            <div className="relative shrink-0">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border p-1 pr-2 sm:pr-3 transition-colors hover:bg-muted shrink-0"
              >
                <img
                  src={currentUser.image}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover shrink-0"
                />
                <span className="hidden text-sm font-medium text-foreground sm:inline truncate max-w-[80px]">
                  {currentUser.name.split(" ")[0]}
                </span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div
                      id="profile-menu-overlay"
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <motion.div
                      id="profile-menu-dropdown"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-lift)]"
                    >
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-xs text-muted-foreground font-medium">Signed in as</p>
                        <p className="font-semibold text-sm truncate text-foreground">{currentUser.name}</p>
                        <span className="inline-block mt-1 rounded-full bg-brand-muted text-[10px] font-semibold text-brand px-2 py-0.5">
                          {currentUser.role === "PROVIDER" ? "Elite Provider" : "Traveler Mode"}
                        </span>
                      </div>

                      <div className="mt-1 space-y-0.5">
                        <button
                          onClick={async () => {
                            setShowProfileMenu(false);
                            await switchRole();
                            router.push(currentUser.role === "PROVIDER" ? "/trips" : "/provider");
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <Sparkles className="h-4 w-4 text-brand" />
                          Switch to {currentUser.role === "PROVIDER" ? "Traveler" : "Provider"}
                        </button>

                        <Link
                          href={currentUser.role === "PROVIDER" ? "/provider" : "/trips"}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                          {currentUser.role === "PROVIDER" ? "Provider Dashboard" : "My Journeys"}
                        </Link>

                        <Link
                          href="/wishlist"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <Heart className="h-4 w-4 text-red-500" />
                          My Wishlists
                        </Link>

                        <hr className="my-1 border-border" />

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                            router.push("/");
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              id="open-auth-modal-btn"
              data-testid="sign-in"
              onClick={() => {
                setAuthMode("login");
                setIsOpenAuthModal(true);
              }}
              className="h-10 px-3 sm:px-4 btn-brand font-medium rounded-2xl flex items-center justify-center gap-1.5 transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wide">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal overlay */}
      <AnimatePresence>
        {isOpenAuthModal && (
          <div id="auth-modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setIsOpenAuthModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-50 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-lift)]"
            >
              <button
                onClick={() => setIsOpenAuthModal(false)}
                className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-foreground tracking-tight">
                  {authMode === "login" ? "Welcome back to WanderLodge" : "Create your account"}
                </h3>
                <p className="text-center text-xs text-muted-foreground mt-1">
                  Connect with world-class providers and exclusive local lodges.
                </p>
              </div>

              {authError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Marcus Traveler"
                      className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:bg-card"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    data-testid="auth-email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. marcus@wanderlodge.com"
                    className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:bg-card"
                  />
                  {authMode === "login" && (
                    <span className="block mt-1 text-[10px] text-muted-foreground">
                      Try <b>marcus@wanderlodge.com</b> or <b>evelyn@wanderlodge.com</b>
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    data-testid="auth-password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:bg-card"
                  />
                  {authMode === "login" && (
                    <span className="block mt-1 text-[10px] text-muted-foreground">
                      Demo password is server-side - see <b>SECURITY.md</b>
                    </span>
                  )}
                </div>

                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">
                      Account Tier / Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAuthRole("TRAVELER")}
                        className={`rounded-xl border p-2.5 text-center transition-all ${
                          authRole === "TRAVELER"
                            ? "border-brand bg-brand-muted text-brand"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="block text-xs font-bold">Traveler</span>
                        <span className="text-[10px] opacity-80">Book unique stays</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthRole("PROVIDER")}
                        className={`rounded-xl border p-2.5 text-center transition-all ${
                          authRole === "PROVIDER"
                            ? "border-brand bg-brand-muted text-brand"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="block text-xs font-bold">Lodge Provider</span>
                        <span className="text-[10px] opacity-80">List & host lodges</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  data-testid="auth-submit"
                  disabled={loadingAuth}
                  className="mt-2 w-full rounded-2xl btn-brand py-3 text-sm font-semibold transition-transform focus:scale-[0.98] disabled:opacity-50"
                >
                  {loadingAuth ? "Please wait..." : authMode === "login" ? "Sign In" : "Register and Sign In"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={toggleAuthMode}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  {authMode === "login" ? "Don't have an account? Create one" : "Already have an account? Sign In"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
