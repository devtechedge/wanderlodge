"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Star, Heart, Share, ShieldCheck, HelpCircle, Utensils, Wifi, Sparkles, MapPin, Calendar, Users, Send, Check, AlertCircle, RefreshCw, Leaf, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DatePicker from "@/components/DatePicker";

interface PropertyDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  lat: number;
  lng: number;
  images: string[];
  amenities: string[];
  maxGuests: number;
  ecoScore?: number;
  carbonFootprint?: number;
  ecoAmenities?: string[];
  hasEVCharging?: boolean;
  chargingType?: string;
  ecoPledged?: boolean;
}

interface Review {
  id: string;
  comment: string;
  ratingClean: number;
  ratingComm: number;
  ratingLoc: number;
  ratingValue: number;
  ratingAverage: number;
  createdAt: string;
  authorName: string;
  authorImage: string;
}

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { currentUser, wishlists, refreshWishlists } = useStore();

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [provider, setProvider] = useState<{ name: string; image: string; id: string } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking states
  const [dates, setDates] = useState({ start: "", end: "" });
  const [guestCount, setGuestCount] = useState(1);
  const [bookingError, setBookingError] = useState("");
  const [bookingStep, setBookingStep] = useState<"idle" | "review" | "payment" | "confirmed">("idle");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [simulatedCardNumber, setSimulatedCardNumber] = useState("");

  // Eco-Conscious Travel States
  const [optInOffset, setOptInOffset] = useState(false);
  const [signedPledge, setSignedPledge] = useState(false);
  const [pledgeInitial, setPledgeInitial] = useState("");
  const [pledgeListAgreed, setPledgeListAgreed] = useState<string[]>([]);
  const [ecoTab, setEcoTab] = useState<"transit" | "sourcing" | "code">("transit");

  // Review submission states
  const [reviewComment, setReviewComment] = useState("");
  const [cleanRating, setCleanRating] = useState(5);
  const [commRating, setCommRating] = useState(5);
  const [locRating, setLocRating] = useState(5);
  const [valRating, setValRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const fetchPropertyDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProperty(data.property);
        setProvider(data.provider);
        setReviews(data.reviews || []);
      } else {
        router.push("/");
      }
    } catch (e) {
      console.error(e);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchPropertyDetails();
    });
  }, [fetchPropertyDetails]);

  // Pricing math helper
  const getNightsCount = () => {
    if (!dates.start || !dates.end) return 0;
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
  };

  const nights = getNightsCount();
  const nightlySubtotal = property ? property.price * nights : 0;
  const serviceFee = parseFloat((nightlySubtotal * 0.10).toFixed(2));
  const ecoOffsetFee = optInOffset ? parseFloat((2.50 * nights).toFixed(2)) : 0;
  const totalPrice = parseFloat((nightlySubtotal + serviceFee + ecoOffsetFee).toFixed(2));

  const handleCreateReservation = async () => {
    if (!currentUser) {
      const btn = document.getElementById("open-auth-modal-btn");
      if (btn) btn.click();
      return;
    }

    if (!dates.start || !dates.end) {
      setBookingError("Please select check-in and check-out dates");
      return;
    }

    setBookingError("");
    setBookingStep("review");
  };

  const handleConfirmReservation = async () => {
    setSubmittingBooking(true);
    setBookingError("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          startDate: dates.start,
          endDate: dates.end,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error || "Reservation failed");
        setBookingStep("idle");
      } else {
        setBookingStep("confirmed");
      }
    } catch (err) {
      setBookingError("Failed to book reservation. Server connection error.");
      setBookingStep("idle");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          comment: reviewComment,
          ratingClean: cleanRating,
          ratingComm: commRating,
          ratingLoc: locRating,
          ratingValue: valRating,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviews([data.review, ...reviews]);
        setReviewComment("");
        setCleanRating(5);
        setCommRating(5);
        setLocRating(5);
        setValRating(5);
      } else {
        setReviewError(data.error || "Failed to submit review");
      }
    } catch (err) {
      setReviewError("Connection error. Try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      const btn = document.getElementById("open-auth-modal-btn");
      if (btn) btn.click();
      return;
    }

    if (wishlists.length > 0) {
      const first = wishlists[0];
      const res = await fetch("/api/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          wishlistId: first.id,
          propertyId: id,
        }),
      });
      if (res.ok) {
        await refreshWishlists();
      }
    } else {
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
            propertyId: id,
          }),
        });
        if (resToggle.ok) {
          await refreshWishlists();
        }
      }
    }
  };

  const isSaved = () => {
    return wishlists.some((w) => w.propertyIds.includes(id));
  };

  const getAverageReviewRating = () => {
    if (reviews.length === 0) return 4.9;
    const total = reviews.reduce((acc, curr) => acc + curr.ratingAverage, 0);
    return parseFloat((total / reviews.length).toFixed(1));
  };

  const globalRating = getAverageReviewRating();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-bold text-slate-400 font-mono">LOADING PROPERTY MATRICES...</p>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const isSavedVal = isSaved();

  return (
    <div id="pdp-container" className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/search")}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>Back to explore search</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleWishlist}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Heart className={`h-4 w-4 ${isSavedVal ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
              <span>{isSavedVal ? "Saved in wishlists" : "Save to wishlist"}</span>
            </button>
          </div>
        </div>

        {/* Header Title Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              EliteProvider Verified Lodge
            </span>
          </div>
          <h1 className="font-sans text-2xl font-extrabold sm:text-3xl text-slate-900 dark:text-white mt-1.5 leading-tight">
            {property.title}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="h-4 w-4 fill-amber-500" />
              <span>{globalRating} ({reviews.length} ratings)</span>
            </div>
            <span>•</span>
            <span className="underline">{property.location}</span>
          </div>
        </div>

        {/* Masonry image grid gallery */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-3xl overflow-hidden mb-8 h-[240px] md:h-[400px]">
          {/* Main Primary Photo */}
          <div className="md:col-span-8 h-full overflow-hidden bg-slate-200">
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Secondary Photo Stack */}
          <div className="hidden md:col-span-4 md:flex flex-col gap-3 h-full">
            <div className="h-1/2 overflow-hidden bg-slate-200">
              <img
                src={property.images[1] || "https://picsum.photos/seed/pdp2/1200/800"}
                alt={`${property.title} interior`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-1/2 overflow-hidden bg-slate-200">
              <img
                src={property.images[2] || "https://picsum.photos/seed/pdp3/1200/800"}
                alt={`${property.title} view`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content Split columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Main details info (Lg: 8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Description card */}
            <div className="space-y-4">
              <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                About this sanctuary
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {property.description}
              </p>
            </div>

            {/* Lodge Eco-Efficiency Profile Card & Local Guide */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 space-y-6">
              <div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  ENVIRONMENTAL VERIFICATION
                </span>
                <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white mt-1.5">
                  Eco-Efficiency & Low-Impact Profile
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Audited sustainable infrastructure metrics for {property.title}
                </p>
              </div>

              {/* Eco metrics layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Score & Carbon Box */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Eco-Score Index</span>
                      <span className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none mt-1.5 block">
                        {property.ecoScore || 80}/100
                      </span>
                    </div>
                    <div className="h-11 w-11 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-xs">
                      {property.ecoScore && property.ecoScore >= 90 ? "A+" : "B"}
                    </div>
                  </div>

                  {/* Rating progress bar */}
                  <div className="mt-4">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${property.ecoScore || 80}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1.5">
                      Top <span className="font-bold text-emerald-600 dark:text-emerald-400">10% of regional properties</span> in water/energy efficiency
                    </span>
                  </div>
                </div>

                {/* Carbon Footprint details */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Carbon Footprint Estimate</span>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {property.carbonFootprint || 5.0} kg
                    </span>
                    <span className="text-xs text-slate-400">CO2e / night</span>
                  </div>

                  {/* Benchmark Comparison */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Typical Hotel Room Benchmark</span>
                      <span className="font-bold text-red-500">21.4 kg / night</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">WanderLodge Average</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">4.5 kg / night</span>
                    </div>
                    <div className="w-full bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-xl text-[10px] text-emerald-800 dark:text-emerald-400 border border-emerald-100/40 mt-2 font-medium">
                      🍃 Preserves approx. <span className="font-extrabold">16.9 kg of carbon emissions</span> per night of stay compared to legacy hotel suites.
                    </div>
                  </div>
                </div>
              </div>

              {/* Eco Amenities Badges */}
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                  Active Eco-Utilities Installed
                </span>
                <div className="flex flex-wrap gap-2">
                  {(property.ecoAmenities || ["LED Energy Star bulbs", "Greywater recycling", "Local recycling depot access"]).map((ecoAmenity) => (
                    <span
                      key={ecoAmenity}
                      className="inline-flex items-center gap-1 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
                    >
                      <Leaf className="h-3 w-3 shrink-0" />
                      <span>{ecoAmenity}</span>
                    </span>
                  ))}
                  {property.hasEVCharging && (
                    <span className="inline-flex items-center gap-1 bg-blue-50/80 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      <Zap className="h-3 w-3 shrink-0 text-blue-500" />
                      <span>EV Charger: {property.chargingType || "Level 2 Charger"}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive Local Low-Impact Guide Tabs */}
              <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                
                {/* Tabs Selector row */}
                <div className="flex border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 p-1">
                  {(["transit", "sourcing", "code"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEcoTab(tab)}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition ${
                        ecoTab === tab
                          ? "bg-white dark:bg-slate-850 text-emerald-800 dark:text-emerald-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab === "transit" ? "🚌 Zero-Emission Transit" : tab === "sourcing" ? "🍏 Organic Sourcing" : "🌲 Low-Impact Living"}
                    </button>
                  ))}
                </div>

                {/* Tab Content Panels */}
                <div className="p-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {ecoTab === "transit" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-800 dark:text-white text-xs">Getting around without emissions:</p>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-500 dark:text-slate-400">
                        <li><span className="font-bold text-slate-700 dark:text-slate-350">WanderShuttle Line C:</span> Stops 0.4 miles from the lodge entrance every hour, connecting straight to main hiking trailheads and the central ranger depot.</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-350">Mountain Cruiser E-Bikes:</span> Dual electric fat-tire bikes are parked in the gear closet on-site, fully charged and free to use.</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-350">EV Charging Network:</span> {property.hasEVCharging ? `Listing features an on-site ${property.chargingType || "Level 2"} charger.` : "Closest high-efficiency public DC fast charger is exactly 4.2 miles away at Pinecrest Coop."}</li>
                      </ul>
                    </div>
                  )}

                  {ecoTab === "sourcing" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-800 dark:text-white text-xs">Support the local bio-network:</p>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-500 dark:text-slate-400">
                        <li><span className="font-bold text-slate-700 dark:text-slate-350">Pinecrest Farmers Cooperative:</span> Open Wed-Sat, 8am-2pm. Sells 100% pesticide-free, dry-farmed heirloom apples, local honey, and grass-fed dairy products.</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-350">Wildwood Herb Garden:</span> Located directly behind the provider cabin. Guests are explicitly invited to harvest seasonal organic rosemary, sage, and mint for cooking.</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-350">No-Single-Use Packaging:</span> Eco toiletries (biodegradable organic bodywash, bar shampoos) are provided on tap in custom glass bottles.</li>
                      </ul>
                    </div>
                  )}

                  {ecoTab === "code" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-800 dark:text-white text-xs">Low-impact wilderness checklist:</p>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-500 dark:text-slate-400">
                        <li><span className="font-bold text-slate-700 dark:text-slate-350">Geothermal/Solar Heating:</span> Thermostat is linked to off-grid solar storage. We kindly request keeping target ranges between 68°F and 72°F to preserve load weights.</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-350">Composting guidelines:</span> Please place all raw veggie and fruit scraps inside the dual-chamber spinning compost drum on the western deck.</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-350">Greywater recycling:</span> Shower runoff feeds local cedar planters. Only use the organic, greywater-safe castile soaps provided.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8">
              <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white mb-4">
                What this lodge offers
              </h3>
              <div className="grid grid-cols-2 gap-3.5">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-150 p-3 bg-white dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider Section */}
            {provider && (
              <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 rounded-3xl p-6 bg-white dark:bg-slate-900/40 border border-slate-150">
                <div className="flex items-center gap-4">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      ELITE PROVIDER
                    </span>
                    <h4 className="font-sans text-base font-bold text-slate-900 dark:text-white mt-1">
                      Hosted by {provider.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase mt-0.5">
                      Compliant with 10-point inspection criteria
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                  As an EliteProvider, {provider.name} is dedicated to organizing bespoke stays, maintaining strict clean ratios, and providing immediate safety protocols. Use the Journeys page after booking to message directly about LocalAdventures planning.
                </p>
              </div>
            )}

            {/* Reviews list matrix and Submission Form */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 space-y-8">
              <div>
                <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                  Guest Feedback & Ratings
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Verified reviews collected from actual stays in the WanderLodge Network
                </p>
              </div>

              {/* Review metrics split */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-150">
                {[
                  { name: "Cleanliness", score: 4.9 },
                  { name: "Communication", score: 4.8 },
                  { name: "Location", score: 5.0 },
                  { name: "Value", score: 4.8 }
                ].map((score) => (
                  <div key={score.name} className="text-center md:text-left py-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">{score.name}</span>
                    <div className="flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                      <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200">{score.score}</span>
                      <div className="flex text-amber-500">
                        <Star className="h-3 w-3 fill-amber-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add review form (for authenticated travelers) */}
              {currentUser && currentUser.role === "TRAVELER" && (
                <div className="rounded-3xl border border-slate-150 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                  <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                    <span>Leave your feedback</span>
                  </h4>

                  {reviewError && (
                    <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30">
                      {reviewError}
                    </div>
                  )}

                  <form onSubmit={handleAddReview} className="space-y-4">
                    {/* Rating dials */}
                    <div className="grid grid-cols-2 gap-4">
                      {["Cleanliness", "Communication", "Location", "Value"].map((label) => {
                        const val = label === "Cleanliness" ? cleanRating : label === "Communication" ? commRating : label === "Location" ? locRating : valRating;
                        const setter = label === "Cleanliness" ? setCleanRating : label === "Communication" ? setCommRating : label === "Location" ? setLocRating : setValRating;

                        return (
                          <div key={label}>
                            <label className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                              <span>{label}</span>
                              <span className="text-emerald-600 font-bold">{val} / 5</span>
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              step="0.5"
                              value={val}
                              onChange={(e) => setter(parseFloat(e.target.value))}
                              className="w-full accent-emerald-600 dark:accent-emerald-500 cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Review Comment
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Detail your stay... cedar hot tub speed, check-in instructions, local vistas"
                        className="w-full rounded-xl border border-slate-250 bg-slate-50 px-4 py-2.5 text-xs outline-none transition-colors focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500"
                      >
                        {submittingReview ? "Posting review..." : "Post Verified Review"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Review listing */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6 border-t border-slate-100 dark:border-slate-800">
                    No reviews yet. Be the first to leave verified feedback!
                  </p>
                ) : (
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="border-t border-slate-100 pt-5 dark:border-slate-800/80 flex flex-col md:flex-row gap-4"
                    >
                      {/* Left: Author card */}
                      <div className="md:w-44 shrink-0 flex items-center md:items-start gap-3">
                        <img
                          src={r.authorImage}
                          alt={r.authorName}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {r.authorName}
                          </h5>
                          <span className="text-[10px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Right: Feedback comment */}
                      <div className="flex-grow space-y-1">
                        <div className="flex items-center gap-1">
                          <div className="flex text-amber-500">
                            <Star className="h-3 w-3 fill-amber-500" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {r.ratingAverage} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                          {r.comment}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Reservation Calculator - Lg: 4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="font-sans text-2xl font-extrabold text-slate-900 dark:text-white">
                    ${property.price}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                  <span>{globalRating}</span>
                </div>
              </div>

              {bookingError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30">
                  {bookingError}
                </div>
              )}

              {/* Dynamic Steps UI Renderer */}
              {bookingStep === "idle" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Check-in & Check-out Selection
                    </label>
                    <DatePicker
                      startDate={dates.start}
                      endDate={dates.end}
                      onDatesChange={(start, end) => setDates({ start, end })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Guests
                    </label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                        className="w-full text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent outline-none cursor-pointer"
                      >
                        {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n} className="dark:bg-slate-900">
                            {n} Traveler{n > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="space-y-3 border-t border-dashed border-slate-100 pt-4 dark:border-slate-800/80">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>${property.price} x {nights} nights</span>
                        <span className="font-semibold">${nightlySubtotal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-0.5">
                          WanderGuarantee Fee (10%)
                          <span title="Includes 24/7 service safety shield">
                            <HelpCircle className="h-3 w-3 text-slate-400" />
                          </span>
                        </span>
                        <span className="font-semibold">${serviceFee}</span>
                      </div>
                      
                      {/* Dynamic Eco Offset Line Item */}
                      {optInOffset && (
                        <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          <span className="flex items-center gap-1">
                            🌱 Eco-Carbon Offset ($2.50/nt)
                          </span>
                          <span>+${ecoOffsetFee}</span>
                        </div>
                      )}

                      {/* Carbon Offset Opt-In toggle box */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/40 space-y-2 mt-2">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            id="carbon-neutral-checkbox"
                            checked={optInOffset}
                            onChange={(e) => setOptInOffset(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800 dark:text-emerald-400">Pledge Carbon-Neutral</span>
                            <span className="block text-[9px] text-slate-500 leading-tight mt-0.5">
                              Offset this stay&apos;s carbon weight ({parseFloat(((property.carbonFootprint || 5.0) * nights).toFixed(1))} kg CO2e) via regional forestry seeding.
                            </span>
                          </div>
                        </label>
                        
                        {optInOffset && (
                          <div className="pt-2 border-t border-emerald-100/30">
                            {/* Mini Certificate preview card */}
                            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 p-2 rounded-xl flex items-center gap-2">
                              <Leaf className="h-4 w-4 text-emerald-500 shrink-0 animate-bounce" />
                              <div className="text-[9px]">
                                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block uppercase">Leave No Trace Verified</span>
                                <span className="text-slate-400 block mt-0.5">Neutralizes {parseFloat(((property.carbonFootprint || 5.0) * nights).toFixed(1))} kg CO2</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-bold text-slate-800 dark:border-slate-800 dark:text-slate-200">
                        <span>Grand Total</span>
                        <span className="text-emerald-600 dark:text-emerald-400">${totalPrice}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCreateReservation}
                    className="w-full rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition"
                  >
                    Secure Wilderness Stay
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">You won&apos;t be billed yet</p>
                </div>
              )}

              {bookingStep === "review" && (
                <div className="space-y-4">
                  <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Review House Rules</h4>
                  <ul className="text-xs text-slate-500 space-y-2">
                    <li className="flex items-start gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Respect the local ecology: no trash left behind in the valley.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Cedar hot tub: please lid up after use to preserve warmth.</span>
                    </li>
                  </ul>

                  {/* Interactive Leave No Trace Wilderness Pledge Checklist */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      🌲 Leave No Trace Wilderness Pledge
                    </span>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      WanderLodge complies with local preservation boards. Please check each principle and initial below to proceed:
                    </p>

                    <div className="space-y-2.5 mt-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pledgeListAgreed.includes("lnt1")}
                          onChange={() => {
                            setPledgeListAgreed(prev => 
                              prev.includes("lnt1") ? prev.filter(x => x !== "lnt1") : [...prev, "lnt1"]
                            );
                          }}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                          I pledge to <span className="font-bold">pack out all refuse</span> and raw plastic packaging, leaving zero trash behind.
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pledgeListAgreed.includes("lnt2")}
                          onChange={() => {
                            setPledgeListAgreed(prev => 
                              prev.includes("lnt2") ? prev.filter(x => x !== "lnt2") : [...prev, "lnt2"]
                            );
                          }}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                          I pledge to <span className="font-bold">respect the local wildlife and boundaries</span>, staying on designated trails and kayak lanes.
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pledgeListAgreed.includes("lnt3")}
                          onChange={() => {
                            setPledgeListAgreed(prev => 
                              prev.includes("lnt3") ? prev.filter(x => x !== "lnt3") : [...prev, "lnt3"]
                            );
                          }}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                          I pledge to <span className="font-bold">conserve power</span> by shutting down heating units and water heaters while outdoor-exploring.
                        </span>
                      </label>
                    </div>

                    {/* Initials Input */}
                    <div className="mt-3">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">
                        Signature Initials (min 2 letters)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. JB"
                        value={pledgeInitial}
                        onChange={(e) => setPledgeInitial(e.target.value.toUpperCase())}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-emerald-500 font-mono uppercase"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSignedPledge(true);
                      setBookingStep("payment");
                    }}
                    disabled={
                      !pledgeListAgreed.includes("lnt1") ||
                      !pledgeListAgreed.includes("lnt2") ||
                      !pledgeListAgreed.includes("lnt3") ||
                      pledgeInitial.trim().length < 2
                    }
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40 transition"
                  >
                    Sign Pledge & Continue
                  </button>
                  <button
                    onClick={() => setBookingStep("idle")}
                    className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-1"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {bookingStep === "payment" && (
                <div className="space-y-4">
                  <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Simulated Payment processing</h4>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-850 dark:bg-slate-950">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Grand Total to Charge</span>
                    <span className="text-lg font-extrabold text-emerald-600">${totalPrice}</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Simulated Card Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      value={simulatedCardNumber}
                      onChange={(e) => setSimulatedCardNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <button
                    onClick={handleConfirmReservation}
                    disabled={submittingBooking || !simulatedCardNumber.trim()}
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submittingBooking ? "Simulating transaction..." : `Authorize Payment of $${totalPrice}`}
                  </button>
                  <button
                    onClick={() => setBookingStep("idle")}
                    className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-1"
                  >
                    Go Back
                  </button>
                </div>
              )}

              {bookingStep === "confirmed" && (
                <div className="text-center space-y-4 py-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <h4 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                    Stay Confirmed!
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your itinerary is generated. An automated welcome chat was opened with your EliteProvider. Check details on the Journeys page.
                  </p>

                  {/* Gorgeous climate offset digital certificate */}
                  {optInOffset && (
                    <div className="mt-4 border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 rounded-2xl text-left shadow-sm border-dashed relative overflow-hidden">
                      {/* Leaf background icon watermark */}
                      <Leaf className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/5 rotate-12 pointer-events-none" />
                      
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-emerald-500/10">
                        <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Leaf className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
                          Climate Pioneer Certificate
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[10px] font-sans text-slate-600 dark:text-slate-400">
                        <p>
                          <span className="text-slate-400">Guardian Name:</span>{" "}
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {currentUser?.name || "Wilderness Traveler"}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-400">Lodge Secured:</span>{" "}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {property.title}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-400">LNT Witness Initials:</span>{" "}
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {pledgeInitial || "WLV"}
                          </span>
                        </p>
                        <p className="pt-1 flex justify-between items-baseline border-t border-emerald-500/5 mt-2">
                          <span className="text-slate-400">Net Carbon Offset:</span>
                          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                            {parseFloat(((property.carbonFootprint || 5.0) * nights).toFixed(1))} kg CO2e
                          </span>
                        </p>
                      </div>

                      <div className="mt-3 text-[9px] text-slate-400 text-center font-mono">
                        ID: WLC-847291 • VERIFIED PLANTING
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => router.push("/trips")}
                    className="w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                  >
                    Open Journeys & Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
