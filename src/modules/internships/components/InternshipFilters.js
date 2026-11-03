"use client";

import { useState } from "react";
import { WORK_MODES, WORK_MODE_LABELS, SORT_LABELS, DEFAULT_FILTERS } from "../constants";
import { inputClass } from "@/components/ui/FormField";

// Props:
//   filters  → the filters currently applied
//   onChange → function(newFilters), called when the user clicks "Apply" or "Reset"
export default function InternshipFilters({ filters, onChange }) {
  // "draft" holds what the user is typing. Nothing is searched until they click Apply.
  const [draft, setDraft] = useState(filters);

  function handleChange(event) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onChange(draft);
  }

  function handleReset() {
    setDraft(DEFAULT_FILTERS);
    onChange(DEFAULT_FILTERS);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label htmlFor="search" className="mb-1 block text-sm font-medium text-gray-700">Search</label>
          <input
            id="search" name="search" value={draft.search} onChange={handleChange}
            placeholder="Company or job role" className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            id="location" name="location" value={draft.location} onChange={handleChange}
            placeholder="e.g. Pune" className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="workMode" className="mb-1 block text-sm font-medium text-gray-700">Internship type</label>
          <select id="workMode" name="workMode" value={draft.workMode} onChange={handleChange} className={inputClass}>
            <option value="">All types</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>{WORK_MODE_LABELS[mode]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="minStipend" className="mb-1 block text-sm font-medium text-gray-700">Min stipend (₹)</label>
          <input
            id="minStipend" name="minStipend" type="number" min="0" value={draft.minStipend}
            onChange={handleChange} placeholder="e.g. 5000" className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="sort" className="mb-1 block text-sm font-medium text-gray-700">Sort by</label>
          <select id="sort" name="sort" value={draft.sort} onChange={handleChange} className={inputClass}>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Apply
        </button>
        <button type="button" onClick={handleReset} className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100">
          Reset
        </button>
      </div>
    </form>
  );
}
