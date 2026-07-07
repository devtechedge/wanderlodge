"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Plus, LayoutDashboard, Calendar, BarChart3, Settings, Sparkles, MapPin, DollarSign, Users, ChevronRight, X, Check, Compass, AlertCircle, RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Reservation {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  propertyTitle: string;
  propertyImage: string;
  travelerName: string;
  travelerImage: string;
}

const PRESET_MOCK_IMAGES = [
  "https://picsum.photos/seed/pdp1/1200/800",
  "https://picsum.photos/seed/pdp2/1200/800",
  "https://picsum.photos/seed/pdp3/1200/800",
  "https://picsum.photos/seed/pdp4/1200/800",
];

const AVAILABLE_AMENITIES = [
  "Wood Hot Tub", "Grand Fireplace", "Mountain Vista", "Super Wifi", 
  "Kitchen", "Pet Friendly", "Waterfront", "Canoes & Boards", 
  "Outdoor Kitchen", "Fire Pit", "Elevated Tree Deck", "Forest Shower", 
  "Artisan Coffee Bar", "Finnish Dry-Sauna", "Sunken Fireplace", 
  "Heated Floors"
];

export default function ProviderPage() {
  const router = useRouter();
  const { currentUser, loadingUser } = useStore();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "calendar" | "list-lodge">("dashboard");

  // New Lodge form wizard wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [lodgeTitle, setLodgeTitle] = useState("");
  const [lodgeDesc, setLodgeDesc] = useState("");
  const [lodgePrice, setLodgePrice] = useState("");
  const [lodgeLocation, setLodgeLocation] = useState("");
  const [lodgeGuests, setLodgeGuests] = useState(2);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(PRESET_MOCK_IMAGES[0]);
  const [wizardError, setWizardError] = useState("");
  const [submittingLodge, setSubmittingLodge] = useState(false);

  // Calendar Blocking states
  const [blockLodgeId, setBlockLodgeId] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockedRanges, setBlockedRanges] = useState<Array<{ lodgeTitle: string; start: string; end: string }>>([]);

  const fetchProviderReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      Promise.resolve().then(() => {
        fetchProviderReservations();
      });
    }
  }, [currentUser]);

  const handleCreateLodge = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError("");
    setSubmittingLodge(true);

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lodgeTitle,
          description: lodgeDesc,
          price: lodgePrice,
          location: lodgeLocation,
          maxGuests: lodgeGuests,
          amenities: selectedAmenities,
          images: [selectedImage],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setWizardError(data.error || "Failed to create lodge");
      } else {
        // Reset and go back
        setLodgeTitle("");
        setLodgeDesc("");
        setLodgePrice("");
        setLodgeLocation("");
        setLodgeGuests(2);
        setSelectedAmenities([]);
        setWizardStep(1);
        setActiveTab("dashboard");
        await fetchProviderReservations(); // Reload dashboard analytics
      }
    } catch (err) {
      setWizardError("Failed to save lodge details.");
    } finally {
      setSubmittingLodge(false);
    }
  };

  const handleAddBlockedRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockLodgeId || !blockStart || !blockEnd) return;

    setBlockedRanges([
      ...blockedRanges,
      {
        lodgeTitle: blockLodgeId === "prop-1" ? "Eldorado Ridge Cabin" : "Goldenwood Lakeside Lodge",
        start: blockStart,
        end: blockEnd,
      },
    ]);
    setBlockStart("");
    setBlockEnd("");
  };

  // Compute analytics
  const totalBookings = reservations.length;
  const grossEarnings = reservations.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const providerCut = parseFloat((grossEarnings * 0.90).toFixed(2)); // Provider gets 90%
  const averageValue = totalBookings > 0 ? parseFloat((grossEarnings / totalBookings).toFixed(2)) : 0;

  if (loadingUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Compass className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Authorize: Must be Provider
  if (!currentUser || currentUser.role !== "PROVIDER") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 py-20 text-center">
          <div className="max-w-md rounded-3xl border border-slate-150 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500 animate-pulse" />
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">Lodge Provider Tier Needed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              You are currently signed in as a Traveler. Switch your account tier to Lodge Provider to post structures, block calendars, and track payouts.
            </p>
            <button
              onClick={() => {
                const btn = document.getElementById("user-profile-menu-btn");
                if (btn) btn.click();
              }}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500"
            >
              Access Account Menu
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div id="provider-dashboard-container" className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 w-full">
        {/* Main Header & Tab Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 mb-8 dark:border-slate-800 gap-4">
          <div>
            <span className="rounded bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase dark:bg-emerald-950/40 dark:text-emerald-400">
              Provider Portal — Elite Tier Account
            </span>
            <h1 className="font-sans text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Sanctuary Management
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold border transition ${
                activeTab === "dashboard"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/25 dark:text-emerald-400"
                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-500" />
              <span>Dashboard & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold border transition ${
                activeTab === "calendar"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/25 dark:text-emerald-400"
                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              }`}
            >
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span>Block Dates</span>
            </button>

            <button
              onClick={() => setActiveTab("list-lodge")}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 dark:bg-emerald-500"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>List New Lodge</span>
            </button>
          </div>
        </div>

        {/* Dashboard Analytics tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Metric widgets block */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Income</span>
                  <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">${grossEarnings}</span>
                  <span className="block text-[10px] text-slate-400 mt-1 font-mono uppercase">
                    Your Take (90% cut): <b>${providerCut}</b>
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Stays Logged</span>
                  <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalBookings} bookings</span>
                  <span className="block text-[10px] text-slate-400 mt-1 font-mono uppercase">
                    Average Book Value: <b>${averageValue}</b>
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Lodges</span>
                  <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">5 Listed</span>
                  <span className="block text-[10px] text-slate-400 mt-1 font-mono uppercase">
                    inspection score: <b>Elite Tier Verified</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Visual analytics chart & incoming reservation grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* SVG analytics bar */}
              <div className="lg:col-span-4 rounded-3xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Earnings Breakdown by Lodge
                </h3>
                {/* Simulated Custom SVG Chart */}
                <div className="relative h-48 w-full mt-4 flex items-end justify-between px-2 gap-4">
                  {[
                    { title: "Eldorado Cabin", val: 80, fill: "bg-emerald-600" },
                    { title: "Waterfront Lodge", val: 100, fill: "bg-emerald-500" },
                    { title: "Treehouse Canopy", val: 40, fill: "bg-emerald-400" },
                    { title: "Slate Peak", val: 60, fill: "bg-teal-600" }
                  ].map((bar) => (
                    <div key={bar.title} className="flex-grow flex flex-col items-center">
                      <div className="w-full relative rounded-t-lg bg-slate-100 dark:bg-slate-850 h-32 overflow-hidden flex items-end">
                        <div style={{ height: `${bar.val}%` }} className={`w-full ${bar.fill} transition-all`} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 truncate w-14 mt-2 block text-center uppercase tracking-wide">
                        {bar.title.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reservations feed */}
              <div className="lg:col-span-8 rounded-3xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Incoming Reservations Feed
                </h3>
                
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                ) : reservations.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-12">No stays booked yet. Keep your listing details competitive!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3">Lodge Property</th>
                          <th className="py-3">Traveler Guest</th>
                          <th className="py-3">Check-In/Out</th>
                          <th className="py-3 text-right">Gross payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((res) => (
                          <tr key={res.id} className="border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <td className="py-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <img src={res.propertyImage} className="h-8 w-10 rounded object-cover shrink-0" />
                              <span className="truncate max-w-[150px]">{res.propertyTitle}</span>
                            </td>
                            <td className="py-4 font-semibold text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <img src={res.travelerImage} className="h-6 w-6 rounded-full object-cover shrink-0" />
                                <span>{res.travelerName}</span>
                              </div>
                            </td>
                            <td className="py-4 font-mono text-[10px]">{res.startDate} to {res.endDate}</td>
                            <td className="py-4 text-right font-bold text-slate-900 dark:text-white">${res.totalPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Date Calendar Blocking tab */}
        {activeTab === "calendar" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Block date form */}
            <div className="md:col-span-5 rounded-3xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">
                Block Lodge Calendar Dates
              </h3>
              <form onSubmit={handleAddBlockedRange} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Select Lodge Property
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <select
                      value={blockLodgeId}
                      onChange={(e) => setBlockLodgeId(e.target.value)}
                      required
                      className="w-full text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent outline-none cursor-pointer"
                    >
                      <option value="">Choose Listing</option>
                      <option value="prop-1">Eldorado Ridge Cabin</option>
                      <option value="prop-2">Goldenwood Lakeside Lodge</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={blockStart}
                      onChange={(e) => setBlockStart(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={blockEnd}
                      onChange={(e) => setBlockEnd(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700"
                >
                  Block Calendar Interval
                </button>
              </form>
            </div>

            {/* Current blocks list */}
            <div className="md:col-span-7 rounded-3xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">
                Blocked Dates Registry
              </h3>
              {blockedRanges.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-12">No dates manually blocked yet. Block check-out intervals above.</p>
              ) : (
                <div className="space-y-2">
                  {blockedRanges.map((range, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 rounded-xl border border-slate-150 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          {range.lodgeTitle}
                        </span>
                        <span className="text-[10px] text-red-500 font-mono">
                          Blocked: {range.start} to {range.end}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setBlockedRanges(blockedRanges.filter((_, i) => i !== idx));
                        }}
                        className="rounded-lg p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* List New Lodge wizard tab */}
        {activeTab === "list-lodge" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-150 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-6 mb-8 border-b border-slate-100 pb-5 dark:border-slate-800">
              {[
                { step: 1, name: "Core Details" },
                { step: 2, name: "Amenities" },
                { step: 3, name: "Preset Photo" }
              ].map((ind) => {
                const active = ind.step === wizardStep;
                const completed = ind.step < wizardStep;
                return (
                  <div key={ind.step} className="flex items-center gap-1.5">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      active ? "bg-emerald-600 text-white" : completed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"
                    }`}>
                      {completed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : ind.step}
                    </div>
                    <span className={`text-xs font-bold ${active ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>
                      {ind.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {wizardError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30">
                {wizardError}
              </div>
            )}

            <form onSubmit={handleCreateLodge} className="space-y-6">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Lodge Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eldorado Ridge Cabin"
                      value={lodgeTitle}
                      onChange={(e) => setLodgeTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Detailed Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Detail your structure, wilderness view depth, fireplace dimensions..."
                      value={lodgeDesc}
                      onChange={(e) => setLodgeDesc(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Nightly Price ($)
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="220"
                        value={lodgePrice}
                        onChange={(e) => setLodgePrice(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Region Location
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Pinecrest Valley"
                        value={lodgeLocation}
                        onChange={(e) => setLodgeLocation(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Max Guest Cap
                      </label>
                      <select
                        value={lodgeGuests}
                        onChange={(e) => setLodgeGuests(parseInt(e.target.value, 10))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} Guests
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      disabled={!lodgeTitle || !lodgeDesc || !lodgePrice || !lodgeLocation}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Structure Amenities
                  </h4>
                  <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto pr-1">
                    {AVAILABLE_AMENITIES.map((amenity) => {
                      const selected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                            } else {
                              setSelectedAmenities([...selectedAmenities, amenity]);
                            }
                          }}
                          className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                            selected
                              ? "border-emerald-500 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : "border-slate-150 hover:border-slate-300 dark:border-slate-800"
                          }`}
                        >
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                            selected ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500" : "border-slate-300"
                          }`}>
                            {selected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {amenity}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Assign Premium Wilderness Cover Photo
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {PRESET_MOCK_IMAGES.map((img, idx) => {
                      const selected = selectedImage === img;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImage(img)}
                          className={`relative h-28 rounded-xl overflow-hidden border-2 transition ${
                            selected ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-transparent hover:scale-101"
                          }`}
                        >
                          <img src={img} className="h-full w-full object-cover" />
                          {selected && (
                            <div className="absolute inset-0 bg-emerald-600/10 flex items-center justify-center text-white">
                              <div className="rounded-full bg-emerald-600 p-1">
                                <Check className="h-4 w-4 stroke-[3]" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submittingLodge}
                      className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500"
                    >
                      {submittingLodge ? "Submitting Lodge..." : "Confirm & Post Lodge Listing"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
