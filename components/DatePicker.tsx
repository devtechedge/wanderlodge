"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DatePickerProps {
  startDate: string;
  endDate: string;
  onDatesChange: (start: string, end: string) => void;
  placeholderStart?: string;
  placeholderEnd?: string;
}

export default function DatePicker({
  startDate,
  endDate,
  onDatesChange,
  placeholderStart = "Add check-in date",
  placeholderEnd = "Add check-out date",
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Manage Calendar View State (Default to current month & year)
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Close calendar on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const clickedStr = formatDateString(clickedDate);

    if (!startDate || (startDate && endDate)) {
      onDatesChange(clickedStr, "");
    } else {
      const start = new Date(startDate);
      if (clickedDate < start) {
        onDatesChange(clickedStr, "");
      } else {
        onDatesChange(startDate, clickedStr);
        setShowCalendar(false); // Close calendar on full selection
      }
    }
  };

  const isSelected = (day: number) => {
    const dStr = formatDateString(new Date(currentYear, currentMonth, day));
    return dStr === startDate || dStr === endDate;
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const d = new Date(currentYear, currentMonth, day);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return d > start && d < end;
  };

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day, 23, 59, 59);
    return d < today;
  };

  // Generate blank leading days
  const blankDays = Array.from({ length: firstDay }, (_, i) => i);
  // Generate active calendar days
  const activeDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div ref={containerRef} id="datepicker-container" className="relative w-full">
      {/* Target Triggers */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => setShowCalendar(true)}
          className="flex flex-col items-start px-4 py-2.5 text-left rounded-xl transition hover:bg-white dark:hover:bg-slate-900"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Check-In
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate w-full">
            {startDate ? new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : placeholderStart}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowCalendar(true)}
          className="flex flex-col items-start px-4 py-2.5 text-left rounded-xl transition hover:bg-white dark:hover:bg-slate-900 border-l border-slate-200/50 dark:border-slate-800/50"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Check-Out
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate w-full">
            {endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : placeholderEnd}
          </span>
        </button>
      </div>

      {/* Calendar Dropdown UI */}
      {showCalendar && (
        <div
          id="datepicker-dropdown"
          className="absolute left-0 mt-2 z-50 w-[320px] rounded-3xl border border-slate-150 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:w-[350px]"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {months[currentMonth]} {currentYear}
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Select reservation range
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="rounded-xl border border-slate-100 p-1.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded-xl border border-slate-100 p-1.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => onDatesChange("", "")}
                  className="ml-1 rounded-xl bg-slate-50 p-1.5 hover:bg-red-50 hover:text-red-600 dark:bg-slate-850 dark:hover:bg-red-950/20"
                  title="Clear selection"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Calendar Grid Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center py-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {blankDays.map((_, idx) => (
              <div key={`blank-${idx}`} className="h-9 w-9" />
            ))}

            {activeDays.map((day) => {
              const disabled = isPast(day);
              const selected = isSelected(day);
              const highlighted = isInRange(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  className={`h-9 w-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                    selected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 dark:bg-emerald-500"
                      : highlighted
                      ? "bg-emerald-50 text-emerald-800 rounded-none dark:bg-emerald-950/30 dark:text-emerald-400"
                      : disabled
                      ? "text-slate-300 dark:text-slate-700 cursor-not-allowed line-through"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Calendar Helper Info */}
          <div className="mt-4 border-t border-slate-100 pt-3 text-center dark:border-slate-800">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {startDate && !endDate && "Select check-out date"}
              {!startDate && "Choose your check-in date"}
              {startDate && endDate && `Selected ${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} nights`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
