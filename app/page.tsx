"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, MapPin, Users, Heart, Star, Compass, Shield, Flame, Map, Check, X } from "lucide-react";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DatePicker from "@/components/DatePicker";
import { Property } from "@/lib/db";

const ALL_AMENITIES = [
  "Wood Hot Tub", "Grand Fireplace", "Mountain Vista", "Super Wifi", 
  "Kitchen", "Pet Friendly", "Waterfront", "Canoes & Boards", 
  "Outdoor Kitchen", "Fire Pit", "Elevated Tree Deck", "Forest Shower", 
  "Artisan Coffee Bar", "Finnish Dry-Sauna", "Sunken Fireplace", 
  "Heated Floors", "Glass Floor View", "Lake Hover Deck", "Swim Access"
];

export default function Home() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, wishlists, refreshWishlists, currentUser } = useStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Local UI States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Stays");
  const [wishlistModalPropId, setWishlistModalPropId] = useState<string | null>(null);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [showCreateWishlistInput, setShowCreateWishlistInput] = useState(false);

  // Quick inputs
  const [locInput, setLocInput] = useState(searchQuery.location);
  const [guestCount, setGuestCount] = useState(searchQuery.guests);
  const [dates, setDates] = useState({ start: searchQuery.startDate, end: searchQuery.endDate });

  // Filter drawer options
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(600);
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/properties";
      const params: string[] = [];

      if (selectedCategory !== "All Stays") {
        if (selectedCategory === "Mountain Cabins") {
          params.push("location=valley");
        } else if (selectedCategory === "Waterfront") {
          params.push("amenities=waterfront");
        } else if (selectedCategory === "Finnish Saunas") {
          params.push("amenities=sauna");
        } else if (selectedCategory === "Treehouses") {
          params.push("location=woods");
        } else if (selectedCategory === "Pet Friendly") {
          params.push("amenities=pet");
        }
      }

      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (e) {
      console.error("Failed to load properties", e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Fetch properties
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchProperties();
    });
  }, [fetchProperties]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery({
      location: locInput,
      guests: guestCount,
      startDate: dates.start,
      endDate: dates.end,
    });

    const params = new URLSearchParams();
    if (locInput) params.set("location", locInput);
    if (guestCount > 1) params.set("guests", String(guestCount));
    if (dates.start) params.set("startDate", dates.start);
    if (dates.end) params.set("endDate", dates.end);

    router.push(`/search?${params.toString()}`);
  };

  const handleApplyFilters = () => {
    setSearchQuery({
      minPrice,
      maxPrice,
      selectedAmenities: filterAmenities,
    });
    setShowFilterModal(false);

    // Redirect to search results page with current parameters
    const params = new URLSearchParams();
    if (locInput) params.set("location", locInput);
    if (guestCount > 1) params.set("guests", String(guestCount));
    if (dates.start) params.set("startDate", dates.start);
    if (dates.end) params.set("endDate", dates.end);
    params.set("minPrice", String(minPrice));
    params.set("maxPrice", String(maxPrice));
    if (filterAmenities.length > 0) params.set("amenities", filterAmenities.join(","));

    router.push(`/search?${params.toString()}`);
  };

  const handleToggleWishlist = async (propertyId: string) => {
    if (!currentUser) {
      // Prompt sign-in
      const btn = document.getElementById("open-auth-modal-btn");
      if (btn) btn.click();
      return;
    }

    setWishlistModalPropId(propertyId);
  };

  const togglePropertyInWishlist = async (wishlistId: string, propertyId: string) => {
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

  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) return;
    try {
      const res = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newWishlistName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewWishlistName("");
        setShowCreateWishlistInput(false);
        await refreshWishlists();
        if (wishlistModalPropId) {
          await togglePropertyInWishlist(data.wishlist.id, wishlistModalPropId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isSavedInAnyWishlist = (propertyId: string) => {
    return wishlists.some((w) => w.propertyIds.includes(propertyId));
  };

  return (
    <div id="homepage-container" className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Banner Section */}
        <section id="hero-banner" className="relative overflow-hidden bg-slate-900 py-20 text-white dark:bg-slate-950 lg:py-28">
          {/* Animated Background Vector Lines */}
          <div className="absolute inset-0 opacity-15">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M0,30 Q30,70 60,30 T100,30" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </svg>
          </div>

          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/25 uppercase tracking-wider mb-4">
                <Compass className="h-3.5 w-3.5 animate-spin-slow" />
                <span>The WanderGuarantee Standard</span>
              </span>
              <h1 className="font-sans text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl max-w-3xl mx-auto leading-tight">
                Find Sanctuary. <br />
                <span className="text-emerald-400 bg-clip-text">Architectural Lodges</span> Built for Wilderness.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
                Peer-to-peer luxury log cabins, glassy waterfront boathouses, and dry-sauna alpine chalets curated by local adventurers.
              </p>
            </motion.div>

            {/* Floating Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mx-auto mt-10 max-w-4xl"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="rounded-3xl border border-slate-150 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-slate-800 dark:text-white"
              >
                {/* Location input */}
                <div className="md:col-span-4 flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                  <MapPin className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="text-left w-full">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Where
                    </label>
                    <input
                      type="text"
                      value={locInput}
                      onChange={(e) => setLocInput(e.target.value)}
                      placeholder="e.g. Pinecrest Valley, Sunset Bay..."
                      className="w-full text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Datepicker input */}
                <div className="md:col-span-5 flex items-center gap-2 px-3 py-1 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                  <div className="w-full">
                    <DatePicker
                      startDate={dates.start}
                      endDate={dates.end}
                      onDatesChange={(start, end) => setDates({ start, end })}
                    />
                  </div>
                </div>

                {/* Guests counter & action */}
                <div className="md:col-span-3 flex items-center justify-between gap-2 px-3 py-1">
                  <div className="flex items-center gap-2 text-left">
                    <Users className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Who
                      </label>
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n} className="dark:bg-slate-900">
                            {n} Guest{n > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="rounded-2xl bg-emerald-600 p-3.5 text-white transition hover:bg-emerald-700 hover:scale-105 active:scale-95 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Discovery Filter Header Category Section */}
        <section id="categories-section" className="border-b border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900/40 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center relative overflow-hidden">
            
            {/* Scrollable Categories List Tracker Container */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pr-32 w-full scroll-smooth snap-x">
              {[
                { name: "All Stays", desc: "Every lodge" },
                { name: "Mountain Cabins", desc: "High altitude" },
                { name: "Waterfront", desc: "Shore docks" },
                { name: "Finnish Saunas", desc: "Steam therapy" },
                { name: "Treehouses", desc: "Elevated canopies" },
                { name: "Pet Friendly", desc: "Bring companions" }
              ].map((cat) => {
                const isActive = cat.name === selectedCategory;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`rounded-2xl px-4 py-2.5 text-left border transition-all shrink-0 snap-start focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isActive
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "border-slate-200 hover:border-slate-350 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                    }`}
                  >
                    <span className="block text-xs font-bold leading-none">{cat.name}</span>
                    <span className="text-[9px] opacity-70 font-mono mt-0.5 block">{cat.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Masked Sticky Filter Anchor Component Wrapper */}
            <div className="absolute right-0 top-0 bottom-0 w-36 bg-gradient-to-l from-white via-white/95 dark:from-slate-900 dark:via-slate-900/95 to-transparent flex items-center justify-end pr-4 sm:pr-6 lg:pr-8 pointer-events-none">
              <button
                onClick={() => setShowFilterModal(true)}
                className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-slate-200 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
                <span className="whitespace-nowrap">Advanced Filters</span>
              </button>
            </div>

          </div>
        </section>

        {/* Featured Lodging Matrix Grid */}
        <section id="featured-lodges" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Featured Wilderness Sanctuaries
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rigorous EliteProvider standard compliance with high average guest ratings.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
              {properties.length} lodgings matching
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-3xl border border-slate-150 bg-white p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900 animate-pulse">
                  <div className="h-52 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-5 w-2/3 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/3 rounded-md bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/10">
              <Compass className="mx-auto h-12 w-12 text-slate-300 animate-bounce" />
              <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">No Lodges Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No active properties match the selected category. Try selecting another filter tag or resetting search bounds.
              </p>
              <button
                onClick={() => setSelectedCategory("All Stays")}
                className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Reset Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p, idx) => {
                const hasWishlist = isSavedInAnyWishlist(p.id);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group relative rounded-3xl border border-slate-150 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900"
                  >
                    {/* Heart wishlist toggle */}
                    <button
                      onClick={() => handleToggleWishlist(p.id)}
                      className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-slate-600 shadow-md transition hover:scale-105 dark:bg-slate-900/90"
                    >
                      <Heart
                        className={`h-4.5 w-4.5 transition-colors ${
                          hasWishlist ? "fill-red-500 text-red-500" : "text-slate-600 dark:text-slate-400 hover:text-red-500"
                        }`}
                      />
                    </button>

                    {/* Image slider link */}
                    <div
                      onClick={() => router.push(`/properties/${p.id}`)}
                      className="relative h-52 w-full overflow-hidden bg-slate-100 cursor-pointer"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute bottom-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white tracking-wide">
                        {p.location}
                      </div>
                    </div>

                    {/* Lodge info card */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          onClick={() => router.push(`/properties/${p.id}`)}
                          className="font-sans font-bold text-base text-slate-900 dark:text-white truncate hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                        >
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-4 w-4 fill-amber-500" />
                          <span>4.9</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {p.description}
                      </p>

                      {/* Amenities chips */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {p.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="rounded-lg bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                          >
                            {a}
                          </span>
                        ))}
                        {p.amenities.length > 3 && (
                          <span className="text-[9px] font-bold text-slate-400 pl-1">
                            +{p.amenities.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="font-sans text-lg font-extrabold text-slate-900 dark:text-white">
                            ${p.price}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium"> / night</span>
                        </div>
                        <button
                          onClick={() => router.push(`/properties/${p.id}`)}
                          className="rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-3.5 py-2 transition dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                        >
                          Secure Stay
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Wanderlodge Security Credentials Section */}
        <section id="security-credentials" className="bg-slate-100 py-16 transition-colors dark:bg-slate-900/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-sans text-sm font-bold text-slate-900 dark:text-white">
                  The WanderGuarantee Program
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Every reservation is secured. If a provider cancels within 48 hours of check-in, we source equal or superior lodging instantly, guaranteed.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Flame className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-sans text-sm font-bold text-slate-900 dark:text-white">
                  EliteProvider Verified Checklists
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  We check each structure physically. Cleanliness, water supply density, and star-link speed rates verified before accepting list postings.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Map className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-sans text-sm font-bold text-slate-900 dark:text-white">
                  Bespoke Local Adventures
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Enhance your lodgings. Message your EliteProvider about organizing custom kayaking lines, private fishing docks, or guided snowshoes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Advanced Filters Modal/Drawer */}
      <AnimatePresence>
        {showFilterModal && (
          <div id="filter-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowFilterModal(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative z-50 h-full w-full max-w-md border-l border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                      Advanced Lodge Filters
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Fine-tune your wilderness lodging preferences
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="rounded-xl bg-slate-50 p-2 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Nightly price range filter */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Nightly Price Limits
                  </h4>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left dark:border-slate-800 dark:bg-slate-950">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Minimum</span>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full text-sm font-bold text-slate-800 dark:text-slate-200 bg-transparent outline-none mt-0.5"
                      />
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left dark:border-slate-800 dark:bg-slate-950">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Maximum</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value, 10) || 0))}
                        className="w-full text-sm font-bold text-slate-800 dark:text-slate-200 bg-transparent outline-none mt-0.5"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="20"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value, 10)))}
                    className="w-full mt-4 accent-emerald-600 dark:accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Amenities checklist filter */}
                <div className="mt-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                    Structure & Amenities
                  </h4>
                  <div className="grid grid-cols-2 gap-2 h-72 overflow-y-auto pr-1">
                    {ALL_AMENITIES.map((amenity) => {
                      const selected = filterAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          onClick={() => {
                            if (selected) {
                              setFilterAmenities(filterAmenities.filter((a) => a !== amenity));
                            } else {
                              setFilterAmenities([...filterAmenities, amenity]);
                            }
                          }}
                          className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                            selected
                              ? "border-emerald-500 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : "border-slate-150 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                            selected ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500" : "border-slate-300"
                          }`}>
                            {selected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {amenity}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => {
                    setFilterAmenities([]);
                    setMinPrice(0);
                    setMaxPrice(600);
                  }}
                  className="w-1/3 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="w-2/3 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  Apply Filter Constraints
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wishlist Folders Management Modal */}
      <AnimatePresence>
        {wishlistModalPropId && (
          <div id="wishlist-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setWishlistModalPropId(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-50 w-full max-w-sm rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h4 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Save to Wishlist
                </h4>
                <button
                  onClick={() => setWishlistModalPropId(null)}
                  className="rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Existing wishlists list */}
              <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
                {wishlists.length === 0 && !showCreateWishlistInput && (
                  <p className="text-center text-xs text-slate-400 py-4">No wishlists created yet.</p>
                )}
                {wishlists.map((w) => {
                  const alreadySaved = w.propertyIds.includes(wishlistModalPropId);
                  return (
                    <button
                      key={w.id}
                      onClick={async () => {
                        await togglePropertyInWishlist(w.id, wishlistModalPropId);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-150 p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          {w.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {w.propertyIds.length} properties saved
                        </span>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                        alreadySaved ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                      }`}>
                        {alreadySaved && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Create new wishlist input block */}
              {showCreateWishlistInput ? (
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Wishlist Title
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newWishlistName}
                      onChange={(e) => setNewWishlistName(e.target.value)}
                      placeholder="e.g. Summer Vacation 2027"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transitionfocus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-emerald-500"
                    />
                    <button
                      onClick={handleCreateWishlist}
                      disabled={!newWishlistName.trim()}
                      className="rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500"
                    >
                      Create
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateWishlistInput(true)}
                  className="mt-4 w-full rounded-2xl border border-dashed border-emerald-400/50 p-3 text-center text-xs font-bold text-emerald-600 hover:bg-emerald-50/50 dark:text-emerald-400 dark:hover:bg-emerald-950/10"
                >
                  + Create New Folder Wishlist
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
