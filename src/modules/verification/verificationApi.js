// The ONLY place where the browser talks to /api/verification.
import { request } from "@/lib/apiClient";

export async function fetchVerification(internshipId) {
  const json = await request(`/api/verification/${internshipId}`);
  return json.data;
}

// Re-runs the rules (public).
export async function evaluateVerification(internshipId) {
  const json = await request(`/api/verification/${internshipId}/evaluate`, { method: "POST" });
  return json.data;
}

// Reviewer only: the key travels in the x-reviewer-key header.
export async function submitReview(internshipId, data, reviewerKey) {
  const json = await request(`/api/verification/${internshipId}/review`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "x-reviewer-key": reviewerKey },
  });
  return json.data;
}

// Reviewer only (used by the dashboard in Step 3).
// params = { riskLevel, reviewed, page, limit }
export async function fetchReviewQueue(params, reviewerKey) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== undefined && value !== null) query.set(key, value);
  }
  const json = await request(`/api/verification?${query.toString()}`, {
    headers: { "x-reviewer-key": reviewerKey },
  });
  return { items: json.data, meta: json.meta };
}
