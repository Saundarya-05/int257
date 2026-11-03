"use client";

import { useState } from "react";
import { createInternshipSchema } from "../validations/internshipSchema";
import { WORK_MODES, WORK_MODE_LABELS } from "../constants";
import FormField, { inputClass } from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";

// Every input holds TEXT, so the form keeps all values as strings.
const EMPTY_VALUES = {
  companyName: "",
  role: "",
  description: "",
  stipend: "",
  durationMonths: "",
  location: "",
  workMode: "onsite",
  skills: "", // typed as "React, CSS"
  applicationLink: "",
  companyWebsite: "",
  contactEmail: "",
  registrationFee: "0",
};

// Database object → form strings (used when editing).
function toFormValues(internship) {
  if (!internship) return EMPTY_VALUES;
  return {
    companyName: internship.companyName,
    role: internship.role,
    description: internship.description,
    stipend: String(internship.stipend),
    durationMonths: String(internship.durationMonths),
    location: internship.location,
    workMode: internship.workMode,
    skills: internship.skills.join(", "),
    applicationLink: internship.applicationLink,
    companyWebsite: internship.companyWebsite,
    contactEmail: internship.contactEmail,
    registrationFee: String(internship.registrationFee),
  };
}

// "" → undefined (Zod then says "Required"), "8000" → 8000
function toNumber(text) {
  return text.trim() === "" ? undefined : Number(text);
}

// Form strings → the object our Zod schema expects.
function toPayload(values) {
  return {
    companyName: values.companyName,
    role: values.role,
    description: values.description,
    stipend: toNumber(values.stipend),
    durationMonths: toNumber(values.durationMonths),
    location: values.location,
    workMode: values.workMode,
    skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
    applicationLink: values.applicationLink,
    companyWebsite: values.companyWebsite,
    contactEmail: values.contactEmail,
    registrationFee: toNumber(values.registrationFee),
  };
}

// Zod issues → { fieldName: "first message" }
function issuesToErrors(issues) {
  const errors = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

// Props:
//   initialValues → an internship (edit mode) or nothing (create mode)
//   onSubmit      → async function(data). Throw an Error to show a message in the form.
//   submitLabel   → text on the button
export default function InternshipForm({ initialValues, onSubmit, submitLabel = "Save internship" }) {
  const [values, setValues] = useState(() => toFormValues(initialValues));
  const [errors, setErrors] = useState({}); // field errors
  const [submitting, setSubmitting] = useState(false); // true while the request runs
  const [submitError, setSubmitError] = useState(""); // error for the whole form

  // One handler for ALL inputs: the input's "name" tells us which value to change.
  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // remove the red error for this field as soon as the user edits it
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's page reload
    setSubmitError("");

    // 1. Check the data in the browser first (same Zod rules as the API).
    const result = createInternshipSchema.safeParse(toPayload(values));
    if (!result.success) {
      setErrors(issuesToErrors(result.error.issues));
      return;
    }
    setErrors({});

    // 2. Hand the clean data to the parent (the parent calls the API).
    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch (error) {
      // The server may also reject the data → show its field errors too.
      if (error.details) {
        const fromServer = {};
        for (const d of error.details) fromServer[d.field.split(".")[0]] = d.message;
        setErrors(fromServer);
      }
      setSubmitError(error.message);
    } finally {
      setSubmitting(false); // always re-enable the button
    }
  }

  // Shortcut so each input needs fewer lines.
  function field(name) {
    return { id: name, name, value: values[name], onChange: handleChange, className: inputClass };
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Alert type="error">{submitError}</Alert>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Company name *" name="companyName" error={errors.companyName}>
          <input {...field("companyName")} placeholder="Acme Tech" />
        </FormField>
        <FormField label="Internship role *" name="role" error={errors.role}>
          <input {...field("role")} placeholder="Frontend Intern" />
        </FormField>
      </div>

      <FormField label="Description *" name="description" error={errors.description} hint="At least 30 characters. Mention what the intern will do.">
        <textarea {...field("description")} rows={5} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Stipend (₹/month) *" name="stipend" error={errors.stipend} hint="0 means unpaid">
          <input {...field("stipend")} type="number" min="0" />
        </FormField>
        <FormField label="Duration (months) *" name="durationMonths" error={errors.durationMonths}>
          <input {...field("durationMonths")} type="number" min="1" max="12" />
        </FormField>
        <FormField label="Location *" name="location" error={errors.location} hint='e.g. "Pune" or "Remote"'>
          <input {...field("location")} />
        </FormField>
        <FormField label="Internship type *" name="workMode" error={errors.workMode}>
          <select {...field("workMode")}>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Required skills" name="skills" error={errors.skills} hint="Separate with commas, e.g. React, CSS, Git">
        <input {...field("skills")} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Application URL *" name="applicationLink" error={errors.applicationLink}>
          <input {...field("applicationLink")} type="url" placeholder="https://company.com/apply" />
        </FormField>
        <FormField label="Company website" name="companyWebsite" error={errors.companyWebsite}>
          <input {...field("companyWebsite")} type="url" placeholder="https://company.com" />
        </FormField>
        <FormField label="Contact email" name="contactEmail" error={errors.contactEmail}>
          <input {...field("contactEmail")} type="email" placeholder="hr@company.com" />
        </FormField>
        <FormField label="Registration fee (₹)" name="registrationFee" error={errors.registrationFee} hint="0 means no fee">
          <input {...field("registrationFee")} type="number" min="0" />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
