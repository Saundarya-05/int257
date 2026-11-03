// Small coloured label: "Low risk" / "Medium risk" / "High risk".
// Used on cards (Module 1) and inside RiskSummary.
export const RISK_LABELS = { low: "Low risk", medium: "Medium risk", high: "High risk" };

export const RISK_STYLES = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

// Props:
//   status   → "low" | "medium" | "high"  (use finalStatus from the API)
//   reviewed → optional, adds "Reviewed" when a human checked the listing
export default function RiskBadge({ status, reviewed = false }) {
  if (!RISK_LABELS[status]) return null; // unknown status → show nothing

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${RISK_STYLES[status]}`}>
      {RISK_LABELS[status]}
      {reviewed && <span>· ✓ Reviewed</span>}
    </span>
  );
}
