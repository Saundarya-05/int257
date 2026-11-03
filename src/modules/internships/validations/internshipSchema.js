import { z } from "zod";
import { WORK_MODES, SORT_OPTIONS, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "../constants";

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const urlMessage = "Enter a valid URL starting with http:// or https://";

export const createInternshipSchema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters").max(100, "Company name is too long"),
  role: z.string().trim().min(2, "Role must be at least 2 characters").max(100, "Role is too long"),
  description: z.string().trim().min(30, "Description must be at least 30 characters").max(3000, "Description is too long"),
  stipend: z.number().min(0, "Stipend cannot be negative"),
  location: z.string().trim().min(2, "Location is required"),
  workMode: z.enum(WORK_MODES),
  durationMonths: z.number().int("Duration must be a whole number").min(1, "Minimum 1 month").max(12, "Maximum 12 months"),
  skills: z.array(z.string().trim().min(1).max(40)).max(15, "Maximum 15 skills").default([]),
  applicationLink: z.string().trim().refine(isValidUrl, urlMessage),
  companyWebsite: z.string().trim().refine((v) => v === "" || isValidUrl(v), urlMessage).default(""),
  contactEmail: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address")
    .default(""),
  registrationFee: z.number().min(0, "Fee cannot be negative").default(0),
});

export const updateInternshipSchema = createInternshipSchema;

export const listInternshipsQuerySchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  workMode: z.enum(WORK_MODES).optional(),
  minStipend: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  sort: z.enum(Object.keys(SORT_OPTIONS)).default("newest"),
});
