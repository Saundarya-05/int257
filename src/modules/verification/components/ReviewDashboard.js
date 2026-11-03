"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import Pagination from "@/components/ui/Pagination";
import { inputClass } from "@/components/ui/FormField";
import RiskBadge from "./RiskBadge";
import ReasonList from "./ReasonList";
import ReviewForm from "./ReviewForm";
import { fetchReviewQueue } from "../verificationApi";
import { DECISION_LABELS } from "../constants";

const STORAGE_KEY = "p24ReviewerKey";
const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { riskLevel: "", reviewed: "false" }; // start with "needs review"
const MAX_REASONS_SHOWN = 3;

// Remembering the key only for this browser tab (sessionStorage). Wrapped in
// try/catch because some browsers block storage.
function saveKey(key) {
  try {
    sessionStorage.setItem(STORAGE_KEY, key);
  } catch {}
}
function clearSavedKey() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default function ReviewDashboard() {
  // ----- login state -----
  const [ready, setReady] = useState(false); // true once we looked for a saved key
  const [reviewerKey, setReviewerKey] = useState(""); // "" = locked
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");

  // ----- queue state -----
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openId, setOpenId] = useState(null); // internship id whose review form is open
  const [reloadCount, setReloadCount] = useState(0);

  // 1. Runs once in the browser: look for a key saved earlier in this tab.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setReviewerKey(saved);
    } catch {}
    setReady(true);
  }, []);

  // 2. Load the queue whenever the key, filters, page or reloadCount change.
  useEffect(() => {
    if (!reviewerKey) return; // locked: nothing to load

    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await fetchReviewQueue({ ...filters, page, limit: PAGE_SIZE }, reviewerKey);
        if (!ignore) {
          setItems(result.items);
          setMeta(result.meta);
        }
      } catch (err) {
        if (ignore) return;
        if (err.code === "UNAUTHORIZED") {
          // The key was wrong → lock again and say so.
          clearSavedKey();
          setReviewerKey("");
          setAuthError("Wrong reviewer key. Please try again.");
        } else {
          setError(err.message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [reviewerKey, filters, page, reloadCount]);

  function handleUnlock(event) {
    event.preventDefault();
    const key = keyInput.trim();
    if (!key) {
      setAuthError("Enter the reviewer key");
      return;
    }
    setAuthError("");
    saveKey(key);
    setReviewerKey(key); // this triggers the effect above, which also checks the key
    setKeyInput("");
  }

  function handleSignOut() {
    clearSavedKey();
    setReviewerKey("");
    setItems([]);
    setMeta(null);
    setOpenId(null);
    setMessage("");
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
    setOpenId(null);
    setMessage("");
  }

  function handleReviewed(item) {
    setOpenId(null);
    setMessage(`Review saved for ${item.listing?.companyName ?? "the listing"}.`);
    // If that was the last card on this page, go back one page. Otherwise reload.
    if (items.length === 1 && page > 1) setPage(page - 1);
    else setReloadCount((n) => n + 1);
  }

  // ---------- screens ----------
  if (!ready) return <Spinner />;

  if (!reviewerKey) {
    return (
      <form onSubmit={handleUnlock} className="mx-auto max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Reviewer sign-in</h2>
        <p className="text-sm text-gray-600">This page is for authorised reviewers. Enter the reviewer key to continue.</p>
        <Alert type="error">{authError}</Alert>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Reviewer key"
          autoComplete="off"
          className={inputClass}
        />
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Unlock
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <label htmlFor="reviewed" className="mb-1 block text-sm font-medium text-gray-700">Review status</label>
          <select id="reviewed" name="reviewed" value={filters.reviewed} onChange={handleFilterChange} className={inputClass}>
            <option value="false">Needs review</option>
            <option value="true">Already reviewed</option>
            <option value="">All</option>
          </select>
        </div>
        <div>
          <label htmlFor="riskLevel" className="mb-1 block text-sm font-medium text-gray-700">Automatic risk level</label>
          <select id="riskLevel" name="riskLevel" value={filters.riskLevel} onChange={handleFilterChange} className={inputClass}>
            <option value="">All levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button onClick={handleSignOut} className="ml-auto text-sm text-gray-600 hover:underline">
          Sign out
        </button>
      </div>

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
        <Spinner label="Loading review queue..." />
      ) : !error && items.length === 0 ? (
        <p className="py-10 text-center text-gray-500">Nothing here. No listings match these filters.</p>
      ) : (
        <>
          {meta && (
            <p className="text-sm text-gray-600">
              Showing {items.length} of {meta.total}, highest risk first
            </p>
          )}

          {items.map((item) => {
            const id = String(item.internship);
            const extra = item.reasons.length - MAX_REASONS_SHOWN;
            return (
              <article key={item._id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{item.listing ? item.listing.role : "Listing no longer exists"}</h3>
                    {item.listing && (
                      <p className="text-sm text-gray-600">
                        {item.listing.companyName} · {item.listing.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Score {item.riskScore}/100</span>
                    <RiskBadge status={item.finalStatus} reviewed={Boolean(item.manualReview)} />
                  </div>
                </div>

                <div className="mt-3">
                  <ReasonList reasons={item.reasons.slice(0, MAX_REASONS_SHOWN)} />
                  {extra > 0 && <p className="mt-1 text-xs text-gray-500">+{extra} more reason{extra === 1 ? "" : "s"}</p>}
                </div>

                {item.manualReview && (
                  <p className="mt-3 text-sm text-gray-600">
                    {DECISION_LABELS[item.manualReview.decision]} by {item.manualReview.reviewerName}
                    {item.manualReview.note ? `: ${item.manualReview.note}` : ""}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4 text-sm">
                  {item.listing && (
                    <Link href={`/internships/${id}`} className="text-blue-600 hover:underline">
                      View listing
                    </Link>
                  )}
                  <button
                    onClick={() => setOpenId(openId === id ? null : id)}
                    className="font-medium text-gray-700 hover:underline"
                  >
                    {openId === id ? "Close" : item.manualReview ? "Change review" : "Review"}
                  </button>
                </div>

                {openId === id && (
                  <div className="mt-4">
                    <ReviewForm
                      internshipId={id}
                      reviewerKey={reviewerKey}
                      onReviewed={() => handleReviewed(item)}
                      onCancel={() => setOpenId(null)}
                    />
                  </div>
                )}
              </article>
            );
          })}

          {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
