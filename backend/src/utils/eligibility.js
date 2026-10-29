// Eligibility rules: Branch, CGPA and Backlogs (see Module 3 of the practical)

function parseBranches(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      /* not JSON - treat as comma separated */
    }
    return value.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

/**
 * @param student { branch, cgpa, backlogs }
 * @param job     { eligible_branches, min_cgpa, max_backlogs }
 * @returns { eligible: boolean, reasons: string[] }
 */
function checkEligibility(student, job) {
  const reasons = [];
  const branches = parseBranches(job.eligible_branches).map(normalize);

  if (branches.length && !branches.includes(normalize(student.branch))) {
    reasons.push("Your branch is not eligible for this drive");
  }
  if (Number(student.cgpa) < Number(job.min_cgpa)) {
    reasons.push(`Minimum CGPA required is ${Number(job.min_cgpa).toFixed(2)}`);
  }
  if (Number(student.backlogs) > Number(job.max_backlogs)) {
    reasons.push(`Maximum ${job.max_backlogs} backlog(s) allowed`);
  }
  return { eligible: reasons.length === 0, reasons };
}

module.exports = { checkEligibility, parseBranches };
