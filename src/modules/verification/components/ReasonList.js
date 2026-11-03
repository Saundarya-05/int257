// Shows WHY a listing got its score. One line per rule that triggered.
// Props: reasons → [{ ruleId, message, points }]
export default function ReasonList({ reasons }) {
  if (!reasons || reasons.length === 0) {
    return <p className="text-sm text-green-700">No warning signs were found by our automatic checks.</p>;
  }

  return (
    <ul className="space-y-2">
      {reasons.map((reason) => (
        <li key={reason.ruleId} className="flex items-start justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
          <span>
            <span className="mr-2 font-bold text-red-600">!</span>
            {reason.message}
          </span>
          <span className="shrink-0 text-xs font-medium text-gray-500">+{reason.points}</span>
        </li>
      ))}
    </ul>
  );
}
