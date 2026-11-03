// PURE functions: no database, no side effects. Input = an internship object,
// output = null (rule did not trigger) or { ruleId, message, points }.
import {
  RULE_POINTS,
  FREE_EMAIL_DOMAINS,
  SUSPICIOUS_LINK_HOSTS,
  REGISTRATION_FEE_PATTERN,
  URGENCY_PATTERN,
  UNREALISTIC_STIPEND_LIMIT,
  VAGUE_DESCRIPTION_LENGTH,
  RISK_THRESHOLDS,
  MAX_RISK_SCORE,
} from "../constants";

// ---------- small helpers ----------
function hasValue(text) {
  return typeof text === "string" && text.trim() !== ""; // "" counts as missing
}

// "https://www.acme.com/apply" → "acme.com"
function getHost(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

// "HR@Acme.com" → "acme.com"
function getEmailDomain(email) {
  const parts = (email || "").toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

function isFreeEmail(email) {
  return FREE_EMAIL_DOMAINS.includes(getEmailDomain(email));
}

// ---------- the rules ----------
function registrationFeeRule(internship) {
  if (internship.registrationFee > 0) {
    return {
      ruleId: "REGISTRATION_FEE",
      message: `Asks students to pay a registration fee of ₹${internship.registrationFee.toLocaleString("en-IN")}`,
      points: RULE_POINTS.REGISTRATION_FEE,
    };
  }
  if (REGISTRATION_FEE_PATTERN.test(internship.description)) {
    return {
      ruleId: "REGISTRATION_FEE",
      message: "Description mentions a registration fee or deposit",
      points: RULE_POINTS.REGISTRATION_FEE,
    };
  }
  return null;
}

function noCompanyWebsiteRule(internship) {
  if (hasValue(internship.companyWebsite)) return null;
  return {
    ruleId: "NO_COMPANY_WEBSITE",
    message: "No company website was provided",
    points: RULE_POINTS.NO_COMPANY_WEBSITE,
  };
}

function freeEmailDomainRule(internship) {
  if (!hasValue(internship.contactEmail) || !isFreeEmail(internship.contactEmail)) return null;
  return {
    ruleId: "FREE_EMAIL_DOMAIN",
    message: `Contact email uses a free provider (${getEmailDomain(internship.contactEmail)}) instead of a company domain`,
    points: RULE_POINTS.FREE_EMAIL_DOMAIN,
  };
}

function suspiciousApplyLinkRule(internship) {
  const host = getHost(internship.applicationLink);
  const suspicious = SUSPICIOUS_LINK_HOSTS.some((bad) => host === bad || host.endsWith("." + bad));
  if (!suspicious) return null;
  return {
    ruleId: "SUSPICIOUS_APPLY_LINK",
    message: `Application link goes to ${host}, a messaging app or link shortener, not a company page`,
    points: RULE_POINTS.SUSPICIOUS_APPLY_LINK,
  };
}

function emailWebsiteMismatchRule(internship) {
  if (!hasValue(internship.contactEmail) || !hasValue(internship.companyWebsite)) return null;
  if (isFreeEmail(internship.contactEmail)) return null; // already caught by FREE_EMAIL_DOMAIN

  const emailDomain = getEmailDomain(internship.contactEmail);
  const siteHost = getHost(internship.companyWebsite);
  if (!emailDomain || !siteHost) return null;

  // "mail.acme.com" and "acme.com" count as the same company.
  const matches =
    emailDomain === siteHost || siteHost.endsWith("." + emailDomain) || emailDomain.endsWith("." + siteHost);
  if (matches) return null;

  return {
    ruleId: "EMAIL_WEBSITE_MISMATCH",
    message: `Email domain (${emailDomain}) does not match the company website (${siteHost})`,
    points: RULE_POINTS.EMAIL_WEBSITE_MISMATCH,
  };
}

function urgencyLanguageRule(internship) {
  if (!URGENCY_PATTERN.test(internship.description)) return null;
  return {
    ruleId: "URGENCY_LANGUAGE",
    message: "Description uses pressure words like 'limited seats' or 'apply immediately'",
    points: RULE_POINTS.URGENCY_LANGUAGE,
  };
}

function unrealisticStipendRule(internship) {
  if (!(internship.stipend > UNREALISTIC_STIPEND_LIMIT)) return null;
  return {
    ruleId: "UNREALISTIC_STIPEND",
    message: `Stipend of ₹${internship.stipend.toLocaleString("en-IN")}/month is unusually high for an internship`,
    points: RULE_POINTS.UNREALISTIC_STIPEND,
  };
}

function vagueDescriptionRule(internship) {
  if (internship.description.length >= VAGUE_DESCRIPTION_LENGTH) return null;
  return {
    ruleId: "VAGUE_DESCRIPTION",
    message: "Description is very short and gives few details",
    points: RULE_POINTS.VAGUE_DESCRIPTION,
  };
}

// To add a new rule: write a function above and add it to this list.
const RULES = [
  registrationFeeRule,
  noCompanyWebsiteRule,
  freeEmailDomainRule,
  suspiciousApplyLinkRule,
  emailWebsiteMismatchRule,
  urgencyLanguageRule,
  unrealisticStipendRule,
  vagueDescriptionRule,
];

// Score → "low" | "medium" | "high"
export function getRiskLevel(score) {
  if (score >= RISK_THRESHOLDS.high) return "high";
  if (score >= RISK_THRESHOLDS.medium) return "medium";
  return "low";
}

// Runs every rule and adds up the points.
export function evaluateRules(internship) {
  const reasons = [];
  for (const rule of RULES) {
    const result = rule(internship);
    if (result) reasons.push(result);
  }
  const total = reasons.reduce((sum, reason) => sum + reason.points, 0);
  const riskScore = Math.min(total, MAX_RISK_SCORE); // never above 100
  return { riskScore, riskLevel: getRiskLevel(riskScore), reasons };
}
