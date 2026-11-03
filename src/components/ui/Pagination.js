// Previous / Next buttons. Hidden when there is only one page.
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const buttonClass =
    "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <button className={buttonClass} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button className={buttonClass} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
