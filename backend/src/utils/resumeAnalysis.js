// Rule-based resume check: which sections exist, how complete it looks, and what to improve.
const { extractSkills } = require("./skills");

const SECTION_PATTERNS = {
  summary: /\b(summary|objective|profile|about me)\b/i,
  education: /\b(education|academic|qualification|b\.?\s?tech|b\.?\s?e\.?|bachelor|diploma|university|college)\b/i,
  experience: /\b(experience|internship|intern\b|employment|work history|worked at)\b/i,
  projects: /\b(projects?|academic projects?|personal projects?)\b/i,
  skills: /\b(skills|technical skills|technologies|tech stack|tools)\b/i,
  certifications: /\b(certifications?|certificates?|courses?|coursera|udemy|nptel)\b/i,
  achievements: /\b(achievements?|awards?|honou?rs|hackathon|rank|winner|scholarship)\b/i,
};

function analyzeResume(text, student = {}) {
  const t = String(text || "");
  const words = (t.match(/\b[\w+#.]+\b/g) || []).length;
  const skills = extractSkills(t);

  const sections = {};
  for (const [key, re] of Object.entries(SECTION_PATTERNS)) sections[key] = re.test(t);

  const contact = {
    email: /[^\s@]+@[^\s@]+\.[^\s@]+/.test(t),
    phone: /(\+?\d[\d\s-]{8,}\d)/.test(t),
    linkedin: /linkedin\.com/i.test(t),
    github: /github\.com/i.test(t),
  };

  const hasNumbers = (t.match(/\b\d+(\.\d+)?\s?(%|x|k\+?|users|students|projects|lpa)\b/gi) || []).length;

  // Score out of 100
  let score = 0;
  score += Math.min(30, skills.length * 3);                               // skills evidence (max 30)
  score += (sections.education ? 8 : 0) + (sections.projects ? 12 : 0) + (sections.experience ? 10 : 0);
  score += (sections.skills ? 5 : 0) + (sections.certifications ? 4 : 0) + (sections.achievements ? 3 : 0) + (sections.summary ? 3 : 0);
  score += (contact.email ? 3 : 0) + (contact.phone ? 2 : 0) + (contact.linkedin ? 3 : 0) + (contact.github ? 4 : 0);
  score += hasNumbers >= 2 ? 3 : 0;
  if (words < 150) score -= 15;
  else if (words > 1100) score -= 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const tips = [];
  if (!t.trim()) {
    tips.push("We could not read any text from this file. Upload a text-based PDF or DOCX (not a scanned image).");
  } else {
    if (words < 150) tips.push("Your resume looks very short. Add projects, internships and skills to give recruiters more to evaluate.");
    if (!sections.projects) tips.push("Add a Projects section with 2-3 projects, the tech stack used, and what you achieved.");
    if (!sections.experience) tips.push("Add internships, training or freelance work, even small ones, under an Experience section.");
    if (!sections.skills || skills.length < 5) tips.push("List your technical skills clearly in a Skills section. We detected only " + skills.length + ".");
    if (!contact.github && !contact.linkedin) tips.push("Add your GitHub and/or LinkedIn link so recruiters can see your work.");
    if (!contact.email || !contact.phone) tips.push("Make sure your email address and phone number are on the resume.");
    if (hasNumbers < 2) tips.push("Quantify your impact where you can (for example 'reduced load time by 40%' or 'built for 200+ users').");
    if (!sections.certifications) tips.push("Mention relevant certifications or online courses if you have any.");
    if (words > 1100) tips.push("Your resume is long. Aim for one page (two at most) with the strongest points first.");
  }

  return {
    word_count: words,
    score,
    skills,
    sections,
    contact,
    tips: tips.slice(0, 6),
  };
}

module.exports = { analyzeResume };
