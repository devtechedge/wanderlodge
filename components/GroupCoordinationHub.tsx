"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  CreditCard,
  MapPin,
  CheckSquare,
  AlertTriangle,
  Pin,
  Calendar,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  DollarSign,
  Compass,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";

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
  coTravelers?: CoTraveler[];
  groupExpenses?: GroupExpense[];
}

interface GroupCoordinationHubProps {
  reservation: Reservation;
  currentUser: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

// Sub-component state structures
interface VoteItem {
  id: string;
  title: string;
  category: "lodge" | "activity";
  votes: string[]; // names of voters
}

interface ChecklistItem {
  id: string;
  task: string;
  assignedTo: string;
  completed: boolean;
  category: "gear" | "supplies" | "other";
}

interface ArrivalStatus {
  id: string;
  name: string;
  from: string;
  mode: "car" | "plane" | "train" | "foot";
  status: string;
  eta: string;
  color: string;
  lat: number; // 0 to 100 for SVG positioning
  lng: number; // 0 to 100 for SVG positioning
}

interface PinboardNote {
  id: string;
  title: string;
  content: string;
  color: "yellow" | "blue" | "green" | "pink";
  pinnedBy: string;
  date: string;
}

interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  title: string;
  owner: string;
  description?: string;
}

interface PhotoEntry {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  date: string;
}

interface GroceryItem {
  id: string;
  item: string;
  quantity: string;
  assignedTo: string;
  packed: boolean;
}

interface DepartureChore {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  completed: boolean;
}

export default function GroupCoordinationHub({ reservation, currentUser }: GroupCoordinationHubProps) {
  const resId = reservation.id;

  // Active sub-tab state inside the Coordination Hub
  const [activeSubTab, setActiveSubTab] = useState<"comms" | "finances" | "lists" | "itinerary" | "safety">("comms");

  // State hooks with localStorage backing
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [arrivals, setArrivals] = useState<ArrivalStatus[]>([]);
  const [pins, setPins] = useState<PinboardNote[]>([]);
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [chores, setChores] = useState<DepartureChore[]>([]);
  const [payments, setPayments] = useState<{ [name: string]: boolean }>({});

  // Form input states
  const [newVoteTitle, setNewVoteTitle] = useState("");
  const [newVoteCat, setNewVoteCat] = useState<"lodge" | "activity">("activity");

  const [newCheckItem, setNewCheckItem] = useState("");
  const [newCheckAssign, setNewCheckAssign] = useState("");
  const [newCheckCat, setNewCheckCat] = useState<"gear" | "supplies">("gear");

  const [newGroceryItem, setNewGroceryItem] = useState("");
  const [newGroceryQty, setNewGroceryQty] = useState("1");
  const [newGroceryAssign, setNewGroceryAssign] = useState("");

  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChoreDesc, setNewChoreDesc] = useState("");
  const [newChoreAssign, setNewChoreAssign] = useState("");

  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteColor, setNewNoteColor] = useState<"yellow" | "blue" | "green" | "pink">("yellow");

  const [newItTime, setNewItTime] = useState("");
  const [newItTitle, setNewItTitle] = useState("");
  const [newItDesc, setNewItDesc] = useState("");
  const [newItOwner, setNewItOwner] = useState("");
  const [newItDay, setNewItDay] = useState(1);

  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [newPhotoPreset, setNewPhotoPreset] = useState("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [transitName, setTransitName] = useState("");
  const [transitFrom, setTransitFrom] = useState("");
  const [transitMode, setTransitMode] = useState<"car" | "plane" | "train">("car");
  const [transitStatus, setTransitStatus] = useState("");
  const [transitEta, setTransitEta] = useState("");

  // Payment simulator modal state
  const [simulatingPayment, setSimulatingPayment] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Floor plan active zone
  const [selectedZone, setSelectedZone] = useState<string>("living");

  // Get list of all travelers (CurrentUser + CoTravelers)
  const allTravelers = [
    { name: currentUser.name, image: currentUser.image || "https://picsum.photos/seed/current/150/150", role: "Organizer" },
    ...(reservation.coTravelers || []).map((c, i) => ({
      name: c.name,
      image: c.image || `https://picsum.photos/seed/co-${i}/150/150`,
      role: c.role || "Adult"
    }))
  ];

  // Helper to sync to localstorage
  const saveKey = (key: string, data: any) => {
    localStorage.setItem(`group_${resId}_${key}`, JSON.stringify(data));
  };

  // Initial load
  useEffect(() => {
    if (!resId) return;

    const loadState = () => {
      const getStored = (key: string, defaults: any) => {
        const stored = localStorage.getItem(`group_${resId}_${key}`);
        return stored ? JSON.parse(stored) : defaults;
      };

      // 1. Voting Boards
      setVotes(getStored("votes", [
        { id: "v1", title: "Sunset Kayak Expedition", category: "activity", votes: [currentUser.name] },
        { id: "v2", title: "Subalpine Ridge Guided Hike", category: "activity", votes: [] },
        { id: "v3", title: "Woodfired Cedar Hot Tub Night", category: "activity", votes: allTravelers.map(t => t.name) },
      ]));

      // 2. Shared Checklists
      setChecklist(getStored("checklist", [
        { id: "cl1", task: "Bear Spray & Wilderness Flares", assignedTo: currentUser.name, completed: true, category: "gear" },
        { id: "cl2", task: "High-Resolution Binoculars", assignedTo: allTravelers[1]?.name || currentUser.name, completed: false, category: "gear" },
        { id: "cl3", task: "Comprehensive Mountain First-Aid Kit", assignedTo: currentUser.name, completed: false, category: "gear" },
      ]));

      // 3. Arrivals
      setArrivals(getStored("arrivals", [
        { id: "a1", name: currentUser.name, from: "Seattle Metro", mode: "car", status: "Driving subalpine passes", eta: "45 mins", color: "#10b981", lat: 35, lng: 42 },
        { id: "a2", name: allTravelers[1]?.name || "Uncle Jim", from: "Portland Int Airport", mode: "car", status: "Renting AWD vehicle", eta: "2.5 hours", color: "#6366f1", lat: 75, lng: 60 },
        { id: "a3", name: allTravelers[2]?.name || "Sarah", from: "Vancouver SkyTrain", mode: "plane", status: "Transit connection", eta: "4 hours", color: "#f59e0b", lat: 15, lng: 20 },
      ]));

      // 4. Message Pinboard
      setPins(getStored("pins", [
        { id: "p1", title: "📡 Wi-Fi Password", content: `Network: "Wilderness_Retreat_${resId.slice(0,4)}"\nPass: "breathesubalpine2026"`, color: "yellow", pinnedBy: "System", date: "Jul 7" },
        { id: "p2", title: "🔑 Keyless Lockbox", content: `Door Code: *1984#\n(Active starting 3:00 PM)`, color: "green", pinnedBy: "System", date: "Jul 7" },
        { id: "p3", title: "🌲 Leave No Trace Code", content: "All graywater systems are organic. Please use provided plant-based sanitation liquids strictly.", color: "blue", pinnedBy: "System", date: "Jul 7" },
      ]));

      // 5. Itineraries
      setItineraries(getStored("itineraries", [
        { id: "it1", day: 1, time: "3:00 PM", title: "Arrival & Keyless Cabin Unlock", owner: "Group" },
        { id: "it2", day: 1, time: "6:00 PM", title: "Sunset Salmon BBQ & Fire Pit Lighting", owner: "Group", description: "First group meal in the wilderness." },
        { id: "it3", day: 2, time: "6:30 AM", title: "Nocturnal Wildlife Watch / Stargazing Deck", owner: currentUser.name, description: "Taking zoom lenses to watch morning elk herds." },
        { id: "it4", day: 2, time: "10:00 AM", title: "Canoeing & Waterfront Access", owner: allTravelers[1]?.name || "All" },
      ]));

      // 6. Photo Journal
      setPhotos(getStored("photos", [
        { id: "ph1", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80", caption: "Our home under the stars. Perfect bortle conditions!", uploadedBy: currentUser.name, date: "Jul 7" },
        { id: "ph2", url: "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=600&q=80", caption: "Deep subalpine ridge air.", uploadedBy: allTravelers[1]?.name || "Alex", date: "Jul 8" },
      ]));

      // 7. Groceries
      setGroceries(getStored("groceries", [
        { id: "g1", item: "Ground Roast Coffee Beans (Organic)", quantity: "2 lbs", assignedTo: currentUser.name, packed: true },
        { id: "g2", item: "S'mores Kit (Graham Crackers, Dark Choc, Mallows)", quantity: "3 boxes", assignedTo: allTravelers[1]?.name || currentUser.name, packed: false },
        { id: "g3", item: "Almond & Oat Milk cartons", quantity: "4 ct", assignedTo: allTravelers[2]?.name || currentUser.name, packed: false },
      ]));

      // 8. Chores
      setChores(getStored("chores", [
        { id: "ch1", title: "Bundle Bed Linens & Towels", description: "Strip sheets from all beds and pack them into the entryway laundry bins.", assignedTo: allTravelers[1]?.name || currentUser.name, completed: false },
        { id: "ch2", title: "Clean Firewood Ash", description: "Use metal scoop to put firewood ash into the external safety bucket.", assignedTo: currentUser.name, completed: false },
        { id: "ch3", title: "Lock Crawlspace Windows", description: "Ensure all lower level sliding frames are sealed tight to prevent raccoon entry.", assignedTo: currentUser.name, completed: true },
      ]));

      // 9. Payment states
      setPayments(getStored("payments", {
        [currentUser.name]: true, // organizer usually paid reservation
      }));
    };

    const timer = setTimeout(loadState, 0);
    return () => clearTimeout(timer);
  }, [resId]);

  // Sync state helpers
  const handleVoteToggle = (id: string) => {
    const updated = votes.map(v => {
      if (v.id === id) {
        const hasVoted = v.votes.includes(currentUser.name);
        return {
          ...v,
          votes: hasVoted ? v.votes.filter(n => n !== currentUser.name) : [...v.votes, currentUser.name]
        };
      }
      return v;
    });
    setVotes(updated);
    saveKey("votes", updated);
  };

  const handleAddVoteItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoteTitle.trim()) return;
    const newItem: VoteItem = {
      id: "v_" + Date.now(),
      title: newVoteTitle,
      category: newVoteCat,
      votes: [currentUser.name]
    };
    const updated = [...votes, newItem];
    setVotes(updated);
    saveKey("votes", updated);
    setNewVoteTitle("");
  };

  const handleToggleChecklist = (id: string) => {
    const updated = checklist.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
    setChecklist(updated);
    saveKey("checklist", updated);
  };

  const handleAddCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    const newItem: ChecklistItem = {
      id: "cl_" + Date.now(),
      task: newCheckItem,
      assignedTo: newCheckAssign || currentUser.name,
      completed: false,
      category: newCheckCat
    };
    const updated = [...checklist, newItem];
    setChecklist(updated);
    saveKey("checklist", updated);
    setNewCheckItem("");
  };

  const handleToggleGrocery = (id: string) => {
    const updated = groceries.map(g => g.id === id ? { ...g, packed: !g.packed } : g);
    setGroceries(updated);
    saveKey("groceries", updated);
  };

  const handleAddGroceryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryItem.trim()) return;
    const newItem: GroceryItem = {
      id: "g_" + Date.now(),
      item: newGroceryItem,
      quantity: newGroceryQty,
      assignedTo: newGroceryAssign || currentUser.name,
      packed: false
    };
    const updated = [...groceries, newItem];
    setGroceries(updated);
    saveKey("groceries", updated);
    setNewGroceryItem("");
  };

  const handleToggleChore = (id: string) => {
    const updated = chores.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
    setChores(updated);
    saveKey("chores", updated);
  };

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoreTitle.trim()) return;
    const newItem: DepartureChore = {
      id: "ch_" + Date.now(),
      title: newChoreTitle,
      description: newChoreDesc,
      assignedTo: newChoreAssign || currentUser.name,
      completed: false
    };
    const updated = [...chores, newItem];
    setChores(updated);
    saveKey("chores", updated);
    setNewChoreTitle("");
    setNewChoreDesc("");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const newItem: PinboardNote = {
      id: "p_" + Date.now(),
      title: newNoteTitle,
      content: newNoteContent,
      color: newNoteColor,
      pinnedBy: currentUser.name,
      date: "Jul " + new Date().getDate()
    };
    const updated = [...pins, newItem];
    setPins(updated);
    saveKey("pins", updated);
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const handleDeleteNote = (id: string) => {
    const updated = pins.filter(p => p.id !== id);
    setPins(updated);
    saveKey("pins", updated);
  };

  const handleAddItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItTitle.trim() || !newItTime.trim()) return;
    const newItem: ItineraryItem = {
      id: "it_" + Date.now(),
      day: newItDay,
      time: newItTime,
      title: newItTitle,
      owner: newItOwner || "Group",
      description: newItDesc
    };
    const updated = [...itineraries, newItem].sort((a, b) => a.time.localeCompare(b.time));
    setItineraries(updated);
    saveKey("itineraries", updated);
    setNewItTitle("");
    setNewItTime("");
    setNewItDesc("");
  };

  const handleAddArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitName.trim() || !transitFrom.trim()) return;
    const newItem: ArrivalStatus = {
      id: "a_" + Date.now(),
      name: transitName,
      from: transitFrom,
      mode: transitMode,
      status: transitStatus || "En Route",
      eta: transitEta || "TBD",
      color: "#" + Math.floor(Math.random()*16777215).toString(16),
      lat: Math.floor(Math.random() * 60) + 20,
      lng: Math.floor(Math.random() * 60) + 20
    };
    const updated = [...arrivals, newItem];
    setArrivals(updated);
    saveKey("arrivals", updated);
    setTransitName("");
    setTransitFrom("");
    setTransitStatus("");
    setTransitEta("");
  };

  const handleDirectPaySimulator = (name: string) => {
    setSimulatingPayment(name);
    setPaymentSuccess(false);
  };

  const confirmSimulatedPayment = () => {
    if (!simulatingPayment) return;
    const updated = { ...payments, [simulatingPayment]: true };
    setPayments(updated);
    saveKey("payments", updated);
    setPaymentSuccess(true);
    setTimeout(() => {
      setSimulatingPayment(null);
      setPaymentSuccess(false);
    }, 1200);
  };

  const handleAddPhotoPreset = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingPhoto(true);
    setTimeout(() => {
      const newEntry: PhotoEntry = {
        id: "ph_" + Date.now(),
        url: newPhotoPreset,
        caption: newPhotoCaption || "Wilderness retreat memory!",
        uploadedBy: currentUser.name,
        date: "Today"
      };
      const updated = [newEntry, ...photos];
      setPhotos(updated);
      saveKey("photos", updated);
      setNewPhotoCaption("");
      setUploadingPhoto(false);
    }, 800);
  };

  // Calculations for split bill metrics
  const additionalExpensesSum = reservation.groupExpenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const grandTotalPlan = reservation.totalPrice + additionalExpensesSum;
  const numPeople = allTravelers.length;
  const perPersonShare = grandTotalPlan / numPeople;

  // Arrival Progress Calculations
  const arrivedCount = arrivals.filter(a => a.status.toLowerCase().includes("arrived")).length;

  return (
    <div id="group-coordination-hub-workspace" className="flex-grow flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sub-Navigation Rail */}
      <div className="bg-white/80 dark:bg-slate-900 border-b border-slate-200/60 px-6 py-2.5 flex items-center justify-between shrink-0 overflow-x-auto gap-4 z-10">
        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Multi-Device Group Workspace
          </span>
        </div>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/40">
          <button
            onClick={() => setActiveSubTab("comms")}
            className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition ${
              activeSubTab === "comms"
                ? "bg-white text-slate-800 shadow dark:bg-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            Pinboards & Arrivals
          </button>
          <button
            onClick={() => setActiveSubTab("finances")}
            className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition ${
              activeSubTab === "finances"
                ? "bg-white text-slate-800 shadow dark:bg-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            Bill Splits
          </button>
          <button
            onClick={() => setActiveSubTab("lists")}
            className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition ${
              activeSubTab === "lists"
                ? "bg-white text-slate-800 shadow dark:bg-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            Checklists & Meals
          </button>
          <button
            onClick={() => setActiveSubTab("itinerary")}
            className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition ${
              activeSubTab === "itinerary"
                ? "bg-white text-slate-800 shadow dark:bg-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            Itineraries & Photos
          </button>
          <button
            onClick={() => setActiveSubTab("safety")}
            className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition ${
              activeSubTab === "safety"
                ? "bg-white text-slate-800 shadow dark:bg-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            Safety Blueprint
          </button>
        </div>
      </div>

      {/* Main Subtab Scrolling Viewport */}
      <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
        
        {/* COMMS TAB: Group Message Pinboards & Family Arrival Pinboards */}
        {activeSubTab === "comms" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Group Message Pinboards */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col h-full min-h-[420px]">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                      <Pin className="h-4 w-4 text-rose-500 animate-bounce" />
                      <span>Group Bulletin Pinboard</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">Critical Check-In Wi-Fi & Host details pinned by system and guests.</p>
                  </div>
                  <span className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                    {pins.length} Sticky Notes
                  </span>
                </div>

                {/* Sticky notes list */}
                <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[260px] pr-1 flex-grow">
                  {pins.map((pin) => {
                    const bgColors = {
                      yellow: "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-200 dark:border-yellow-900/40",
                      blue: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/20 dark:text-blue-200 dark:border-blue-900/40",
                      green: "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-200 dark:border-emerald-900/40",
                      pink: "bg-pink-50 text-pink-900 border-pink-200 dark:bg-pink-950/20 dark:text-pink-200 dark:border-pink-900/40"
                    };

                    return (
                      <div
                        key={pin.id}
                        className={`rounded-2xl p-3.5 border flex flex-col justify-between relative shadow-sm ${bgColors[pin.color]}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-sans font-bold text-xs truncate">{pin.title}</span>
                            {pin.pinnedBy !== "System" && (
                              <button
                                onClick={() => handleDeleteNote(pin.id)}
                                className="opacity-40 hover:opacity-100 transition"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] leading-relaxed whitespace-pre-wrap font-sans font-medium">
                            {pin.content}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[8px] font-mono opacity-60">
                          <span>By: {pin.pinnedBy}</span>
                          <span>{pin.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pin Note Form */}
                <form onSubmit={handleAddNote} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2 shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Pin New Sticky</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Note Title"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                    />
                    <select
                      value={newNoteColor}
                      onChange={(e) => setNewNoteColor(e.target.value as any)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                    >
                      <option value="yellow">💛 Yellow Sticky</option>
                      <option value="blue">💙 Blue Sticky</option>
                      <option value="green">💚 Green Sticky</option>
                      <option value="pink">💗 Pink Sticky</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Note details, door directions, wifi instructions..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white flex-grow"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-3.5 text-[10px] font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 shrink-0"
                    >
                      Pin Note
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* 2. Family Arrival Pinboards */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col h-full min-h-[420px]">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Family Arrival Pinboard</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">Real-time transit updates & ETA coordinates converging on the Lodge.</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                    {arrivedCount} of {arrivals.length} Arrived
                  </span>
                </div>

                {/* SVG/CSS Map simulation */}
                <div className="h-[140px] bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center shrink-0">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />
                  
                  {/* Paths leading to destination */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none">
                    {arrivals.map((arrival) => (
                      <line
                        key={arrival.id}
                        x1={`${arrival.lng}%`}
                        y1={`${arrival.lat}%`}
                        x2="50%"
                        y2="50%"
                        stroke={arrival.color}
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        className="animate-pulse"
                        opacity="0.4"
                      />
                    ))}
                  </svg>

                  {/* Destination Lodge Pin */}
                  <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black border border-white animate-pulse">
                      🏡
                    </span>
                    <span className="text-[8px] font-black font-mono text-rose-400 bg-slate-900/80 px-1 rounded-full mt-0.5 truncate max-w-[80px]">
                      LODGE
                    </span>
                  </div>

                  {/* Traveler Pins on the map */}
                  {arrivals.map((arrival) => {
                    const modes = { car: "🚗", plane: "✈️", train: "🚆", foot: "🥾" };
                    return (
                      <div
                        key={arrival.id}
                        style={{ left: `${arrival.lng}%`, top: `${arrival.lat}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group"
                      >
                        <div
                          style={{ borderColor: arrival.color }}
                          className="h-6 w-6 rounded-full border-2 bg-slate-900 flex items-center justify-center text-[10px] shadow-md cursor-pointer hover:scale-115 transition"
                        >
                          {modes[arrival.mode as keyof typeof modes] || "🚗"}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-[8px] text-white px-1.5 py-0.5 rounded border border-slate-800 whitespace-nowrap opacity-100 z-20 font-mono shadow-xl">
                          {arrival.name} ({arrival.eta})
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Arrivals Info List */}
                <div className="space-y-2 mt-4 overflow-y-auto max-h-[120px] pr-1 flex-grow">
                  {arrivals.map((arrival) => (
                    <div key={arrival.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: arrival.color }}
                          className="h-2 w-2 rounded-full shrink-0"
                        />
                        <div className="text-left">
                          <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-none">
                            {arrival.name}
                          </h5>
                          <span className="text-[9px] text-slate-400 mt-0.5 block font-sans">
                            From: {arrival.from} • <span className="italic">{arrival.status}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          ETA: {arrival.eta}
                        </span>
                        <div className="flex justify-end gap-1 text-[8px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                          <span>{arrival.mode}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Status Form */}
                <form onSubmit={handleAddArrival} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2 shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Broadcast Your Transit</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <select
                      value={transitName}
                      onChange={(e) => setTransitName(e.target.value)}
                      required
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                    >
                      <option value="">Select Who</option>
                      {allTravelers.map((t, idx) => (
                        <option key={idx} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Origin (Seattle...)"
                      value={transitFrom}
                      onChange={(e) => setTransitFrom(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                    />
                    <select
                      value={transitMode}
                      onChange={(e) => setTransitMode(e.target.value as any)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                    >
                      <option value="car">🚗 Driving</option>
                      <option value="plane">✈️ Flying</option>
                      <option value="train">🚆 Train</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Current status (e.g., stops for snacks)"
                      value={transitStatus}
                      onChange={(e) => setTransitStatus(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white flex-grow"
                    />
                    <input
                      type="text"
                      placeholder="ETA (e.g. 1.5h)"
                      value={transitEta}
                      onChange={(e) => setTransitEta(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white w-20 shrink-0"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-3 text-[10px] font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 shrink-0"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* FINANCES TAB: Split-Bill Micro-Trackers */}
        {activeSubTab === "finances" && (
          <div className="space-y-6">
            
            {/* Split-Bill Tracker Card */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Split-Bill Micro-Trackers</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Divide group expenses transparently. Click on your name or any owe balance to simulate individual device payments.
                  </p>
                </div>

                <div className="flex gap-4 text-left">
                  <div className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Total Lodge Budget</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">${grandTotalPlan.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Your Share ({numPeople} Ways)</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">${perPersonShare.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Progress gauge for settled funds */}
              {(() => {
                const totalPaidPeople = Object.values(payments).filter(Boolean).length;
                const paidPercentage = Math.round((totalPaidPeople / numPeople) * 100);
                const totalSettledFunds = totalPaidPeople * perPersonShare;

                return (
                  <div className="py-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-350">Group Settled Funding Ratio:</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        {paidPercentage}% (${totalSettledFunds.toFixed(2)} / ${grandTotalPlan.toFixed(2)})
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${paidPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Grid of group members and their settlement status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {allTravelers.map((traveler, idx) => {
                  const isPaid = !!payments[traveler.name];

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-4.5 flex items-center justify-between transition-all ${
                        isPaid
                          ? "border-emerald-150 bg-emerald-50/5 dark:border-emerald-950/40"
                          : "border-slate-150 bg-white dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={traveler.image}
                          alt={traveler.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-850"
                        />
                        <div className="text-left">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                            {traveler.name}
                          </h5>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {traveler.role}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                          ${perPersonShare.toFixed(2)}
                        </span>
                        
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 mt-1 text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 font-mono">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Paid</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDirectPaySimulator(traveler.name)}
                            className="mt-1 bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg hover:bg-amber-600 transition shadow-sm font-mono"
                          >
                            Pay Portion
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Payment Modal (Floating element) */}
            <AnimatePresence>
              {simulatingPayment && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-2xl relative overflow-hidden"
                  >
                    {!paymentSuccess ? (
                      <div className="space-y-4">
                        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto text-xl">
                          💳
                        </div>
                        <div>
                          <h3 className="font-sans font-bold text-slate-900 dark:text-white text-sm">
                            Simulate Secure Multi-Device Payment
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Acting as <strong className="text-emerald-600 dark:text-emerald-400">{simulatingPayment}</strong> on their device.
                          </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between text-slate-500">
                            <span>Splits / Share:</span>
                            <span>1 of {numPeople}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Subalpine Lodging:</span>
                            <span>${(reservation.totalPrice / numPeople).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Shared Grocery / Adventure:</span>
                            <span>${(additionalExpensesSum / numPeople).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-800 dark:text-white font-bold border-t border-slate-200/50 dark:border-slate-800 pt-1.5 mt-1">
                            <span>Amount Due:</span>
                            <span>${perPersonShare.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={() => setSimulatingPayment(null)}
                            className="rounded-xl border border-slate-200 dark:border-slate-850 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmSimulatedPayment}
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500"
                          >
                            Authorize Apple Pay / Card
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 py-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl"
                        >
                          ✓
                        </motion.div>
                        <div>
                          <h3 className="font-sans font-extrabold text-slate-900 dark:text-white text-sm">
                            Payment Authorized Successfully!
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            WanderGuarantee transaction complete. Syncing balance sheets...
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* LISTS TAB: Shared checklists, grocery planner, & departure chore allocation */}
        {activeSubTab === "lists" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Shared Travel Checklists (Gear) */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col h-full min-h-[440px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-indigo-500" />
                    <span>Shared Travel Gear</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Collaborative checklist for essential wilderness supplies.</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1 flex-grow">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition shrink-0 ${
                        item.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      }`}>
                        {item.completed && <Check className="h-3 w-3" />}
                      </div>
                      <span className={`text-[11px] font-medium leading-tight truncate ${item.completed ? "line-through text-slate-450" : "text-slate-800 dark:text-slate-200"}`}>
                        {item.task}
                      </span>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[8px] font-bold text-slate-500 uppercase font-mono shrink-0">
                      {item.assignedTo.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <form onSubmit={handleAddCheckItem} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Add gear item..."
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  />
                  <select
                    value={newCheckAssign}
                    onChange={(e) => setNewCheckAssign(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  >
                    <option value="">Assign To</option>
                    {allTravelers.map((t, idx) => (
                      <option key={idx} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2 text-[10px] font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500"
                >
                  Add Gear Item
                </button>
              </form>
            </div>

            {/* 2. Shared Grocery Planner */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col h-full min-h-[440px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-amber-500" />
                    <span>Shared Grocery Planner</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Meal checklist mapping preventing duplicate pantry purchases.</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1 flex-grow">
                {groceries.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleGrocery(item.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition shrink-0 ${
                        item.packed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      }`}>
                        {item.packed && <Check className="h-3 w-3" />}
                      </div>
                      <div className="truncate leading-tight">
                        <span className={`text-[11px] font-medium block truncate ${item.packed ? "line-through text-slate-450" : "text-slate-800 dark:text-slate-200"}`}>
                          {item.item}
                        </span>
                        <span className="text-[8px] text-slate-400 font-mono">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[8px] font-bold text-slate-500 uppercase font-mono shrink-0">
                      {item.assignedTo.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <form onSubmit={handleAddGroceryItem} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2 shrink-0">
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="E.g., Eggs"
                    value={newGroceryItem}
                    onChange={(e) => setNewGroceryItem(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Qty (E.g. 2 ct)"
                    value={newGroceryQty}
                    onChange={(e) => setNewGroceryQty(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={newGroceryAssign}
                    onChange={(e) => setNewGroceryAssign(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white flex-grow"
                  >
                    <option value="">Buyer</option>
                    {allTravelers.map((t, idx) => (
                      <option key={idx} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 text-[10px] font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 shrink-0"
                  >
                    Add Grocery
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Group Check-Out Chore Allocations */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col h-full min-h-[440px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Check-Out Chore Board</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Assigned departure duties ensuring stress-free handoffs.</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 overflow-y-auto max-h-[180px] pr-1 flex-grow">
                {chores.map((chore) => (
                  <div
                    key={chore.id}
                    onClick={() => handleToggleChore(chore.id)}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition text-left"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition mt-0.5 shrink-0 ${
                        chore.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      }`}>
                        {chore.completed && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[11px] font-bold ${chore.completed ? "line-through text-slate-450" : "text-slate-800 dark:text-slate-200"}`}>
                            {chore.title}
                          </span>
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 text-[7px] font-bold text-emerald-800 dark:text-emerald-400 uppercase font-mono">
                            {chore.assignedTo.split(" ")[0]}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                          {chore.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress gauge */}
              {(() => {
                const totalChores = chores.length;
                const doneChores = chores.filter(c => c.completed).length;
                const chorePercent = totalChores > 0 ? Math.round((doneChores / totalChores) * 100) : 0;

                return (
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850 my-2 text-[10px] font-sans">
                    <div className="flex justify-between items-center mb-1 text-slate-500 font-medium">
                      <span>Checkout Readiness Gauge:</span>
                      <span className="font-mono font-bold text-emerald-600">{chorePercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${chorePercent}%` }} />
                    </div>
                  </div>
                );
              })()}

              {/* Add form */}
              <form onSubmit={handleAddChore} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Chore title"
                    value={newChoreTitle}
                    onChange={(e) => setNewChoreTitle(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  />
                  <select
                    value={newChoreAssign}
                    onChange={(e) => setNewChoreAssign(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  >
                    <option value="">Assignee</option>
                    {allTravelers.map((t, idx) => (
                      <option key={idx} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Short description..."
                    value={newChoreDesc}
                    onChange={(e) => setNewChoreDesc(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white flex-grow"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 text-[10px] font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 shrink-0"
                  >
                    Assign
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* ITINERARY TAB: Individual Itineraries & Photo Journaling & Joint Group Voting Boards */}
        {activeSubTab === "itinerary" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Joint Group Voting Boards */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col h-full min-h-[460px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span>Joint Group Voting Boards</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Vote on favorite subalpine activities and excursions.</p>
                </div>
              </div>

              {/* Votes List */}
              <div className="space-y-3.5 overflow-y-auto max-h-[220px] pr-1 flex-grow">
                {votes.map((item) => {
                  const hasVoted = item.votes.includes(currentUser.name);
                  const totalVotes = item.votes.length;
                  const percentage = numPeople > 0 ? Math.round((totalVotes / numPeople) * 100) : 0;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/50 dark:border-slate-850 dark:bg-slate-950/40 text-left space-y-2 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2 relative z-10">
                        <div>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                            {item.category}
                          </span>
                          <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-snug mt-0.5">
                            {item.title}
                          </h5>
                        </div>

                        <button
                          onClick={() => handleVoteToggle(item.id)}
                          className={`rounded-xl px-2.5 py-1 text-[10px] font-bold font-mono transition flex items-center gap-1 shrink-0 ${
                            hasVoted
                              ? "bg-emerald-600 text-white dark:bg-emerald-500"
                              : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <span>👍</span>
                          <span>{totalVotes}</span>
                        </button>
                      </div>

                      {/* Vote Progress Line */}
                      <div className="space-y-1 relative z-10">
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                          <span className="truncate">Voters: {item.votes.join(", ") || "None"}</span>
                          <span>{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add form */}
              <form onSubmit={handleAddVoteItem} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Suggest Adventure Option</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="E.g., Sunrise Ridge Picnic"
                    value={newVoteTitle}
                    onChange={(e) => setNewVoteTitle(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white flex-grow"
                  />
                  <select
                    value={newVoteCat}
                    onChange={(e) => setNewVoteCat(e.target.value as any)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white w-24 shrink-0"
                  >
                    <option value="activity">Excursion</option>
                    <option value="lodge">Dining</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-3.5 text-[10px] font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 shrink-0"
                  >
                    Suggest
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Individual Itinerary Builders */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col h-full min-h-[460px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span>Personal Daily Itineraries</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Map personal excursions alongside the shared group timeline.</p>
                </div>
              </div>

              {/* Daily timeline filter tabs */}
              <div className="flex gap-1 bg-slate-50 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200/40 dark:border-slate-850 shrink-0 mb-3">
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    onClick={() => setNewItDay(d)}
                    className={`flex-grow py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-md transition ${
                      newItDay === d
                        ? "bg-white text-slate-800 shadow dark:bg-slate-900 dark:text-white"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Day {d}
                  </button>
                ))}
              </div>

              {/* Itinerary Stream */}
              <div className="space-y-2.5 overflow-y-auto max-h-[180px] pr-1 flex-grow">
                {itineraries
                  .filter((it) => it.day === newItDay)
                  .map((it) => (
                    <div
                      key={it.id}
                      className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-left relative overflow-hidden"
                    >
                      <div className="flex items-baseline justify-between gap-1.5">
                        <span className="font-mono font-black text-[9px] text-indigo-600 dark:text-indigo-400 shrink-0">
                          {it.time}
                        </span>
                        <span className="rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[7px] font-bold text-indigo-700 dark:text-indigo-400 uppercase font-mono truncate max-w-[80px]">
                          {it.owner}
                        </span>
                      </div>
                      <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {it.title}
                      </h5>
                      {it.description && (
                        <p className="text-[8px] text-slate-400 leading-normal mt-0.5">
                          {it.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>

              {/* Add event form */}
              <form onSubmit={handleAddItinerary} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Schedule Personal Event</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Time (E.g. 8:30 AM)"
                    value={newItTime}
                    onChange={(e) => setNewItTime(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  />
                  <select
                    value={newItOwner}
                    onChange={(e) => setNewItOwner(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  >
                    <option value="">Owner (Group)</option>
                    {allTravelers.map((t, idx) => (
                      <option key={idx} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Event title (E.g. Yoga)"
                    value={newItTitle}
                    onChange={(e) => setNewItTitle(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white flex-grow"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 text-[10px] font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 shrink-0"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Joint Photo Journaling */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col h-full min-h-[460px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-rose-500" />
                    <span>Joint Photo Journaling</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">A private, shared album cataloging photos from your stay.</p>
                </div>
              </div>

              {/* Photo stream Grid */}
              <div className="grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[220px] pr-1 flex-grow">
                {photos.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-150 p-1.5 bg-slate-50 dark:border-slate-850 dark:bg-slate-950 flex flex-col justify-between"
                  >
                    <img
                      src={item.url}
                      alt={item.caption}
                      className="h-20 w-full rounded-xl object-cover"
                    />
                    <div className="p-1 text-left">
                      <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2 italic">
                        &ldquo;{item.caption}&rdquo;
                      </p>
                      <div className="flex items-center justify-between text-[6px] font-mono text-slate-400 mt-1.5 uppercase font-bold">
                        <span>By: {item.uploadedBy.split(" ")[0]}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sim Photo Upload Form */}
              <form onSubmit={handleAddPhotoPreset} className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Catalog Photo Memory</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={newPhotoPreset}
                    onChange={(e) => setNewPhotoPreset(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  >
                    <option value="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80">🏔️ Snowy Peaks</option>
                    <option value="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80">⛺ Campfire Night</option>
                    <option value="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80">🌲 Forest Stream</option>
                    <option value="https://images.unsplash.com/photo-1472214222555-d404758b1c42?auto=format&fit=crop&w=600&q=80">🪵 Cosy Woodstove</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Short caption..."
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="w-full rounded-xl bg-emerald-600 py-2 text-[10px] font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500"
                >
                  {uploadingPhoto ? "Syncing memory..." : "Simulate Album Upload"}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* SAFETY TAB: Youth & Senior Safety Zones */}
        {activeSubTab === "safety" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* floor plan visual blueprint */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between min-h-[380px]">
              <div>
                <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Youth & Senior Safety Zones</span>
                </h4>
                <p className="text-[10px] text-slate-400 mb-4">Interactive cabin floor plan highlighting mobility support & kid-proof gates.</p>
              </div>

              {/* Vector blueprint plan */}
              <div className="h-[220px] bg-slate-950 border border-slate-850 rounded-2xl relative p-4 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-35" />
                
                {/* SVG Floor plan wire lines */}
                <svg className="absolute inset-0 h-full w-full opacity-40 pointer-events-none p-4" viewBox="0 0 100 100">
                  {/* Outer boundaries */}
                  <rect x="5" y="5" width="90" height="90" fill="none" stroke="#10b981" strokeWidth="1" />
                  {/* Living Room divider */}
                  <line x1="5" y1="50" x2="60" y2="50" stroke="#10b981" strokeWidth="1" />
                  {/* Bedrooms divider */}
                  <line x1="60" y1="5" x2="60" y2="95" stroke="#10b981" strokeWidth="1" />
                  {/* Loft staircase */}
                  <line x1="40" y1="50" x2="40" y2="95" stroke="#10b981" strokeWidth="1" />
                </svg>

                {/* Living Area Zone */}
                <button
                  onClick={() => setSelectedZone("living")}
                  className={`absolute left-[15%] top-[20%] p-2 rounded-xl text-[10px] font-bold border transition ${
                    selectedZone === "living" ? "bg-emerald-600 border-emerald-400 text-white z-15 shadow-lg" : "bg-slate-900/80 border-slate-750 text-slate-400 hover:text-white"
                  }`}
                >
                  🔥 Stove & Fireplace
                </button>

                {/* Kitchen Area Zone */}
                <button
                  onClick={() => setSelectedZone("kitchen")}
                  className={`absolute left-[15%] top-[65%] p-2 rounded-xl text-[10px] font-bold border transition ${
                    selectedZone === "kitchen" ? "bg-emerald-600 border-emerald-400 text-white z-15 shadow-lg" : "bg-slate-900/80 border-slate-750 text-slate-400 hover:text-white"
                  }`}
                >
                  🧪 Kitchen Cabinets
                </button>

                {/* Ground Bedroom Zone */}
                <button
                  onClick={() => setSelectedZone("bedroom")}
                  className={`absolute left-[65%] top-[30%] p-2 rounded-xl text-[10px] font-bold border transition ${
                    selectedZone === "bedroom" ? "bg-emerald-600 border-emerald-400 text-white z-15 shadow-lg" : "bg-slate-900/80 border-slate-750 text-slate-400 hover:text-white"
                  }`}
                >
                  🛏️ Zero-Step Suite
                </button>

                {/* Deck & Exterior Zone */}
                <button
                  onClick={() => setSelectedZone("deck")}
                  className={`absolute left-[65%] top-[70%] p-2 rounded-xl text-[10px] font-bold border transition ${
                    selectedZone === "deck" ? "bg-emerald-600 border-emerald-400 text-white z-15 shadow-lg" : "bg-slate-900/80 border-slate-750 text-slate-400 hover:text-white"
                  }`}
                >
                  🪜 Staircase Gate
                </button>
              </div>

              <div className="text-[9px] font-mono text-slate-400 pt-3 text-left">
                💡 Click highlighted blueprint buttons to verify active safety measures.
              </div>
            </div>

            {/* active safety zone detail panel */}
            <div className="bg-white rounded-3xl border border-slate-150 p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
                  Active Zone Diagnostics
                </span>

                {selectedZone === "living" && (
                  <div className="mt-4 space-y-4 text-left">
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">🔥 Subalpine Fireplace & Woodstove Shield</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      The core living area is equipped with a professional, lockable carbon-steel heat mesh screen around the firewood stove, minimizing stray sparks and physical touch risks for curious children.
                    </p>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100/30 text-xs text-slate-600 dark:text-slate-400 font-sans font-medium space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>Certified thermal barrier spacing (36 inches spacing to upholstery)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>Dual carbon monoxide diagnostic sensors actively calibrated</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedZone === "kitchen" && (
                  <div className="mt-4 space-y-4 text-left">
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">🧪 Kitchen Cabinets & Organic Cleaners</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      All under-sink detergents, cleaning agents, and utilities are stocked in drawers sealed by magnetic youth safety latches. Standard chemical-free solvents are utilized throughout the property.
                    </p>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100/30 text-xs text-slate-600 dark:text-slate-400 font-sans font-medium space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>Magnetic latches pre-mounted on all hazard drawers</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>First-aid kit nested above microwave line (out of child reach)</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedZone === "bedroom" && (
                  <div className="mt-4 space-y-4 text-left">
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">🛏️ Ground-Level Zero-Step Mobility Suite</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      Optimized for senior family members. Features a zero-step master entry straight from the living room, a low-pile therapeutic wool rug to minimize trip hazards, and heavy-duty grab bars inside the shower stall.
                    </p>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100/30 text-xs text-slate-600 dark:text-slate-400 font-sans font-medium space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>High-visibility LED hallway guiding lights during dark hours</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>Shower seat and heavy-duty brass safety grab-rails fully bolted</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedZone === "deck" && (
                  <div className="mt-4 space-y-4 text-left">
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">🪜 Staircase Entry Safety Gate</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      The wooden spiral staircase leading to the subalpine loft is gated by a custom lock-latch pressure gate, preventing toddlers from exploring unsupervised.
                    </p>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100/30 text-xs text-slate-600 dark:text-slate-400 font-sans font-medium space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>Dual-latch childproof locking handle</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>Fitted flush to oak wood frames to avoid balance offsets</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex items-center gap-2 text-[10px] text-slate-400 text-left">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Verified by EliteProvider Compliance Inspection. All security fixtures certified as of July 2026.</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
