"use client"; // error.js must be a Client Component

// Next.js shows this if a page crashes unexpectedly.
export default function Error({ reset }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-gray-600">An unexpected error happened. Please try again.</p>
      <button onClick={() => reset()} className="mt-6 rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
        Try again
      </button>
    </main>
  );
}
