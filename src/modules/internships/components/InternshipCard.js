import Link from "next/link";
import { WORK_MODE_LABELS } from "../constants";
import { formatStipend, formatDuration, formatDate } from "../utils/format";

// Temporary risk label. Module 2 can replace this with its own <RiskBadge />.
const RISK_STYLES = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

// Props:
//   internship → one object from the API
//   onDelete   → optional function. If given, a Delete button is shown.
export default function InternshipCard({ internship, onDelete }) {
  const { _id, companyName, role, stipend, location, workMode, durationMonths, skills, registrationFee, createdAt, verification } =
    internship;

  const shownSkills = skills.slice(0, 5);
  const hiddenCount = skills.length - shownSkills.length;

  return (
    <article className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{role}</h3>
          <p className="text-gray-600">{companyName}</p>
        </div>
        {verification && (
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${RISK_STYLES[verification.finalStatus]}`}>
            {verification.finalStatus} risk
          </span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-gray-500">Stipend</dt>
          <dd className="font-medium">{formatStipend(stipend)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Duration</dt>
          <dd className="font-medium">{formatDuration(durationMonths)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Location</dt>
          <dd className="font-medium">{location}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Type</dt>
          <dd className="font-medium">{WORK_MODE_LABELS[workMode]}</dd>
        </div>
      </dl>

      {registrationFee > 0 && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Asks for a registration fee of ₹{registrationFee.toLocaleString("en-IN")}
        </p>
      )}

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {shownSkills.map((skill) => (
            <span key={skill} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
              {skill}
            </span>
          ))}
          {hiddenCount > 0 && <span className="px-1 py-1 text-xs text-gray-500">+{hiddenCount} more</span>}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">Posted {formatDate(createdAt)}</p>

      <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4 text-sm">
        <Link href={`/internships/${_id}`} className="font-medium text-blue-600 hover:underline">
          View details
        </Link>
        <Link href={`/internships/${_id}/edit`} className="text-gray-600 hover:underline">
          Edit
        </Link>
        {onDelete && (
          <button onClick={() => onDelete(internship)} className="ml-auto text-red-600 hover:underline">
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
