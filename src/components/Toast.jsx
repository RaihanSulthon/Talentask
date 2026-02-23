import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useLocation } from "react-router-dom";

// ─── Context ──────────────────────────────────────────────
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

// ─── Single Toast Item ────────────────────────────────────
const CONFIGS = {
  success: {
    icon: CheckCircle2,
    bar: "bg-emerald-500",
    iconColor: "text-emerald-500",
    bg: "bg-white",
    border: "border-emerald-100",
    title: "text-gray-800",
    label: "Success",
  },
  error: {
    icon: XCircle,
    bar: "bg-rose-500",
    iconColor: "text-rose-500",
    bg: "bg-white",
    border: "border-rose-100",
    title: "text-gray-800",
    label: "Error",
  },
  info: {
    icon: Info,
    bar: "bg-blue-500",
    iconColor: "text-blue-500",
    bg: "bg-white",
    border: "border-blue-100",
    title: "text-gray-800",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    bar: "bg-amber-500",
    iconColor: "text-amber-500",
    bg: "bg-white",
    border: "border-amber-100",
    title: "text-gray-800",
    label: "Warning",
  },
};

const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cfg = CONFIGS[toast.type] || CONFIGS.info;
  const Icon = cfg.icon;

  useEffect(() => {
    // mount → masuk
    const t1 = setTimeout(() => setVisible(true), 10);
    // auto-dismiss
    const t2 = setTimeout(() => dismiss(), toast.duration || 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 350);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 w-80 rounded-2xl border shadow-lg shadow-gray-200/60
        px-4 py-3.5 overflow-hidden cursor-default select-none
        transition-all duration-350 ease-in-out
        ${cfg.bg} ${cfg.border}
        ${
          visible && !leaving
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-10"
        }
      `}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${cfg.bar}`}
      />

      {/* Icon */}
      <div className={`mt-0.5 shrink-0 ${cfg.iconColor}`}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${cfg.iconColor} mb-0.5`}
        >
          {cfg.label}
        </p>
        <p className={`text-sm font-medium leading-snug ${cfg.title}`}>
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={dismiss}
        className="shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 rounded-b-2xl overflow-hidden">
        <div
          className={`h-full ${cfg.bar} rounded-b-2xl`}
          style={{
            animation: `toast-shrink ${toast.duration || 4000}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};


// ─── Container (portal-like, fixed) ──────────────────────
const ToastContainer = ({ toasts, removeToast }) => {
  const isAuthPage = window.location.pathname === "/auth";

  return (
    <div
      className={`fixed ${isAuthPage ? "top-5" : "top-20"} right-6 z-9999 flex flex-col gap-3 items-end pointer-events-none`}
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};

// ─── Provider ─────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
