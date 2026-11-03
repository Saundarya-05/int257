import { handleRoute } from "@/lib/handleRoute";
import { success } from "@/lib/apiResponse";
import { reevaluateInternshipById } from "@/modules/verification/services/verificationService";

// POST /api/verification/:internshipId/evaluate   (public, no body needed)
export const POST = handleRoute(async (request, { params }) => {
  const { internshipId } = await params;
  return success(await reevaluateInternshipById(internshipId));
});
