"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Type, 
  Eye, 
  Volume2, 
  VolumeX, 
  X, 
  Activity, 
  Check, 
  HelpCircle, 
  RefreshCw,
  Sparkles
} from "lucide-react";

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Accessibility state variables with lazy initialization
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">(() => {
    if (typeof window === "undefined") return "normal";
    return (localStorage.getItem("acc_font_size") as "normal" | "large" | "xlarge") || "normal";
  });
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("acc_high_contrast") === "true";
  });
  const [dyslexicFont, setDyslexicFont] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("acc_dyslexic_font") === "true";
  });
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("acc_tts_enabled") === "true";
  });
  const [calmMode, setCalmMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("acc_calm_mode") === "true";
  });

  // Helper functions to apply changes to document elements
  const applyFontSize = (size: "normal" | "large" | "xlarge") => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (size === "normal") {
      root.style.fontSize = "100%";
    } else if (size === "large") {
      root.style.fontSize = "112.5%"; // Increases base font size across the app
    } else if (size === "xlarge") {
      root.style.fontSize = "125%"; // 25% bigger base text
    }
  };

  const applyHighContrast = (enabled: boolean) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (enabled) {
      root.classList.add("accessible-high-contrast");
    } else {
      root.classList.remove("accessible-high-contrast");
    }
  };

  const applyDyslexicFont = (enabled: boolean) => {
    if (typeof window === "undefined") return;
    const body = document.body;
    if (enabled) {
      body.classList.add("accessible-dyslexic-font");
    } else {
      body.classList.remove("accessible-dyslexic-font");
    }
  };

  const applyCalmMode = (enabled: boolean) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (enabled) {
      root.classList.add("accessible-calm-mode");
    } else {
      root.classList.remove("accessible-calm-mode");
    }
  };

  // Apply initial preferences on mount
  useEffect(() => {
    applyFontSize(fontSize);
    applyHighContrast(highContrast);
    applyDyslexicFont(dyslexicFont);
    applyCalmMode(calmMode);
  }, [fontSize, highContrast, dyslexicFont, calmMode]);

  // State update handlers that also save to local storage
  const handleFontSizeChange = (size: "normal" | "large" | "xlarge") => {
    setFontSize(size);
    localStorage.setItem("acc_font_size", size);
    applyFontSize(size);
    speakText(`Font size set to ${size === "normal" ? "normal" : size === "large" ? "large" : "extra large"}`);
  };

  const toggleHighContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    localStorage.setItem("acc_high_contrast", String(newVal));
    applyHighContrast(newVal);
    speakText(`High contrast mode ${newVal ? "enabled" : "disabled"}`);
  };

  const toggleDyslexicFont = () => {
    const newVal = !dyslexicFont;
    setDyslexicFont(newVal);
    localStorage.setItem("acc_dyslexic_font", String(newVal));
    applyDyslexicFont(newVal);
    speakText(`High legibility readability font ${newVal ? "enabled" : "disabled"}`);
  };

  const toggleTts = () => {
    const newVal = !ttsEnabled;
    setTtsEnabled(newVal);
    localStorage.setItem("acc_tts_enabled", String(newVal));
    if (newVal) {
      speakText("Voice Hover Assistant enabled. Hover over items to hear them.");
    } else {
      speakText("Voice Hover Assistant disabled.");
    }
  };

  const toggleCalmMode = () => {
    const newVal = !calmMode;
    setCalmMode(newVal);
    localStorage.setItem("acc_calm_mode", String(newVal));
    applyCalmMode(newVal);
    speakText(`Cognitive focus mode ${newVal ? "enabled" : "disabled"}`);
  };

  const resetAll = () => {
    setFontSize("normal");
    setHighContrast(false);
    setDyslexicFont(false);
    setTtsEnabled(false);
    setCalmMode(false);

    localStorage.removeItem("acc_font_size");
    localStorage.removeItem("acc_high_contrast");
    localStorage.removeItem("acc_dyslexic_font");
    localStorage.removeItem("acc_tts_enabled");
    localStorage.removeItem("acc_calm_mode");

    applyFontSize("normal");
    applyHighContrast(false);
    applyDyslexicFont(false);
    applyCalmMode(false);

    speakText("All accessibility settings reset to default.");
  };

  // Simple clean voice synthesis helper
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Cancel current audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Set up hover-to-speech event listeners dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHover = (e: MouseEvent) => {
      if (!ttsEnabled) return;
      const target = e.target as HTMLElement;
      if (!target) return;

      // Only read interactive elements, headers, or elements with explicit aria labels
      const clickable = target.closest("button, a, input, select, textarea, h1, h2, h3, h4, h5, [role='button']");
      if (clickable) {
        let textToSpeak = "";
        
        // Use aria-label, standard title, placeholder, or innerText
        if (clickable.getAttribute("aria-label")) {
          textToSpeak = clickable.getAttribute("aria-label") || "";
        } else if (clickable.getAttribute("placeholder")) {
          textToSpeak = "Input field. " + (clickable.getAttribute("placeholder") || "");
        } else if (clickable.tagName === "A") {
          textToSpeak = "Link. " + (clickable.textContent || "");
        } else if (clickable.tagName === "BUTTON") {
          textToSpeak = "Button. " + (clickable.textContent || "");
        } else {
          textToSpeak = clickable.textContent || "";
        }

        // Limit length to avoid massive speech cycles
        if (textToSpeak && textToSpeak.length < 200) {
          speakText(textToSpeak.trim());
        }
      }
    };

    document.addEventListener("mouseover", handleHover);
    return () => {
      document.removeEventListener("mouseover", handleHover);
    };
  }, [ttsEnabled]);

  return (
    <>
      {/* Global CSS injection for Accessibility overrides */}
      <style jsx global>{`
        /* High Contrast overrides matching WCAG AAA requirements */
        .accessible-high-contrast {
          --bg-slate-50: #ffffff !important;
          --bg-white: #ffffff !important;
          --bg-slate-100: #ffffff !important;
          --bg-slate-900: #000000 !important;
          --bg-slate-950: #000000 !important;
          --text-slate-900: #000000 !important;
          --text-slate-800: #000000 !important;
          --text-slate-700: #111111 !important;
          --text-slate-600: #111111 !important;
          --text-slate-500: #222222 !important;
          --text-slate-400: #222222 !important;
          color-scheme: light !important;
        }

        .accessible-high-contrast body,
        .accessible-high-contrast main,
        .accessible-high-contrast section,
        .accessible-high-contrast div,
        .accessible-high-contrast nav,
        .accessible-high-contrast footer {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #000000 !important;
          box-shadow: none !important;
        }

        .accessible-high-contrast p,
        .accessible-high-contrast span,
        .accessible-high-contrast h1,
        .accessible-high-contrast h2,
        .accessible-high-contrast h3,
        .accessible-high-contrast h4,
        .accessible-high-contrast h5,
        .accessible-high-contrast label {
          color: #000000 !important;
          font-weight: 700 !important;
        }

        .accessible-high-contrast button,
        .accessible-high-contrast a,
        .accessible-high-contrast input,
        .accessible-high-contrast select {
          background-color: #ffffff !important;
          color: #000000 !important;
          border: 3px solid #000000 !important;
          font-weight: 800 !important;
          border-radius: 4px !important;
        }

        .accessible-high-contrast button:hover,
        .accessible-high-contrast a:hover {
          background-color: #000000 !important;
          color: #ffffff !important;
        }

        /* Dyslexia-Friendly Readable Font overrides */
        .accessible-dyslic-font-applied,
        .accessible-dyslexic-font,
        .accessible-dyslexic-font * {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          line-height: 1.85 !important;
          letter-spacing: 0.05em !important;
          word-spacing: 0.12em !important;
        }

        /* Calm Mode - stops complex transitions/gradients/clutter */
        .accessible-calm-mode * {
          animation: none !important;
          transition: none !important;
          background-image: none !important;
        }
        .accessible-calm-mode .animate-pulse,
        .accessible-calm-mode .animate-bounce,
        .accessible-calm-mode .animate-spin {
          animation: none !important;
        }
      `}</style>

      {/* Floating Widget Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3 w-80 rounded-3xl bg-white p-5 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Universal Comfort Settings
                    </h4>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">
                      Senior & accessible reading helpers
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Close accessibility controls"
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Controls List */}
              <div className="space-y-4 font-sans text-xs">
                
                {/* 1. Global Font Size */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Type className="h-3.5 w-3.5" />
                    <span>Lodge Font Booster</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                    {(["normal", "large", "xlarge"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => handleFontSizeChange(size)}
                        className={`py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                          fontSize === size
                            ? "bg-white dark:bg-slate-850 text-emerald-800 dark:text-emerald-400 shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                        }`}
                      >
                        {size === "normal" ? "Standard" : size === "large" ? "Medium +" : "Extra Large"}
                      </button>
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    Enlarges site fonts to avoid strain for seniors and visually impaired readers.
                  </span>
                </div>

                {/* 2. High Contrast View */}
                <div className="flex items-start justify-between gap-4 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                      <Eye className="h-4 w-4 text-emerald-600" />
                      <span>High Contrast Mode</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      WCAG AAA compliance. Strips soft gradients for maximum solid contrast.
                    </p>
                  </div>
                  <button
                    onClick={toggleHighContrast}
                    className={`h-6 w-11 rounded-full p-0.5 transition-all ${
                      highContrast ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-all shadow-sm ${
                        highContrast ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Dyslexia Readability Font */}
                <div className="flex items-start justify-between gap-4 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                      <Type className="h-4 w-4 text-emerald-600" />
                      <span>Legibility Spacing</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      Generous line spacing & heavy letters to bolster reading flow.
                    </p>
                  </div>
                  <button
                    onClick={toggleDyslexicFont}
                    className={`h-6 w-11 rounded-full p-0.5 transition-all ${
                      dyslexicFont ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-all shadow-sm ${
                        dyslexicFont ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Text-to-Speech Assistant */}
                <div className="flex items-start justify-between gap-4 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                      {ttsEnabled ? (
                        <Volume2 className="h-4 w-4 text-emerald-600 animate-bounce" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-slate-400" />
                      )}
                      <span>Voice Hover Assistant</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      Reads buttons, headlines, and prices out loud as you hover or touch.
                    </p>
                  </div>
                  <button
                    onClick={toggleTts}
                    className={`h-6 w-11 rounded-full p-0.5 transition-all ${
                      ttsEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-all shadow-sm ${
                        ttsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Cognitive Calm Mode */}
                <div className="flex items-start justify-between gap-4 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      <span>Cognitive Calm Mode</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      Halts animations and visual motions for sensory comfort.
                    </p>
                  </div>
                  <button
                    onClick={toggleCalmMode}
                    className={`h-6 w-11 rounded-full p-0.5 transition-all ${
                      calmMode ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-all shadow-sm ${
                        calmMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Reset Controls footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Intergenerational Helpers</span>
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset to Standard</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating trigger button */}
        <button
          onClick={() => {
            const nextState = !isOpen;
            setIsOpen(nextState);
            if (nextState) {
              speakText("Accessibility options opened.");
            }
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-transform active:scale-95 border-2 border-white focus:outline-none focus:ring-4 focus:ring-emerald-500/50 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-950"
          aria-label="Universal Comfort & Accessibility Settings Panel"
          title="Comfort Settings"
          style={{ touchAction: "manipulation", minWidth: "48px", minHeight: "48px" }}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <motion.div
              animate={{ rotate: [0, 5, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <Eye className="h-6 w-6" />
            </motion.div>
          )}
        </button>
      </div>
    </>
  );
}
