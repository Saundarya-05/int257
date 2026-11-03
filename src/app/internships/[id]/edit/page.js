import Link from "next/link";
import EditInternship from "@/modules/internships/components/EditInternship";

export const metadata = { title: "Edit internship | P24" };

export default async function EditInternshipPage({ params }) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Link href={`/internships/${id}`} className="text-sm text-blue-600 hover:underline">
        ← Back to details
      </Link>
      <h1 className="text-2xl font-bold">Edit internship</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <EditInternship id={id} />
      </div>
    </main>
  );
}
