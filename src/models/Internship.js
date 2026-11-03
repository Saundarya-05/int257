import mongoose from "mongoose";
import { WORK_MODES } from "@/modules/internships/constants";

const internshipSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    role: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 30, maxlength: 3000 },
    stipend: { type: Number, required: true, min: 0 }, // INR per month, 0 = unpaid
    location: { type: String, required: true, trim: true },
    workMode: { type: String, required: true, enum: WORK_MODES }, // "Internship Type" in the UI
    durationMonths: { type: Number, required: true, min: 1, max: 12 },
    skills: { type: [String], default: [] },
    applicationLink: { type: String, required: true, trim: true },
    companyWebsite: { type: String, trim: true, default: "" },
    contactEmail: { type: String, trim: true, lowercase: true, default: "" },
    registrationFee: { type: Number, min: 0, default: 0 }, // INR, 0 = no fee
  },
  { timestamps: true }
);

internshipSchema.index({ createdAt: -1 });
internshipSchema.index({ workMode: 1 });

export default mongoose.models.Internship || mongoose.model("Internship", internshipSchema);
