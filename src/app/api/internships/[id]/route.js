import { handleRoute, readJsonBody } from "@/lib/handleRoute";
import { success } from "@/lib/apiResponse";
import {
  getInternshipById,
  updateInternship,
  deleteInternship,
} from "@/modules/internships/services/internshipService";
import { updateInternshipSchema } from "@/modules/internships/validations/internshipSchema";

// In current Next.js, `params` is a Promise, so we must await it.
export const GET = handleRoute(async (request, { params }) => {
  const { id } = await params;
  return success(await getInternshipById(id));
});

export const PUT = handleRoute(async (request, { params }) => {
  const { id } = await params;
  const body = await readJsonBody(request);
  const data = updateInternshipSchema.parse(body);
  return success(await updateInternship(id, data));
});

export const DELETE = handleRoute(async (request, { params }) => {
  const { id } = await params;
  return success(await deleteInternship(id));
});
