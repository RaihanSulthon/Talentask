import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, Users } from "lucide-react";

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  label,
  required = false,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions =
    searchable && searchQuery
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : options;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-gray-50 text-left rounded-xl border transition-all ${
          isOpen
            ? "border-violet-400 ring-2 ring-violet-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between">
          {value && selectedOption ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-linear-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {selectedOption.icon ||
                  selectedOption.label.substring(0, 1).toUpperCase()}
              </div>
              <span className="text-gray-800 font-medium">
                {selectedOption.label}
              </span>
              {selectedOption.description && (
                <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-xs rounded-full font-medium">
                  {selectedOption.description}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <ChevronDown
            size={20}
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl shadow-gray-200/60 overflow-hidden max-h-72">
          {" "}
          {/* Search Bar */}
          {searchable && options.length > 5 && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          {/* Options List */}
          <div
            className="max-h-39 overflow-y-auto scroll-smooth"
            style={{ willChange: "scroll-position" }}
          >
            {" "}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2.5 group flex items-center justify-between transition-colors ${
                    value === option.value
                      ? "bg-violet-50 text-violet-700"
                      : "text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && (
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          value === option.value
                            ? "bg-violet-500 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-violet-100 group-hover:text-violet-600"
                        }`}
                      >
                        {option.icon}
                      </div>
                    )}
                    <div className="text-left">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {value === option.value && (
                    <Check size={16} className="text-violet-500 shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
