"use client";

import { useState } from "react";
import { Leaf, Award, Zap, Trees, Calendar, ChevronRight, Activity, ArrowUpRight } from "lucide-react";

interface EcoDashboardProps {
  personalNights?: number;
  personalCO2Offset?: number;
}

export default function EcoCommunityDashboard({
  personalNights = 4,
  personalCO2Offset = 18.2,
}: EcoDashboardProps) {
  const [activeTab, setActiveTab] = useState<"community" | "personal">("community");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"all" | "year" | "month">("all");

  // Community metrics
  const communityStats = {
    all: { nights: 1842, co2: 8930.5, trees: 4465, ev: 642, offsetRate: "94%" },
    year: { nights: 1102, co2: 5410.2, trees: 2705, ev: 395, offsetRate: "96%" },
    month: { nights: 248, co2: 1210.8, trees: 605, ev: 92, offsetRate: "98%" },
  };

  const currentStats = communityStats[selectedTimeframe];

  // Personal badges
  const badges = [
    { name: "Forest Guardian", desc: "Offset > 10kg CO2", icon: Trees, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400" },
    { name: "Tesla of the Trail", desc: "Booked EV charger stay", icon: Zap, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400" },
    { name: "Leave No Trace", desc: "Signed Wilderness Pledge", icon: Award, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400" },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-850">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Leaf className="h-5 w-5 animate-pulse" />
            </span>
            <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
              GreenTravel Impact Center
            </h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Real-time low-impact metrics of the WanderLodge Wilderness Network
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("community")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "community"
                ? "bg-white dark:bg-slate-850 text-emerald-800 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "personal"
                ? "bg-white dark:bg-slate-850 text-emerald-800 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Personal Share
          </button>
        </div>
      </div>

      {activeTab === "community" ? (
        <div className="space-y-6">
          {/* Timeframe Selectors */}
          <div className="flex gap-2">
            {(["all", "year", "month"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTimeframe(t)}
                className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border transition-all ${
                  selectedTimeframe === t
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-transparent border-slate-200 dark:border-slate-850 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {t === "all" ? "All Time" : t === "year" ? "This Year" : "This Month"}
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Green Nights</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white block mt-1">
                {currentStats.nights}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center mt-0.5">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +14% growth
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">CO2 Offset</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white block mt-1">
                {currentStats.co2.toLocaleString()} kg
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                Preserved forest canopy
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Seedlings Funded</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white block mt-1">
                {currentStats.trees}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center mt-0.5">
                <Trees className="h-3.5 w-3.5 mr-0.5" /> 100% planted
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pledge Adherence</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white block mt-1">
                {currentStats.offsetRate}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Eco-pledge verification
              </span>
            </div>
          </div>

          {/* Visual SVG Chart of Monthly CO2 Savings */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span>Monthly CO2 Mitigation Trend (kg CO2e)</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">LIVE CLIMATE FEED</span>
            </div>
            
            <div className="h-32 w-full flex items-end gap-2 sm:gap-4 pt-4 px-2">
              {[
                { month: "Jan", val: 320 },
                { month: "Feb", val: 410 },
                { month: "Mar", val: 590 },
                { month: "Apr", val: 780 },
                { month: "May", val: 950 },
                { month: "Jun", val: 1210 },
              ].map((item, idx) => {
                const maxVal = 1300;
                const pct = (item.val / maxVal) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full group">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg flex-grow flex items-end overflow-hidden">
                      <div
                        style={{ height: `${pct}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 transition-all rounded-t-md relative cursor-help"
                        title={`${item.val} kg CO2e saved`}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
                          {item.val} kg
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Specific Eco summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-5 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                Your Footprint Level
              </span>
              <span className="text-2xl font-extrabold text-emerald-950 dark:text-white block leading-none">
                Eco Pioneer
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-2">
                Streak: <span className="font-bold text-emerald-700 dark:text-emerald-400">3 stays</span> this year
              </span>

              <div className="mt-4 flex justify-center">
                <div className="h-14 w-14 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 ring-4 ring-emerald-100 dark:ring-emerald-950/60">
                  <Leaf className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Traveler stats */}
            <div className="md:col-span-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Green Nights Stayed</span>
                <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 block">
                  {personalNights} nights
                </span>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  100% offset via eco-pledge matching
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">CO2 Offset Contributed</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {personalCO2Offset} kg
                </span>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  Equivalent to <span className="font-bold text-emerald-700 dark:text-emerald-400">9 tree-years</span>
                </span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-3 uppercase tracking-wider">
              Earned Badges
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.name}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40"
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-800 dark:text-white">{b.name}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
