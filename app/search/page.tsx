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

  // Sensory Filters Params
  const queryDecibel = searchParams.get("decibelAtmosphere") || "";
  const queryMinAstro = searchParams.get("minAstroScore") || "0";
  const queryYardRequired = searchParams.get("enclosedYardRequired") || "false";
  const queryMinFenceHeight = searchParams.get("minFenceHeight") || "";
  const queryWorkstationRequired = searchParams.get("ergonomicWorkstationRequired") || "false";
  const queryMinUploadSpeed = searchParams.get("minUploadSpeed") || "";
  const queryStoveRequired = searchParams.get("stoveRequired") || "false";
  const queryMinSolitude = searchParams.get("minSolitudeIndex") || "0";
  const queryWaterfrontSafety = searchParams.get("waterfrontSafetySteepness") || "";
  const querySeasonalAccess = searchParams.get("maxSeasonalAccessDifficulty") || "";
  const queryFragranceFree = searchParams.get("fragranceFreeRequired") || "false";
  const queryPoolMechanics = searchParams.get("poolMechanicsType") || "";

  // Local sync inputs
  const [locInput, setLocInput] = useState(queryLocation);
  const [guestCount, setGuestCount] = useState(parseInt(queryGuests, 10));
  const [dates, setDates] = useState({ start: queryStart, end: queryEnd });

  // Sensory Toggle & Local States
  const [showSensoryPanel, setShowSensoryPanel] = useState(false);
  const [decibelFilter, setDecibelFilter] = useState<string[]>(queryDecibel ? queryDecibel.split(",") : []);
  const [minAstroScore, setMinAstroScore] = useState<number>(parseInt(queryMinAstro, 10) || 0);
  const [yardRequired, setYardRequired] = useState<boolean>(queryYardRequired === "true");
  const [minFenceHeight, setMinFenceHeight] = useState<string>(queryMinFenceHeight);
  const [workstationRequired, setWorkstationRequired] = useState<boolean>(queryWorkstationRequired === "true");
  const [minUploadSpeed, setMinUploadSpeed] = useState<string>(queryMinUploadSpeed);
  const [stoveRequired, setStoveRequired] = useState<boolean>(queryStoveRequired === "true");
  const [minSolitude, setMinSolitude] = useState<number>(parseInt(queryMinSolitude, 10) || 0);
  const [waterfrontSafety, setWaterfrontSafety] = useState<string[]>(queryWaterfrontSafety ? queryWaterfrontSafety.split(",") : []);
  const [seasonalAccess, setSeasonalAccess] = useState<string[]>(querySeasonalAccess ? querySeasonalAccess.split(",") : []);
  const [fragranceFree, setFragranceFree] = useState<boolean>(queryFragranceFree === "true");
  const [poolMechanics, setPoolMechanics] = useState<string[]>(queryPoolMechanics ? queryPoolMechanics.split(",") : []);

  const hasActiveSensoryFilters = () => {
    return (
      decibelFilter.length > 0 ||
      minAstroScore > 0 ||
      yardRequired ||
      minFenceHeight !== "" ||
      workstationRequired ||
      minUploadSpeed !== "" ||
      stoveRequired ||
      minSolitude > 0 ||
      waterfrontSafety.length > 0 ||
      seasonalAccess.length > 0 ||
      fragranceFree ||
      poolMechanics.length > 0
    );
  };

  const handleClearSensoryFilters = () => {
    setDecibelFilter([]);
    setMinAstroScore(0);
    setYardRequired(false);
    setMinFenceHeight("");
    setWorkstationRequired(false);
    setMinUploadSpeed("");
    setStoveRequired(false);
    setMinSolitude(0);
    setWaterfrontSafety([]);
    setSeasonalAccess([]);
    setFragranceFree(false);
    setPoolMechanics([]);

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

    // Advanced Sensory Filters
    if (decibelFilter.length > 0) params.set("decibelAtmosphere", decibelFilter.join(","));
    if (minAstroScore > 0) params.set("minAstroScore", String(minAstroScore));
    if (yardRequired) params.set("enclosedYardRequired", "true");
    if (minFenceHeight) params.set("minFenceHeight", minFenceHeight);
    if (workstationRequired) params.set("ergonomicWorkstationRequired", "true");
    if (minUploadSpeed) params.set("minUploadSpeed", minUploadSpeed);
    if (stoveRequired) params.set("stoveRequired", "true");
    if (minSolitude > 0) params.set("minSolitudeIndex", String(minSolitude));
    if (waterfrontSafety.length > 0) params.set("waterfrontSafetySteepness", waterfrontSafety.join(","));
    if (seasonalAccess.length > 0) params.set("maxSeasonalAccessDifficulty", seasonalAccess.join(","));
    if (fragranceFree) params.set("fragranceFreeRequired", "true");
    if (poolMechanics.length > 0) params.set("poolMechanicsType", poolMechanics.join(","));

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
                onClick={() => setShowSensoryPanel(!showSensoryPanel)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shrink-0 ${
                  showSensoryPanel || hasActiveSensoryFilters()
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                }`}
                title="Sensory & Advanced Filters"
              >
                <SlidersHorizontal className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Sensory</span>
              </button>

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

      {/* Advanced Sensory Filters Expandable Panel (Batch 5) */}
      <AnimatePresence>
        {showSensoryPanel && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-b border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 z-10 shrink-0 overflow-y-auto max-h-[60vh]"
          >
            <div className="mx-auto max-w-7xl p-5 md:p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                    <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                    <span>Sensory Atmosphere & Technical Support Specs</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                    Locate lodges aligned with absolute silence levels, dark night skyscapes, and professional pet / remote workstation specs.
                  </p>
                </div>
                {hasActiveSensoryFilters() && (
                  <button
                    onClick={handleClearSensoryFilters}
                    className="text-[9px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-lg transition"
                  >
                    Reset Sensory Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Acoustics, Skies, Solitude */}
                <div className="space-y-4">
                  {/* Decibel Atmosphere Rating */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Decibel Atmosphere Rating
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Whispering Pines", "Active River Noise", "Silent Meadow"].map((val) => {
                        const isChecked = decibelFilter.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              if (isChecked) {
                                setDecibelFilter(decibelFilter.filter((v) => v !== val));
                              } else {
                                setDecibelFilter([...decibelFilter, val]);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition ${
                              isChecked
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {val === "Whispering Pines" ? "🌲 Whispering Pines (~22dB)" : val === "Active River Noise" ? "🌊 Active River (~30dB)" : "🔇 Silent Meadow (<15dB)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Solitude Index */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Solitude Index (Nearest Neighbor: {minSolitude ? `${minSolitude}+ Score` : "Any"})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={minSolitude}
                      onChange={(e) => setMinSolitude(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 dark:accent-emerald-400 bg-slate-100 dark:bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1">
                      <span>Shared Estate</span>
                      <span>Secluded (0.5mi)</span>
                      <span>Absolute Privacy</span>
                    </div>
                  </div>

                  {/* Astrophotography Conditions Score */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Astrophotography Score (Min Rating: {minAstroScore ? `${minAstroScore}+` : "Any"})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={minAstroScore}
                      onChange={(e) => setMinAstroScore(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 dark:accent-emerald-400 bg-slate-100 dark:bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1">
                      <span>Any Sky</span>
                      <span>6+ (Clean)</span>
                      <span>10 (Bortle Class 1)</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Pet Safety (Yard) & Remote Workstation */}
                <div className="space-y-4">
                  {/* Pet-Friendly Enclosed Yard */}
                  <div className="rounded-xl border border-slate-150 p-3 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        🐕 Fully Enclosed Yard
                      </span>
                      <input
                        type="checkbox"
                        checked={yardRequired}
                        onChange={(e) => setYardRequired(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 accent-emerald-600 cursor-pointer h-4 w-4"
                      />
                    </div>
                    {yardRequired && (
                      <div className="space-y-2 pt-1 animate-fadeIn">
                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Minimum Fence Height Required
                        </label>
                        <select
                          value={minFenceHeight}
                          onChange={(e) => setMinFenceHeight(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <option value="">Any Height</option>
                          <option value="5">5.0+ Feet</option>
                          <option value="6">6.0+ Feet</option>
                          <option value="6.5">6.5+ Feet</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Remote Workstation Support */}
                  <div className="rounded-xl border border-slate-150 p-3 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        💻 Ergonomic Workstation
                      </span>
                      <input
                        type="checkbox"
                        checked={workstationRequired}
                        onChange={(e) => setWorkstationRequired(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 accent-emerald-600 cursor-pointer h-4 w-4"
                      />
                    </div>
                    {workstationRequired && (
                      <div className="space-y-2 pt-1 animate-fadeIn">
                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Verified Internet Upload Speed
                        </label>
                        <select
                          value={minUploadSpeed}
                          onChange={(e) => setMinUploadSpeed(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <option value="">Any Speed</option>
                          <option value="100">100+ Mbps (High Upload)</option>
                          <option value="150">150+ Mbps (Low Latency Stream)</option>
                          <option value="250">250+ Mbps (Enterprise Standard)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 3: Heating, Access, Waterfront, Scents, Tubs */}
                <div className="space-y-4">
                  {/* Quick-toggle Checklist */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col justify-between rounded-xl border border-slate-150 p-2 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                      <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        🔥 Stove & Wood
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[8px] font-medium text-slate-400">Available</span>
                        <input
                          type="checkbox"
                          checked={stoveRequired}
                          onChange={(e) => setStoveRequired(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 accent-emerald-600 cursor-pointer h-3.5 w-3.5"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-xl border border-slate-150 p-2 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                      <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        🌿 Organic scent
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[8px] font-medium text-slate-400">No Fragrance</span>
                        <input
                          type="checkbox"
                          checked={fragranceFree}
                          onChange={(e) => setFragranceFree(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 accent-emerald-600 cursor-pointer h-3.5 w-3.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Waterfront Edge Incline / Safety */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Waterfront Access Slope
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Flat", "Gentle Slope", "Steep Bank", "None"].map((val) => {
                        const isChecked = waterfrontSafety.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              if (isChecked) {
                                setWaterfrontSafety(waterfrontSafety.filter((v) => v !== val));
                              } else {
                                setWaterfrontSafety([...waterfrontSafety, val]);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-[9px] font-semibold border transition ${
                              isChecked
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {val === "Flat" ? "🏖️ Flat" : val === "Gentle Slope" ? "🛶 Gentle" : val === "Steep Bank" ? "🧗 Cliff" : "🚫 None"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hot Tub / Pool Mechanics */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Water Tub Mechanics
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Saline", "Natural Circulating Stream-Water", "None"].map((val) => {
                        const isChecked = poolMechanics.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              if (isChecked) {
                                setPoolMechanics(poolMechanics.filter((v) => v !== val));
                              } else {
                                setPoolMechanics([...poolMechanics, val]);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-[9px] font-semibold border transition ${
                              isChecked
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {val === "Saline" ? "🧂 Saline" : val === "Natural Circulating Stream-Water" ? "💧 Stream" : "🚫 None"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seasonal Access Difficulty */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Access Road Difficulty
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Easy", "Moderate", "Difficult"].map((val) => {
                        const isChecked = seasonalAccess.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              if (isChecked) {
                                setSeasonalAccess(seasonalAccess.filter((v) => v !== val));
                              } else {
                                setSeasonalAccess([...seasonalAccess, val]);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-[9px] font-semibold border transition ${
                              isChecked
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {val === "Easy" ? "🚗 Paved" : val === "Moderate" ? "🚙 Dirt" : "❄️ 4WD/Chains"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside Sensory Panel */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowSensoryPanel(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateSearch();
                    setShowSensoryPanel(false);
                  }}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 transition dark:bg-emerald-500 shadow-sm shadow-emerald-500/20"
                >
                  Apply Sensory Filters
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

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

                        {/* Sensory profile highlights */}
                        {p.sensory && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            <span className="inline-flex items-center gap-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 text-[8px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100/30">
                              🔊 {p.sensory.decibelAtmosphere}
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 text-[8px] font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-100/30">
                              ✨ Skies: {p.sensory.astrophotographyScore}/10
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 text-[8px] font-bold text-teal-700 dark:text-teal-400 border border-teal-100/30 font-medium">
                              🌲 Solitude: {p.sensory.solitudeIndex}/10
                            </span>
                            {p.sensory.enclosedYard.exists && (
                              <span className="inline-flex items-center gap-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 text-[8px] font-bold text-amber-700 dark:text-amber-400 border border-amber-100/30">
                                🐕 Fence: {p.sensory.enclosedYard.fenceHeight} ({p.sensory.enclosedYard.fenceMaterial})
                              </span>
                            )}
                          </div>
                        )}
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
