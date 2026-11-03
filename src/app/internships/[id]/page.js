import Link from "next/link";
import InternshipDetail from "@/modules/internships/components/InternshipDetail";

export const metadata = { title: "Internship details | P24" };

export default async function InternshipDetailPage({ params, searchParams }) {
  const { id } = await params; // the [id] part of the URL
  const { created, updated } = await searchParams; // ?created=1 or ?updated=1
  const notice = created ? "created" : updated ? "updated" : undefined;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Link href="/internships" className="text-sm text-blue-600 hover:underline">
        ← Back to internships
      </Link>
      <InternshipDetail id={id} notice={notice} />
    </main>
  );
}
