import Link from "next/link";

// Shown for any URL that does not exist.
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-600">The page you are looking for does not exist.</p>
      <Link href="/internships" className="mt-6 inline-block text-blue-600 hover:underline">
        Go to internships
      </Link>
    </main>
  );
}
