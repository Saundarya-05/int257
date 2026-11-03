"use client";

import { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import RiskBadge from "./RiskBadge";
import ReasonList from "./ReasonList";
import ReviewForm from "./ReviewForm";
import { fetchVerification, evaluateVerification } from "../verificationApi";
import { DECISION_LABELS } from "../constants";

const BAR_COLORS = { low: "bg-green-500", medium: "bg-yellow-500", high: "bg-red-500" };

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// The full "risk assessment" card for ONE internship.
// It loads its own data, so Module 1 only writes: <RiskSummary internshipId={id} />
export default function RiskSummary({ internshipId }) {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false); // true = this listing was never checked
  const [running, setRunning] = useState(false); // true while "run check" is working
  const [showReview, setShowReview] = useState(false);
  const [message, setMessage] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      setMissing(false);
      try {
        const data = await fetchVerification(internshipId);
        if (!ignore) setVerification(data);
      } catch (err) {
        if (ignore) return;
        if (err.code === "NOT_FOUND") setMissing(true); // not an error, just not checked yet
        else setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [internshipId, reloadCount]);

  // "Run risk check" / "Re-run check"
  async function handleRun() {
    setRunning(true);
    setError("");
    setMessage("");
    try {
      const data = await evaluateVerification(internshipId);
      setVerification(data);
      setMissing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  }

  function handleReviewed(updated) {
    setVerification(updated);
    setShowReview(false);
    setMessage("Review saved successfully.");
  }

  const wrapper = "rounded-lg border border-gray-200 bg-white p-6 shadow-sm";

  if (loading) {
    return (
      <section className={wrapper}>
        <Spinner label="Checking risk..." />
      </section>
    );
  }

  if (error && !verification) {
    return (
      <section className={`${wrapper} space-y-3`}>
        <Alert type="error">{error}</Alert>
        <button onClick={() => setReloadCount((n) => n + 1)} className="text-sm text-blue-600 hover:underline">
          Try again
        </button>
      </section>
    );
  }

  if (missing) {
    return (
      <section className={`${wrapper} space-y-3`}>
        <h2 className="text-lg font-semibold">Risk assessment</h2>
        <p className="text-sm text-gray-600">This listing has not been checked yet.</p>
        <button onClick={handleRun} disabled={running} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {running ? "Checking..." : "Run risk check"}
        </button>
      </section>
    );
  }

  const v = verification;
  const review = v.manualReview;

  return (
    <section className={`${wrapper} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Risk assessment</h2>
        <RiskBadge status={v.finalStatus} reviewed={Boolean(review)} />
      </div>

      <Alert type="success">{message}</Alert>
      <Alert type="error">{error}</Alert>

      {/* Score bar */}
      <div>
        <div className="mb-1 flex justify-between text-sm text-gray-600">
          <span>Automatic risk score</span>
          <span className="font-medium">{v.riskScore} / 100</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div className={`h-2 rounded-full ${BAR_COLORS[v.riskLevel]}`} style={{ width: `${v.riskScore}%` }} />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Why this score?</h3>
        <ReasonList reasons={v.reasons} />
      </div>

      {review && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
          <p className="font-medium">
            {DECISION_LABELS[review.decision]} by {review.reviewerName} on {formatDate(review.reviewedAt)}
          </p>
          {review.note && <p className="mt-1 text-gray-700">{review.note}</p>}
          {v.finalStatus !== v.riskLevel && (
            <p className="mt-1 text-xs text-gray-500">The automatic check said {v.riskLevel} risk. The reviewer's decision overrides it.</p>
          )}
        </div>
      )}

      {showReview ? (
        <ReviewForm internshipId={internshipId} onReviewed={handleReviewed} onCancel={() => setShowReview(false)} />
      ) : (
        <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm">
          <button onClick={handleRun} disabled={running} className="text-blue-600 hover:underline disabled:opacity-60">
            {running ? "Checking..." : "Re-run check"}
          </button>
          <button onClick={() => { setShowReview(true); setMessage(""); }} className="text-gray-600 hover:underline">
            I am a reviewer: add a review
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">Automatic checks are a guide, not proof. Always confirm an offer with the company before paying or sharing documents.</p>
    </section>
  );
}
