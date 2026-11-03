import ReviewDashboard from "@/modules/verification/components/ReviewDashboard";

export const metadata = { title: "Reviewer dashboard | P24" };

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Reviewer dashboard</h1>
        <p className="text-gray-600">Listings that need a human check, highest risk first.</p>
      </div>
      <ReviewDashboard />
    </main>
  );
}
