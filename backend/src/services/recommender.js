// AI job-matching engine (runs locally, no API key needed).
//
// For every drive it combines four signals into a 0-100 match score:
//   1. Skill match      (45%)  - how many of the drive's required skills the student has
//   2. Text similarity  (25%)  - TF-IDF cosine similarity between resume/skills and the job description
//   3. Career interest  (10%)  - does the drive title match what the student said they want
//   4. Academic fit     (20%)  - CGPA headroom above the drive's cut-off
// A signal that cannot be computed (e.g. no resume yet) is dropped and the weights are re-normalised,
// so a missing resume lowers confidence instead of silently lowering the score.
// Every result also carries matched/missing skills and plain-English reasons, so the match is explainable.

const { extractSkills, inferSkillsFromRole, parseSkillColumn } = require("../utils/skills");
const { parseBranches } = require("../utils/eligibility");

const WEIGHTS = { skill: 0.45, text: 0.25, interest: 0.1, academic: 0.2 };

const STOPWORDS = new Set(
  ("a an and are as at be by for from has have in is it its of on or that the their this to was were will with you your we our " +
    "etc using use used based work working strong good knowledge experience skills ability candidate role job responsibilities " +
    "build maintain support develop help new team within across including such than into over under also can may more most").split(" ")
);

function tokenize(text) {
  return (String(text || "").toLowerCase().match(/[a-z][a-z0-9+#.]{1,}/g) || [])
    .map((w) => w.replace(/\.+$/, ""))
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function termFreq(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

function buildIdf(docTokenLists) {
  const df = new Map();
  for (const tokens of docTokenLists) for (const t of new Set(tokens)) df.set(t, (df.get(t) || 0) + 1);
  const n = docTokenLists.length;
  const idf = new Map();
  for (const [t, d] of df) idf.set(t, Math.log((1 + n) / (1 + d)) + 1);
  return idf;
}

function vectorize(tokens, idf) {
  const vec = new Map();
  let norm = 0;
  for (const [t, f] of termFreq(tokens)) {
    const w = (1 + Math.log(f)) * (idf.get(t) || 1); // sub-linear tf * idf
    vec.set(t, w);
    norm += w * w;
  }
  return { vec, norm: Math.sqrt(norm) };
}

function cosine(a, b) {
  if (!a.norm || !b.norm) return 0;
  let dot = 0;
  const [small, large] = a.vec.size < b.vec.size ? [a.vec, b.vec] : [b.vec, a.vec];
  for (const [t, w] of small) if (large.has(t)) dot += w * large.get(t);
  return dot / (a.norm * b.norm);
}

const round1 = (n) => Math.round(n * 10) / 10;

/** Skills a drive needs: what the recruiter listed, otherwise inferred from title + description. */
function jobSkills(job) {
  const listed = parseSkillColumn(job.required_skills);
  if (listed.length) return { skills: listed, source: "recruiter" };
  return { skills: inferSkillsFromRole(job.title, job.description), source: "inferred" };
}

/** All skills known for a student: typed on the profile plus detected in the resume. */
function studentSkills(student) {
  const typed = parseSkillColumn(student.skills);
  const detected = extractSkills(student.resume_text || "");
  const seen = new Set();
  const all = [];
  for (const s of [...typed, ...detected]) {
    if (!seen.has(s.toLowerCase())) {
      seen.add(s.toLowerCase());
      all.push(s);
    }
  }
  return { typed, detected, all };
}

/** How complete the student's profile is for matching purposes (0-100) with a to-do list. */
function profileStrength(student, skills, resumeAnalysis) {
  const todo = [];
  let score = 0;
  if (student.branch && Number(student.cgpa) > 0) score += 20; else todo.push("Add your branch and CGPA");
  if (student.phone) score += 5; else todo.push("Add your phone number");
  if (student.graduation_year) score += 5;
  if (student.resume_text || student.has_resume) score += 25; else todo.push("Upload your resume (PDF or DOCX)");
  if (skills.typed.length >= 5) score += 25;
  else if (skills.typed.length > 0) { score += 12; todo.push("Add at least 5 skills to your profile"); }
  else todo.push("Add your skills to your profile");
  if (String(student.career_interests || "").trim()) score += 10; else todo.push("Tell us which roles you are interested in");
  if (resumeAnalysis && resumeAnalysis.score >= 60) score += 10;
  else if (resumeAnalysis && resumeAnalysis.score > 0) { score += 5; todo.push("Improve your resume (see the tips below)"); }
  return { score: Math.min(100, score), todo };
}

function matchLabel(score) {
  if (score >= 75) return "Excellent match";
  if (score >= 55) return "Good match";
  if (score >= 35) return "Fair match";
  return "Low match";
}

function interestScore(interests, job) {
  const phrases = String(interests || "").toLowerCase().split(/[,;\n]/).map((x) => x.trim()).filter((x) => x.length > 1);
  if (!phrases.length) return null;
  const title = String(job.title || "").toLowerCase();
  const desc = String(job.description || "").toLowerCase();
  let best = 0;
  for (const p of phrases) {
    if (title.includes(p)) best = Math.max(best, 1);
    else {
      const words = p.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
      const hitsTitle = words.filter((w) => title.includes(w)).length;
      const hitsDesc = words.filter((w) => desc.includes(w)).length;
      if (words.length) best = Math.max(best, 0.7 * (hitsTitle / words.length) + 0.3 * (hitsDesc / words.length));
    }
  }
  return Math.min(1, best);
}

/**
 * Score many drives for one student.
 * @param student  row with branch, cgpa, backlogs, skills, career_interests, resume_text
 * @param jobs     drives, each already carrying { eligible, reasons } for this student (see routes/jobs.js)
 */
function recommend(student, jobs) {
  const sk = studentSkills(student);
  const studentSet = new Set(sk.all.map((s) => s.toLowerCase()));

  const studentTokens = tokenize(
    [student.resume_text || "", (sk.all.join(" ") + " ").repeat(3), (student.career_interests || "") + " ", (student.career_interests || "") + " "].join(" ")
  );
  const jobInfos = jobs.map((job) => {
    const js = jobSkills(job);
    const docTokens = tokenize(`${job.title} ${job.title} ${job.description || ""} ${js.skills.join(" ")}`);
    return { job, js, docTokens };
  });
  const idf = buildIdf([...jobInfos.map((j) => j.docTokens), studentTokens]);
  const studentVec = vectorize(studentTokens, idf);
  const haveText = studentTokens.length >= 5;

  // Raw similarities, scaled so the best-fitting drive for this student is not punished by short job descriptions
  const sims = jobInfos.map((j) => cosine(studentVec, vectorize(j.docTokens, idf)));
  const simCeiling = Math.max(0.3, ...sims);

  const results = jobInfos.map((info, i) => {
    const { job, js } = info;
    const required = js.skills;
    const matched = required.filter((s) => studentSet.has(s.toLowerCase()));
    const missing = required.filter((s) => !studentSet.has(s.toLowerCase()));

    const components = {
      skill: required.length && studentSet.size ? matched.length / required.length : required.length ? 0 : null,
      text: haveText ? Math.min(1, sims[i] / simCeiling) : null,
      interest: interestScore(student.career_interests, job),
      academic: (() => {
        const headroom = Number(student.cgpa) - Number(job.min_cgpa || 0);
        return Math.max(0, Math.min(1, 0.55 + headroom / 4)); // 0.55 at the cut-off, 1.0 when 1.8+ points above it
      })(),
    };

    let weighted = 0;
    let totalWeight = 0;
    for (const [key, weight] of Object.entries(WEIGHTS)) {
      if (components[key] == null) continue;
      weighted += components[key] * weight;
      totalWeight += weight;
    }
    let score = totalWeight ? (weighted / totalWeight) * 100 : 0;
    if (job.eligible === false) score *= 0.5; // can't apply, so rank it lower but still show it

    const reasons = [];
    if (required.length && matched.length) {
      reasons.push(`You have ${matched.length} of ${required.length} skills this role asks for (${matched.slice(0, 4).join(", ")}${matched.length > 4 ? "..." : ""})`);
    } else if (required.length && !studentSet.size) {
      reasons.push("Add skills or upload a resume to see how well you match the required skills");
    } else if (required.length) {
      reasons.push(`None of the ${required.length} skills this role asks for were found on your profile or resume`);
    }
    if (components.text != null && components.text >= 0.6) reasons.push("Your resume content is closely related to this role's description");
    if (components.interest != null && components.interest >= 0.6) reasons.push("Matches the roles you said you are interested in");
    const headroom = Number(student.cgpa) - Number(job.min_cgpa || 0);
    if (job.eligible !== false && headroom >= 1) reasons.push(`Your CGPA (${Number(student.cgpa).toFixed(2)}) is comfortably above the ${Number(job.min_cgpa).toFixed(2)} cut-off`);
    if (job.eligible === false && job.reasons?.length) reasons.push(`Not eligible: ${job.reasons.join("; ")}`);

    return {
      job_id: job.id,
      score: Math.round(score),
      label: job.eligible === false ? "Not eligible" : matchLabel(score),
      matched_skills: matched,
      missing_skills: missing,
      skills_source: js.source,
      breakdown: {
        skills: components.skill == null ? null : Math.round(components.skill * 100),
        resume_relevance: components.text == null ? null : Math.round(components.text * 100),
        interest: components.interest == null ? null : Math.round(components.interest * 100),
        academics: Math.round(components.academic * 100),
      },
      reasons: reasons.slice(0, 4),
    };
  });

  return { results, skills: sk, haveText };
}

/** Score a single (student, job) pair, used for ranking applicants on the recruiter side. */
function scoreOne(student, job) {
  const { results } = recommend(student, [{ ...job, eligible: true }]);
  return results[0];
}

/** Score many students against one drive (recruiter view). IDF is built over the applicant pool + the drive. */
function scoreApplicants(students, job) {
  const js = jobSkills(job);
  const jobTokens = tokenize(`${job.title} ${job.title} ${job.description || ""} ${js.skills.join(" ")}`);
  const studentInfos = students.map((s) => {
    const sk = studentSkills(s);
    const tokens = tokenize([s.resume_text || "", (sk.all.join(" ") + " ").repeat(3), s.career_interests || ""].join(" "));
    return { s, sk, tokens };
  });
  const idf = buildIdf([jobTokens, ...studentInfos.map((x) => x.tokens)]);
  const jobVec = vectorize(jobTokens, idf);
  const sims = studentInfos.map((x) => cosine(vectorize(x.tokens, idf), jobVec));
  const ceiling = Math.max(0.3, ...sims);

  return studentInfos.map((x, i) => {
    const set = new Set(x.sk.all.map((v) => v.toLowerCase()));
    const matched = js.skills.filter((v) => set.has(v.toLowerCase()));
    const comps = {
      skill: js.skills.length && set.size ? matched.length / js.skills.length : js.skills.length ? 0 : null,
      text: x.tokens.length >= 5 ? Math.min(1, sims[i] / ceiling) : null,
      interest: interestScore(x.s.career_interests, job),
      academic: Math.max(0, Math.min(1, 0.55 + (Number(x.s.cgpa) - Number(job.min_cgpa || 0)) / 4)),
    };
    let w = 0, tw = 0;
    for (const [k, weight] of Object.entries(WEIGHTS)) {
      if (comps[k] == null) continue;
      w += comps[k] * weight;
      tw += weight;
    }
    const score = tw ? Math.round((w / tw) * 100) : 0;
    return { student_id: x.s.id, score, label: matchLabel(score), matched_skills: matched, missing_skills: js.skills.filter((v) => !set.has(v.toLowerCase())), skills: x.sk.all.slice(0, 12) };
  });
}

module.exports = { recommend, scoreOne, scoreApplicants, studentSkills, jobSkills, profileStrength, matchLabel, round1, parseBranches };
