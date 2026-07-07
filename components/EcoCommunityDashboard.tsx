"use client";

import { useState } from "react";
import { Leaf, Award, ShieldCheck, HelpCircle, HeartHandshake } from "lucide-react";

export default function EcoCommunityDashboard() {
  const [activeTab, setActiveTab] = useState<"impact" | "energy">("impact");

  return (
    <div id="eco-community-dashboard" className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Leaf className="h-4.5 w-4.5" />
            </span>
            <h2 className="font-sans text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Eco-Community Registry & Impact Diagnostics
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time verified environmental performance and subalpine community investment logs.
          </p>
        </div>

        {/* Tab selection */}
        <div className="inline-flex rounded-xl bg-slate-50 p-1 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
          <button
            onClick={() => setActiveTab("impact")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "impact"
                ? "bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
            }`}
          >
            Regional Impact
          </button>
          <button
            onClick={() => setActiveTab("energy")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "energy"
                ? "bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
            }`}
          >
            Grid & Heat Mechanics
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="mt-6">
        {activeTab === "impact" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1 */}
            <div className="space-y-2 p-4 rounded-2xl bg-emerald-50/20 border border-emerald-100/10 dark:bg-emerald-950/5">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span>CO2 Offset (Certified)</span>
                <Award className="h-4 w-4" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-white">
                4,210 <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct savings compared to typical mountain cabins through clean geothermal pumps, LED zoning, and high R-value insulation panels.
              </p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-2 p-4 rounded-2xl bg-indigo-50/20 border border-indigo-100/10 dark:bg-indigo-950/5">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                <span>Preservation Funding</span>
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-white">
                1% <span className="text-xs font-normal text-slate-400">reinvested</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Every reservation funds local subalpine forest fire prevention lines, high-altitude trail rehabilitation, and non-invasive wildlife trackers.
              </p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-2 p-4 rounded-2xl bg-amber-50/20 border border-amber-100/10 dark:bg-amber-950/5">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>Provider Compliance</span>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-white">
                100% <span className="text-xs font-normal text-slate-400">verified</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Our EliteProviders commit to absolute zero-single-use plastics, toxic cleaning material restrictions, and organic local scent preservation guidelines.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Energy Mix Detail */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-350">
                <span>Renewable Energy Share</span>
              </div>
              <div className="flex items-baseline gap-1 text-2xl font-black text-slate-800 dark:text-white">
                87.4%
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "87.4%" }} />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Propelled by micro-hydro streams and active solar tracking batteries on remote high alpine ridge roofs.
              </p>
            </div>

            {/* Waste Prevention */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-350">
                <span>Composting & Recycling</span>
              </div>
              <div className="flex items-baseline gap-1 text-2xl font-black text-slate-800 dark:text-white">
                98%
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "98%" }} />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Bear-proof outdoor mechanical compost bins actively separate raw food components, returning trace nitrogen back to regional soil beds.
              </p>
            </div>

            {/* Smart Charging Nodes */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-350">
                <span>EV Grid Integration</span>
              </div>
              <div className="flex items-baseline gap-1 text-2xl font-black text-slate-800 dark:text-white">
                Level 2 <span className="text-xs font-normal text-slate-400">zoning</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "70%" }} />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Fast car charging ports utilize surplus diurnal energy, maintaining local subalpine utility grid stability.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
