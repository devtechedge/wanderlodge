"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Award, 
  MapPin, 
  Image as ImageIcon, 
  Sparkles, 
  Compass, 
  TreePine, 
  Heart, 
  Navigation, 
  HelpCircle, 
  Share2, 
  Check, 
  Star, 
  ChevronRight, 
  Eye, 
  BadgeAlert,
  Dribbble,
  DollarSign
} from "lucide-react";

interface LogEntry {
  id: string;
  date: string;
  reflection: string;
  specimen: string;
  location: string;
}

interface PhotoEntry {
  id: string;
  url: string;
  caption: string;
  author: string;
  date: string;
  likes: number;
}

export default function WildernessExplorationHub() {
  const [activeSubTab, setActiveSubTab] = useState<"journal" | "badges" | "trails" | "fun">("journal");

  // 1. Personal Nature Logbooks states
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wander_nature_logs");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      { id: "1", date: "Jul 05, 2026", reflection: "Watched the morning fog drift over the high ridge. Spotted a bald eagle nesting on the eastern pine.", specimen: "Douglas Fir", location: "East Deck Trailhead" },
      { id: "2", date: "Jul 06, 2026", reflection: "Found a beautiful bunch of wildflowers near the creek. Tasted fresh thimbleberries!", specimen: "Cascade Lily", location: "Creekside Bridge" }
    ];
  });
  const [reflection, setReflection] = useState("");
  const [specimen, setSpecimen] = useState("Douglas Fir");
  const [locationSpotted, setLocationSpotted] = useState("Lodge Deck");

  // 2. Photo Journal states
  const [photos, setPhotos] = useState<PhotoEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wander_photos");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      { id: "p1", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80", caption: "Sunrise breaking over the Eastern Cascade Ridge. Taken directly from the hot tub deck!", author: "Sarah (Cabin 4)", date: "Today, 6:15 AM", likes: 14 },
      { id: "p2", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80", caption: "A curious gray jay swooped down to investigate my morning pour-over coffee.", author: "James (Creekside)", date: "Yesterday", likes: 8 }
    ];
  });
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoPreset, setPhotoPreset] = useState("https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80");
  const [sharingPhoto, setSharingPhoto] = useState(false);

  // 3. Eco-Steward Badges States
  const [badges, setBadges] = useState(() => {
    const baseBadges = [
      { id: "pledge", title: "Tread Lightly", desc: "Signed the Leave-No-Trace Stewardship Pledge", icon: "🌱", unlocked: false },
      { id: "energy", title: "Energy Conservator", desc: "Verified low lodge thermostat during peak peak hours", icon: "🔥", unlocked: false },
      { id: "trail", title: "Trail Guardian", desc: "Submitted litter cleanup collection proof", icon: "🧹", unlocked: false },
      { id: "local", title: "Green Supporter", desc: "Supported 2 local bio-partners or green businesses", icon: "🥖", unlocked: false },
      { id: "dark_sky", title: "Night-Sky Guardian", desc: "Explored the stars using the Constellation Overlay", icon: "🌌", unlocked: false },
      { id: "tree", title: "Wandering Veteran", desc: "Completed 5 stays to plant a physical reserve tree", icon: "🌲", unlocked: false },
    ];
    if (typeof window !== "undefined") {
      const savedPledge = localStorage.getItem("wander_pledge_signed") === "true";
      const savedBadges = localStorage.getItem("wander_unlocked_badges");
      let unlockedIds: string[] = [];
      if (savedBadges) {
        try {
          unlockedIds = JSON.parse(savedBadges);
        } catch (e) {
          console.error(e);
        }
      }
      if (savedPledge && !unlockedIds.includes("pledge")) {
        unlockedIds.push("pledge");
      }
      return baseBadges.map(b => unlockedIds.includes(b.id) ? { ...b, unlocked: true } : b);
    }
    return baseBadges;
  });

  // 4. Trail Check-In states
  const [checkedInTrails, setCheckedInTrails] = useState<string[]>([]);
  const [activeTriviaIndex, setActiveTriviaIndex] = useState<number | null>(null);
  const [triviaAnswer, setTriviaAnswer] = useState<string | null>(null);

  const trails = [
    { 
      id: "eagles_crest", 
      name: "Eagle's Crest Ridge", 
      difficulty: "Strenuous", 
      length: "4.2 miles",
      elevation: "+1,200ft",
      trivia: {
        question: "What unique behavior does the Golden Eagle exhibit over Eagle's Crest to catch thermal updrafts?",
        options: [
          "Flapping continuously for miles",
          "Locking its wings at a specific angle without a single flap",
          "Spiraling exclusively clockwise",
          "Nesting only in subalpine larches"
        ],
        correct: "Locking its wings at a specific angle without a single flap",
        explanation: "Golden Eagles lock their primary feathers at an dihedral angle to effortlessly spiral on thermal rising columns above dry ridges."
      }
    },
    { 
      id: "meadow_loop", 
      name: "Subalpine Meadow Loop", 
      difficulty: "Easy", 
      length: "1.8 miles",
      elevation: "+150ft",
      trivia: {
        question: "Why do subalpine meadows burst with lupine and Indian paintbrush simultaneously in late summer?",
        options: [
          "They are planted by lodge rangers",
          "They share root-bound mycorrhizal nutrients to accelerate rapid growth before winter",
          "The color combination scares away subalpine black bears",
          "Lupine fixes nitrogen in the soil, which feeds the parasite paintbrush roots"
        ],
        correct: "Lupine fixes nitrogen in the soil, which feeds the parasite paintbrush roots",
        explanation: "Indian Paintbrush is hemiparasitic. Its roots tap into the root system of neighboring plants, especially nitrogen-fixing Lupine, to survive the harsh soil."
      }
    },
    { 
      id: "whispering_pines", 
      name: "Whispering Pine Path", 
      difficulty: "Moderate", 
      length: "2.5 miles",
      elevation: "+450ft",
      trivia: {
        question: "Which tree found along Whispering Pine path depends on high-intensity forest fires to open its cones?",
        options: [
          "Lodgepole Pine",
          "Douglas Fir",
          "Pacific Yew",
          "Subalpine Fir"
        ],
        correct: "Lodgepole Pine",
        explanation: "Lodgepole Pines have serotinous cones sealed with a durable resin. Only intense heat from fire melts the resin, allowing the scales to open and disperse seeds."
      }
    }
  ];

  // 5. Lodge Wandering Trails states
  const visitedLodges = [
    { id: "hood", name: "Mount Hood Creekside", loc: "Mount Hood, OR", lat: "45.331° N", lon: "121.711° W", date: "Oct 2024", visited: true },
    { id: "aspen", name: "Aspen Vista Canopy", loc: "Aspen, CO", lat: "39.191° N", lon: "106.817° W", date: "Jan 2025", visited: true },
    { id: "yosemite", name: "Yosemite Cedar Ridge", loc: "Yosemite, CA", lat: "37.745° N", lon: "119.533° W", date: "Stay Active Now", visited: true },
    { id: "teton", name: "Grand Teton Meadow Lodge", loc: "Jackson, WY", lat: "43.790° N", lon: "110.681° W", date: "Upcoming Oct 2026", visited: false },
  ];

  // 6. Identifier Game state
  const faunaSpecs = [
    { id: "jay", name: "Steller's Jay", icon: "🐦", type: "Fauna", desc: "Vibrant dark blue bird with a prominent charcoal crest. Extremely vocal around lodge pines." },
    { id: "larch", name: "Subalpine Larch", icon: "🌲", type: "Flora", desc: "Deciduous conifer whose needles turn a brilliant golden-yellow in late Autumn before shedding." },
    { id: "pika", name: "American Pika", icon: "🐹", type: "Fauna", desc: "Small, egg-shaped mammal living in talus fields. Known for its distinct high-pitched warning beep." },
    { id: "trillium", name: "Pacific Trillium", icon: "🌸", type: "Flora", desc: "Elegant woodland flower with exactly three white petals that age into a beautiful deep pink." }
  ];
  const [selectedFaunaId, setSelectedFaunaId] = useState<string | null>(null);
  const [faunaFeedback, setFaunaFeedback] = useState<string | null>(null);

  // 7. Leave No Trace states
  const [stewardName, setStewardName] = useState("");
  const [stewardAge, setStewardAge] = useState("");
  const [signedPledge, setSignedPledge] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wander_pledge_signed") === "true";
    }
    return false;
  });

  // 8. Constellation Tool states
  const [skyHeading, setSkyHeading] = useState<"North" | "South" | "Zenith">("North");
  const [redSkyMode, setRedSkyMode] = useState(false);
  const [activeConstellation, setActiveConstellation] = useState<string | null>(null);

  // 9. Reforestation states
  const [completedStays, setCompletedStays] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wander_completed_stays");
      if (saved) return parseInt(saved);
    }
    return 4;
  });
  const [showReforestSuccess, setShowReforestSuccess] = useState(false);

  const saveBadgesToStorage = (updatedBadges: typeof badges) => {
    const unlockedIds = updatedBadges.filter(b => b.unlocked).map(b => b.id);
    localStorage.setItem("wander_unlocked_badges", JSON.stringify(unlockedIds));
  };

  // Handlers
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    const newEntry: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      reflection,
      specimen,
      location: locationSpotted
    };

    const updated = [newEntry, ...logEntries];
    setLogEntries(updated);
    localStorage.setItem("wander_nature_logs", JSON.stringify(updated));
    setReflection("");
  };

  const handleSharePhoto = () => {
    if (!photoCaption.trim()) return;

    const newPhoto: PhotoEntry = {
      id: "photo_" + Date.now(),
      url: photoPreset,
      caption: photoCaption,
      author: "Me (Active Stay)",
      date: "Just now",
      likes: 0
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    localStorage.setItem("wander_photos", JSON.stringify(updated));
    setPhotoCaption("");
    setSharingPhoto(false);
  };

  const handleLikePhoto = (id: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    setPhotos(updated);
    localStorage.setItem("wander_photos", JSON.stringify(updated));
  };

  const handleVerifyBadge = (badgeId: string) => {
    const updated = badges.map(b => b.id === badgeId ? { ...b, unlocked: true } : b);
    setBadges(updated);
    saveBadgesToStorage(updated);
  };

  const handleCheckInTrail = (trailId: string) => {
    if (!checkedInTrails.includes(trailId)) {
      setCheckedInTrails([...checkedInTrails, trailId]);
    }
    const idx = trails.findIndex(t => t.id === trailId);
    setActiveTriviaIndex(idx);
    setTriviaAnswer(null);
  };

  const handleAnswerTrivia = (option: string, correct: string) => {
    setTriviaAnswer(option);
    if (option === correct) {
      // Unlock local green supporter badge or trail guardian badge helper
      const updated = badges.map(b => b.id === "trail" ? { ...b, unlocked: true } : b);
      setBadges(updated);
      saveBadgesToStorage(updated);
    }
  };

  const handleSignPledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stewardName.trim()) return;

    setSignedPledge(true);
    localStorage.setItem("wander_pledge_signed", "true");

    const updated = badges.map(b => b.id === "pledge" ? { ...b, unlocked: true } : b);
    setBadges(updated);
    saveBadgesToStorage(updated);
  };

  const handleSimulateStayCompletion = () => {
    const newStays = completedStays + 1;
    setCompletedStays(newStays);
    localStorage.setItem("wander_completed_stays", newStays.toString());

    if (newStays % 5 === 0) {
      setShowReforestSuccess(true);
      const updated = badges.map(b => b.id === "tree" ? { ...b, unlocked: true } : b);
      setBadges(updated);
      saveBadgesToStorage(updated);
    }
  };

  const handleTriggerDarkSky = () => {
    setRedSkyMode(!redSkyMode);
    // Auto-unlock dark sky guardian badge
    const updated = badges.map(b => b.id === "dark_sky" ? { ...b, unlocked: true } : b);
    setBadges(updated);
    saveBadgesToStorage(updated);
  };

  const presetPhotos = [
    { url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80", label: "Misty Fir Forest" },
    { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", label: "Midnight Valley Starry Sky" },
    { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80", label: "Golden Hour Ridge Peak" },
    { url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80", label: "Whispering Alpine Meadow" }
  ];

  return (
    <div id="wilderness-exploration-hub" className="rounded-3xl border border-slate-150 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col transition-all duration-300">
      
      {/* Main Header */}
      <div className="bg-slate-950 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950 z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Compass className="h-4 w-4 animate-spin-slow" />
              </span>
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-emerald-400">
                Batch 10 Sandbox
              </span>
            </div>
            <h2 className="font-sans text-xl font-black mt-1 text-white tracking-tight">
              Gamified Wilderness Exploration & Milestones
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Cultivate child-friendly eco-stewardship, log subalpine specimens, and chart the constellations.
            </p>
          </div>

          {/* Sub Tab selection */}
          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 self-start md:self-auto shrink-0">
            {[
              { id: "journal", label: "📖 Journal & Deck Pics" },
              { id: "badges", label: "🏆 Badges & Reforest" },
              { id: "trails", label: "🗺️ Trails & Impact" },
              { id: "fun", label: "🌌 Fun & Learning" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeSubTab === tab.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 flex-grow bg-slate-50/40 dark:bg-slate-950/20">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: JOURNAL & PHOTO FEED */}
          {activeSubTab === "journal" && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Personal Nature Logbook */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Private Nature Logbook</span>
                    </h3>
                    <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                      {logEntries.length} entries
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    Record your morning observations, describe subalpine air currents, and log unique flora or fauna discovered during hikes.
                  </p>

                  <form onSubmit={handleAddLog} className="space-y-3">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Select Spotted Specimen
                      </label>
                      <select
                        value={specimen}
                        onChange={(e) => setSpecimen(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-850 dark:bg-slate-950 text-slate-800 dark:text-slate-100 cursor-pointer"
                      >
                        <option value="Douglas Fir">🌲 Douglas Fir (High Canopy)</option>
                        <option value="Pacific Trillium">🌸 Pacific Trillium (Spotted woodland flower)</option>
                        <option value="Subalpine Larch">🍁 Subalpine Larch (Golden Needles)</option>
                        <option value="Indian Paintbrush">🌺 Indian Paintbrush (Scarlet bracts)</option>
                        <option value="Cascade Frog">🐸 Cascade Frog (Creekside pools)</option>
                        <option value="Steller's Jay">{"🐦 Steller's Jay (Blue crest)"}</option>
                        <option value="Other / Wilderness View">⛰️ Other Subalpine View</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Location Found
                        </label>
                        <input
                          type="text"
                          value={locationSpotted}
                          onChange={(e) => setLocationSpotted(e.target.value)}
                          placeholder="e.g. Lodge hot tub deck"
                          className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-850 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full text-xs font-mono font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 shadow-sm transition"
                        >
                          Log Discovery
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Reflections & Observations
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder="e.g., The subalpine forest smells intensely of warm cedar needles today. We saw three chipmunks gathering cones near the patio..."
                        className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-850 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </form>
                </div>

                {/* Log history list */}
                <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4 max-h-[180px] overflow-y-auto space-y-2.5">
                  <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Historic Journal Pages
                  </span>

                  {logEntries.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/10 dark:border-emerald-950/20 dark:bg-emerald-950/5 text-xs text-left"
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                            {log.specimen}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400 text-[9px]">{log.location}</span>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400 font-medium">
                          {log.date}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-350 leading-relaxed italic">
                        &ldquo;{log.reflection}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wanderer's Photo Journal Feed */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{"Wanderer's Photo Journal"}</span>
                    </h3>
                    <button
                      onClick={() => setSharingPhoto(!sharingPhoto)}
                      className="text-[10px] font-mono font-bold uppercase bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 transition"
                    >
                      {sharingPhoto ? "Close" : "Share a View 📸"}
                    </button>
                  </div>

                  {sharingPhoto ? (
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 mb-4 space-y-3">
                      <span className="block text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">
                        Configure Deck Snapshot
                      </span>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {presetPhotos.map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setPhotoPreset(p.url)}
                            className={`relative rounded-lg overflow-hidden border-2 h-14 ${
                              photoPreset === p.url ? "border-emerald-500 scale-95" : "border-transparent"
                            }`}
                          >
                            <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white py-0.5 truncate text-center">
                              {p.label}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={photoCaption}
                          onChange={(e) => setPhotoCaption(e.target.value)}
                          placeholder="Write a cozy caption for fellow wanders..."
                          className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-slate-850 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                        />
                        <button
                          onClick={handleSharePhoto}
                          className="w-full bg-emerald-600 text-white font-mono text-[10px] font-extrabold uppercase py-2 rounded-xl"
                        >
                          Broadcast to Lodge Feed
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                      A visual collection of real, guest-submitted scenery captured straight from the redwood decks of surrounding subalpine lodges.
                    </p>
                  )}

                  {/* Photo Stream Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {photos.map((photo) => (
                      <div 
                        key={photo.id}
                        className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20"
                      >
                        <div className="relative h-28 w-full bg-slate-100">
                          <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-slate-950/70 backdrop-blur-sm text-[8px] text-emerald-400 font-mono px-1.5 py-0.5 rounded font-black uppercase">
                            Deck Cam
                          </div>
                        </div>
                        <div className="p-3 text-left space-y-2">
                          <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300 leading-snug">
                            {photo.caption}
                          </p>
                          <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-2">
                            <span>Shared by {photo.author}</span>
                            <button
                              onClick={() => handleLikePhoto(photo.id)}
                              className="flex items-center gap-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 px-1.5 py-0.5 rounded transition font-black"
                            >
                              <Heart className="h-2.5 w-2.5 fill-rose-500" />
                              <span>{photo.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ECO BADGES & TREE REFORESTATION */}
          {activeSubTab === "badges" && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Milestone Badges Board */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Eco-Steward Milestone Badges</span>
                  </h3>
                  <span className="font-mono text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-black">
                    {badges.filter(b => b.unlocked).length} / {badges.length} UNLOCKED
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Complete local actions, conserve energy, clean mountain trails, and explore dark sky targets to unlock active certification badges.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {badges.map((badge) => (
                    <div 
                      key={badge.id}
                      className={`p-3.5 rounded-xl border flex gap-3.5 items-start transition ${
                        badge.unlocked 
                          ? "bg-emerald-50/10 border-emerald-500/30 dark:bg-emerald-950/5 dark:border-emerald-900/35" 
                          : "bg-slate-50/60 border-slate-150 dark:bg-slate-950/20 dark:border-slate-850 opacity-75"
                      }`}
                    >
                      <span className="text-2xl h-11 w-11 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                        {badge.unlocked ? badge.icon : "🔒"}
                      </span>
                      
                      <div className="space-y-1 text-left flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold leading-none ${badge.unlocked ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                            {badge.title}
                          </h4>
                          {badge.unlocked ? (
                            <span className="text-[7.5px] font-mono font-black text-emerald-500 bg-emerald-500/10 px-1 rounded">VERIFIED</span>
                          ) : (
                            <span className="text-[7.5px] font-mono font-black text-slate-400 bg-slate-100 dark:bg-slate-950 px-1 rounded">LOCKED</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          {badge.desc}
                        </p>

                        {!badge.unlocked && (
                          <div className="pt-1.5 flex gap-1.5">
                            {badge.id === "energy" && (
                              <button
                                onClick={() => handleVerifyBadge("energy")}
                                className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950 hover:opacity-90 font-mono text-[8px] font-bold px-2 py-0.5 rounded transition uppercase"
                              >
                                Verify Low Energy Mode
                              </button>
                            )}
                            {badge.id === "local" && (
                              <button
                                onClick={() => handleVerifyBadge("local")}
                                className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950 hover:opacity-90 font-mono text-[8px] font-bold px-2 py-0.5 rounded transition uppercase"
                              >
                                Verify local vendor buy
                              </button>
                            )}
                            {badge.id === "pledge" && (
                              <span className="text-[8px] text-slate-450 italic leading-none">Complete LNT pledge below to unlock.</span>
                            )}
                            {badge.id === "trail" && (
                              <button
                                onClick={() => handleVerifyBadge("trail")}
                                className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950 hover:opacity-90 font-mono text-[8px] font-bold px-2 py-0.5 rounded transition uppercase"
                              >
                                Log Clean hike bag
                              </button>
                            )}
                            {badge.id === "dark_sky" && (
                              <span className="text-[8px] text-slate-450 italic leading-none">{"Use Constellation Tool in 'Fun' tab to unlock."}</span>
                            )}
                            {badge.id === "tree" && (
                              <span className="text-[8px] text-slate-450 italic leading-none">Reach 5 completed stays on the reforestation card.</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kids Leave-No-Trace Pledge Screen */}
                <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-5 text-left">
                  <h4 className="font-sans text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>🌱 Kids & Family Leave-No-Trace Pledge</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                    Younger adventurers can commit to protect subalpine wildlife, keep watersheds clean, and preserve silence. Signing unlocks your first badge.
                  </p>

                  {signedPledge ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center space-y-1.5">
                      <span className="text-xl">📜</span>
                      <h5 className="font-sans text-xs font-black text-emerald-500 uppercase tracking-widest">
                        Certified Ranger & Eco-Steward
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        Awarded to junior explorer <strong className="text-slate-800 dark:text-white">{stewardName || "Active Wanderer"}</strong> (Age {stewardAge || "Youth"}) for signing the pledge and maintaining forest conservation trails!
                      </p>
                      <button
                        onClick={() => {
                          setSignedPledge(false);
                          localStorage.removeItem("wander_pledge_signed");
                        }}
                        className="text-[8px] font-mono font-bold text-slate-450 uppercase underline tracking-wider pt-2 block mx-auto hover:text-slate-300"
                      >
                        Reset Signed Certificate
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSignPledge} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        value={stewardName}
                        onChange={(e) => setStewardName(e.target.value)}
                        placeholder="Junior Steward Name"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-slate-850 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                      <input
                        type="number"
                        required
                        value={stewardAge}
                        onChange={(e) => setStewardAge(e.target.value)}
                        placeholder="Explorer Age"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-slate-850 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] font-bold uppercase py-2"
                      >
                        ✍️ Sign stewardship Pledge
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Tree Reforestation Tracker */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                      <TreePine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Reforestation Milestones</span>
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    WanderLodge plants a native tree in our private Cascade-area reserve for every 5 completed stays on your behalf.
                  </p>

                  {/* Growth Stage visual */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-center space-y-3">
                    <span className="text-4xl block animate-bounce-slow">
                      {completedStays < 5 ? "🌱" : completedStays < 10 ? "🌿" : "🌲"}
                    </span>
                    <div>
                      <span className="block text-[8px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                        {completedStays < 5 ? "Growth Stage: Seedling" : "Growth Stage: Active Sapling"}
                      </span>
                      <strong className="block text-xs text-slate-850 dark:text-white mt-1">
                        Reserve Coordinate Zone: Lat 45.33° N, Lon 121.71° W
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold font-mono text-slate-400">
                        <span>Stay Milestones</span>
                        <span>{completedStays} / 5 Stays</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(completedStays % 5) * 20 || 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    🌲 Your completed bookings have successfully restored <strong>{Math.floor(completedStays / 5)} physical Douglas Firs</strong> to high-fire burn zones.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button
                    onClick={handleSimulateStayCompletion}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-mono text-[9px] font-bold uppercase py-2 rounded-xl text-center"
                  >
                    Simulate Completed Stay
                  </button>
                  <span className="block text-[8px] text-slate-450 font-mono text-center mt-1.5">
                    Click to add a mock booking and trigger tree growth & planting.
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: TRAILS & FOOTPRINT */}
          {activeSubTab === "trails" && (
            <motion.div
              key="trails"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Local Trailhead Logs */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Trailhead Check-In & Conservation Trivia</span>
                  </h3>
                  <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-black">
                    {checkedInTrails.length} / 3 VISITED
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Check-in digitally as you pass nearby verified trailheads during your wilderness treks to unlock localized high-altitude trivia questions.
                </p>

                <div className="space-y-3">
                  {trails.map((trail) => {
                    const isChecked = checkedInTrails.includes(trail.id);
                    return (
                      <div 
                        key={trail.id}
                        className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-850 dark:text-white font-sans text-xs">
                              {trail.name}
                            </strong>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                              trail.difficulty === "Easy" 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : trail.difficulty === "Moderate"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}>
                              {trail.difficulty}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-450 font-mono">
                            Length: {trail.length} • Elevation Gain: {trail.elevation}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCheckInTrail(trail.id)}
                            className={`rounded-lg px-3 py-1.5 text-[9px] font-mono font-bold uppercase transition ${
                              isChecked 
                                ? "bg-emerald-600 text-white" 
                                : "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950 hover:opacity-90"
                            }`}
                          >
                            {isChecked ? "✓ Checked-In (Trivia Open)" : "Check-In At Trailhead"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Active Trivia segment */}
                {activeTriviaIndex !== null && (
                  <div className="mt-5 border-t border-slate-100 dark:border-slate-850 pt-4 bg-slate-50/40 dark:bg-slate-950/20 p-4 rounded-xl text-left">
                    <span className="block text-[8px] font-mono font-black text-emerald-500 uppercase tracking-widest mb-1">
                      ACTIVE TRAILHEAD CONSERVATION TRIVIA
                    </span>
                    <strong className="block text-xs text-slate-850 dark:text-white leading-relaxed mb-3">
                      {trails[activeTriviaIndex].trivia.question}
                    </strong>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {trails[activeTriviaIndex].trivia.options.map((opt, oIdx) => {
                        const isCorrect = opt === trails[activeTriviaIndex].trivia.correct;
                        const isSelected = triviaAnswer === opt;
                        
                        let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300";
                        if (triviaAnswer) {
                          if (isCorrect) btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400";
                          else if (isSelected) btnStyle = "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={!!triviaAnswer}
                            onClick={() => handleAnswerTrivia(opt, trails[activeTriviaIndex].trivia.correct)}
                            className={`p-2.5 border rounded-lg text-left text-[11px] leading-snug transition font-medium ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {triviaAnswer && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-[10px] text-slate-500 leading-relaxed flex items-start gap-2">
                        <span className="text-emerald-400">💡</span>
                        <p>
                          <strong>Explanation:</strong> {trails[activeTriviaIndex].trivia.explanation}
                          <br />
                          <span className="text-emerald-500 font-extrabold mt-1 block">🏆 Trail Guardian Badge progress unlocked!</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Lodge-to-Lodge Wandering Trails & Community Footprint Receipt */}
              <div className="space-y-6">
                
                {/* Geolocation Lodge Route */}
                <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left">
                  <h3 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Lodge-to-Lodge Wandering Trail</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                    Track the unique coordinates and dates of your historic WanderLodge visits across North America.
                  </p>

                  <div className="space-y-3 relative before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-[1px] before:bg-slate-200 dark:before:bg-slate-800">
                    {visitedLodges.map((lodge) => (
                      <div key={lodge.id} className="flex gap-3 text-xs text-left relative z-10">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-[10px] shrink-0 ${
                          lodge.visited 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                            : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-950 dark:border-slate-850"
                        }`}>
                          {lodge.visited ? "✓" : "⏰"}
                        </div>
                        <div className="space-y-0.5">
                          <strong className={`block ${lodge.visited ? "text-slate-850 dark:text-white" : "text-slate-400"}`}>
                            {lodge.name}
                          </strong>
                          <span className="block text-[8px] font-mono text-slate-400 leading-none">
                            {lodge.loc} • Coordinates: {lodge.lat}, {lodge.lon}
                          </span>
                          <span className="block text-[8px] text-emerald-600 font-bold">
                            {lodge.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regional community impact receipt */}
                <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left">
                  <h3 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Regional Footprint Summary</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-3.5">
                    100% transparent distribution showing the positive financial and resource impact of your stay on this rural community.
                  </p>

                  <div className="border border-dashed border-emerald-100 dark:border-emerald-900/30 p-3 rounded-xl bg-emerald-50/5 text-[10px] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-450">Local Housekeeper Living Wages</span>
                      <strong className="font-mono text-slate-850 dark:text-white">$65.00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">High-Altitude Trail Conservation</span>
                      <strong className="font-mono text-slate-850 dark:text-white">$38.40</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Tribal Artisans Scents Partnership</span>
                      <strong className="font-mono text-slate-850 dark:text-white">$15.00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Local Bakery Organic Supplies</span>
                      <strong className="font-mono text-slate-850 dark:text-white">$24.10</strong>
                    </div>
                    <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-1.5 flex justify-between font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      <span>Total Regional Community Support</span>
                      <span>$142.50</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: FUN & AR CONSTELLATION */}
          {activeSubTab === "fun" && (
            <motion.div
              key="fun"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              
              {/* Flora & Fauna Matching Game */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Flora & Fauna Identifier (Young Travelers)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    Learn to identify common wilderness tree species, woodland flowers, and mountain birds with this fun educational quiz!
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {faunaSpecs.map((spec) => (
                      <button
                        key={spec.id}
                        onClick={() => {
                          setSelectedFaunaId(spec.id);
                          setFaunaFeedback(spec.desc);
                        }}
                        className={`p-3 border rounded-xl text-left transition flex items-center gap-3 ${
                          selectedFaunaId === spec.id
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-850 dark:hover:bg-slate-900"
                        }`}
                      >
                        <span className="text-2xl">{spec.icon}</span>
                        <div>
                          <strong className="block text-xs text-slate-850 dark:text-white leading-none">{spec.name}</strong>
                          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                            Type: {spec.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {faunaFeedback ? (
                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 text-xs">
                      <span className="block text-[8px] font-mono font-black text-emerald-500 uppercase tracking-widest mb-1">
                        SPECIMEN INSIGHTS
                      </span>
                      <p className="text-slate-600 dark:text-slate-350 leading-relaxed italic">
                        {faunaFeedback}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-[10px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50">
                      💡 Select any local bird or tree card above to unlock deep subalpine species knowledge and field guides.
                    </div>
                  )}
                </div>

                <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 mt-4">
                  <span className="text-[8px] font-mono font-black text-emerald-400 block uppercase">
                    🌳 JUNIOR CONSERVATOR RANK
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Match all species during your hike to earn full active Ranger credentials.
                  </span>
                </div>
              </div>

              {/* Constellation Mapping Tool */}
              <div className={`rounded-2xl border p-5 text-left flex flex-col justify-between transition-colors duration-300 ${
                redSkyMode 
                  ? "bg-rose-950/20 border-rose-900/40 text-rose-300" 
                  : "bg-slate-950 border-slate-850 text-slate-200"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-sans text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-white">
                      <Star className={`h-4 w-4 ${redSkyMode ? "text-rose-500 animate-pulse" : "text-amber-400"}`} />
                      <span>Constellation Mapping Overlay</span>
                    </h3>

                    <button
                      onClick={handleTriggerDarkSky}
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded transition ${
                        redSkyMode 
                          ? "bg-rose-600 text-white" 
                          : "bg-slate-800 text-slate-300 hover:bg-slate-750"
                      }`}
                    >
                      {redSkyMode ? "🔴 Red Vision Active" : "🌑 Enable Red Mode"}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    Point your device above your cabin roof to reveal active starry formations. Select viewing targets below to trigger alignment.
                  </p>

                  <div className="flex gap-2 mb-4">
                    {["North", "South", "Zenith"].map((dir) => (
                      <button
                        key={dir}
                        onClick={() => {
                          setSkyHeading(dir as any);
                          setActiveConstellation(null);
                        }}
                        className={`px-2 py-1 text-[9px] font-mono font-black uppercase rounded ${
                          skyHeading === dir
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-900 text-slate-450 hover:text-slate-300"
                        }`}
                      >
                        {dir} Sky Dome
                      </button>
                    ))}
                  </div>

                  {/* Simulated Star Map Sky */}
                  <div className="relative h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    
                    {/* Stars background pattern */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(1.5px_1.5px_at_20px_30px,#fff_100%,transparent_0),radial-gradient(1px_1px_at_80px_120px,#fff_100%,transparent_0),radial-gradient(1.5px_1.5px_at_140px_60px,#fff_100%,transparent_0),radial-gradient(1.2px_1.2px_at_220px_150px,#fff_100%,transparent_0)]" />

                    {skyHeading === "North" && (
                      <div className="relative w-full h-full p-4 flex flex-col justify-between">
                        <span className="text-[8px] font-mono text-slate-500 font-bold">DIRECTION: 350° NORTH</span>
                        
                        {/* Custom Constellation 1: Ursa Major */}
                        <button
                          onClick={() => setActiveConstellation("ursa")}
                          className="absolute top-1/4 left-1/3 flex flex-col items-center group cursor-pointer"
                        >
                          <div className={`flex gap-1 items-center ${redSkyMode ? "text-rose-500" : "text-emerald-400 animate-pulse"}`}>
                            <span>★</span>
                            <span className="text-[8px]">★</span>
                            <span>★</span>
                          </div>
                          <span className="text-[8px] font-mono text-white/70 group-hover:text-emerald-300">Ursa Major (Great Bear)</span>
                        </button>

                        <span className="text-[8px] font-mono text-slate-500 text-center font-bold">Horizon Line (Cascade Range)</span>
                      </div>
                    )}

                    {skyHeading === "South" && (
                      <div className="relative w-full h-full p-4 flex flex-col justify-between">
                        <span className="text-[8px] font-mono text-slate-500 font-bold">DIRECTION: 180° SOUTH</span>

                        {/* Custom Constellation 2: Orion */}
                        <button
                          onClick={() => setActiveConstellation("orion")}
                          className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                        >
                          <div className={`flex flex-col items-center gap-1 ${redSkyMode ? "text-rose-500" : "text-emerald-400"}`}>
                            <span className="text-[8px]">★</span>
                            <div className="flex gap-1 font-black text-xs leading-none">
                              <span>★</span>
                              <span>★</span>
                              <span>★</span>
                            </div>
                            <span className="text-[8px]">★</span>
                          </div>
                          <span className="text-[8px] font-mono text-white/70 mt-1 group-hover:text-emerald-300">Orion (The Hunter Belt)</span>
                        </button>

                        <span className="text-[8px] font-mono text-slate-500 text-center font-bold">Horizon Line</span>
                      </div>
                    )}

                    {skyHeading === "Zenith" && (
                      <div className="relative w-full h-full p-4 flex flex-col justify-between">
                        <span className="text-[8px] font-mono text-slate-500 font-bold">DIRECTION: 90° ZENITH DOME</span>

                        {/* Custom Constellation 3: Cassiopeia */}
                        <button
                          onClick={() => setActiveConstellation("cassiopeia")}
                          className="absolute top-1/4 left-1/4 flex flex-col items-center group cursor-pointer"
                        >
                          <div className={`font-black text-lg tracking-widest leading-none ${redSkyMode ? "text-rose-500" : "text-emerald-400"}`}>
                            W
                          </div>
                          <span className="text-[8px] font-mono text-white/70 mt-1 group-hover:text-emerald-300">Cassiopeia (The Queen)</span>
                        </button>

                        <span className="text-[8px] font-mono text-slate-500 text-center font-bold">Zenith Point</span>
                      </div>
                    )}

                  </div>

                  {activeConstellation ? (
                    <div className="mt-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                      <strong className="block text-white">
                        {activeConstellation === "ursa" && "Ursa Major (The Great Bear)"}
                        {activeConstellation === "orion" && "Orion (The Hunter Belt)"}
                        {activeConstellation === "cassiopeia" && "Cassiopeia (The Queen)"}
                      </strong>
                      <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed">
                        {activeConstellation === "ursa" && "Contains the famous 'Big Dipper' asterism. Follow the two pointer stars on the bowl's edge directly to Polaris (the North Star)."}
                        {activeConstellation === "orion" && "One of the most recognizable patterns in the galaxy. His belt is formed by Alnilam, Alnitak, and Mintaka, pointing directly to Sirius."}
                        {activeConstellation === "cassiopeia" && "The prominent W-shaped stellar formation representing the boastful mythological queen of Aethiopia."}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 text-center text-[9px] text-slate-500 mt-2">
                      💡 Click on any active constellation in the sky dome map to unlock navigation field guides.
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
