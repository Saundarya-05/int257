import { z } from "zod";
import { RISK_LEVELS, REVIEW_DECISIONS, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "../constants";

// Body of PATCH /api/verification/:internshipId/review
export const reviewSchema = z
  .object({
    decision: z.enum(REVIEW_DECISIONS),
    note: z.string().trim().max(500, "Note is too long (max 500 characters)").default(""),
    reviewerName: z.string().trim().min(2, "Reviewer name is required").max(60, "Name is too long"),
  })
  // A "suspicious" verdict must be explained.
  .refine((data) => data.decision !== "confirmed_suspicious" || data.note.length >= 10, {
    message: "Please explain why this is suspicious (at least 10 characters)",
    path: ["note"],
  });

// Query string of GET /api/verification
export const listVerificationsQuerySchema = z.object({
  riskLevel: z.enum(RISK_LEVELS).optional(),
  reviewed: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
});
