import { handleRoute } from "@/lib/handleRoute";
import { success } from "@/lib/apiResponse";
import { getVerificationByInternshipId } from "@/modules/verification/services/verificationService";

// GET /api/verification/:internshipId   (public)
export const GET = handleRoute(async (request, { params }) => {
  const { internshipId } = await params;
  return success(await getVerificationByInternshipId(internshipId));
});
