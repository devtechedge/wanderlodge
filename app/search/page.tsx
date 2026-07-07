"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, SlidersHorizontal, Star, Heart, Map, List, Compass, ChevronLeft, Check, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import InteractiveMap from "@/components/InteractiveMap";
import DatePicker from "@/components/DatePicker";
import { Property } from "@/lib/db";

// Next.js Search Params Wrapper to bypass SSR limits
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, wishlists, refreshWishlists, searchQuery, setSearchQuery } = useStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Map Visibility State (Mainly for mobile split toggle)
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Highlighting and binding selections
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [visiblePropIds, setVisiblePropIds] = useState<string[]>([]);
  const [searchBoundingFilter, setSearchBoundingFilter] = useState(true);

  // Retrieve Search URL Params
  const queryLocation = searchParams.get("location") || "";
  const queryGuests = searchParams.get("guests") || "1";
  const queryStart = searchParams.get("startDate") || "";
  const queryEnd = searchParams.get("endDate") || "";
  const queryMin = searchParams.get("minPrice") || "0";
  const queryMax = searchParams.get("maxPrice") || "600";
  const queryAmenities = searchParams.get("amenities") || "";

  // Local sync inputs
  const [locInput, setLocInput] = useState(queryLocation);
  const [guestCount, setGuestCount] = useState(parseInt(queryGuests, 10));
  const [dates, setDates] = useState({ start: queryStart, end: queryEnd });

  const fetchFilteredProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const res = await fetch(`/api/properties?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Load Filter Constraints
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchFilteredProperties();
    });
  }, [fetchFilteredProperties]);

  const handleUpdateSearch = () => {
    const params = new URLSearchParams();
    if (locInput) params.set("location", locInput);
    if (guestCount > 1) params.set("guests", String(guestCount));
    if (dates.start) params.set("startDate", dates.start);
    if (dates.end) params.set("endDate", dates.end);
    if (queryMin !== "0") params.set("minPrice", queryMin);
    if (queryMax !== "600") params.set("maxPrice", queryMax);
    if (queryAmenities) params.set("amenities", queryAmenities);

    router.push(`/search?${params.toString()}`);
  };

  // Check if a property should be displayed in the list
  const filteredListProperties = properties.filter((p) => {
    if (!searchBoundingFilter) return true;
    return visiblePropIds.includes(p.id);
  });

  const handleToggleWishlist = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      const btn = document.getElementById("open-auth-modal-btn");
      if (btn) btn.click();
      return;
    }

    // Default to the first wishlist for instant toggling in search
    if (wishlists.length > 0) {
      const firstList = wishlists[0];
      const res = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          wishlistId: firstList.id,
          propertyId,
        }),
      });
      if (res.ok) {
        await refreshWishlists();
      }
    } else {
      // Create a default wishlist folder
      const resCreate = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: "Summer Vacation 2027" }),
      });
      if (resCreate.ok) {
        const data = await resCreate.json();
        const resToggle = await fetch("/api/wishlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "toggle",
            wishlistId: data.wishlist.id,
            propertyId,
          }),
        });
        if (resToggle.ok) {
          await refreshWishlists();
        }
      }
    }
  };

  const isSaved = (propertyId: string) => {
    return wishlists.some((w) => w.propertyIds.includes(propertyId));
  };

  return (
    <div id="searchpage-container" className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      <Navbar />

      {/* Mini-Query Search Subbar */}
      <section id="search-subbar" className="border-b border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 z-10 shrink-0">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shrink-0 pr-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Home</span>
          </button>

          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            {/* Location */}
            <div className="md:col-span-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950">
              <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
              <input
                type="text"
                value={locInput}
                onChange={(e) => setLocInput(e.target.value)}
                placeholder="Region search"
                className="w-full text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none"
              />
            </div>

            {/* Date Picker */}
            <div className="md:col-span-6">
              <DatePicker
                startDate={dates.start}
                endDate={dates.end}
                onDatesChange={(start, end) => setDates({ start, end })}
              />
            </div>

            {/* Guests & Action button */}
            <div className="md:col-span-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950 w-full">
                <Users className="h-4 w-4 text-emerald-500 shrink-0" />
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                  className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none w-full cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n} className="dark:bg-slate-900">
                      {n} Guest{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpdateSearch}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shrink-0 dark:bg-emerald-500"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split-Screen Panel container */}
      <div className="flex-grow flex relative overflow-hidden">
        {/* Left Side: Lodging feed */}
        <div
          id="search-list-panel"
          className={`w-full lg:w-[50%] h-full overflow-y-auto px-4 py-6 sm:px-6 relative transition-all ${
            showMobileMap ? "hidden lg:block" : "block"
          }`}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Found {properties.length} total • showing {filteredListProperties.length} on map
              </span>
              <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                Lodgings in {queryLocation || "Wander Valley"}
              </h2>
            </div>

            {/* Bounding box sync toggle */}
            <button
              onClick={() => setSearchBoundingFilter(!searchBoundingFilter)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase transition ${
                searchBoundingFilter
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800"
              }`}
            >
              <div className={`h-2.5 w-2.5 rounded-full ${searchBoundingFilter ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span>Search as I Move Map</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-3xl border border-slate-150 bg-white p-4 flex gap-4 dark:border-slate-800 dark:bg-slate-900 animate-pulse">
                  <div className="h-28 w-36 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-2 w-full py-1">
                    <div className="h-4 w-2/3 rounded-md bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-1/3 rounded-md bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-1/4 rounded-md bg-slate-200 dark:bg-slate-800 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredListProperties.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40">
              <Compass className="mx-auto h-12 w-12 text-slate-300 animate-bounce" />
              <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">No Lodges in Current Map View</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Drag or zoom out the map on the right to discover lodges nearby, or toggle off <b>Search as I Move Map</b>.
              </p>
              <button
                onClick={() => setSearchBoundingFilter(false)}
                className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Disable Map Bounding Filter
              </button>
            </div>
          ) : (
            <div className="space-y-4 pb-20">
              {filteredListProperties.map((p) => {
                const isSelected = p.id === selectedPropId;
                const isSavedVal = isSaved(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPropId(p.id);
                      router.push(`/properties/${p.id}`);
                    }}
                    onMouseEnter={() => setSelectedPropId(p.id)}
                    className={`group rounded-3xl border overflow-hidden bg-white p-3 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-xl cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 ring-1 ring-emerald-500/20 dark:border-emerald-500 dark:bg-slate-900/60"
                        : "border-slate-150 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    {/* Lodge thumbnail */}
                    <div className="relative h-36 w-full sm:w-44 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-103"
                      />
                      <button
                        onClick={(e) => handleToggleWishlist(e, p.id)}
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow"
                      >
                        <Heart className={`h-3.5 w-3.5 ${isSavedVal ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
                      </button>
                    </div>

                    {/* Lodge info info */}
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {p.location} • UP TO {p.maxGuests} GUESTS
                          </span>
                          <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            <span>4.9</span>
                          </div>
                        </div>

                        <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {p.title}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex flex-wrap gap-1">
                          {p.amenities.slice(0, 2).map((a) => (
                            <span
                              key={a}
                              className="rounded-lg bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                            >
                              {a}
                            </span>
                          ))}
                        </div>

                        <div>
                          <span className="font-sans text-base font-extrabold text-slate-900 dark:text-white">
                            ${p.price}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium"> / night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Map Canvas */}
        <div
          id="search-map-panel"
          className={`w-full lg:w-[50%] h-full transition-all ${
            showMobileMap ? "block" : "hidden lg:block"
          }`}
        >
          <InteractiveMap
            properties={properties}
            selectedPropertyId={selectedPropId}
            onSelectProperty={setSelectedPropId}
            onVisiblePropertiesChange={setVisiblePropIds}
          />
        </div>

        {/* Mobile View Toggle Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden">
          <button
            onClick={() => setShowMobileMap(!showMobileMap)}
            className="flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur-md px-5 py-3 text-xs font-bold text-white shadow-xl hover:scale-105 active:scale-95 dark:bg-slate-100 dark:text-slate-900 transition-all border border-slate-800"
          >
            {showMobileMap ? (
              <>
                <List className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                <span>Show List Feed</span>
              </>
            ) : (
              <>
                <Map className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                <span>Show Map Canvas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Global wrap in Suspense for NextAuth URL param hydration safety
export default function Search() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Compass className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
