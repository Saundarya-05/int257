// A small spinning circle shown while data is loading.
export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-gray-600" role="status">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      <span>{label}</span>
    </div>
  );
}
