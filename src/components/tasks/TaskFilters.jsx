import { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronDown,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ── Reusable Custom Dropdown ──────────────────────────────────────────────────
const FilterDropdown = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);
  const isActive = !!value;

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all min-w-32 justify-between
          ${
            open
              ? "border-violet-400 ring-2 ring-violet-100 bg-white text-gray-800"
              : isActive
                ? "border-violet-400 bg-violet-50 text-violet-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:text-gray-800"
          }`}
      >
        <div className="flex items-center gap-1.5">
          {isActive && selected?.dot && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${selected.dot}`} />
          )}
          <span className={isActive ? "text-violet-700" : "text-gray-400"}>
            {selected?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform ${isActive ? "text-violet-400" : "text-gray-400"} ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 min-w-44 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden">
          <div className="p-1.5">
            {options.map((opt) => {
              const isActive = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                    ${
                      isActive
                        ? "bg-violet-50 text-violet-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {opt.dot && (
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`}
                      />
                    )}
                    {opt.label}
                  </div>
                  {isActive && (
                    <Check size={14} className="text-violet-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Mini Calendar Date Range Picker ──────────────────────────────────────────
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const DateRangePicker = ({ dateRange, onChange }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { start, end } = dateRange;

  const formatLabel = () => {
    if (!start && !end) return "Pick date range";
    const fmt = (d) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (start && !end) return `From ${fmt(start)}`;
    return `${fmt(start)} – ${fmt(end)}`;
  };

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handleDayClick = (day) => {
    const clicked = new Date(year, month, day);
    if (!start || (start && end)) {
      onChange({ start: clicked, end: null });
    } else {
      if (clicked < start) {
        onChange({ start: clicked, end: start });
      } else {
        onChange({ start, end: clicked });
      }
    }
  };

  const isStart = (day) =>
    start && new Date(year, month, day).toDateString() === start.toDateString();
  const isEnd = (day) =>
    end && new Date(year, month, day).toDateString() === end.toDateString();
  const isInRange = (day) => {
    const d = new Date(year, month, day);
    const e = end || hovered;
    if (!start || !e) return false;
    const [lo, hi] = start <= e ? [start, e] : [e, start];
    return d > lo && d < hi;
  };

  const hasActive = start || end;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all
          ${
            open
              ? "border-violet-400 ring-2 ring-violet-100 bg-white text-gray-800"
              : hasActive
                ? "border-violet-300 bg-violet-50 text-violet-700"
                : "border-gray-200 bg-white text-gray-500 hover:border-violet-300 hover:text-gray-800"
          }`}
      >
        <Calendar
          size={14}
          className={hasActive ? "text-violet-500" : "text-gray-400"}
        />
        <span>{formatLabel()}</span>
        {hasActive && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange({ start: null, end: null });
            }}
            className="ml-1 text-violet-400 hover:text-violet-600 transition-colors"
          >
            <X size={12} />
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 p-4 w-72">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-gray-400 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const _isStart = isStart(day);
              const _isEnd = isEnd(day);
              const _inRange = isInRange(day);
              const today =
                new Date().toDateString() ===
                new Date(year, month, day).toDateString();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() =>
                    start && !end && setHovered(new Date(year, month, day))
                  }
                  onMouseLeave={() => setHovered(null)}
                  className={`relative h-8 w-full text-xs font-medium transition-all
                    ${_isStart || _isEnd ? "bg-violet-600 text-white rounded-lg z-10" : ""}
                    ${_inRange ? "bg-violet-100 text-violet-700 rounded-none" : ""}
                    ${!_isStart && !_isEnd && !_inRange ? "text-gray-700 hover:bg-gray-100 rounded-lg" : ""}
                    ${today && !_isStart && !_isEnd ? "font-bold underline underline-offset-2" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Shortcut presets */}
          <div className="border-t border-gray-100 mt-4 pt-3 flex flex-wrap gap-2">
            {[
              {
                label: "Today",
                fn: () => {
                  const t = new Date();
                  onChange({ start: t, end: t });
                },
              },
              {
                label: "This week",
                fn: () => {
                  const now = new Date();
                  const mon = new Date(now);
                  mon.setDate(now.getDate() - now.getDay() + 1);
                  const sun = new Date(mon);
                  sun.setDate(mon.getDate() + 6);
                  onChange({ start: mon, end: sun });
                },
              },
              {
                label: "This month",
                fn: () => {
                  const now = new Date();
                  onChange({
                    start: new Date(now.getFullYear(), now.getMonth(), 1),
                    end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
                  });
                },
              },
            ].map(({ label, fn }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  fn();
                  setOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition-colors border border-gray-200 hover:border-violet-200"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── TaskFilters Main Component ────────────────────────────────────────────────
const TaskFilters = ({
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedMemberFilter,
  setSelectedMemberFilter,
  selectedDeadlineFilter,
  setSelectedDeadlineFilter,
  dateRange,
  setDateRange,
  availableMembers,
  hasUnassigned,
  onResetFilters,
  isUser,
}) => {
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "todo", label: "To Do", dot: "bg-amber-400" },
    { value: "inprogress", label: "In Progress", dot: "bg-blue-400" },
    { value: "inreview", label: "In Review", dot: "bg-violet-400" },
    { value: "done", label: "Done", dot: "bg-emerald-400" },
  ];

  const memberOptions = [
    { value: "", label: "All Members" },
    ...(isUser ? [{ value: "my-tasks", label: "My Tasks" }] : []),
    ...(hasUnassigned ? [{ value: "unassigned", label: "Unassigned" }] : []),
    ...availableMembers.map((m) => ({ value: m.uid, label: m.displayName })),
  ];

  const deadlineOptions = [
    { value: "", label: "All Deadlines" },
    { value: "overdue", label: "🚨 Overdue", dot: "bg-red-500" },
    { value: "today", label: "⚠️ Due Today", dot: "bg-orange-400" },
    { value: "3days", label: "⏰ Next 3 Days", dot: "bg-yellow-400" },
    { value: "week", label: "📅 This Week", dot: "bg-blue-400" },
    { value: "no-deadline", label: "No Deadline", dot: "bg-gray-300" },
  ];

  const hasActiveFilters =
    selectedStatusFilter ||
    selectedMemberFilter ||
    selectedDeadlineFilter ||
    dateRange.start ||
    dateRange.end;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown
        value={selectedStatusFilter}
        onChange={setSelectedStatusFilter}
        options={statusOptions}
        placeholder="All Status"
      />
      <FilterDropdown
        value={selectedMemberFilter}
        onChange={setSelectedMemberFilter}
        options={memberOptions}
        placeholder="All Members"
      />
      <FilterDropdown
        value={selectedDeadlineFilter}
        onChange={setSelectedDeadlineFilter}
        options={deadlineOptions}
        placeholder="All Deadlines"
      />
      <DateRangePicker dateRange={dateRange} onChange={setDateRange} />

      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-100 text-sm font-medium transition-colors"
        >
          <X size={13} />
          Reset
        </button>
      )}
    </div>
  );
};

export default TaskFilters;
