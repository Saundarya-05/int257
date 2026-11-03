import mongoose from "mongoose";
import Verification from "@/models/Verification";
import { NotFoundError } from "@/lib/errors";
import { evaluateRules } from "./riskRules";
import { FINAL_STATUS_FOR_DECISION } from "../constants";
// Module 1's PUBLIC functions (we never import its model).
// Note: Module 1 also imports this file. That is fine because each side only
// calls the other INSIDE functions, never while the file is loading.
import { getInternshipById, getInternshipsByIds } from "@/modules/internships/services/internshipService";

// ---------- helpers ----------
function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Verification not found");
}

// The reviewer's decision wins; otherwise use the automatic level.
function getFinalStatus(verification) {
  if (verification.manualReview) {
    return FINAL_STATUS_FOR_DECISION[verification.manualReview.decision];
  }
  return verification.riskLevel;
}

// Adds "finalStatus" so the UI never has to work it out.
function toResponse(verification) {
  return { ...verification, finalStatus: getFinalStatus(verification) };
}

// Runs the rules and saves the result (insert if new, update if it exists).
async function saveEvaluation(internship, resetReview) {
  const { riskScore, riskLevel, reasons } = evaluateRules(internship);

  const update = { riskScore, riskLevel, reasons, evaluatedAt: new Date() };
  if (resetReview) update.manualReview = null;

  const saved = await Verification.findOneAndUpdate(
    { internship: internship._id }, // find the verification of THIS internship
    { $set: update },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
  return toResponse(saved);
}

// =====================================================================
// PUBLIC FUNCTIONS used by Module 1 (names and arguments are the contract)
// =====================================================================

// Called after an internship is created or EDITED. The details changed,
// so any old human review is cleared and the listing needs a fresh review.
export async function evaluateInternship(internship) {
  return saveEvaluation(internship, true);
}

// ONE query for a whole page of cards.
// Returns { "<internshipId>": { riskLevel, riskScore, finalStatus } }
export async function getVerificationSummaries(internshipIds) {
  const validIds = internshipIds.filter((id) => mongoose.isValidObjectId(id));
  const docs = await Verification.find({ internship: { $in: validIds } })
    .select("internship riskScore riskLevel manualReview")
    .lean();

  const summaries = {};
  for (const doc of docs) {
    summaries[String(doc.internship)] = {
      riskLevel: doc.riskLevel,
      riskScore: doc.riskScore,
      finalStatus: getFinalStatus(doc),
    };
  }
  return summaries;
}

// Called when an internship is deleted.
export async function deleteVerificationByInternship(internshipId) {
  if (!mongoose.isValidObjectId(internshipId)) return;
  await Verification.deleteOne({ internship: internshipId });
}

// =====================================================================
// Used by Module 2's own API routes
// =====================================================================

export async function getVerificationByInternshipId(internshipId) {
  assertValidId(internshipId);
  const verification = await Verification.findOne({ internship: internshipId }).lean();
  if (!verification) throw new NotFoundError("No verification found for this internship yet");
  return toResponse(verification);
}

// Manual "re-run the rules" button. The listing did NOT change, so a human review is kept.
export async function reevaluateInternshipById(internshipId) {
  const internship = await getInternshipById(internshipId); // throws 404 if it does not exist
  return saveEvaluation(internship, false);
}

export async function submitManualReview(internshipId, { decision, note, reviewerName }) {
  assertValidId(internshipId);
  const updated = await Verification.findOneAndUpdate(
    { internship: internshipId },
    { $set: { manualReview: { decision, note, reviewerName, reviewedAt: new Date() } } },
    { new: true, runValidators: true }
  ).lean();
  if (!updated) throw new NotFoundError("No verification found for this internship yet");
  return toResponse(updated);
}

// Reviewer dashboard: highest risk first.
export async function listVerifications(query) {
  const { riskLevel, reviewed, page, limit } = query;

  const filter = {};
  if (riskLevel) filter.riskLevel = riskLevel;
  if (reviewed === "true") filter.manualReview = { $ne: null }; // already reviewed
  if (reviewed === "false") filter.manualReview = null; // waiting for review

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Verification.find(filter).sort({ riskScore: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    Verification.countDocuments(filter),
  ]);

  // ONE query to Module 1 for company names (not one per row).
  const listings = await getInternshipsByIds(docs.map((doc) => doc.internship));
  const items = docs.map((doc) => ({
    ...toResponse(doc),
    listing: listings[String(doc.internship)] ?? null, // { companyName, role, location, stipend }
  }));

  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
