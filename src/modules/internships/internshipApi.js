// The ONLY place where the browser talks to /api/internships.
// Components call these functions and never write fetch() themselves.

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store", // always get fresh data
      ...options,
    });
  } catch {
    // fetch() only throws when the network itself fails
    throw new Error("Could not reach the server. Check your connection.");
  }

  const json = await response.json().catch(() => null);
  if (!json) throw new Error("The server sent an unexpected response.");

  if (!json.success) {
    // Turn the API error into a normal JavaScript Error the UI can show.
    const error = new Error(json.error.message);
    error.code = json.error.code;
    error.details = json.error.details; // [{ field, message }] for validation errors
    throw error;
  }
  return json; // { success: true, data, meta? }
}

// params = { search, location, workMode, minStipend, sort, page, limit }
export async function fetchInternships(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    // skip empty filters so "?workMode=" is never sent (the API would reject it)
    if (value !== "" && value !== undefined && value !== null) query.set(key, value);
  }
  const json = await request(`/api/internships?${query.toString()}`);
  return { items: json.data, meta: json.meta };
}

export async function fetchInternship(id) {
  const json = await request(`/api/internships/${id}`);
  return json.data;
}

export async function createInternship(data) {
  const json = await request("/api/internships", { method: "POST", body: JSON.stringify(data) });
  return json.data;
}

export async function updateInternship(id, data) {
  const json = await request(`/api/internships/${id}`, { method: "PUT", body: JSON.stringify(data) });
  return json.data;
}

export async function deleteInternship(id) {
  const json = await request(`/api/internships/${id}`, { method: "DELETE" });
  return json.data;
}
