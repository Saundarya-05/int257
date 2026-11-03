import mongoose from "mongoose";
import Internship from "@/models/Internship";
import { NotFoundError } from "@/lib/errors";
import { SORT_OPTIONS } from "../constants";
import {
  evaluateInternship,
  getVerificationSummaries,
  deleteVerificationByInternship,
} from "@/modules/verification/services/verificationService";
import { deleteExperiencesByInternship } from "@/modules/experiences/services/experienceService";

// Escape regex special characters so user text is treated as plain text.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A bad id (like "abc") would crash Mongoose, so treat it as "not found".
function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new NotFoundError("Internship not found");
  }
}

// If Module 2 fails we keep the internship and only log the problem.
async function runEvaluation(internship) {
  try {
    await evaluateInternship(internship);
  } catch (error) {
    console.error("Verification failed for internship", internship._id, error);
  }
}

export async function listInternships(query) {
  const { search, location, workMode, minStipend, page, limit, sort } = query;

  const filter = {};
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ companyName: regex }, { role: regex }];
  }
  if (location) filter.location = new RegExp(escapeRegex(location), "i");
  if (workMode) filter.workMode = workMode;
  if (minStipend !== undefined) filter.stipend = { $gte: minStipend };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Internship.find(filter).sort(SORT_OPTIONS[sort]).skip(skip).limit(limit).lean(),
    Internship.countDocuments(filter),
  ]);

  // ONE call to Module 2 for the whole page (no N+1 queries).
  const summaries = await getVerificationSummaries(items.map((item) => item._id));
  const withVerification = items.map((item) => ({
    ...item,
    verification: summaries[String(item._id)] ?? null,
  }));

  return {
    items: withVerification,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Public: Modules 2 and 3 may call this.
export async function getInternshipById(id) {
  assertValidId(id);
  const internship = await Internship.findById(id).lean();
  if (!internship) throw new NotFoundError("Internship not found");
  return internship;
}

// Public: Module 2 uses this to show company names on the reviewer dashboard.
// ONE query for many ids. Returns { "<id>": { companyName, role, location, stipend } }
export async function getInternshipsByIds(ids) {
  const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
  const internships = await Internship.find({ _id: { $in: validIds } })
    .select("companyName role location stipend")
    .lean();
  const byId = {};
  for (const internship of internships) byId[String(internship._id)] = internship;
  return byId;
}

// Public: Module 3 uses this before saving an experience.
export async function internshipExists(id) {
  if (!mongoose.isValidObjectId(id)) return false;
  const found = await Internship.exists({ _id: id });
  return found !== null;
}

export async function createInternship(data) {
  const internship = await Internship.create(data);
  const plain = internship.toObject();
  await runEvaluation(plain);
  return plain;
}

export async function updateInternship(id, data) {
  assertValidId(id);
  const updated = await Internship.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!updated) throw new NotFoundError("Internship not found");
  await runEvaluation(updated);
  return updated;
}

export async function deleteInternship(id) {
  assertValidId(id);
  const deleted = await Internship.findByIdAndDelete(id).lean();
  if (!deleted) throw new NotFoundError("Internship not found");
  await deleteVerificationByInternship(id);
  await deleteExperiencesByInternship(id);
  return { _id: deleted._id };
}
