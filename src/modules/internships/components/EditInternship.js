"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InternshipForm from "./InternshipForm";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import { fetchInternship, updateInternship } from "../internshipApi";

// Loads one internship, fills the form with it, and saves the changes.
export default function EditInternship({ id }) {
  const router = useRouter();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  async function handleUpdate(data) {
    await updateInternship(id, data);
    router.push(`/internships/${id}?updated=1`);
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

  // Render the form only AFTER the data is loaded, so its starting values are correct.
  return <InternshipForm initialValues={internship} onSubmit={handleUpdate} submitLabel="Save changes" />;
}
