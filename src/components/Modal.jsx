import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <div
      className="overlay-animate fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div className={`modal-animate bg-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full ${maxWidth} my-8 border border-gray-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          {typeof title === "string" ? (
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          ) : (
            <div className="flex items-center gap-3">{title}</div>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-4 shrink-0"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
