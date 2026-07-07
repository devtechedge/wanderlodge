"use client";

import Link from "next/link";
import { Compass, ShieldCheck, HelpCircle, Flame, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer id="main-footer" className="border-t border-slate-200 bg-white py-12 transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white dark:bg-emerald-500">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Wander<span className="text-emerald-600 dark:text-emerald-400">Lodge</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bespoke architectural sanctuaries and private adventures. Experience wilderness lodgings with absolute peace of mind.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Globe className="h-4 w-4" />
              <span>Global Marketplace</span>
            </div>
          </div>

          {/* Guarantee Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Wander Guarantee</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">WanderGuarantee</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">24/7 protection against sudden host cancellations.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Flame className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">EliteProvider Standard</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Rigorous inspection and premium wilderness checklist.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Discovery Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Local Adventures</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                  Alpine Chalets
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                  Forest Treehouses
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                  Sunset Waterfronts
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                  Custom Expeditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Assistance</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  Wander Support Desk
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                  Safety Protocol
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                  Provider Guidelines
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium">
                  Cancel Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center dark:border-slate-800">
          <p className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            © 2026 WANDERLODGE GLOBAL MARKETPLACE INC. ALL SANCTUARIES RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
