export const WORK_MODES = ["onsite", "remote", "hybrid"];

// Labels shown in the UI ("Internship Type")
export const WORK_MODE_LABELS = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

// Maps the ?sort= value to a MongoDB sort. 1 = ascending, -1 = descending.
// _id is added last so pages stay in a stable order when two items tie.
export const SORT_OPTIONS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  stipend_high: { stipend: -1, _id: -1 },
  stipend_low: { stipend: 1, _id: 1 },
};

export const SORT_LABELS = {
  newest: "Newest first",
  oldest: "Oldest first",
  stipend_high: "Stipend: high to low",
  stipend_low: "Stipend: low to high",
};

// Starting values of the filter bar. "" means "no filter".
export const DEFAULT_FILTERS = {
  search: "",
  location: "",
  workMode: "",
  minStipend: "",
  sort: "newest",
};

export const DEFAULT_PAGE_LIMIT = 10; // API default
export const MAX_PAGE_LIMIT = 50;
export const PAGE_SIZE = 9; // cards per page in the UI (3 x 3 grid)
