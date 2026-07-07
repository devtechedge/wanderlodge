"use client";

import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Compass, MapPin, Navigation } from "lucide-react";
import { Property } from "@/lib/db";

interface InteractiveMapProps {
  properties: Property[];
  selectedPropertyId: string | null;
  onSelectProperty: (id: string | null) => void;
  onVisiblePropertiesChange?: (visibleIds: string[]) => void;
}

// Coordinate boundaries of our "Wander Valley" canvas map
const MIN_LAT = 45.05;
const MAX_LAT = 45.27;
const MIN_LNG = -121.75;
const MAX_LNG = -121.45;

// Map resizing helper to maintain coordinate bounds
const getCoordinatesPct = (lat: number, lng: number) => {
  // Math to convert geographical coords to percentage of our visual coordinate space
  const xPct = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
  const yPct = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100; // inverted Y
  return { x: xPct, y: yPct };
};

export default function InteractiveMap({
  properties,
  selectedPropertyId,
  onSelectProperty,
  onVisiblePropertiesChange,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Pan Offset and Zoom Level States
  const [zoom, setZoom] = useState(1.15);
  const [panOffset, setPanOffset] = useState({ x: -20, y: -20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Drag-to-pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Double Click Zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(z + 0.3, 3));
  };

  // Zoom Controllers
  const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 3.5));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.8));

  // Determine Bounding Box in coordinates space based on current pan and zoom
  useEffect(() => {
    if (!mapRef.current) return;
    const { width, height } = mapRef.current.getBoundingClientRect();

    // Map Center in SVG percentages
    const svgWidth = 800; // coordinate reference widths
    const svgHeight = 600;

    // Relative boundaries based on panOffset & zoom
    // Center of map is (svgWidth / 2)
    // Compute what portion of the coordinates are currently visible inside the viewport bounds
    const visibleWidthPct = (width / (svgWidth * zoom)) * 100;
    const visibleHeightPct = (height / (svgHeight * zoom)) * 100;

    const centerXPercent = 50 - (panOffset.x / (svgWidth * zoom)) * 100;
    const centerYPercent = 50 - (panOffset.y / (svgHeight * zoom)) * 100;

    const minXVisible = centerXPercent - visibleWidthPct / 2;
    const maxXVisible = centerXPercent + visibleWidthPct / 2;
    const minYVisible = centerYPercent - visibleHeightPct / 2;
    const maxYVisible = centerYPercent + visibleHeightPct / 2;

    // Convert SVG percentages back to Lat/Lng
    const visibleMinLng = MIN_LNG + (minXVisible / 100) * (MAX_LNG - MIN_LNG);
    const visibleMaxLng = MIN_LNG + (maxXVisible / 100) * (MAX_LNG - MIN_LNG);
    // Y is inverted
    const visibleMaxLat = MAX_LAT - (minYVisible / 100) * (MAX_LAT - MIN_LAT);
    const visibleMinLat = MAX_LAT - (maxYVisible / 100) * (MAX_LAT - MIN_LAT);

    // Filter properties that fall inside these coordinates bounds
    const visibleProperties = properties.filter((p) => {
      return (
        p.lat >= visibleMinLat &&
        p.lat <= visibleMaxLat &&
        p.lng >= visibleMinLng &&
        p.lng <= visibleMaxLng
      );
    });

    if (onVisiblePropertiesChange) {
      onVisiblePropertiesChange(visibleProperties.map((p) => p.id));
    }
  }, [panOffset, zoom, properties, onVisiblePropertiesChange]);

  // Handle auto-panning to selected lodge
  useEffect(() => {
    if (selectedPropertyId) {
      const selectedProp = properties.find((p) => p.id === selectedPropertyId);
      if (selectedProp) {
        const { x, y } = getCoordinatesPct(selectedProp.lat, selectedProp.lng);
        // Position the selected pin in the center of the map
        // SVG size is 800x600, so center is 400x300
        const targetX = 400 - (x / 100) * 800 * zoom;
        const targetY = 300 - (y / 100) * 600 * zoom;
        Promise.resolve().then(() => {
          setPanOffset({ x: targetX, y: targetY });
        });
      }
    }
  }, [selectedPropertyId, properties, zoom]);

  return (
    <div
      ref={mapRef}
      id="interactive-map-frame"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onDoubleClick={handleDoubleClick}
      className={`relative w-full h-full overflow-hidden select-none bg-[#E0F2FE] dark:bg-[#0B132B] transition-colors ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* Map Content Wrapper (panned and zoomed) */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="absolute left-1/2 top-1/2 -ml-[400px] -mt-[300px] w-[800px] h-[600px]"
      >
        {/* SVG Geographical Visual Elements */}
        <svg
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full text-slate-300 dark:text-slate-800"
        >
          {/* Water Bodies (Lake Sunset Bay) */}
          <path
            d="M 50 120 Q 180 80 320 180 T 580 120 Q 700 180 750 350 T 520 520 Q 300 480 150 550 Z"
            fill="#BAE6FD"
            className="dark:fill-[#122A47] transition-colors duration-300"
          />
          {/* Creek */}
          <path
            d="M 320 180 Q 280 250 220 280 T 150 450"
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="12"
            strokeLinecap="round"
            className="dark:stroke-[#122A47] transition-colors duration-300"
          />

          {/* Mountains Visual Group */}
          <g className="opacity-40 dark:opacity-25 text-slate-400 dark:text-slate-700">
            {/* Mountain peaks */}
            <polygon points="100,200 130,150 160,200" fill="currentColor" />
            <polygon points="140,220 180,140 220,220" fill="currentColor" />
            <polygon points="620,180 660,110 700,180" fill="currentColor" />
            <polygon points="680,220 730,130 780,220" fill="currentColor" />
            <polygon points="400,80 440,30 480,80" fill="currentColor" />
          </g>

          {/* Forests Visual Outline */}
          <path
            d="M 50 320 C 120 300, 180 350, 150 420 C 100 480, 40 420, 50 320 Z"
            fill="#D1FAE5"
            className="dark:fill-[#0C241B] opacity-40 dark:opacity-30 transition-colors"
          />
          <path
            d="M 600 380 C 680 350, 750 380, 720 460 C 650 520, 580 460, 600 380 Z"
            fill="#D1FAE5"
            className="dark:fill-[#0C241B] opacity-40 dark:opacity-30 transition-colors"
          />

          {/* Core Street Grid Lines */}
          <g stroke="currentColor" strokeWidth="1.5" className="text-slate-200 dark:text-slate-800/60 opacity-60">
            {/* Major Highways */}
            <line x1="0" y1="280" x2="800" y2="280" strokeWidth="4" />
            <line x1="450" y1="0" x2="450" y2="600" strokeWidth="4" />

            {/* Connecting Roads */}
            <line x1="120" y1="0" x2="120" y2="600" />
            <line x1="680" y1="0" x2="680" y2="600" />
            <line x1="0" y1="150" x2="800" y2="150" />
            <line x1="0" y1="480" x2="800" y2="480" />
          </g>

          {/* Grid Accents */}
          <g className="text-slate-400/40 dark:text-slate-600/20 font-mono text-[9px]">
            <text x="10" y="20">GRID REF: ZONE W-1</text>
            <text x="700" y="580">WANDER VALLEY</text>
          </g>
        </svg>

        {/* Dynamic Pins Container */}
        {properties.map((p) => {
          const { x, y } = getCoordinatesPct(p.lat, p.lng);
          const isSelected = p.id === selectedPropertyId;

          return (
            <div
              key={p.id}
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              {/* Pulsing Highlight Pin */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProperty(p.id);
                }}
                className={`relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group ${
                  isSelected ? "z-20 scale-110" : "z-10"
                }`}
              >
                {/* Ping Ring */}
                {isSelected && (
                  <span className="absolute inline-flex h-12 w-12 rounded-full bg-emerald-500/30 animate-ping" />
                )}

                {/* Pin Card */}
                <div
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-sans text-[11px] font-bold shadow-lg border transition-all ${
                    isSelected
                      ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500 scale-105"
                      : "bg-white border-slate-150 text-slate-800 hover:border-emerald-400 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  }`}
                >
                  <MapPin className={`h-3 w-3 shrink-0 ${isSelected ? "text-amber-300 animate-bounce" : "text-emerald-500"}`} />
                  <span>${p.price}</span>
                </div>

                {/* Hover Tooltip card */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform origin-top z-30 pointer-events-none bg-slate-950 text-white rounded-xl px-3 py-1.5 shadow-xl w-40 text-center text-[10px] font-semibold border border-slate-800">
                  <p className="truncate font-sans font-bold">{p.title}</p>
                  <p className="text-slate-400 text-[9px] mt-0.5">{p.location}</p>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Map Control Overlays */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-25">
        <button
          onClick={zoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md border border-slate-150 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={zoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md border border-slate-150 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1.15);
            setPanOffset({ x: -20, y: -20 });
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md border border-slate-150 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
          title="Reset View"
        >
          <Navigation className="h-4 w-4 text-emerald-500 transform rotate-45" />
        </button>
      </div>

      {/* Status Overlay */}
      <div className="absolute top-4 left-4 rounded-xl bg-white/90 backdrop-blur-sm px-3 py-2 text-[10px] font-bold font-mono tracking-wider text-slate-500 uppercase border border-slate-150 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-400 pointer-events-none flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Wander Canvas Engine v1.2</span>
      </div>
    </div>
  );
}
