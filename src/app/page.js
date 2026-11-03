import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-center">
      <h1 className="text-4xl font-bold">Is This Internship Real?</h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
        Browse internship listings, check them for warning signs, and learn from seniors who have been there.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/internships" className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
          Browse internships
        </Link>
        <Link href="/internships/new" className="rounded-md border border-gray-300 bg-white px-6 py-3 font-medium hover:bg-gray-100">
          Add an internship
        </Link>
      </div>
    </main>
  );
}
