"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import { fetchInternship, deleteInternship } from "../internshipApi";
import { WORK_MODE_LABELS } from "../constants";
import { formatStipend, formatDuration, formatDate } from "../utils/format";
import RiskSummary from "@/modules/verification/components/RiskSummary"; // Module 2 component

const NOTICES = {
  created: "Internship added successfully!",
  updated: "Internship updated successfully!",
};

// Props: id (internship _id), notice ("created" | "updated" | undefined)
export default function InternshipDetail({ id, notice }) {
  const router = useRouter();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // loading error
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await fetchInternship(id);
        if (!ignore) setInternship(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleDelete() {
    const ok = window.confirm(`Delete "${internship.role}" at ${internship.companyName}? This cannot be undone.`);
    if (!ok) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteInternship(id);
      router.push("/internships?deleted=1"); // list page shows the success message
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  if (loading) return <Spinner label="Loading internship..." />;

  if (error) {
    return (
      <div className="space-y-3">
        <Alert type="error">{error}</Alert>
        <Link href="/internships" className="text-sm text-blue-600 hover:underline">
          Back to internships
        </Link>
      </div>
    );
  }

  const i = internship;

  return (
    <div className="space-y-6">
      <Alert type="success">{NOTICES[notice]}</Alert>
      <Alert type="error">{deleteError}</Alert>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{i.role}</h1>
            <p className="text-lg text-gray-600">{i.companyName}</p>
            <p className="mt-1 text-xs text-gray-500">Posted {formatDate(i.createdAt)}</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/internships/${i._id}/edit`} className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100">
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {i.registrationFee > 0 && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            Warning: this listing asks for a registration fee of ₹{i.registrationFee.toLocaleString("en-IN")}.
            Real internships rarely ask students to pay.
          </p>
        )}

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Stipend" value={formatStipend(i.stipend)} />
          <Info label="Duration" value={formatDuration(i.durationMonths)} />
          <Info label="Location" value={i.location} />
          <Info label="Internship type" value={WORK_MODE_LABELS[i.workMode]} />
        </dl>

        <h2 className="mt-8 font-semibold">Description</h2>
        <p className="mt-2 whitespace-pre-line text-gray-700">{i.description}</p>

        {i.skills.length > 0 && (
          <>
            <h2 className="mt-6 font-semibold">Required skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {i.skills.map((skill) => (
                <span key={skill} className="rounded bg-blue-50 px-2 py-1 text-sm text-blue-700">
                  {skill}
                </span>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-6 font-semibold">Contact and links</h2>
        <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
          <Info
            label="Company website"
            value={i.companyWebsite ? <ExternalLink href={i.companyWebsite}>{i.companyWebsite}</ExternalLink> : "Not provided"}
          />
          <Info
            label="Contact email"
            value={i.contactEmail ? <a className="text-blue-600 hover:underline" href={`mailto:${i.contactEmail}`}>{i.contactEmail}</a> : "Not provided"}
          />
        </dl>

        <a
          href={i.applicationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Apply on company site
        </a>
      </section>

      {/* Module 2: risk assessment */}
      <RiskSummary internshipId={i._id} />

      {/* Module 3 owner: render <ExperienceList internshipId={i._id} /> here. */}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="font-medium break-words">{value}</dd>
    </div>
  );
}

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      {children}
    </a>
  );
}
