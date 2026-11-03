import { handleRoute, readJsonBody } from "@/lib/handleRoute";
import { success } from "@/lib/apiResponse";
import { listInternships, createInternship } from "@/modules/internships/services/internshipService";
import {
  createInternshipSchema,
  listInternshipsQuerySchema,
} from "@/modules/internships/validations/internshipSchema";

export const GET = handleRoute(async (request) => {
  const rawQuery = Object.fromEntries(request.nextUrl.searchParams);
  const query = listInternshipsQuerySchema.parse(rawQuery);
  const { items, meta } = await listInternships(query);
  return success(items, 200, meta);
});

export const POST = handleRoute(async (request) => {
  const body = await readJsonBody(request);
  const data = createInternshipSchema.parse(body);
  const internship = await createInternship(data);
  return success(internship, 201);
});
