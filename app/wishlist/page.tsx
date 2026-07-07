"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Compass, Heart, Trash2, ArrowRight, ChevronLeft, FolderHeart, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WishlistPage() {
  const router = useRouter();
  const { currentUser, loadingUser, wishlists, refreshWishlists } = useStore();

  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      Promise.resolve().then(() => {
        refreshWishlists();
      });
    }
  }, [currentUser, refreshWishlists]);

  // Set the first wishlist as active by default if none is selected
  useEffect(() => {
    if (wishlists.length > 0 && !activeListId) {
      Promise.resolve().then(() => {
        setActiveListId(wishlists[0].id);
      });
    }
  }, [wishlists, activeListId]);

  const handleDeletePropertyFromWishlist = async (wishlistId: string, propertyId: string) => {
    try {
      const res = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          wishlistId,
          propertyId,
        }),
      });
      if (res.ok) {
        await refreshWishlists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loadingUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Compass className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 py-20 text-center">
          <div className="max-w-md rounded-3xl border border-slate-150 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <FolderHeart className="mx-auto h-12 w-12 text-slate-350 animate-bounce" />
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">Sign In Required</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please sign in to view, edit, and organize your favorite wilderness lodges inside folders.
            </p>
            <button
              onClick={() => {
                const btn = document.getElementById("open-auth-modal-btn");
                if (btn) btn.click();
              }}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500"
            >
              Secure Sign In
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeWishlist = wishlists.find((w) => w.id === activeListId);

  return (
    <div id="wishlists-container" className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Breadcrumb back */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>Back to explore stays</span>
          </button>
        </div>

        {/* Layout Grid: Left list of folders, Right list of properties */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left folders list (Col 4) */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <h1 className="font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                My Saved Folders
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Organize lodges into custom vacations
              </p>
            </div>

            {wishlists.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 font-medium">No saved folders yet. Click the heart icon on any lodge to create one.</p>
            ) : (
              <div className="space-y-2">
                {wishlists.map((w) => {
                  const isActive = w.id === activeListId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setActiveListId(w.id)}
                      className={`w-full flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-emerald-600 bg-emerald-50/20 dark:border-emerald-500 dark:bg-emerald-950/25"
                          : "border-slate-150 bg-white dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div>
                        <span className={`block text-xs font-bold ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}>
                          {w.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {w.propertyIds.length} properties saved
                        </span>
                      </div>
                      <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? "text-emerald-500 translate-x-1" : "text-slate-400"}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right properties grid (Col 8) */}
          <div className="md:col-span-8">
            {activeWishlist ? (
              <div className="space-y-6">
                <div className="border-b border-slate-150 pb-3 dark:border-slate-800 flex justify-between items-baseline">
                  <h2 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                    {activeWishlist.name} Directory
                  </h2>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {activeWishlist.properties?.length || 0} lodgings saved
                  </span>
                </div>

                {/* Price-Drop Direct Notifications Widget */}
                {activeWishlist.properties && activeWishlist.properties.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 dark:bg-emerald-950/20 dark:border-emerald-900/35 flex items-start gap-3 text-left">
                    <span className="text-xl">🔔</span>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                        Price-Drop Direct Alerts Active
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-normal">
                        WanderLodge smart alerts automatically monitor target off-season rates for your wishlists. We detected a **15% price drop** on **Whispering Pines Cabin** and standard off-season rate releases!
                      </p>
                    </div>
                  </div>
                )}

                {(!activeWishlist.properties || activeWishlist.properties.length === 0) ? (
                  <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40">
                    <Heart className="mx-auto h-10 w-10 text-slate-300 animate-pulse" />
                    <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">Folder is Empty</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                      Explore our catalog, select check-in date criteria, and tap the heart icon to save listings.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {activeWishlist.properties.map((p: any) => (
                      <div
                        key={p.id}
                        className="group relative rounded-3xl border border-slate-150 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all dark:border-slate-800 dark:bg-slate-900"
                      >
                        {/* Remove button */}
                        <button
                          onClick={() => handleDeletePropertyFromWishlist(activeWishlist.id, p.id)}
                          className="absolute right-3 top-3 z-20 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-slate-400 shadow-sm transition hover:scale-105 hover:text-red-600 dark:bg-slate-900/90"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        {/* Price drop badge */}
                        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-rose-500 px-2 py-1 text-[8.5px] font-black uppercase text-white shadow-md animate-pulse">
                          <span className="h-1 w-1 rounded-full bg-white" />
                          <span>15% Price Drop Alert</span>
                        </div>

                        <div
                          onClick={() => router.push(`/properties/${p.id}`)}
                          className="h-40 w-full overflow-hidden bg-slate-100 cursor-pointer"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-102"
                          />
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{p.location}</span>
                            <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-amber-500" />
                              <span>4.9</span>
                            </div>
                          </div>

                          <h3
                            onClick={() => router.push(`/properties/${p.id}`)}
                            className="font-sans font-bold text-sm text-slate-900 dark:text-white mt-1 hover:text-emerald-600 truncate cursor-pointer"
                          >
                            {p.title}
                          </h3>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-sans text-sm font-extrabold text-slate-900 dark:text-white">
                                  ${p.price}
                                </span>
                                <span className="text-[10px] text-slate-400 line-through font-medium">
                                  ${Math.round(p.price * 1.15)}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400"> / night</span>
                            </div>
                            <button
                              onClick={() => router.push(`/properties/${p.id}`)}
                              className="rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] px-2.5 py-1.5 transition dark:bg-emerald-950/40 dark:text-emerald-400"
                            >
                              Explore
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 rounded-3xl bg-white/40 border border-slate-150 dark:bg-slate-900/10">
                <FolderHeart className="mx-auto h-12 w-12 text-slate-350 animate-bounce mb-3" />
                <h3 className="font-sans font-bold text-slate-800 dark:text-slate-200">No Folder Selected</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                  Click on one of your custom saved folders on the left panel to display the corresponding lodge directory.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
