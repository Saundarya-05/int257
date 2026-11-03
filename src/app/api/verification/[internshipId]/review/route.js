import { handleRoute, readJsonBody } from "@/lib/handleRoute";
import { success } from "@/lib/apiResponse";
import { requireReviewer } from "@/lib/reviewerAuth";
import { submitManualReview } from "@/modules/verification/services/verificationService";
import { reviewSchema } from "@/modules/verification/validations/verificationSchema";

// PATCH /api/verification/:internshipId/review   (reviewer only)
export const PATCH = handleRoute(async (request, { params }) => {
  requireReviewer(request); // checks the x-reviewer-key header first
  const { internshipId } = await params;
  const body = await readJsonBody(request);
  const data = reviewSchema.parse(body);
  return success(await submitManualReview(internshipId, data));
});
