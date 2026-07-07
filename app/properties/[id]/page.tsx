"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Star, Heart, Share, ShieldCheck, HelpCircle, Utensils, Wifi, Sparkles, MapPin, Calendar, Users, Send, Check, X, AlertCircle, RefreshCw, Eye, Baby, Compass, Activity, Volume2 } from "lucide-react";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DatePicker from "@/components/DatePicker";
import { SensoryProfile } from "@/lib/db";

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
  sensory?: SensoryProfile;
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

  // Review submission states
  const [reviewComment, setReviewComment] = useState("");
  const [cleanRating, setCleanRating] = useState(5);
  const [commRating, setCommRating] = useState(5);
  const [locRating, setLocRating] = useState(5);
  const [valRating, setValRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Universal Comfort & Intergenerational states
  const [activeAccTab, setActiveAccTab] = useState<"physical" | "sensory">("physical");
  const [orthoMats, setOrthoMats] = useState(false);
  const [medicalKit, setMedicalKit] = useState(false);
  const [largePrintGames, setLargePrintGames] = useState(false);
  const [walkerRamp, setWalkerRamp] = useState(false);

  // Local Adventures state
  const [adventures, setAdventures] = useState<Array<{
    title: string;
    type: string;
    distance: string;
    description: string;
    link: string;
    difficulty?: string;
  }>>([]);
  const [loadingAdventures, setLoadingAdventures] = useState(false);
  const [selectedAdventures, setSelectedAdventures] = useState<string[]>([]);
  const [adventuresGrounded, setAdventuresGrounded] = useState(false);
  const [adventuresSource, setAdventuresSource] = useState("");
  const [verifiedSources, setVerifiedSources] = useState<Array<{ title: string; uri: string }>>([]);

  // Verified Host States
  const [showHostModal, setShowHostModal] = useState(false);
  const [hostMessageContent, setHostMessageContent] = useState("");
  const [hostMessageSending, setHostMessageSending] = useState(false);
  const [hostMessageSuccess, setHostMessageSuccess] = useState(false);

  // Community Q&A Board States
  const [feedbackTab, setFeedbackTab] = useState<"reviews" | "qa">("reviews");
  const [qas, setQAs] = useState<any[]>([]);
  const [loadingQAs, setLoadingQAs] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [activeAnswerId, setActiveAnswerId] = useState<string | null>(null);
  const [newAnswerText, setNewAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [aiAnsweringId, setAiAnsweringId] = useState<string | null>(null);

  const fetchLocalAdventures = useCallback(async () => {
    setLoadingAdventures(true);
    try {
      const res = await fetch(`/api/adventures?propertyId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setAdventures(data.adventures || []);
        setAdventuresGrounded(data.grounded || false);
        setAdventuresSource(data.source || "");
        setVerifiedSources(data.verifiedSources || []);
      }
    } catch (e) {
      console.error("Failed to fetch local adventures:", e);
    } finally {
      setLoadingAdventures(false);
    }
  }, [id]);

  const fetchQAs = useCallback(async () => {
    setLoadingQAs(true);
    try {
      const res = await fetch(`/api/qa?propertyId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setQAs(data.qas || []);
      }
    } catch (e) {
      console.error("Failed to load QAs:", e);
    } finally {
      setLoadingQAs(false);
    }
  }, [id]);

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
      fetchLocalAdventures();
      fetchQAs();
    });
  }, [fetchPropertyDetails, fetchLocalAdventures, fetchQAs]);

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
  const totalPrice = nightlySubtotal + serviceFee;

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
          selectedAdventures,
          comfortEquipment: {
            orthoMats,
            medicalKit,
            largePrintGames,
            walkerRamp,
          },
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

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setSubmittingQuestion(true);
    setQuestionError("");

    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          action: "ask",
          question: newQuestionText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setQAs([data.qa, ...qas]);
        setNewQuestionText("");
      } else {
        setQuestionError(data.error || "Failed to submit question");
      }
    } catch (err) {
      setQuestionError("Network error. Please try again.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAddAnswer = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    if (!newAnswerText.trim()) return;
    setSubmittingAnswer(true);

    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          action: "answer",
          questionId,
          text: newAnswerText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setQAs(qas.map((q) => (q.id === questionId ? data.qa : q)));
        setNewAnswerText("");
        setActiveAnswerId(null);
      } else {
        alert(data.error || "Failed to post answer");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAskAIConcierge = async (questionId: string) => {
    setAiAnsweringId(questionId);

    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          action: "ask-ai",
          questionId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setQAs(qas.map((q) => (q.id === questionId ? data.qa : q)));
      } else {
        alert(data.error || "AI assist failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnsweringId(null);
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

            {/* Sensory Atmosphere & Technical Specifications (Batch 5) */}
            {property.sensory && (
              <div id="sensory-specs-panel" className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 space-y-6">
                <div>
                  <h3 className="font-sans text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                    <Volume2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Sensory Atmosphere & Technical Specifications</span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                    Detailed physical soundscapes, chemical-free scent profiles, and pet/workstation structural dimensions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Decibel & Acoustics */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔊</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Decibel Atmosphere & Acoustics</span>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono">
                        Acoustics Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Characterized as <span className="font-semibold text-slate-700 dark:text-slate-300">&ldquo;{property.sensory.decibelAtmosphere}&rdquo;</span>. Natural soundscape features premium subalpine acoustics, minimizing high-frequency disturbances.
                    </p>
                  </div>

                  {/* Astrophotography */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Astrophotography Conditions</span>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-mono">
                        Bortle Score: {property.sensory.astrophotographyScore}/10
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      Unmatched dark sky visibility. Highly isolated from regional light pollution, with pristine clean air patterns, perfect for stargazers, photography, or deep nocturnal contemplation.
                    </p>
                  </div>

                  {/* Fully Enclosed Yard */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🐕</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Fenced Yard (Pet Safety Specs)</span>
                      </div>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-mono">
                        {property.sensory.enclosedYard.exists ? "Fully Enclosed" : "Not Enclosed"}
                      </span>
                    </div>
                    {property.sensory.enclosedYard.exists ? (
                      <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <p className="leading-relaxed">
                          Secure containment for active breeds with complete perimeter enforcement.
                        </p>
                        <div className="flex flex-wrap gap-2 text-[9px] font-mono">
                          <span className="bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500">Fence Height: {property.sensory.enclosedYard.fenceHeight}</span>
                          <span className="bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500">Material: {property.sensory.enclosedYard.fenceMaterial}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">No enclosed yard. Wild natural elements envelope the surrounding fields.</p>
                    )}
                  </div>

                  {/* Ergonomic Workstation */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💻</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Ergonomic Remote Workstation</span>
                      </div>
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 font-mono">
                        {property.sensory.ergonomicWorkstation.exists ? "Verified Office" : "Basic WiFi"}
                      </span>
                    </div>
                    {property.sensory.ergonomicWorkstation.exists ? (
                      <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <p className="leading-relaxed">
                          Designed with posture correction and verified low-latency connection speeds.
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-[9px] font-mono bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <div>⚡ Upload: {property.sensory.ergonomicWorkstation.uploadSpeedMbps} Mbps</div>
                          <div>📏 Desk: {property.sensory.ergonomicWorkstation.deskHeight}</div>
                          <div className="col-span-2 mt-0.5 truncate">💺 Chair: {property.sensory.ergonomicWorkstation.chairType}</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">No dedicated office station setup, standard table layout provided.</p>
                    )}
                  </div>

                  {/* Stove & Firewood Tracker */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔥</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Stove & Firewood Availability</span>
                      </div>
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 font-mono">
                        {property.sensory.stoveFirewoodTracker.hasStove ? "Woodstove Warmth" : "Central Heat"}
                      </span>
                    </div>
                    {property.sensory.stoveFirewoodTracker.hasStove ? (
                      <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <p className="leading-relaxed font-sans">
                          A beautiful wood-burning stove is featured. Dried, cured firewood is fully supplied.
                        </p>
                        <div className="flex flex-wrap gap-2 text-[9px] font-mono">
                          <span className="bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500">Firewood Provided: {property.sensory.stoveFirewoodTracker.firewoodProvided ? "Yes" : "No"}</span>
                          <span className="bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500">Ignition: {property.sensory.stoveFirewoodTracker.lightingDifficulty}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">Equipped with low-carbon centralized subalpine heat pump.</p>
                    )}
                  </div>

                  {/* Solitude Index */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌲</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Solitude Index</span>
                      </div>
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 font-mono">
                        Index: {property.sensory.solitudeIndex}/10
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      This lodge is situated {property.sensory.solitudeIndex >= 8 ? "highly isolated, providing deep seclusion and zero shared visual borders with neighbors." : "in a quiet, private area bordered by subalpine pines and clean mountain ridges."}
                    </p>
                  </div>

                  {/* Scent Profile */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌿</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Organic Scent Profile</span>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono">
                        Scent Free
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Lodge atmosphere emits <span className="font-semibold text-slate-700 dark:text-slate-300">&ldquo;{property.sensory.naturalScentProfile}&rdquo;</span>. Strictly no volatile organic chemicals, artificial fragrances, or strong chemical residues are used.
                    </p>
                  </div>

                  {/* Pool & Hot Tub Mechanics */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💧</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Water Mechanics & Sanitation</span>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-mono">
                        {property.sensory.poolHotTubMechanics.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      Sanitated utilizing organic <span className="font-semibold text-slate-700 dark:text-slate-300">{property.sensory.poolHotTubMechanics.details}</span> mechanics. Ensures zero strong chlorine odors, completely eye-safe and sensitive-skin friendly.
                    </p>
                  </div>

                  {/* Waterfront Edge Safety */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🛶</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Waterfront Access Safety</span>
                      </div>
                      <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-700 dark:bg-slate-900/40 font-mono">
                        {property.sensory.waterfrontSafety.steepness}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Water access point features a <span className="font-semibold text-slate-700 dark:text-slate-300">{property.sensory.waterfrontSafety.steepness}</span> grade. Notice: <span className="italic text-slate-450 font-medium">{property.sensory.waterfrontSafety.safetyRating}</span>.
                    </p>
                  </div>

                  {/* Seasonal Access */}
                  <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/45 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">❄️</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Seasonal Access (Winter)</span>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-mono">
                        {property.sensory.seasonalAccess.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Road access is designated <span className="font-semibold text-slate-700 dark:text-slate-300">{property.sensory.seasonalAccess.rating}</span>, with <span className="font-semibold text-slate-700 dark:text-slate-300">{property.sensory.seasonalAccess.details}</span> winter snow removal schedules.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Universal Comfort & Accessibility Profile Section */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-sans text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Universal Comfort & Accessibility Profile</span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    EliteProvider certified physical and cognitive support specs.
                  </p>
                </div>
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 self-start">
                  <button
                    onClick={() => setActiveAccTab("physical")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeAccTab === "physical"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    Physical Access
                  </button>
                  <button
                    onClick={() => setActiveAccTab("sensory")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeAccTab === "sensory"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    Sensory & Safety
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeAccTab === "physical" ? (
                  <motion.div
                    key="physical"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Entryway */}
                    <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          🚪
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Step-Free Entryway & Hallways</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        A continuous, gently sloped ramp connects the primary driveway directly to the main timber deck. Low interior thresholds (under 0.25 inches) ensure safe walker or wheelchair glide.
                      </p>
                      <div className="inline-block rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                        Door Width: 36&quot; clear opening
                      </div>
                    </div>

                    {/* Bath */}
                    <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          🚿
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Comfort Bath Configuration</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Equipped with a 17-inch comfort-height commode. Features a curbless roll-in tile shower with non-slip floor treatment and support handles.
                      </p>
                      <div className="inline-block rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                        Optional grab bars available on demand
                      </div>
                    </div>

                    {/* Bed */}
                    <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          🛏️
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Ground Floor Master Suite</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        The primary bedroom is situated on the ground level, eliminating the need to navigate the cedar stairs. Offers 3.5 feet of wide perimeter space on both sides of the orthocare mattress.
                      </p>
                      <div className="inline-block rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                        Bed Clearance: 42 inches wide
                      </div>
                    </div>

                    {/* Traction */}
                    <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          👣
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Textured Traction Flooring</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Features matte-finished wire-brushed oak floorings and textured slate tiling in high-risk zones. Completely avoids loose-threaded carpets or heavy throw rugs to protect against tripping.
                      </p>
                      <div className="inline-block rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                        Trip-free design certified
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="sensory"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Sound proof */}
                    <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          🔊
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Premium Acoustic Soundproofing</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Insulated with high-density mineral wool sound boards. Minimizes wind roar and exterior noise, providing a calming sensory environment for light sleepers or neurodivergent children.
                      </p>
                      <div className="inline-block rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                        10-decibel average noise dampening
                      </div>
                    </div>

                    {/* Lighting */}
                    <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          💡
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Anti-Glare Calibrated Lighting</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Recessed warm white light fixtures with high color rendering (CRI 90+) and fully dimmable controls. Smooth visual adaptation prevents strain for aging eyes and helps regulate circadian rhythms.
                      </p>
                      <div className="inline-block rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                        Warm 2700K ambient lumens
                      </div>
                    </div>

                    {/* Medical */}
                    <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          🩺
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Immediate Medical Safeguards</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        For complete peace of mind, our cabin has immediate emergency routes clearly mapped. A standard clinical first-aid kit is mounted under the main kitchen console.
                      </p>
                      <div className="inline-block rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 px-2 py-0.5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                        Sunset Medical Center: 3.2 miles away
                      </div>
                    </div>

                    {/* Childproof */}
                    <div className="rounded-2xl border border-slate-150 p-4 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          🧸
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">Childproof & Toddler Safe</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Cabinet doors are equipped with optional toggle latches. Furnishings feature rounded wooden corners, and all high power outlets are sealed with safety inserts.
                      </p>
                      <div className="inline-block rounded-md bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                        Hearth guard & outlet plugs included
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Seamless Local Adventures Section */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                      Seamless Local Adventures
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Custom-curated local highlights and excursions grounded in real location data.
                  </p>
                </div>
                {adventuresSource && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 px-3 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 shrink-0 self-start sm:self-center">
                    <Sparkles className="h-3 w-3" />
                    <span>{adventuresSource}</span>
                  </div>
                )}
              </div>

              {loadingAdventures ? (
                <div className="rounded-2xl border border-slate-150 p-8 text-center bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-3">
                  <RefreshCw className="h-6 w-6 text-slate-400 dark:text-slate-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    Grounding regional adventure intelligence...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {adventures.map((adv) => {
                      const isSelected = selectedAdventures.includes(adv.title);
                      return (
                        <div
                          key={adv.title}
                          className={`relative rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-emerald-50/40 border-emerald-500 dark:bg-emerald-950/10 dark:border-emerald-600 shadow-sm"
                              : "bg-white border-slate-150 hover:border-slate-300 dark:bg-slate-900/40 dark:border-slate-800 dark:hover:border-slate-750"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                {adv.type}
                              </span>
                              {adv.difficulty && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  adv.difficulty === "Easy" ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" :
                                  adv.difficulty === "Moderate" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                                  "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                                }`}>
                                  {adv.difficulty}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">
                              {adv.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                              {adv.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                              <span className="font-mono">{adv.distance}</span>
                              {adv.link && (
                                <a
                                  href={adv.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                                >
                                  Sources <Eye className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAdventures(selectedAdventures.filter(t => t !== adv.title));
                                } else {
                                  setSelectedAdventures([...selectedAdventures, adv.title]);
                                }
                              }}
                              className={`w-full py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300"
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Added to Itinerary
                                </>
                              ) : (
                                "Add to Itinerary"
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {verifiedSources.length > 0 && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-850 dark:bg-slate-950/20">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Live Grounding Sources Verified by Gemini</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {verifiedSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1 hover:underline"
                          >
                            <span className="text-slate-400 font-mono">[{idx + 1}]</span>
                            <span className="truncate max-w-[200px]">{source.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              <div
                onClick={() => setShowHostModal(true)}
                className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 rounded-3xl p-6 bg-white dark:bg-slate-900/40 border border-slate-150 cursor-pointer hover:border-emerald-500/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="h-14 w-14 rounded-full object-cover border-2 border-emerald-500/20 group-hover:border-emerald-500 transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 uppercase tracking-wide">
                        Verified Elite Host
                      </span>
                    </div>
                    <h4 className="font-sans text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                      Hosted by {provider.name}
                      <span className="text-[10px] text-slate-400 font-normal underline">(View Profile)</span>
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
            <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 space-y-6">
              
              {/* Tab Selector Buttons */}
              <div className="flex border-b border-slate-250 dark:border-slate-800 gap-6">
                <button
                  type="button"
                  onClick={() => setFeedbackTab("reviews")}
                  className={`pb-3 text-sm font-bold transition-all relative ${
                    feedbackTab === "reviews"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  Verified Guest Reviews ({reviews.length})
                  {feedbackTab === "reviews" && (
                    <motion.div layoutId="feedbackUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackTab("qa")}
                  className={`pb-3 text-sm font-bold transition-all relative ${
                    feedbackTab === "qa"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  Community Q&A Board ({qas.length})
                  {feedbackTab === "qa" && (
                    <motion.div layoutId="feedbackUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </button>
              </div>

              {feedbackTab === "reviews" ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
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
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                      Community Questions & Advice
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Grounded local coordination board featuring verified guest answers and instant AI Concierge assistance.
                    </p>
                  </div>

                  {/* Add Question input */}
                  {currentUser ? (
                    <div className="rounded-3xl border border-slate-150 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                      <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-2">
                        Ask the Community Board
                      </h4>
                      {questionError && (
                        <div className="mb-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/20">
                          {questionError}
                        </div>
                      )}
                      <form onSubmit={handleAskQuestion} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          placeholder="e.g., Is there cell signal? Is firewood provided for the hot tub?"
                          className="flex-grow rounded-xl border border-slate-250 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                        />
                        <button
                          type="submit"
                          disabled={submittingQuestion}
                          className="rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 shrink-0"
                        >
                          {submittingQuestion ? "Posting..." : "Ask Question"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center dark:border-slate-800 bg-slate-50/50">
                      <p className="text-xs text-slate-500">
                        Please <span className="font-bold underline cursor-pointer hover:text-emerald-600" onClick={() => document.getElementById("open-auth-modal-btn")?.click()}>log in</span> to ask questions or answer fellow travelers on the board.
                      </p>
                    </div>
                  )}

                  {/* Q&A List */}
                  <div className="space-y-5">
                    {loadingQAs ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-5 w-5 text-emerald-600 animate-spin" />
                        <span className="text-xs text-slate-400 ml-2">Loading discussion board...</span>
                      </div>
                    ) : qas.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-slate-150 rounded-2xl">
                        <p className="text-xs text-slate-400">
                          No questions have been posted yet. Be the first to start the discussion!
                        </p>
                      </div>
                    ) : (
                      qas.map((qa) => {
                        const isAnsweringThis = activeAnswerId === qa.id;
                        const isAiAnsweringThis = aiAnsweringId === qa.id;
                        const hasAIAnswer = qa.answers.some((ans: any) => ans.role === "AI_CONCIERGE");

                        return (
                          <div
                            key={qa.id}
                            className="border-b border-slate-100 pb-5 dark:border-slate-800/80 space-y-3"
                          >
                            {/* Question Header */}
                            <div className="flex items-start gap-3">
                              <img
                                src={qa.authorImage}
                                alt={qa.authorName}
                                className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5"
                              />
                              <div className="flex-grow space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {qa.authorName}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(qa.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                                  Q: {qa.question}
                                </h4>
                              </div>
                            </div>

                            {/* Question Actions */}
                            <div className="flex items-center gap-3 pl-11 text-[10px] font-bold text-slate-400 uppercase">
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentUser) {
                                    setActiveAnswerId(isAnsweringThis ? null : qa.id);
                                  } else {
                                    document.getElementById("open-auth-modal-btn")?.click();
                                  }
                                }}
                                className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                              >
                                Answer Question
                              </button>
                              
                              <button
                                type="button"
                                disabled={isAiAnsweringThis || hasAIAnswer}
                                onClick={() => handleAskAIConcierge(qa.id)}
                                className={`flex items-center gap-1 transition-colors ${
                                  hasAIAnswer 
                                    ? "text-emerald-600/50 cursor-not-allowed dark:text-emerald-400/40" 
                                    : "text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                }`}
                              >
                                {isAiAnsweringThis ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    AI Thinking...
                                  </>
                                ) : hasAIAnswer ? (
                                  "AI Responded"
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3" />
                                    Ask AI Concierge
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Inline Answer Submission */}
                            {isAnsweringThis && (
                              <form
                                onSubmit={(e) => handleAddAnswer(e, qa.id)}
                                className="pl-11 mt-2 flex gap-2"
                              >
                                <input
                                  type="text"
                                  required
                                  value={newAnswerText}
                                  onChange={(e) => setNewAnswerText(e.target.value)}
                                  placeholder="Type your answer here..."
                                  className="flex-grow rounded-xl border border-slate-250 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                                />
                                <button
                                  type="submit"
                                  disabled={submittingAnswer}
                                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500"
                                >
                                  {submittingAnswer ? "Posting..." : "Post"}
                                </button>
                              </form>
                            )}

                            {/* Threaded Answers */}
                            {qa.answers && qa.answers.length > 0 && (
                              <div className="pl-11 space-y-3 mt-2">
                                {qa.answers.map((ans: any) => {
                                  const isAI = ans.role === "AI_CONCIERGE";
                                  const isHost = ans.role === "PROVIDER";

                                  return (
                                    <div
                                      key={ans.id}
                                      className={`rounded-2xl p-3.5 border text-xs leading-relaxed ${
                                        isAI
                                          ? "bg-purple-50/40 border-purple-150/60 dark:bg-purple-950/10 dark:border-purple-900/40"
                                          : isHost
                                          ? "bg-emerald-50/40 border-emerald-150/60 dark:bg-emerald-950/10 dark:border-emerald-900/40"
                                          : "bg-slate-50/45 border-slate-150/40 dark:bg-slate-900/20 dark:border-slate-800/40"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <img
                                          src={ans.authorImage}
                                          alt={ans.authorName}
                                          className="h-5 w-5 rounded-full object-cover"
                                        />
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                          {ans.authorName}
                                        </span>
                                        {isAI && (
                                          <span className="flex items-center gap-0.5 rounded bg-purple-100 px-1.5 py-0.5 text-[8px] font-black text-purple-700 uppercase tracking-wider dark:bg-purple-950/80 dark:text-purple-300">
                                            <Sparkles className="h-2 w-2" />
                                            AI Concierge Assist
                                          </span>
                                        )}
                                        {isHost && (
                                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[8px] font-black text-emerald-700 uppercase tracking-wider dark:bg-emerald-950/80 dark:text-emerald-300">
                                            Lodge Host
                                          </span>
                                        )}
                                        <span className="text-[9px] text-slate-400 ml-auto">
                                          {new Date(ans.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-sans pl-1">
                                        {ans.content}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
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

                  {/* Complimentary Intergenerational Support Equipment */}
                  <div className="rounded-2xl border border-slate-150 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 space-y-2">
                    <span className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      👵 Child & Senior Comfort Setup
                    </span>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight">
                      Inspected by EliteProvider. Toggle complimentary medical or physical safety layouts for your party:
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-start gap-2 cursor-pointer select-none text-left">
                        <input
                          type="checkbox"
                          checked={orthoMats}
                          onChange={(e) => setOrthoMats(e.target.checked)}
                          className="h-3.5 w-3.5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <div>
                          <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">Non-Slip Bath Mats & Shower Chair</span>
                          <span className="block text-[8px] text-slate-450 dark:text-slate-500 leading-none">Increases bathroom traction for seniors</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer select-none text-left">
                        <input
                          type="checkbox"
                          checked={medicalKit}
                          onChange={(e) => setMedicalKit(e.target.checked)}
                          className="h-3.5 w-3.5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <div>
                          <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">Pulse Oximeter & Pediatric Kit</span>
                          <span className="block text-[8px] text-slate-450 dark:text-slate-500 leading-none">Clinical-grade diagnostic tools in-lodge</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer select-none text-left">
                        <input
                          type="checkbox"
                          checked={largePrintGames}
                          onChange={(e) => setLargePrintGames(e.target.checked)}
                          className="h-3.5 w-3.5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <div>
                          <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">Large-Print Card Games & Puzzles</span>
                          <span className="block text-[8px] text-slate-450 dark:text-slate-500 leading-none">Keeps grandparents & kids connected</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer select-none text-left">
                        <input
                          type="checkbox"
                          checked={walkerRamp}
                          onChange={(e) => setWalkerRamp(e.target.checked)}
                          className="h-3.5 w-3.5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <div>
                          <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">Portable Walkway Threshold Ramp</span>
                          <span className="block text-[8px] text-slate-450 dark:text-slate-500 leading-none">Eases walker/wheel entry over deck lips</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="space-y-2 border-t border-dashed border-slate-100 pt-4 dark:border-slate-800/80">
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

                      {(orthoMats || medicalKit || largePrintGames || walkerRamp) && (
                        <div className="flex justify-between text-xs text-emerald-600 font-bold dark:text-emerald-400">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Comfort Gear Configured</span>
                          </span>
                          <span>FREE</span>
                        </div>
                      )}

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

                  {(orthoMats || medicalKit || largePrintGames || walkerRamp) && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-950/40 dark:bg-emerald-950/20 text-left">
                      <span className="block text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        Active Comfort Equipment Requests
                      </span>
                      <ul className="text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                        {orthoMats && <li className="flex items-center gap-1">✓ Non-Slip Bath Mats & Shower Chair</li>}
                        {medicalKit && <li className="flex items-center gap-1">✓ Pulse Oximeter & Pediatric Kit</li>}
                        {largePrintGames && <li className="flex items-center gap-1">✓ Large-Print Games & Puzzles</li>}
                        {walkerRamp && <li className="flex items-center gap-1">✓ Portable Walkway Threshold Ramp</li>}
                      </ul>
                    </div>
                  )}

                  {selectedAdventures.length > 0 && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-950/40 dark:bg-emerald-950/20 text-left">
                      <span className="block text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        Selected Local Adventures
                      </span>
                      <ul className="text-[10px] text-emerald-700 dark:text-emerald-300 space-y-1">
                        {selectedAdventures.map((adv) => (
                          <li key={adv} className="flex items-center gap-1">🧭 {adv} (Complimentary Support)</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => setBookingStep("payment")}
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Accept & Continue
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

                  {(orthoMats || medicalKit || largePrintGames || walkerRamp) && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 text-[10px] font-bold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Comfort Protection Active</span>
                    </div>
                  )}

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

                  {(orthoMats || medicalKit || largePrintGames || walkerRamp) && (
                    <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 p-3 dark:border-emerald-950/20 text-left mt-2">
                      <span className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        📦 Dispatching Comfort Gear Pack:
                      </span>
                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 font-medium">
                        {orthoMats && <li>• Non-Slip Bath Mats & Shower Chair</li>}
                        {medicalKit && <li>• Pulse Oximeter & Pediatric Kit</li>}
                        {largePrintGames && <li>• Large-Print Games & Puzzles</li>}
                        {walkerRamp && <li>• Portable Walkway Threshold Ramp</li>}
                      </ul>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 leading-tight">
                        Our EliteProvider is pre-installing this layout before your arrival at the lodge.
                      </p>
                    </div>
                  )}

                  {selectedAdventures.length > 0 && (
                    <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 p-3 dark:border-emerald-950/20 text-left mt-2">
                      <span className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        🧭 Registered Local Adventures:
                      </span>
                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 font-medium">
                        {selectedAdventures.map((adv) => (
                          <li key={adv}>• {adv}</li>
                        ))}
                      </ul>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono mt-1.5 leading-tight">
                        Complimentary pass coordinates & mapping instructions sent to your welcome chat thread.
                      </p>
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

      {/* Verified Host Profile Modal Overlay */}
      <AnimatePresence>
        {showHostModal && provider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setShowHostModal(false);
                  setHostMessageSuccess(false);
                  setHostMessageContent("");
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Host Profile Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="h-16 w-16 rounded-full object-cover border-4 border-emerald-500/10"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[8px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Verified Identity Active
                    </span>
                    <span className="rounded bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 text-[8px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      Elite Provider
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
                    {provider.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">
                    Member since January 2026
                  </p>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-4 gap-2 text-center py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <span className="block text-[18px] font-extrabold text-slate-900 dark:text-white">4.9</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rating ★</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[18px] font-extrabold text-slate-900 dark:text-white">24</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Stays Hosted</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[18px] font-extrabold text-slate-900 dark:text-white">100%</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Response Rate</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[18px] font-extrabold text-slate-900 dark:text-white">&lt; 1hr</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Response Time</span>
                </div>
              </div>

              {/* Bio & Badges */}
              <div className="py-4 space-y-4 max-h-[220px] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                    Host Biography
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Hi! I&apos;m {provider.name}. I design and build bespoke wooden cabins, hot tubs, and secluded retreats.
                    I focus heavily on safety checklists, accessibility layouts, and seamless trail planning. My team and
                    I inspect every corner to ensure a perfect 10/10 stay. Feel free to contact me directly with any custom requests!
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                    Elite 10-Point Inspection Achievements
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-350">
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Carbon Neutral Heating</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>CVR Clean Ratio &gt; 98%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Accessible Lighting Map</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Emergency Kit Audit Pass</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Host form inside profile */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 space-y-3">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  Have a question? Message {provider.name}
                </h4>
                {hostMessageSuccess ? (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    ✓ Your message has been sent successfully! Evelyn will reply shortly.
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder={`Ask ${provider.name} about local trails, early check-in, or equipment...`}
                      value={hostMessageContent}
                      onChange={(e) => setHostMessageContent(e.target.value)}
                      className="flex-grow rounded-xl border border-slate-250 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!hostMessageContent.trim()) return;
                        setHostMessageSending(true);
                        // Mock sending message
                        await new Promise((resolve) => setTimeout(resolve, 800));
                        setHostMessageSending(false);
                        setHostMessageSuccess(true);
                        setHostMessageContent("");
                      }}
                      disabled={hostMessageSending || !hostMessageContent.trim()}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 shrink-0"
                    >
                      {hostMessageSending ? "Sending..." : "Send"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
