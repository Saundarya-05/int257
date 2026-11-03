// The ONLY place where the browser talks to /api/internships.
import { request } from "@/lib/apiClient";

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
