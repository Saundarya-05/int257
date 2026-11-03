// One box for success, error and info messages.
const STYLES = {
  success: "border-green-300 bg-green-50 text-green-800",
  error: "border-red-300 bg-red-50 text-red-800",
  info: "border-blue-300 bg-blue-50 text-blue-800",
};

export default function Alert({ type = "info", children }) {
  if (!children) return null; // nothing to show → render nothing
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`rounded-md border px-4 py-3 text-sm ${STYLES[type]}`}
    >
      {children}
    </div>
  );
}
