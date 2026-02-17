import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white border border-gray-200 shadow-2xl p-8 w-full ${maxWidth} my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          {typeof title === "string" ? (
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          ) : (
            <div className="flex items-center gap-3">{title}</div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-4 shrink-0"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
