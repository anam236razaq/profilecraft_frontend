import { NextIcon, PrevIcon } from "../assets/icons";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="py-5 text-center text-gray-400">Loading...</div>;
  }

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    const maxVisible = window.innerWidth < 640 ? 2 : 6;
    const pages = [];

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(2, currentPage - Math.floor(maxVisible / 2));
      const right = Math.min(
        totalPages - 1,
        currentPage + Math.floor(maxVisible / 2),
      );

      pages.push(1);
      if (left > 2) pages.push("...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className={`flex justify-between items-center gap-x-2`}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
      >
        <PrevIcon /> Previous
      </button>

      <div className="flex items-center gap-x-1">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={page === currentPage}
              className={`min-w-9 min-h-9 px-3 py-2 text-sm rounded-lg transition-colors ${
                page === currentPage
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-gray-600 hover:bg-indigo-50"
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
      >
        Next <NextIcon />
      </button>
    </nav>
  );
};

export default Pagination;
