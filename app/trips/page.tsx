"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Compass, Calendar, MapPin, Send, HelpCircle, MessageSquare, ShieldCheck, Clock, CreditCard, ChevronRight, Layout, RefreshCw, Users, Plus, Trash2, Lock, CloudRain, AlertTriangle, CheckCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GroupCoordinationHub from "@/components/GroupCoordinationHub";
import SmartInStayControls from "@/components/SmartInStayControls";

interface CoTraveler {
  name: string;
  email: string;
  role?: string;
  image?: string;
}

interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  paidByName: string;
}

interface Reservation {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  propertyTitle: string;
  propertyImage: string;
  propertyLocation: string;
  selectedAdventures?: string[];
  comfortEquipment?: {
    orthoMats: boolean;
    medicalKit: boolean;
    largePrintGames: boolean;
    walkerRamp: boolean;
  };
  coTravelers?: CoTraveler[];
  groupExpenses?: GroupExpense[];
  isDayRetreat?: boolean;
  depositPaid?: number;
  depositTotal?: number;
  remainingBalance?: number;
  escrowStatus?: string;
  originalLodgeTitle?: string;
  rainCheckClaimed?: boolean;
  paymentMilestones?: {
    title: string;
    amount: number;
    dueDate: string;
    paid: boolean;
  }[];
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderImage: string;
}

export default function TripsPage() {
  const router = useRouter();
  const { currentUser, loadingUser } = useStore();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeResId, setActiveResId] = useState<string | null>(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"chat" | "planning" | "group" | "stay" | "flexibility">("chat");

  // Rain-Check & Flexibility states
  const [rainCheckStart, setRainCheckStart] = useState("");
  const [rainCheckEnd, setRainCheckEnd] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [extendingStay, setExtendingStay] = useState(false);
  const [cancellingHost, setCancellingHost] = useState(false);
  const [isMilestonePaying, setIsMilestonePaying] = useState(false);

  // Co-traveler form state
  const [newCoName, setNewCoName] = useState("");
  const [newCoEmail, setNewCoEmail] = useState("");
  const [newCoRole, setNewCoRole] = useState("Adult");
  const [invitingCo, setInvitingCo] = useState(false);
  const [coError, setCoError] = useState("");

  // Expense form state
  const [expDesc, setExpDesc] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [expPaidBy, setExpPaidBy] = useState(""); // empty means main traveler
  const [addingExp, setAddingExp] = useState(false);
  const [expError, setExpError] = useState("");

  // Chat window states
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
        
        // Auto-select first reservation to open chat if exists
        if (data.reservations && data.reservations.length > 0) {
          setActiveResId(data.reservations[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendStay = async () => {
    if (!activeResId) return;
    setExtendingStay(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: activeResId,
          action: "extend-stay"
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Refresh reservations list
        const updated = reservations.map(r => r.id === activeResId ? { ...r, ...data.reservation } : r);
        setReservations(updated);
        alert("Stay successfully extended by 1 night! Your provider welcome messages have been updated.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExtendingStay(false);
    }
  };

  const handleRainCheck = async () => {
    if (!activeResId || !rainCheckStart || !rainCheckEnd) {
      alert("Please select rescheduled check-in and check-out dates");
      return;
    }
    setRescheduling(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: activeResId,
          action: "rain-check",
          newStart: rainCheckStart,
          newEnd: rainCheckEnd
        })
      });
      if (res.ok) {
        const data = await res.json();
        const updated = reservations.map(r => r.id === activeResId ? { ...r, ...data.reservation } : r);
        setReservations(updated);
        alert("Rain-Check reschedule approved! Your dates are updated at 0 extra cost.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRescheduling(false);
    }
  };

  const handleTriggerHostCancel = async () => {
    if (!activeResId) return;
    setCancellingHost(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: activeResId,
          action: "trigger-host-cancel"
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Reload all reservations to see the cancelled original and the new BACKUP reservation!
        await fetchReservations();
        alert("WanderShield Activated! Your host reservation was cancelled, and a superior alternative lodge has been matched and booked for you at 0 extra cost.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCancellingHost(false);
    }
  };

  const handlePayInstallment = async () => {
    if (!activeResId) return;
    setIsMilestonePaying(true);
    try {
      const targetRes = reservations.find(r => r.id === activeResId);
      if (targetRes && targetRes.paymentMilestones) {
        const updatedMilestones = targetRes.paymentMilestones.map(m => ({ ...m, paid: true }));
        const updatedRes = {
          ...targetRes,
          depositPaid: targetRes.totalPrice,
          remainingBalance: 0,
          paymentMilestones: updatedMilestones
        };
        const updated = reservations.map(r => r.id === activeResId ? updatedRes : r);
        setReservations(updated);
        alert("Simulated transaction successful! Your remaining scheduled installment has been fully processed and paid.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMilestonePaying(false);
    }
  };

  const fetchChatMessages = useCallback(async (showSpinner = false) => {
    if (!activeResId) return;
    if (showSpinner) setLoadingChat(true);

    try {
      const res = await fetch(`/api/messages?reservationId=${activeResId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showSpinner) setLoadingChat(false);
    }
  }, [activeResId]);

  // Load reservations
  useEffect(() => {
    if (currentUser) {
      Promise.resolve().then(() => {
        fetchReservations();
      });
    }
  }, [currentUser]);

  // Handle active chat polling when active reservation changes
  useEffect(() => {
    if (activeResId) {
      Promise.resolve().then(() => {
        fetchChatMessages(true); // first load with spinner
      });
      
      // Clear any existing pollers
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Poll every 3 seconds
      pollingIntervalRef.current = setInterval(() => {
        Promise.resolve().then(() => {
          fetchChatMessages(false); // poll silently
        });
      }, 3000);
    } else {
      Promise.resolve().then(() => {
        setMessages([]);
      });
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [activeResId, fetchChatMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeResId) return;

    const originalText = newMessageText;
    setNewMessageText("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: activeResId,
          content: originalText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
      } else {
        setNewMessageText(originalText); // restore on error
      }
    } catch (err) {
      console.error(err);
      setNewMessageText(originalText);
    }
  };

  const handleAddCoTraveler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResId || !newCoName.trim() || !newCoEmail.trim()) return;
    setInvitingCo(true);
    setCoError("");

    try {
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: activeResId,
          action: "add-co-traveler",
          coTraveler: {
            name: newCoName,
            email: newCoEmail,
            role: newCoRole,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReservations(reservations.map((r) => r.id === activeResId ? { ...r, coTravelers: data.reservation.coTravelers } : r));
        setNewCoName("");
        setNewCoEmail("");
        setNewCoRole("Adult");
      } else {
        setCoError(data.error || "Failed to add companion");
      }
    } catch (err) {
      setCoError("Network error. Please try again.");
    } finally {
      setInvitingCo(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResId || !expDesc.trim() || !expAmt.trim()) return;
    setAddingExp(true);
    setExpError("");

    try {
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: activeResId,
          action: "add-expense",
          expense: {
            description: expDesc,
            amount: expAmt,
            paidByName: expPaidBy || currentUser?.name || "Main Traveler",
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReservations(reservations.map((r) => r.id === activeResId ? { ...r, groupExpenses: data.reservation.groupExpenses } : r));
        setExpDesc("");
        setExpAmt("");
        setExpPaidBy("");
      } else {
        setExpError(data.error || "Failed to add expense");
      }
    } catch (err) {
      setExpError("Network error. Please try again.");
    } finally {
      setAddingExp(false);
    }
  };

  const handleRemoveExpense = async (expenseId: string) => {
    if (!activeResId) return;

    try {
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: activeResId,
          action: "remove-expense",
          expenseId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReservations(reservations.map((r) => r.id === activeResId ? { ...r, groupExpenses: data.reservation.groupExpenses } : r));
      } else {
        alert(data.error || "Failed to remove expense");
      }
    } catch (err) {
      console.error(err);
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
            <Compass className="mx-auto h-12 w-12 text-slate-300 animate-bounce" />
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">Sign In Required</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please sign in to view your reserved wilderness journeys, receipts, and open chat lines.
            </p>
            <button
              onClick={() => {
                const btn = document.getElementById("open-auth-modal-btn");
                if (btn) btn.click();
              }}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 dark:bg-emerald-500"
            >
              Secure Sign In
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedRes = reservations.find((r) => r.id === activeResId);

  return (
    <div id="tripspage-container" className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      <Navbar />

      <main className="flex-grow flex relative overflow-hidden">
        {/* Left column: Itinerary List */}
        <div id="trips-itinerary-panel" className="w-full md:w-[45%] lg:w-[40%] h-full overflow-y-auto px-4 py-6 border-r border-slate-200 dark:border-slate-800">
          <div className="mb-6">
            <h1 className="font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              My Journeys & Itineraries
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Review booked wilderness retreats, safe receipts, and chat lines
            </p>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((n) => (
                <div key={n} className="h-28 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40">
              <Compass className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">No Journeys Reserved</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Explore our curated mountain-view cabins and sunset boathouses to log your first adventure!
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-4 py-2 transition dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                Find Curated Lodging
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((res) => {
                const isSelected = res.id === activeResId;
                return (
                  <div
                    key={res.id}
                    onClick={() => setActiveResId(res.id)}
                    className={`rounded-2xl border p-4 flex gap-4 transition cursor-pointer text-left relative overflow-hidden ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/10 dark:border-emerald-500 dark:bg-emerald-950/10"
                        : "border-slate-150 bg-white dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    {/* Tiny visual bar indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 dark:bg-emerald-500" />
                    )}

                    {/* Lodge thumb */}
                    <img
                      src={res.propertyImage}
                      alt={res.propertyTitle}
                      className="h-20 w-24 rounded-xl object-cover bg-slate-100 shrink-0"
                    />

                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate">
                            {res.propertyLocation}
                          </span>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 uppercase dark:bg-emerald-950/40 dark:text-emerald-400">
                            Confirmed
                          </span>
                        </div>
                        <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white mt-0.5 truncate max-w-[180px]">
                          {res.propertyTitle}
                        </h4>
                      </div>

                      <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{res.startDate} to {res.endDate}</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          ${res.totalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Live Chat Workspace */}
        <div id="trips-chat-panel" className="hidden md:flex md:w-[55%] lg:w-[60%] h-full flex-col bg-slate-100 dark:bg-slate-950">
          {selectedRes ? (
            <div className="h-full flex flex-col overflow-hidden">
              {/* Chat subheader details */}
              <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between dark:bg-slate-900 dark:border-slate-800 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/40 dark:text-emerald-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                      Elite Chat: {selectedRes.propertyTitle}
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-bold dark:text-emerald-400 flex items-center gap-1 uppercase tracking-wider mt-0.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>WanderGuarantee Secure Line</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Grand Receipt</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">${selectedRes.totalPrice}</span>
                </div>
              </div>

              {/* Workspace Navigation Tabs */}
              <div className="bg-white border-b border-slate-200 px-6 flex dark:bg-slate-900 dark:border-slate-800 shrink-0 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceTab("chat")}
                  className={`py-3 text-xs font-bold uppercase tracking-wider transition-all relative mr-6 shrink-0 ${
                    activeWorkspaceTab === "chat"
                      ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  💬 Chat Thread
                  {activeWorkspaceTab === "chat" && (
                    <motion.div layoutId="workspaceUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceTab("planning")}
                  className={`py-3 text-xs font-bold uppercase tracking-wider transition-all relative mr-6 shrink-0 ${
                    activeWorkspaceTab === "planning"
                      ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  👥 Co-Travelers & Splitting
                  {activeWorkspaceTab === "planning" && (
                    <motion.div layoutId="workspaceUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceTab("group")}
                  className={`py-3 text-xs font-bold uppercase tracking-wider transition-all relative mr-6 shrink-0 ${
                    activeWorkspaceTab === "group"
                      ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  ✨ Group Coordination Hub
                  {activeWorkspaceTab === "group" && (
                    <motion.div layoutId="workspaceUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceTab("stay")}
                  className={`py-3 text-xs font-bold uppercase tracking-wider transition-all relative shrink-0 ${
                    activeWorkspaceTab === "stay"
                      ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  📟 Smart In-Stay Controls
                  {activeWorkspaceTab === "stay" && (
                    <motion.div layoutId="workspaceUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceTab("flexibility")}
                  className={`py-3 text-xs font-bold uppercase tracking-wider transition-all relative shrink-0 ${
                    activeWorkspaceTab === "flexibility"
                      ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  🛡️ Booking Flexibility
                  {activeWorkspaceTab === "flexibility" && (
                    <motion.div layoutId="workspaceUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </button>
              </div>

              {activeWorkspaceTab === "chat" && (
                <div className="flex-grow flex flex-col overflow-hidden">
                  {/* Custom Selections Banner */}
                  {(selectedRes.selectedAdventures?.length || selectedRes.comfortEquipment) && (
                    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-2.5 flex flex-wrap gap-x-3 gap-y-2 text-xs text-slate-600 dark:bg-slate-900/60 dark:border-slate-800/60 shrink-0 z-10">
                      {selectedRes.selectedAdventures && selectedRes.selectedAdventures.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-lg px-2.5 py-1">
                          <Compass className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-extrabold text-[9px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Adventures:</span>
                          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{selectedRes.selectedAdventures.join(", ")}</span>
                        </div>
                      )}

                      {selectedRes.comfortEquipment && Object.values(selectedRes.comfortEquipment).some(Boolean) && (
                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-lg px-2.5 py-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="font-extrabold text-[9px] text-blue-800 dark:text-blue-400 uppercase tracking-wider">Comfort Gear:</span>
                          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">
                            {Object.entries(selectedRes.comfortEquipment)
                              .filter(([_, active]) => active)
                              .map(([key]) => {
                                if (key === "orthoMats") return "Orthopedic Mats";
                                if (key === "medicalKit") return "Medical Kit";
                                if (key === "largePrintGames") return "Large-Print Puzzles";
                                if (key === "walkerRamp") return "Walkway Ramp";
                                return key;
                              })
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chat Message Stream */}
                  <div className="flex-grow overflow-y-auto px-6 py-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                    {loadingChat ? (
                      <div className="text-center py-20 font-mono text-xs text-slate-400">
                        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600 mb-2" />
                        <span>SYNCHRONIZING SECURE CHAT CHANNEL...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-12">No messages in this chat yet.</p>
                    ) : (
                      messages.map((msg) => {
                        const isSelf = msg.senderId === currentUser.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 max-w-[75%] ${isSelf ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left"}`}
                          >
                            {/* Sender Avatar */}
                            <img
                              src={msg.senderImage || "https://picsum.photos/seed/default/150/150"}
                              alt={msg.senderName}
                              className="h-8.5 w-8.5 rounded-full object-cover shrink-0 mt-0.5"
                            />
                            <div className="space-y-1">
                              <div className={`flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase ${isSelf ? "flex-row-reverse" : ""}`}>
                                <span>{msg.senderName}</span>
                                <span>•</span>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              <div
                                className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                                  isSelf
                                    ? "bg-emerald-600 text-white rounded-tr-none dark:bg-emerald-500"
                                    : "bg-white text-slate-800 border border-slate-150 rounded-tl-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Submission Block */}
                  <form
                    onSubmit={handleSendMessage}
                    className="bg-white p-4 border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 z-10 shrink-0"
                  >
                    <div className="flex gap-2.5 items-center">
                      <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder="Ask about check-in steps, wood-fire cedar hot tubs, or guided kayak lines..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-850 dark:bg-slate-950 dark:focus:border-emerald-500 text-slate-800 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={!newMessageText.trim()}
                        className="rounded-xl bg-emerald-600 p-3 text-white transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500"
                      >
                        <Send className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeWorkspaceTab === "planning" && (
                <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Pane: Co-Travelers */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800">
                        <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 mb-3 flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Travel Companions ({selectedRes.coTravelers?.length || 0})</span>
                        </h4>

                        {/* Co-Travelers list */}
                        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                          {!selectedRes.coTravelers || selectedRes.coTravelers.length === 0 ? (
                            <p className="text-[11px] text-slate-400 text-center py-4">
                              No co-travelers added yet. Group-splits require adding companions first.
                            </p>
                          ) : (
                            selectedRes.coTravelers.map((co, i) => (
                              <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
                                <img
                                  src={co.image || `https://picsum.photos/seed/${i}/150/150`}
                                  alt={co.name}
                                  className="h-8 w-8 rounded-full object-cover shrink-0"
                                />
                                <div className="flex-grow">
                                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                                    {co.name}
                                  </h5>
                                  <span className="text-[9px] text-slate-400 truncate max-w-[150px] block mt-0.5">
                                    {co.email}
                                  </span>
                                </div>
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 uppercase dark:bg-emerald-950/40 dark:text-emerald-400">
                                  {co.role || "Adult"}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Invite Form */}
                        <form onSubmit={handleAddCoTraveler} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2">
                          <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Add Companion
                          </h5>
                          {coError && (
                            <div className="text-[10px] text-red-600 bg-red-50 p-1.5 rounded-lg dark:bg-red-950/20">
                              {coError}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={newCoName}
                              onChange={(e) => setNewCoName(e.target.value)}
                              placeholder="Name"
                              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                            />
                            <input
                              type="email"
                              required
                              value={newCoEmail}
                              onChange={(e) => setNewCoEmail(e.target.value)}
                              placeholder="Email"
                              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={newCoRole}
                              onChange={(e) => setNewCoRole(e.target.value)}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 cursor-pointer text-slate-800 dark:text-slate-200 flex-grow"
                            >
                              <option value="Adult">Adult</option>
                              <option value="Child">Child</option>
                              <option value="Senior">Senior</option>
                            </select>
                            <button
                              type="submit"
                              disabled={invitingCo}
                              className="rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 shrink-0"
                            >
                              {invitingCo ? "Adding..." : "Add"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Right Pane: Shared Ledger */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800">
                        <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 mb-3 flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Shared Ledger Expenses ({selectedRes.groupExpenses?.length || 0})</span>
                        </h4>

                        {/* Expense list */}
                        <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                          {!selectedRes.groupExpenses || selectedRes.groupExpenses.length === 0 ? (
                            <p className="text-[11px] text-slate-400 text-center py-4">
                              No logged expenses yet. Enter gear rentals, gas, or grocery costs below.
                            </p>
                          ) : (
                            selectedRes.groupExpenses.map((exp) => (
                              <div key={exp.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
                                <div className="text-left">
                                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {exp.description}
                                  </h5>
                                  <span className="text-[9px] text-slate-400 block mt-0.5">
                                    Paid by <strong className="text-emerald-600 dark:text-emerald-400">{exp.paidByName}</strong>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                    ${exp.amount.toFixed(2)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExpense(exp.id)}
                                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Expense Form */}
                        <form onSubmit={handleAddExpense} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2">
                          <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Log Shared Cost
                          </h5>
                          {expError && (
                            <div className="text-[10px] text-red-600 bg-red-50 p-1.5 rounded-lg dark:bg-red-950/20">
                              {expError}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={expDesc}
                              onChange={(e) => setExpDesc(e.target.value)}
                              placeholder="Description (e.g., Kayaks)"
                              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                            />
                            <input
                              type="number"
                              required
                              step="0.01"
                              min="0.01"
                              value={expAmt}
                              onChange={(e) => setExpAmt(e.target.value)}
                              placeholder="Amount ($)"
                              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={expPaidBy}
                              onChange={(e) => setExpPaidBy(e.target.value)}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 cursor-pointer text-slate-800 dark:text-slate-200 flex-grow"
                            >
                              <option value="">Paid by: Me ({currentUser?.name})</option>
                              {selectedRes.coTravelers?.map((co, i) => (
                                <option key={i} value={co.name}>Paid by: {co.name}</option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              disabled={addingExp}
                              className="rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 shrink-0"
                            >
                              {addingExp ? "Logging..." : "Log Expense"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Expense Settling & Balance Matrix */}
                  <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800">
                    <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 mb-3 flex items-center gap-1.5">
                      <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Dynamic Settlement & Splits</span>
                    </h4>
                    
                    {(() => {
                      const totalLodging = selectedRes.totalPrice;
                      const additionalExpensesSum = selectedRes.groupExpenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
                      const grandTotalPlan = totalLodging + additionalExpensesSum;
                      const companionCount = selectedRes.coTravelers?.length || 0;
                      const totalSharePersons = companionCount + 1;
                      const sharePerPerson = grandTotalPlan / totalSharePersons;

                      // Calculate net paid for each
                      const paidByNameMap: { [name: string]: number } = {};
                      // The main traveler paid the booking price
                      paidByNameMap[currentUser?.name || "Me"] = totalLodging;
                      
                      selectedRes.groupExpenses?.forEach((exp) => {
                        const payer = exp.paidByName;
                        paidByNameMap[payer] = (paidByNameMap[payer] || 0) + exp.amount;
                      });

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-sans">
                            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Grand Total Budget</span>
                              <span className="text-sm font-black text-slate-900 dark:text-white">${grandTotalPlan.toFixed(2)}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Splitting Between</span>
                              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{totalSharePersons} Person{totalSharePersons > 1 ? "s" : ""}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Per-Person Share</span>
                              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">${sharePerPerson.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                            <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                              Individual Balances
                            </h5>
                            <div className="space-y-2">
                              {/* Main Traveler Balance */}
                              {(() => {
                                const selfName = currentUser?.name || "Me";
                                const selfPaid = paidByNameMap[selfName] || 0;
                                const balance = selfPaid - sharePerPerson;
                                return (
                                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/35">
                                    <div className="flex items-center gap-2">
                                      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                                        Me
                                      </div>
                                      <span className="font-bold text-slate-800 dark:text-slate-200">{selfName}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="block text-[9px] text-slate-400">Paid: ${selfPaid.toFixed(2)}</span>
                                      <span className={`text-[11px] font-black ${balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                                        {balance >= 0 ? `Gets back $${balance.toFixed(2)}` : `Owes $${Math.abs(balance).toFixed(2)}`}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Companion Balances */}
                              {selectedRes.coTravelers?.map((co, idx) => {
                                const coPaid = paidByNameMap[co.name] || 0;
                                const balance = coPaid - sharePerPerson;
                                return (
                                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/35">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={co.image}
                                        alt={co.name}
                                        className="h-6 w-6 rounded-full object-cover"
                                      />
                                      <span className="font-bold text-slate-800 dark:text-slate-200">{co.name}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="block text-[9px] text-slate-400">Paid: ${coPaid.toFixed(2)}</span>
                                      <span className={`text-[11px] font-black ${balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                                        {balance >= 0 ? `Gets back $${balance.toFixed(2)}` : `Owes $${Math.abs(balance).toFixed(2)}`}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "group" && (
                <GroupCoordinationHub reservation={selectedRes} currentUser={currentUser} />
              )}

              {activeWorkspaceTab === "stay" && (
                <SmartInStayControls reservation={selectedRes} currentUser={currentUser} />
              )}

              {activeWorkspaceTab === "flexibility" && (
                <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stay Extender Card */}
                    <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left">
                      <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 mb-2 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Stretch Your Serenity: Stay Extender</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mb-4 leading-relaxed">
                        Lodge is unbooked tomorrow! Add an extra night to your wilderness stay with our last-minute special rate (save 35% on standard rates).
                      </p>
                      <div className="bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 p-3.5 rounded-xl mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Last-Minute Extender Price:</span>
                          <span className="font-extrabold text-emerald-700 dark:text-emerald-400">35% OFF Applied</span>
                        </div>
                        <div className="flex justify-between text-sm font-black">
                          <span className="text-slate-850 dark:text-white">Additional Night Total:</span>
                          <span className="text-emerald-600 dark:text-emerald-400">${(selectedRes.totalPrice * 0.45).toFixed(0)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleExtendStay}
                        disabled={extendingStay || selectedRes.status === "CANCELLED"}
                        className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 transition disabled:opacity-50"
                      >
                        {extendingStay ? "Extending Stay..." : "Confirm 1-Night Extension"}
                      </button>
                    </div>

                    {/* Rain-Check Weather Guarantee Card */}
                    <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left">
                      <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 mb-2 flex items-center gap-1.5">
                        <CloudRain className="h-4 w-4 text-sky-500" />
                        <span>Rain-Check Weather Guarantee</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mb-4 leading-relaxed">
                        Compromised outdoor plans due to severe persistent weather? Reschedule your stay to any future timeframe at 0 additional cost.
                      </p>
                      {selectedRes.rainCheckClaimed ? (
                        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/35 dark:text-emerald-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                          <span>Weather guarantee successfully claimed and rescheduled!</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-150 dark:bg-amber-950/20 dark:border-amber-900/35 p-3 rounded-xl text-[10.5px] text-amber-850 dark:text-amber-300 font-medium">
                            ⚠️ Severe Storm Watch detected in region during stay period. Eligible for free reschedule.
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">New Start Date</label>
                              <input
                                type="date"
                                value={rainCheckStart}
                                onChange={(e) => setRainCheckStart(e.target.value)}
                                className="w-full rounded-xl border border-slate-250 bg-slate-50 px-2.5 py-1.5 text-xs outline-none text-slate-800 dark:text-white dark:border-slate-800 dark:bg-slate-950"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">New End Date</label>
                              <input
                                type="date"
                                value={rainCheckEnd}
                                onChange={(e) => setRainCheckEnd(e.target.value)}
                                className="w-full rounded-xl border border-slate-250 bg-slate-50 px-2.5 py-1.5 text-xs outline-none text-slate-800 dark:text-white dark:border-slate-800 dark:bg-slate-950"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRainCheck}
                            disabled={rescheduling || selectedRes.status === "CANCELLED"}
                            className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650 transition disabled:opacity-50"
                          >
                            {rescheduling ? "Rescheduling Dates..." : "Process Rain-Check Reschedule"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Escrow and Payment Milestones Card */}
                    <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left">
                      <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 mb-3 flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Security Deposit & Payment Milestones</span>
                      </h4>
                      <div className="space-y-4">
                        {/* Escrow Status */}
                        <div className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-850 dark:text-slate-200">🔒 WanderTrust Damage Deposit Escrow</span>
                            <span className="block text-[8px] text-slate-450 mt-0.5">Held in neutral holding account. Cleared 48 hrs after stay.</span>
                          </div>
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-700 uppercase dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                            Active in Escrow
                          </span>
                        </div>

                        {/* Payment Milestones Tracker */}
                        <div>
                          <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-2">Installment Milestones Timeline</span>
                          {selectedRes.paymentMilestones ? (
                            <div className="space-y-2">
                              {selectedRes.paymentMilestones.map((m: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/35">
                                  <div>
                                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{m.title}</span>
                                    <span className="block text-[8px] text-slate-450">Due Date: {m.dueDate}</span>
                                  </div>
                                  <div className="text-right flex items-center gap-2">
                                    <span className="text-xs font-extrabold text-slate-850 dark:text-white">${m.amount.toFixed(2)}</span>
                                    {m.paid ? (
                                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[8px] font-black text-emerald-700 uppercase dark:bg-emerald-950/50 dark:text-emerald-400">PAID</span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={handlePayInstallment}
                                        disabled={isMilestonePaying}
                                        className="rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-extrabold text-[8px] px-2 py-0.5 uppercase dark:bg-sky-950/40 dark:text-sky-400 transition"
                                      >
                                        {isMilestonePaying ? "Paying..." : "Pay Now"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-50 rounded-xl dark:bg-slate-950 text-[9.5px] text-slate-500 text-center">
                              💳 Stay fully paid upfront. No remaining milestone balance scheduled.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* WanderShield Guarantee Sandbox (Host Cancellation) */}
                    <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left">
                      <h4 className="font-sans text-xs font-extrabold text-red-600 uppercase tracking-wider dark:text-red-400 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span>WanderShield Host Cancellation Sandbox</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mb-4 leading-relaxed">
                        What happens if a host cancels unexpectedly? Click the button below to simulate an unexpected host cancellation and watch WanderShield automatically secure and book a superior alternative lodge for you.
                      </p>
                      {selectedRes.status === "CANCELLED" ? (
                        <div className="bg-red-50 border border-red-150 text-red-800 dark:bg-red-950/20 dark:border-red-900/35 dark:text-red-300 p-3.5 rounded-xl space-y-1 text-xs">
                          <span className="font-bold block">⚠️ ORIGINAL RESERVATION CANCELLED</span>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Host of {selectedRes.propertyTitle} cancelled. Automatic rebooking successfully transferred your deposit, dates, and gear configurations to your new active backup lodge!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3 rounded-xl text-[9px] text-slate-500 leading-normal">
                            🔍 **How to test**: Tap the button below. The system will mark this lodge booking as cancelled and instantly establish a brand new alternative booking under the same dates, matching your price, and transferring all co-travelers and custom safety setup items.
                          </div>
                          <button
                            type="button"
                            onClick={handleTriggerHostCancel}
                            disabled={cancellingHost}
                            className="w-full rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 dark:bg-red-500 transition disabled:opacity-50"
                          >
                            {cancellingHost ? "Activating WanderShield Back-Up..." : "Simulate Host Cancellation"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Compass className="h-12 w-12 text-slate-350 animate-spin-slow mb-4" />
              <h4 className="font-sans font-bold text-slate-800 dark:text-slate-200 text-base">Select an Itinerary to open Chat</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Pick a reserved wilderness journey on the left pane to initialize secure client-host communications.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
