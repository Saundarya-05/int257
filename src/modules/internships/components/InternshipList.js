"use client";

import { useEffect, useState } from "react";
import InternshipCard from "./InternshipCard";
import InternshipFilters from "./InternshipFilters";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import Pagination from "@/components/ui/Pagination";
import { fetchInternships, deleteInternship } from "../internshipApi";
import { DEFAULT_FILTERS, PAGE_SIZE } from "../constants";

// Shows filters + cards + pagination. It loads its own data from the API.
// initialMessage: optional success text, e.g. "Internship deleted successfully."
export default function InternshipList({ initialMessage = "" }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null); // { page, limit, total, totalPages }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(initialMessage); // success message
  const [reloadCount, setReloadCount] = useState(0); // bump this number to reload

  // Runs after the first render, and again whenever filters, page or reloadCount change.
  useEffect(() => {
    let ignore = false; // protects against old, slow responses overwriting new ones

    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await fetchInternships({ ...filters, page, limit: PAGE_SIZE });
        if (!ignore) {
          setItems(result.items);
          setMeta(result.meta);
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();

    // Cleanup: runs before the next effect (or when the component disappears).
    return () => {
      ignore = true;
    };
  }, [filters, page, reloadCount]);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
    setPage(1); // a new search always starts at page 1
    setMessage("");
  }

  async function handleDelete(internship) {
    const ok = window.confirm(`Delete "${internship.role}" at ${internship.companyName}? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteInternship(internship._id);
      setMessage("Internship deleted successfully.");
      setError("");
      // If we deleted the last card on this page, go back one page.
      if (items.length === 1 && page > 1) setPage(page - 1);
      else setReloadCount((n) => n + 1);
    } catch (err) {
      setMessage("");
      setError(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <InternshipFilters filters={filters} onChange={handleFilterChange} />

      <Alert type="success">{message}</Alert>
      {error && (
        <div className="space-y-2">
          <Alert type="error">{error}</Alert>
          <button onClick={() => setReloadCount((n) => n + 1)} className="text-sm text-blue-600 hover:underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <Spinner label="Loading internships..." />
      ) : !error && items.length === 0 ? (
        <p className="py-10 text-center text-gray-500">No internships found. Try changing your filters.</p>
      ) : (
        <>
          {meta && (
            <p className="text-sm text-gray-600">
              Showing {items.length} of {meta.total} internship{meta.total === 1 ? "" : "s"}
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((internship) => (
              <InternshipCard key={internship._id} internship={internship} onDelete={handleDelete} />
            ))}
          </div>
          {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
