import Link from "next/link";
import InternshipList from "@/modules/internships/components/InternshipList";

export const metadata = { title: "Internships | P24" };

// In Next.js 15, searchParams is a Promise, so we await it.
export default async function InternshipsPage({ searchParams }) {
  const { deleted } = await searchParams;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Internships</h1>
        <Link href="/internships/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add internship
        </Link>
      </div>
      <InternshipList initialMessage={deleted ? "Internship deleted successfully." : ""} />
    </main>
  );
}
