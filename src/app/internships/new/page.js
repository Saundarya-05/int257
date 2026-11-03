import Link from "next/link";
import AddInternship from "@/modules/internships/components/AddInternship";

export const metadata = { title: "Add internship | P24" };

export default function NewInternshipPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Link href="/internships" className="text-sm text-blue-600 hover:underline">
        ← Back to internships
      </Link>
      <h1 className="text-2xl font-bold">Add an internship</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <AddInternship />
      </div>
    </main>
  );
}
