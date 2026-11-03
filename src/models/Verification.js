import mongoose from "mongoose";
import { RISK_LEVELS, REVIEW_DECISIONS } from "@/modules/verification/constants";

// One reason behind the score, e.g. { ruleId: "REGISTRATION_FEE", message: "...", points: 40 }
const reasonSchema = new mongoose.Schema(
  {
    ruleId: { type: String, required: true },
    message: { type: String, required: true },
    points: { type: Number, required: true },
  },
  { _id: false } // no separate id needed for each reason
);

// The human reviewer's decision.
const manualReviewSchema = new mongoose.Schema(
  {
    decision: { type: String, required: true, enum: REVIEW_DECISIONS },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    reviewerName: { type: String, required: true, trim: true, maxlength: 60 },
    reviewedAt: { type: Date, required: true },
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    // Points to the Internship document (Module 1's _id). "unique" = ONE verification per internship.
    internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship", required: true, unique: true },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, required: true, enum: RISK_LEVELS }, // automatic result
    reasons: { type: [reasonSchema], default: [] },
    manualReview: { type: manualReviewSchema, default: null }, // null = not reviewed yet
    evaluatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Speeds up the reviewer dashboard (filter by level, highest score first).
verificationSchema.index({ riskLevel: 1, riskScore: -1 });

export default mongoose.models.Verification || mongoose.model("Verification", verificationSchema);
