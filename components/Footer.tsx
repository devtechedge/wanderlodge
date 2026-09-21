"use client";

import Link from "next/link";
import { Compass, ShieldCheck, HelpCircle, Flame, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer id="main-footer" className="border-t border-border bg-card/80 py-12 transition-colors backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-[var(--glow-brand)]">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Wander<span className="text-brand">Lodge</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bespoke architectural sanctuaries and private adventures. Experience wilderness lodgings with absolute peace of mind.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Global Marketplace</span>
            </div>
          </div>

          {/* Guarantee Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground mb-4">Wander Guarantee</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-foreground">WanderGuarantee</span>
                  <span className="text-[10px] text-muted-foreground">24/7 protection against sudden host cancellations.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Flame className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-foreground">EliteProvider Standard</span>
                  <span className="text-[10px] text-muted-foreground">Rigorous inspection and premium wilderness checklist.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Discovery Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground mb-4">Local Adventures</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Alpine Chalets
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Forest Treehouses
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Sunset Waterfronts
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Custom Expeditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground mb-4">Assistance</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  Wander Support Desk
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Safety Protocol
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Provider Guidelines
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Cancel Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground uppercase">
            © 2026 WANDERLODGE GLOBAL MARKETPLACE INC. ALL SANCTUARIES RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
