import { timingSafeEqual } from "crypto";
import { AppError } from "@/lib/errors";

// Call this at the top of any route that only reviewers may use.
// The browser must send the header:  x-reviewer-key: <REVIEWER_SECRET>
export function requireReviewer(request) {
  const secret = process.env.REVIEWER_SECRET;
  if (!secret) {
    throw new AppError("Reviewer access is not configured on the server", 500, "SERVER_ERROR");
  }

  const key = request.headers.get("x-reviewer-key") || "";

  // timingSafeEqual compares in constant time (needs equal lengths, so we check that first).
  const a = Buffer.from(key);
  const b = Buffer.from(secret);
  const ok = a.length === b.length && timingSafeEqual(a, b);

  if (!ok) {
    throw new AppError("Invalid or missing reviewer key", 401, "UNAUTHORIZED");
  }
}
