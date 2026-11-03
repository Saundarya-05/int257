"use client";

import { useRouter } from "next/navigation";
import InternshipForm from "./InternshipForm";
import { createInternship } from "../internshipApi";

// Connects the form to the API for the "add" page.
export default function AddInternship() {
  const router = useRouter();

  async function handleCreate(data) {
    const created = await createInternship(data); // throws on error → form shows it
    // Go to the new internship's page. "?created=1" tells that page to show a success message.
    router.push(`/internships/${created._id}?created=1`);
  }

  return <InternshipForm onSubmit={handleCreate} submitLabel="Add internship" />;
}
