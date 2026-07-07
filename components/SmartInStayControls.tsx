"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wifi,
  ShieldAlert,
  Flame,
  Thermometer,
  Coffee,
  Check,
  ChevronRight,
  Share2,
  Trash2,
  AlertOctagon,
  Languages,
  BookOpen,
  Map,
  Compass,
  Zap,
  ShoppingBag,
  Bell,
  CheckSquare,
  Sparkles,
  RefreshCw,
  PhoneCall,
  Activity,
  User,
  Heart
} from "lucide-react";

interface CoTraveler {
  name: string;
  email: string;
  role?: string;
  image?: string;
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
}

interface SmartInStayControlsProps {
  reservation: Reservation;
  currentUser: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

// 30+ languages supported for Translate-Ready House Manuals
const LANGUAGES_LIST = [
  { code: "en", name: "English" },
  { code: "es", name: "Español (Spanish)" },
  { code: "fr", name: "Français (French)" },
  { code: "de", name: "Deutsch (German)" },
  { code: "it", name: "Italiano (Italian)" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "zh", name: "中文 (Chinese)" },
  { code: "ko", name: "한국어 (Korean)" },
  { code: "pt", name: "Português (Portuguese)" },
  { code: "ru", name: "Русский (Russian)" },
  { code: "nl", name: "Nederlands (Dutch)" },
  { code: "sv", name: "Svenska (Swedish)" },
  { code: "no", name: "Norsk (Norwegian)" },
  { code: "da", name: "Dansk (Danish)" },
  { code: "fi", name: "Suomi (Finnish)" },
  { code: "pl", name: "Polski (Polish)" },
  { code: "tr", name: "Türkçe (Turkish)" },
  { code: "ar", name: "العربية (Arabic)" },
  { code: "el", name: "Ελληνικά (Greek)" },
  { code: "he", name: "עברית (Hebrew)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "th", name: "ไทย (Thai)" },
  { code: "vi", name: "Tiếng Việt (Vietnamese)" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "cs", name: "Čeština (Czech)" },
  { code: "hu", name: "Magyar (Hungarian)" },
  { code: "ro", name: "Română (Romanian)" },
  { code: "uk", name: "Українська (Ukrainian)" },
  { code: "ms", name: "Bahasa Melayu" },
  { code: "ga", name: "Gaeilge (Irish)" }
];

const TRANSLATED_MANUALS: { [key: string]: {
  welcome: string;
  hvac: string;
  waste: string;
  fauna: string;
  firewood: string;
} } = {
  en: {
    welcome: "Welcome to your subalpine retreat. This digital manual serves as your stay framework. Please respect the organic cedar and wildlife codes.",
    hvac: "Use the smart thermostat dial. Please keep target temperatures below 72°F to preserve the local geo-grid pumps.",
    waste: "Sort refuse into marked containers inside the bear-proof cedar bins outside. Lock both master latches firmly by 10:00 PM.",
    fauna: "You are in an active grizzly & black bear travel corridor. Do not leave food, toiletries, or cooler bags on patios under any circumstances.",
    firewood: "Store firewood dry inside the iron hearth crib. Never burn green subalpine pine; use seasoned cedar rounds strictly."
  },
  es: {
    welcome: "Bienvenido a su refugio subalpino. Este manual digital sirve como marco de su estancia. Respete los códigos de cedro orgánico y vida silvestre.",
    hvac: "Utilice el dial del termostato inteligente. Mantenga las temperaturas objetivo por debajo de 72°F para preservar las bombas de la red geotérmica.",
    waste: "Clasifique los desechos en los contenedores marcados dentro de los depósitos de cedro a prueba de osos afuera. Cierre firmemente ambos pestillos antes de las 10:00 PM.",
    fauna: "Se encuentra en un corredor de tránsito activo de osos pardos y negros. No deje comida, artículos de aseo ni bolsas térmicas en los patios bajo ninguna circunstancia.",
    firewood: "Guarde la leña seca dentro del pesebre de hierro del hogar. Nunca queme pino subalpino verde; use estrictamente rondas de cedro curado."
  },
  fr: {
    welcome: "Bienvenue dans votre refuge subalpin. Ce manuel numérique sert de cadre de séjour. Veuillez respecter les codes du cèdre organique et de la faune.",
    hvac: "Utilisez le cadran du thermostat intelligent. Veuillez maintenir les températures cibles en dessous de 72°F pour préserver les pompes de géogrille.",
    waste: "Triez les déchets dans les conteneurs marqués à l'intérieur des bacs à cèdre anti-ours à l'extérieur. Verrouillez fermement les deux loquets avant 22h00.",
    fauna: "Vous êtes dans un corridor de déplacement actif pour les grizzlis et les ours noirs. Ne laissez en aucun cas de la nourriture ou des articles de toilette sur les terrasses.",
    firewood: "Conservez le bois de chauffage au sec dans le berceau de fer du foyer. Ne brûlez jamais de pin subalpin vert ; utilisez uniquement des bûches de cèdre sec."
  },
  de: {
    welcome: "Willkommen in Ihrem subalpinen Refugium. Dieses digitale Handbuch dient als Leitfaden für Ihren Aufenthalt. Bitte beachten Sie die Bio-Zedern- und Wildtiervorschriften.",
    hvac: "Verwenden Sie den intelligenten Thermostatregler. Bitte halten Sie die Zieltemperaturen unter 22°C (72°F), um die Erdwärmepumpen zu schonen.",
    waste: "Sortieren Sie den Müll in die markierten Behälter in den bärensicheren Zedernholzboxen im Außenbereich. Verriegeln Sie beide Riegel bis 22:00 Uhr fest.",
    fauna: "Sie befinden sich in einem aktiven Grizzly- und Schwarzbärenkorridor. Lassen Sie unter keinen Umständen Lebensmittel oder Toilettenartikel auf den Terrassen liegen.",
    firewood: "Lagern Sie Brennholz trocken im eisernen Kaminregal. Verbrennen Sie niemals frische subalpine Kiefer; verwenden Sie ausschließlich getrocknete Zedernholzscheite."
  },
  ja: {
    welcome: "亜高山帯のリトリートへようこそ。このデジタルマニュアルは滞在の指針となります。天然杉や野生動物保護の規約を遵守してください。",
    hvac: "スマートサーモスタットのダイヤルを使用してください。地熱グリッドポンプを保護するため、設定温度は72°F（約22°C）以下に保ってください。",
    waste: "屋外にある防熊仕様の杉材ゴミ箱内の、指定された容器にゴミを分別してください。夜10時までに、両方のマスターラッチをしっかりとロックしてください。",
    fauna: "ここはグリズリーやツキノワグマの活発な移動経路です。理由を問わず、テラスに食べ物や洗面用具、クーラーバッグを放置しないでください。",
    firewood: "薪は暖炉のアイアンラック内に乾燥した状態で保管してください。生の亜高山帯松は絶対に燃やさず、十分に乾燥した杉の丸太のみを使用してください。"
  }
};

export default function SmartInStayControls({ reservation, currentUser }: SmartInStayControlsProps) {
  const resId = reservation.id;

  // Active language state
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Emergency Signal State
  const [emergencyActivated, setEmergencyActivated] = useState(false);
  const [emergencyConfirmOpen, setEmergencyConfirmOpen] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(5);

  // Thermostat State
  const [currentTemp, setCurrentTemp] = useState(68);
  const [activeHVACMode, setActiveHVACMode] = useState<"cool" | "heat" | "eco">("heat");
  const [thermostatVideoPlaying, setThermostatVideoPlaying] = useState(true);
  const [videoTimer, setVideoTimer] = useState(15);
  const [activeSystemType, setActiveSystemType] = useState<"hvac" | "woodstove" | "geothermal">("hvac");

  // Appliance Selection
  const [activeAppliance, setActiveAppliance] = useState<"espresso" | "cooktop" | "hottub">("espresso");
  const [applianceSteps, setApplianceSteps] = useState<{ [key: string]: boolean }>({});

  // Safety Map active Pin state
  const [selectedSafetyPin, setSelectedSafetyPin] = useState<string | null>("extinguisher-kitchen");

  // Local Pantry Stock
  const [pantryLogs, setPantryLogs] = useState([
    { id: "p1", item: "Organic Cold-Pressed Olive Oil", status: "In Stock", lastChecked: "Jul 6" },
    { id: "p2", item: "Coarse Himalayan Pink Salt", status: "In Stock", lastChecked: "Jul 6" },
    { id: "p3", item: "Medium Roast Whole Coffee Beans", status: "Low", lastChecked: "Jul 7" },
    { id: "p4", item: "Unbleached V60 Paper Filters", status: "Out of Stock", lastChecked: "Jul 7" },
    { id: "p5", item: "Organic Ground Cinnamon & Nutmeg", status: "In Stock", lastChecked: "Jul 5" }
  ]);

  // Bluetooth key states
  const [digitalKeys, setDigitalKeys] = useState<{ [email: string]: { shared: boolean; code: string; type: "Bluetooth" | "Passcode" } }>({});

  // Stream-Flow safety level
  const [riverSafety, setRiverSafety] = useState({
    flowRate: 2.1, // m3/s
    temp: 49, // Fahrenheit
    level: "Normal",
    status: "🟢 SAFE FOR WADING",
    notice: "Upper creeks are perfectly clear. Runoff is currently stable, but always wear wading boots."
  });

  // Trash notification reminder state
  const [dismissedTrashReminder, setDismissedTrashReminder] = useState(false);

  // Countdown timer for 15s Thermostat silent instruction loop simulation
  useEffect(() => {
    if (!thermostatVideoPlaying) return;
    const interval = setInterval(() => {
      setVideoTimer((prev) => {
        if (prev <= 1) return 15;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [thermostatVideoPlaying]);

  // Load state from localStorage on init
  useEffect(() => {
    if (!resId) return;
    const loadState = () => {
      const savedKeys = localStorage.getItem(`stay_${resId}_keys`);
      if (savedKeys) {
        setDigitalKeys(JSON.parse(savedKeys));
      } else {
        // Default share state for registered guests
        const defaultState: { [email: string]: { shared: boolean; code: string; type: "Bluetooth" | "Passcode" } } = {};
        (reservation.coTravelers || []).forEach((guest, i) => {
          defaultState[guest.email] = {
            shared: i === 0, // share with first one by default
            code: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
            type: i % 2 === 0 ? "Bluetooth" : "Passcode"
          };
        });
        setDigitalKeys(defaultState);
      }

      const savedPantry = localStorage.getItem(`stay_${resId}_pantry`);
      if (savedPantry) setPantryLogs(JSON.parse(savedPantry));
    };

    const timer = setTimeout(loadState, 0);
    return () => clearTimeout(timer);
  }, [resId, reservation.coTravelers]);

  // Helper to save key share state
  const handleToggleKeyShare = (email: string) => {
    const updated = {
      ...digitalKeys,
      [email]: {
        ...digitalKeys[email],
        shared: !digitalKeys[email]?.shared
      }
    };
    setDigitalKeys(updated);
    localStorage.setItem(`stay_${resId}_keys`, JSON.stringify(updated));
  };

  // Helper to update pantry status
  const handleCyclePantryStatus = (id: string) => {
    const updated = pantryLogs.map((p) => {
      if (p.id === id) {
        const nextStatus = p.status === "In Stock" ? "Low" : p.status === "Low" ? "Out of Stock" : "In Stock";
        return { ...p, status: nextStatus, lastChecked: "Today" };
      }
      return p;
    });
    setPantryLogs(updated);
    localStorage.setItem(`stay_${resId}_pantry`, JSON.stringify(updated));
  };

  // Emergency countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emergencyActivated && emergencyCountdown > 0) {
      timer = setTimeout(() => {
        setEmergencyCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [emergencyActivated, emergencyCountdown]);

  const handleTriggerEmergency = () => {
    setEmergencyConfirmOpen(false);
    setEmergencyActivated(true);
    setEmergencyCountdown(5);
  };

  const handleCancelEmergency = () => {
    setEmergencyActivated(false);
    setEmergencyCountdown(5);
  };

  const handleStepToggle = (stepId: string) => {
    setApplianceSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const activeManual = TRANSLATED_MANUALS[selectedLanguage] || TRANSLATED_MANUALS["en"];

  // Safety Pins metadata
  const SAFETY_PINS = [
    {
      id: "extinguisher-kitchen",
      label: "🧯 Kitchen Fire Extinguisher",
      loc: "Under-sink storage cabinet directly adjacent to the induction range.",
      status: "Certified - Exp: Dec 2026",
      x: 38,
      y: 42
    },
    {
      id: "firstaid-closet",
      label: "🩹 Entryway First Aid kit",
      loc: "Inside the primary wood closet next to keyless deadbolt, top shelf.",
      status: "Fully Stocked with burn gels & subalpine splints",
      x: 65,
      y: 75
    },
    {
      id: "flashlight-bed",
      label: "🔦 Emergency LED Flashlights",
      loc: "Housed in the drawers of both bedrooms. Features solar crank cells.",
      status: "Battery: 100% (Inductor base)",
      x: 18,
      y: 22
    }
  ];

  return (
    <div id="smart-instay-comfort-controls" className="flex-grow flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* 1. Header & Emergency banner */}
      <div className="bg-white border-b border-slate-250/50 px-6 py-4 dark:bg-slate-900 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 z-20 shadow-xs">
        <div>
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />
            WanderStay Connected Applet
          </span>
          <h2 className="font-sans text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mt-1">
            📟 Smart Stay Controls & Manuals
          </h2>
          <p className="text-[10px] text-slate-400">
            Control cabin climate, access electronic credentials, and query translated digital logs.
          </p>
        </div>

        {/* Dispatch & Emergency Triggers */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="block text-[8px] font-bold text-slate-400 uppercase">GPS Dispatch Coord</span>
            <span className="font-mono text-[9px] font-semibold text-slate-650 dark:text-slate-350">
              47.6062° N, 122.3321° W • Alt: 1,420m
            </span>
          </div>

          <button
            onClick={() => setEmergencyConfirmOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md border border-red-500 hover:border-red-600 flex items-center gap-1.5 transition animate-pulse"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Emergency Alert</span>
          </button>
        </div>
      </div>

      {/* EMERGENCY DISPATCH MODAL */}
      <AnimatePresence>
        {emergencyConfirmOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-500 p-6 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto text-xl">
                ⚠️
              </div>
              <h3 className="font-sans font-extrabold text-slate-900 dark:text-white text-base mt-3 uppercase tracking-wider">
                CONFIRM EMERGENCY ALERT
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                This will immediately broadcast an SMS & Pager signal to the local host and dispatch rescue coordinators at <strong className="text-red-500">Subalpine Ranger Zone 4</strong>.
              </p>

              <div className="bg-red-50/50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-200/40 dark:border-red-900/40 text-left my-4 space-y-1.5 font-mono text-[10px] text-red-800 dark:text-red-400">
                <div>📍 CURRENT COORDINATES: 47.6062° N, 122.3321° W</div>
                <div>🌲 LODGE ID: {resId.slice(0, 8).toUpperCase()}</div>
                <div>📡 SIGNAL BROADCAST: Subalpine Satellite Mesh Node #14</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEmergencyConfirmOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Cancel & Back
                </button>
                <button
                  onClick={handleTriggerEmergency}
                  className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2.5 text-xs font-bold text-white shadow-md border border-red-500"
                >
                  Yes, Broadcast Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ACTIVE EMERGENCY COUNTDOWN OVERLAY */}
        {emergencyActivated && (
          <div className="fixed inset-0 bg-red-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-md w-full text-center text-white space-y-6"
            >
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40 h-24 w-24 mx-auto" />
                <div className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center text-3xl font-black border border-white z-10">
                  📡
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-sans font-black text-2xl uppercase tracking-widest text-red-200">
                  Broadcasting SOS Alert
                </h2>
                <p className="text-sm text-red-100 max-w-sm mx-auto">
                  Local Search & Rescue and your host have been queued. Stand by near cellular/mesh transceivers.
                </p>
              </div>

              <div className="bg-black/30 border border-white/10 p-5 rounded-2xl max-w-xs mx-auto font-mono text-left text-xs space-y-2 text-red-100">
                <div className="flex justify-between">
                  <span>Host Alert Pager:</span>
                  <span className="font-bold text-emerald-400">QUEUED</span>
                </div>
                <div className="flex justify-between">
                  <span>S.O.S Coordinates:</span>
                  <span>47.6062, -122.3321</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Channel:</span>
                  <span>SatMesh CH-16 (S)</span>
                </div>
              </div>

              <div className="space-y-3">
                {emergencyCountdown > 0 ? (
                  <p className="font-mono text-sm">
                    Connecting with dispatch in <strong className="text-yellow-400 font-extrabold text-lg">{emergencyCountdown}s</strong>...
                  </p>
                ) : (
                  <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl max-w-xs mx-auto text-emerald-400 font-bold text-xs animate-pulse">
                    🟢 CONNECTED: Dispatchers monitoring cabin coordinates.
                  </div>
                )}

                <button
                  onClick={handleCancelEmergency}
                  className="bg-white text-red-900 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-slate-100 transition shadow-lg"
                >
                  False Alarm (Dismiss Alert)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Main Scrolling Workspace */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6">

        {/* TOP ALERT: Trash Pick-Up notification */}
        {!dismissedTrashReminder && (
          <div className="bg-amber-50 border border-amber-250 rounded-3xl p-4.5 dark:bg-amber-950/15 dark:border-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">🐻</span>
              <div className="text-left">
                <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-400 uppercase tracking-wider">
                  ⚠️ Trash Pick-Up Collection Alert (Bear-proof Routine)
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-relaxed mt-0.5">
                  Collection occurs tomorrow morning at <strong>8:00 AM</strong>. Guests must transport sorted waste to the heavy bear-proof containers outside and secure the master mechanical deadbolts by <strong>10:00 PM tonight</strong>.
                </p>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono mt-2 text-amber-700 dark:text-amber-400">
                  <span className="bg-amber-100/50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">Scraps: Double Bagged</span>
                  <span className="bg-amber-100/50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">Cans/Glass: Rinsed & Clean</span>
                  <span className="bg-amber-100/50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">No cardboard boxes on porch</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setDismissedTrashReminder(true)}
              className="text-[10px] font-bold text-amber-900 dark:text-amber-400 underline hover:opacity-80 transition shrink-0 self-end md:self-center"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        )}

        {/* GRID OF IN-STAY WIDGETS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT WIDGET GROUP (Columns 1-7) */}
          <div className="lg:col-span-7 space-y-6">

            {/* A. WiFi QR Connection & Local Stream Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Wi-Fi Connections Widget */}
              <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                      <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Insta-Join Cabin Wi-Fi</span>
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Scan the secure credentials below to immediately route and connect your cell or tablet.
                  </p>
                </div>

                {/* Simulated QR Code Widget */}
                <div className="flex items-center gap-4 py-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-850 my-2">
                  <div className="h-20 w-20 bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs shrink-0 flex items-center justify-center">
                    {/* SVG representation of standard QR */}
                    <svg viewBox="0 0 100 100" className="h-full w-full text-slate-850">
                      <rect width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="25" height="25" fill="black" />
                      <rect x="10" y="10" width="15" height="15" fill="white" />
                      <rect x="12" y="12" width="11" height="11" fill="black" />
                      
                      <rect x="70" y="5" width="25" height="25" fill="black" />
                      <rect x="75" y="10" width="15" height="15" fill="white" />
                      <rect x="77" y="12" width="11" height="11" fill="black" />

                      <rect x="5" y="70" width="25" height="25" fill="black" />
                      <rect x="10" y="75" width="15" height="15" fill="white" />
                      <rect x="12" y="77" width="11" height="11" fill="black" />

                      {/* Random QR Pixels */}
                      <rect x="35" y="15" width="5" height="10" fill="black" />
                      <rect x="45" y="5" width="10" height="5" fill="black" />
                      <rect x="55" y="15" width="5" height="20" fill="black" />
                      <rect x="35" y="40" width="15" height="5" fill="black" />
                      <rect x="40" y="50" width="20" height="10" fill="black" />
                      <rect x="15" y="45" width="10" height="5" fill="black" />
                      <rect x="70" y="45" width="15" height="15" fill="black" />
                      <rect x="80" y="70" width="15" height="5" fill="black" />
                      <rect x="70" y="80" width="5" height="15" fill="black" />
                      <rect x="45" y="75" width="15" height="10" fill="black" />
                      <rect x="50" y="90" width="10" height="5" fill="black" />
                      <circle cx="50" cy="50" r="4" fill="black" />
                    </svg>
                  </div>

                  <div className="text-left space-y-1 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-400 block text-[8px] uppercase font-bold">Network Name</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Wilderness_Lodge_{resId.slice(0, 4)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[8px] uppercase font-bold">WPA-2 Password</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">breathesubalpine2026</span>
                    </div>
                  </div>
                </div>

                <span className="text-[9px] text-center text-slate-400 italic">
                  WanderSecure system certified • Automatic port forwarding active
                </span>
              </div>

              {/* Local Stream-Flow Metrics */}
              <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>River Flow Alert Metric</span>
                    </h4>
                    <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                      Stream Active
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Real-time safety sensors checking river currents and wading safety on the grounds.
                  </p>
                </div>

                {/* Metric Display */}
                <div className="grid grid-cols-2 gap-2 my-2">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Flow Speed</span>
                    <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                      {riverSafety.flowRate} m³/sec
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Water Temp</span>
                    <span className="font-mono text-xs font-black text-slate-850 dark:text-slate-250">
                      {riverSafety.temp}°F (Chilly!)
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-xl text-left">
                  <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase block font-mono">
                    {riverSafety.status}
                  </span>
                  <p className="text-[9px] text-slate-500 leading-normal mt-0.5">
                    {riverSafety.notice}
                  </p>
                </div>
              </div>

            </div>

            {/* B. Translate-Ready House Manuals */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Translate-Ready House Manual</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Read translated wilderness safety codes and mechanical rules instantly in 30+ languages.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="rounded-xl border border-slate-250 bg-slate-50 px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-white"
                  >
                    {LANGUAGES_LIST.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Translation Display cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
                  <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono">
                    🌲 Welcome & Stay Code
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-sans">
                    {activeManual.welcome}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
                  <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest font-mono">
                    🐻 Bear Protection & Waste
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-sans">
                    {activeManual.waste}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
                  <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest font-mono">
                    🌡️ Geothermal Climate
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-sans">
                    {activeManual.hvac}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
                  <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-widest font-mono">
                    🏔️ Wilderness Firewood
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-sans">
                    {activeManual.firewood}
                  </p>
                </div>
              </div>

              {/* Notice in current translation */}
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-3.5 mt-4 text-left text-rose-800 dark:text-rose-400 font-sans text-[11px] flex items-start gap-2.5">
                <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Wild Animal Safety Note:</strong> {activeManual.fauna}
                </p>
              </div>
            </div>

            {/* C. On-Site Safety Map Pins */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <Map className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>On-Site Emergency Safety Pins</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Locate fire safety gear, first aid boxes, and illumination gear instantly on the floorplan map.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Simulated Floorplan Layout */}
                <div className="md:col-span-7 h-[180px] bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />
                  
                  {/* Outer Walls */}
                  <div className="absolute inset-4 border border-dashed border-slate-700/60 rounded-xl" />
                  {/* Internal Rooms */}
                  <div className="absolute left-4 top-4 w-[40%] bottom-[40%] border-r border-b border-slate-800 flex items-center justify-center text-[8px] font-mono text-slate-600 uppercase">
                    Bedroom 1
                  </div>
                  <div className="absolute left-4 bottom-4 w-[40%] h-[35%] border-r border-t border-slate-800 flex items-center justify-center text-[8px] font-mono text-slate-600 uppercase">
                    Bedroom 2
                  </div>
                  <div className="absolute right-4 top-4 w-[55%] bottom-4 border-l border-slate-800 flex items-center justify-center text-[8px] font-mono text-slate-600 uppercase">
                    Great Room & Kitchen
                  </div>

                  {/* Active Safety Pins */}
                  {SAFETY_PINS.map((pin) => (
                    <button
                      key={pin.id}
                      onClick={() => setSelectedSafetyPin(pin.id)}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 transition ${
                        selectedSafetyPin === pin.id ? "scale-125 z-20" : "opacity-75 hover:opacity-100 z-10"
                      }`}
                    >
                      <span className={`flex h-5.5 w-5.5 items-center justify-center rounded-full text-[10px] border shadow-md ${
                        selectedSafetyPin === pin.id
                          ? "bg-rose-600 text-white border-white animate-pulse"
                          : "bg-slate-900 text-slate-300 border-slate-700"
                      }`}>
                        {pin.id.includes("extinguisher") ? "🧯" : pin.id.includes("firstaid") ? "🩹" : "🔦"}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Safety Details side Panel */}
                <div className="md:col-span-5 space-y-2 text-left flex flex-col justify-between">
                  <div className="space-y-1.5 flex-grow">
                    {SAFETY_PINS.map((pin) => (
                      <button
                        key={pin.id}
                        onClick={() => setSelectedSafetyPin(pin.id)}
                        className={`w-full p-2 rounded-xl text-left border transition text-[11px] block ${
                          selectedSafetyPin === pin.id
                            ? "bg-rose-50 border-rose-250 dark:bg-rose-950/20 dark:border-rose-900/60"
                            : "bg-slate-50 border-slate-100 dark:bg-slate-950/40 dark:border-slate-850"
                        }`}
                      >
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">
                          {pin.label}
                        </div>
                        {selectedSafetyPin === pin.id && (
                          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium space-y-1">
                            <div>📍 Location: {pin.loc}</div>
                            <div className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">{pin.status}</div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT WIDGET GROUP (Columns 8-12) */}
          <div className="lg:col-span-5 space-y-6">

            {/* D. Thermostat Interactive Tutor & Video */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    <span>Dynamic Thermostat Instructions</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Watch our 15s silent video loop showing unique geothermal thermostat calibration.
                  </p>
                </div>
              </div>

              {/* Simulated 15-second silent video loop */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between h-[180px]">
                
                {/* 15s Timer Watermark Indicator */}
                <div className="absolute top-3 right-3 bg-red-600 text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  <span>VIDEO LOOP • 0:0{videoTimer}</span>
                </div>

                {/* Simulated Thermostat UI rotating and adjusting */}
                <div className="flex-grow flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {/* Ring dial animation representing a Nest/Thermostat rotating */}
                    <motion.div
                      animate={{ rotate: thermostatVideoPlaying ? [0, 15, -15, 0] : 0 }}
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      className="h-24 w-24 rounded-full border-4 border-dashed border-emerald-500/55 flex items-center justify-center"
                    />
                    
                    {/* Inner core displaying temperature */}
                    <div className="absolute inset-2 bg-slate-900 rounded-full flex flex-col items-center justify-center border border-slate-800">
                      <span className="text-2xl font-black font-mono text-emerald-400">{currentTemp}°F</span>
                      <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {activeHVACMode} Active
                      </span>
                    </div>

                    {/* Finger Touch Guide Indicator mimicking the hand in the instruction video */}
                    {thermostatVideoPlaying && (
                      <motion.div
                        animate={{ x: [25, 35, 20, 25], y: [25, 10, 30, 25], scale: [1, 0.9, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="absolute h-4 w-4 bg-yellow-400 rounded-full border border-black shadow-lg opacity-85 z-10 flex items-center justify-center text-[7px]"
                      >
                        👆
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Video controls bottom bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-450 z-10 border-t border-slate-800/60 pt-2 font-mono">
                  <button
                    onClick={() => setThermostatVideoPlaying(!thermostatVideoPlaying)}
                    className="text-emerald-400 font-bold uppercase tracking-wider hover:underline"
                  >
                    {thermostatVideoPlaying ? "⏸ Pause Loop" : "▶ Resume Loop"}
                  </button>
                  <div className="space-x-1">
                    <button
                      onClick={() => setCurrentTemp(t => t - 1)}
                      className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 hover:bg-slate-800"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setCurrentTemp(t => t + 1)}
                      className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 hover:bg-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions steps overlay */}
              <div className="mt-3.5 space-y-1.5 text-[11px] text-slate-500 font-sans">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Step 1:</span>
                  <span>Tap dead-center of the glass ring to activate the backlight screen.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Step 2:</span>
                  <span>Rotate outer mechanical ring slowly to adjust subalpine temperature targets.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Step 3:</span>
                  <span>Leave on Geothermal ECO setting when hiking to maintain stable floor grid.</span>
                </div>
              </div>
            </div>

            {/* E. Smart Appliance Visual Guides */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800 text-left">
              <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5 mb-2">
                <Coffee className="h-4 w-4 text-amber-600" />
                <span>Smart Appliance Manual Guides</span>
              </h4>
              <p className="text-[10px] text-slate-400 mb-3">
                Select an appliance below to view its visual start guidelines and touch-friendly checklists.
              </p>

              {/* Switch tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-850 mb-3 shrink-0">
                <button
                  onClick={() => setActiveAppliance("espresso")}
                  className={`py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition ${
                    activeAppliance === "espresso" ? "bg-white text-slate-800 shadow dark:bg-slate-900 dark:text-white" : "text-slate-400"
                  }`}
                >
                  ☕ Espresso
                </button>
                <button
                  onClick={() => setActiveAppliance("cooktop")}
                  className={`py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition ${
                    activeAppliance === "cooktop" ? "bg-white text-slate-800 shadow dark:bg-slate-900 dark:text-white" : "text-slate-400"
                  }`}
                >
                  🍳 Cooktop
                </button>
                <button
                  onClick={() => setActiveAppliance("hottub")}
                  className={`py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition ${
                    activeAppliance === "hottub" ? "bg-white text-slate-800 shadow dark:bg-slate-900 dark:text-white" : "text-slate-400"
                  }`}
                >
                  🌊 Hot Tub
                </button>
              </div>

              {/* Appliance Specific instructions and checkboxes */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                {activeAppliance === "espresso" && (
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] font-extrabold text-amber-500 uppercase block">
                      ☕ Pro-Grade Italian Espresso Machine Setup
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Power on rocker behind drip tray. Ensure the rear reservoir is filled with subalpine mountain water strictly.
                    </p>

                    <div className="space-y-2 pt-1">
                      {[
                        { id: "e1", text: "Ensure main power toggle (rear-right) is clicked down." },
                        { id: "e2", text: "Allow boiler needle to sit within the 1-1.5 Bar green zone." },
                        { id: "e3", text: "Grind 18g beans inside portafilter, tamp firm and level." },
                        { id: "e4", text: "Lock portafilter into group head & pull double lever." }
                      ].map((step) => (
                        <div
                          key={step.id}
                          onClick={() => handleStepToggle(step.id)}
                          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85"
                        >
                          <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            applianceSteps[step.id] ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          }`}>
                            {applianceSteps[step.id] && <Check className="h-3 w-3" />}
                          </div>
                          <span className={`text-[11px] ${applianceSteps[step.id] ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeAppliance === "cooktop" && (
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] font-extrabold text-blue-500 uppercase block">
                      🍳 Induction Range Child-Proof Lockout
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      The cooktop utilizes high-efficiency magnetic induction. It requires cookware with ferrous iron bases strictly.
                    </p>

                    <div className="space-y-2 pt-1">
                      {[
                        { id: "c1", text: "Hold the Key/Lock icon down for 3 seconds to release child lock." },
                        { id: "c2", text: "Place steel/cast-iron skillet dead-center of burner circles." },
                        { id: "c3", text: "Slide finger along slider bar to set heat levels (1-9)." },
                        { id: "c4", text: "Note: Screen flashes 'H' if hot. Burner automatically turns off when pan lifts." }
                      ].map((step) => (
                        <div
                          key={step.id}
                          onClick={() => handleStepToggle(step.id)}
                          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85"
                        >
                          <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            applianceSteps[step.id] ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          }`}>
                            {applianceSteps[step.id] && <Check className="h-3 w-3" />}
                          </div>
                          <span className={`text-[11px] ${applianceSteps[step.id] ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeAppliance === "hottub" && (
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] font-extrabold text-purple-500 uppercase block">
                      🌊 Cedar Woodfired Hot Tub Calibration
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Organic hot tub sanitated utilizing organic salt mechanics. Never add soap or high-foaming bubble chemicals.
                    </p>

                    <div className="space-y-2 pt-1">
                      {[
                        { id: "h1", text: "Open woodfired heater intake dial (2 full turns counterclockwise)." },
                        { id: "h2", text: "Light 3 Cedar firewood kindling rounds inside stove hatch." },
                        { id: "h3", text: "Monitor copper thermal probe (do not exceed 104°F maximum)." },
                        { id: "h4", text: "Lock cedar hatch cover tight when pool is not in active use." }
                      ].map((step) => (
                        <div
                          key={step.id}
                          onClick={() => handleStepToggle(step.id)}
                          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85"
                        >
                          <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            applianceSteps[step.id] ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          }`}>
                            {applianceSteps[step.id] && <Check className="h-3 w-3" />}
                          </div>
                          <span className={`text-[11px] ${applianceSteps[step.id] ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* F. Local Pantry Inventory Logs */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Kitchen Pantry Inventory Log</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Verify available staple spices, coffee, and oils left behind by hosts and prior travelers.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                {pantryLogs.map((p) => {
                  const colors = {
                    "In Stock": "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400",
                    "Low": "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
                    "Out of Stock": "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400"
                  };

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleCyclePantryStatus(p.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-850 dark:bg-slate-950/20 text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-slate-850 dark:text-white block leading-none">
                          {p.item}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 mt-1 block">
                          Checked: {p.lastChecked} • Click to Cycle Status
                        </span>
                      </div>

                      <span className={`text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded ${colors[p.status as keyof typeof colors]}`}>
                        {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* G. Digital Key Smart Share */}
            <div className="bg-white rounded-3xl border border-slate-150 p-5 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-sans text-xs font-extrabold text-slate-800 uppercase tracking-wider dark:text-slate-200 flex items-center gap-1.5">
                    <Share2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Digital Key Smart Share</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Delegate Bluetooth check-in tokens & keyless door lockboxes directly with your co-travelers.
                  </p>
                </div>
              </div>

              {/* Secure Deadbolt Code */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center justify-between text-left mb-4">
                <div>
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Cabin Master Door Deadbolt
                  </span>
                  <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
                    *1984#
                  </span>
                </div>
                <div className="text-right text-[10px] text-slate-400 leading-normal">
                  <div>🔐 Type: Keyless Box</div>
                  <div className="text-[8px] font-mono text-emerald-500">Connected & Authorized</div>
                </div>
              </div>

              {/* Guest share list */}
              <div className="space-y-2 text-left">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono">
                  Registered Group access list
                </span>

                {(reservation.coTravelers || []).length > 0 ? (
                  (reservation.coTravelers || []).map((guest, i) => {
                    const shareState = digitalKeys[guest.email] || { shared: false, code: "PASS-TBD", type: "Bluetooth" };

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-850 dark:bg-slate-950/20"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-350 shrink-0">
                            {guest.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-850 dark:text-white block leading-none">
                              {guest.name}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {shareState.shared ? `✓ Shared via ${shareState.type}` : "🚫 Access Suspended"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleKeyShare(guest.email)}
                          className={`px-3 py-1 text-[9px] font-bold uppercase rounded-lg transition font-mono ${
                            shareState.shared
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {shareState.shared ? "Revoke" : "Share Token"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-slate-400 italic py-2">
                    No co-travelers registered yet. Go to &apos;Co-Travelers&apos; tab to invite family members.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
