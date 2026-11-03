import { NextResponse } from "next/server";

export function success(data, status = 200, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

export function failure(code, message, status, details) {
  const error = { code, message };
  if (details) error.details = details;
  return NextResponse.json({ success: false, error }, { status });
}
