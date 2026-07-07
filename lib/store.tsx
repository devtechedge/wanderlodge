"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Wishlist } from "./db";

interface SearchQuery {
  location: string;
  guests: number;
  minPrice: number;
  maxPrice: number;
  selectedAmenities: string[];
  startDate: string;
  endDate: string;
}

interface StoreContextType {
  currentUser: User | null;
  loadingUser: boolean;
  theme: "light" | "dark";
  wishlists: any[];
  searchQuery: SearchQuery;
  activeChatId: string | null;
  
  refreshSession: () => Promise<void>;
  switchRole: () => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  setSearchQuery: (query: Partial<SearchQuery>) => void;
  resetSearchQuery: () => void;
  refreshWishlists: () => Promise<void>;
  setActiveChatId: (id: string | null) => void;
}

const defaultSearchQuery: SearchQuery = {
  location: "",
  guests: 1,
  minPrice: 0,
  maxPrice: 600,
  selectedAmenities: [],
  startDate: "",
  endDate: "",
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setQuery] = useState<SearchQuery>(defaultSearchQuery);

  const applyTheme = (t: "light" | "dark") => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    const body = window.document.body;
    if (t === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
      if (body) {
        body.classList.remove("light");
        body.classList.add("dark");
      }
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      if (body) {
        body.classList.remove("dark");
        body.classList.add("light");
      }
    }
  };

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user || null);
      }
    } catch (e) {
      console.error("Failed to load session", e);
    } finally {
      setLoadingUser(false);
    }
  };

  const refreshWishlists = async () => {
    try {
      const res = await fetch("/api/wishlists");
      if (res.ok) {
        const data = await res.json();
        setWishlists(data.wishlists || []);
      }
    } catch (e) {
      console.error("Failed to fetch wishlists", e);
    }
  };

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("wanderlodge_theme") as "light" | "dark" | null;
    // Base application layer boots directly into Light Mode by default (enableSystem=false)
    const initialTheme = savedTheme || "light";
    Promise.resolve().then(() => {
      setTheme(initialTheme);
      applyTheme(initialTheme);
    });
  }, []);

  // Initialize User Session
  useEffect(() => {
    Promise.resolve().then(() => {
      refreshSession();
    });
  }, []);

  // Fetch Wishlists when user changes
  useEffect(() => {
    if (currentUser) {
      Promise.resolve().then(() => {
        refreshWishlists();
      });
    } else {
      Promise.resolve().then(() => {
        setWishlists([]);
      });
    }
  }, [currentUser]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("wanderlodge_theme", nextTheme);
    applyTheme(nextTheme);
  };

  const switchRole = async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch-role" }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error("Failed to switch role", e);
    }
  };

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/session", { method: "DELETE" });
      if (res.ok) {
        setCurrentUser(null);
        setActiveChatId(null);
      }
    } catch (e) {
      console.error("Failed to log out", e);
    }
  };

  const setSearchQuery = (newQuery: Partial<SearchQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  };

  const resetSearchQuery = () => {
    setQuery(defaultSearchQuery);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        loadingUser,
        theme,
        wishlists,
        searchQuery,
        activeChatId,
        refreshSession,
        switchRole,
        logout,
        toggleTheme,
        setSearchQuery,
        resetSearchQuery,
        refreshWishlists,
        setActiveChatId,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
