// Everything you may want to TUNE lives here, not inside the rules.

export const RISK_LEVELS = ["low", "medium", "high"];

// Decision a human reviewer can make.
export const REVIEW_DECISIONS = ["verified_safe", "confirmed_suspicious"];

// Text shown in the UI for each decision.
export const DECISION_LABELS = {
  verified_safe: "Verified safe",
  confirmed_suspicious: "Marked suspicious",
};

// A reviewer's decision overrides the automatic level:
// verified_safe → "low", confirmed_suspicious → "high"
export const FINAL_STATUS_FOR_DECISION = {
  verified_safe: "low",
  confirmed_suspicious: "high",
};

// Score ranges: 0-29 = low, 30-59 = medium, 60+ = high
export const RISK_THRESHOLDS = { medium: 30, high: 60 };
export const MAX_RISK_SCORE = 100;

// Points added by each rule when it triggers.
export const RULE_POINTS = {
  REGISTRATION_FEE: 40,
  NO_COMPANY_WEBSITE: 20,
  FREE_EMAIL_DOMAIN: 20,
  SUSPICIOUS_APPLY_LINK: 15,
  EMAIL_WEBSITE_MISMATCH: 10,
  URGENCY_LANGUAGE: 10,
  UNREALISTIC_STIPEND: 10,
  VAGUE_DESCRIPTION: 5,
};

export const FREE_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.in", "yahoo.co.in",
  "outlook.com", "hotmail.com", "live.com", "rediffmail.com",
  "proton.me", "protonmail.com", "icloud.com", "aol.com", "mail.com",
];

// Messaging apps and link shorteners are not real application pages.
export const SUSPICIOUS_LINK_HOSTS = [
  "wa.me", "whatsapp.com", "t.me", "telegram.me", "telegram.org",
  "bit.ly", "tinyurl.com", "goo.gl", "t.co", "cutt.ly", "rb.gy", "is.gd",
];

// Case-insensitive patterns searched inside the description.
export const REGISTRATION_FEE_PATTERN =
  /registration fee|registration charges|security deposit|refundable deposit|pay to join|training fee|processing fee|kit fee/i;
export const URGENCY_PATTERN =
  /limited seats?|only few seats|apply immediately|last chance|hurry up|act now|offer ends|urgent(ly)? hiring/i;

export const UNREALISTIC_STIPEND_LIMIT = 50000; // INR per month
export const VAGUE_DESCRIPTION_LENGTH = 100; // characters

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 50;
