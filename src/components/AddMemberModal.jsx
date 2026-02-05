import { useState } from "react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";

const AddMemberModal = ({
  isOpen,
  onClose,
  selectedTeam,
  availableUsers,
  selectedMembers,
  onToggleMember,
  onAddMembers,
  loading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 4;

  if (!isOpen || !selectedTeam) return null;

  const filteredUsers = availableUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Add Team Member</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 flex-1 overflow-hidden flex flex-col">
          <p className="text-slate-400 mb-4">
            Select members to add to{" "}
            <span className="text-white font-semibold">
              {selectedTeam.name}
            </span>
          </p>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* User List */}
          <div className="space-y-2 mb-4" style={{ minHeight: "380px" }}>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => onToggleMember(user.uid)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMembers.includes(user.uid)
                      ? "bg-emerald-500/20 border-emerald-500"
                      : "bg-slate-700 border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.displayName?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-medium">
                          {user.displayName}
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">{user.email}</div>
                    </div>
                    {selectedMembers.includes(user.uid) && (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                {searchQuery ? "No users found matching your search" : "No available users to add"}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > USERS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2 py-4">
              {/* Back Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {getPageNumbers().map((page, index) => (
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                      {page}
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white hover:bg-slate-700"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onAddMembers}
          disabled={selectedMembers.length === 0 || loading}
          className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Adding..."
            : `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
};

export default AddMemberModal;