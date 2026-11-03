import { handleRoute } from "@/lib/handleRoute";
import { success } from "@/lib/apiResponse";
import { requireReviewer } from "@/lib/reviewerAuth";
import { listVerifications } from "@/modules/verification/services/verificationService";
import { listVerificationsQuerySchema } from "@/modules/verification/validations/verificationSchema";

// GET /api/verification?riskLevel=high&reviewed=false   (reviewer only)
export const GET = handleRoute(async (request) => {
  requireReviewer(request);
  const rawQuery = Object.fromEntries(request.nextUrl.searchParams);
  const query = listVerificationsQuerySchema.parse(rawQuery);
  const { items, meta } = await listVerifications(query);
  return success(items, 200, meta);
});
