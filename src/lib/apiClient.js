// Shared by ALL modules: one place that calls our API and understands the
// { success, data, meta } / { success:false, error } format.

export async function request(url, options = {}) {
  const { headers, ...rest } = options;

  let response;
  try {
    response = await fetch(url, {
      cache: "no-store", // always get fresh data
      ...rest,
      headers: { "Content-Type": "application/json", ...headers }, // extra headers are added, not replaced
    });
  } catch {
    // fetch() only throws when the network itself fails
    throw new Error("Could not reach the server. Check your connection.");
  }

  const json = await response.json().catch(() => null);
  if (!json) throw new Error("The server sent an unexpected response.");

  if (!json.success) {
    const error = new Error(json.error.message);
    error.code = json.error.code; // e.g. "NOT_FOUND", "UNAUTHORIZED"
    error.details = json.error.details; // [{ field, message }] for validation errors
    throw error;
  }
  return json; // { success: true, data, meta? }
}
