// Small helpers that turn raw data into friendly text.

export function formatStipend(stipend) {
  if (!stipend) return "Unpaid";
  return `₹${stipend.toLocaleString("en-IN")}/month`;
}

export function formatDuration(months) {
  return months === 1 ? "1 month" : `${months} months`;
}

// createdAt arrives from the API as text like "2026-11-02T07:04:52.000Z"
export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
