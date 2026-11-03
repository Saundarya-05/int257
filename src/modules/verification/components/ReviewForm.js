"use client";

import { useState } from "react";
import FormField, { inputClass } from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";
import { reviewSchema } from "../validations/verificationSchema";
import { submitReview } from "../verificationApi";

const DECISION_OPTIONS = [
  { value: "verified_safe", label: "Verified safe" },
  { value: "confirmed_suspicious", label: "Confirmed suspicious" },
];

// Zod issues → { fieldName: "first message" }
function issuesToErrors(issues) {
  const errors = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

// Props:
//   internshipId → which listing is being reviewed
//   onReviewed   → function(updatedVerification), called after a successful save
//   onCancel     → function(), closes the form
//   reviewerKey  → OPTIONAL. The dashboard already knows the key, so it passes it
//                  here and the key box is hidden. On a detail page it is not passed,
//                  so the reviewer types it.
export default function ReviewForm({ internshipId, onReviewed, onCancel, reviewerKey: savedKey = "" }) {
  const [values, setValues] = useState({ reviewerKey: "", reviewerName: "", decision: "", note: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    // Use the key given by the dashboard, or the one typed in the box.
    const { reviewerKey: typedKey, ...reviewData } = values;
    const key = (savedKey || typedKey).trim();

    // 1. Check in the browser first (same Zod rules as the API).
    const result = reviewSchema.safeParse({ ...reviewData, decision: values.decision || undefined });
    const newErrors = result.success ? {} : issuesToErrors(result.error.issues);
    if (!key) newErrors.reviewerKey = "Reviewer key is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. Send it to the API.
    setSubmitting(true);
    try {
      const updated = await submitReview(internshipId, result.data, key);
      onReviewed(updated);
    } catch (error) {
      if (error.code === "UNAUTHORIZED") {
        if (savedKey) setSubmitError("The reviewer key was rejected. Sign out and enter it again.");
        else setErrors({ reviewerKey: "Wrong reviewer key" });
      } else {
        if (error.details) {
          const fromServer = {};
          for (const d of error.details) fromServer[d.field.split(".")[0]] = d.message;
          setErrors(fromServer);
        }
        setSubmitError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4">
      <h3 className="font-semibold">Reviewer decision</h3>
      <Alert type="error">{submitError}</Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        {!savedKey && (
          <FormField label="Reviewer key *" name="reviewerKey" error={errors.reviewerKey} hint="Given to authorised reviewers only">
            <input id="reviewerKey" name="reviewerKey" type="password" value={values.reviewerKey} onChange={handleChange} className={inputClass} autoComplete="off" />
          </FormField>
        )}
        <FormField label="Your name *" name="reviewerName" error={errors.reviewerName}>
          <input id="reviewerName" name="reviewerName" value={values.reviewerName} onChange={handleChange} className={inputClass} />
        </FormField>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">Decision *</p>
        <div className="flex flex-wrap gap-4">
          {DECISION_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input type="radio" name="decision" value={option.value} checked={values.decision === option.value} onChange={handleChange} />
              {option.label}
            </label>
          ))}
        </div>
        {errors.decision && <p className="mt-1 text-sm text-red-600">{errors.decision}</p>}
      </div>

      <FormField label="Note" name="note" error={errors.note} hint="Required (10+ characters) when marking a listing suspicious">
        <textarea id="note" name="note" rows={3} value={values.note} onChange={handleChange} className={inputClass} />
      </FormField>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {submitting ? "Saving..." : "Save review"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </form>
  );
}
