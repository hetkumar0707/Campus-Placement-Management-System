// Skill dictionary used by the AI matching engine.
// extractSkills(text) finds known skills in free text (resume or job description).
// inferSkillsFromRole(title, description) fills in skills for drives where the recruiter did not list any.

// [canonical name, category, [extra aliases]]
const SKILLS = [
  // Programming languages
  ["Python", "Programming", []],
  ["Java", "Programming", ["core java", "java se"]],
  ["JavaScript", "Programming", ["js", "ecmascript", "es6"]],
  ["TypeScript", "Programming", []],
  ["C", "Programming", ["c programming", "c language"]],
  ["C++", "Programming", ["cpp"]],
  ["C#", "Programming", ["c sharp", "csharp"]],
  ["Go", "Programming", ["golang"]],
  ["Rust", "Programming", []],
  ["PHP", "Programming", []],
  ["Kotlin", "Programming", []],
  ["Swift", "Programming", []],
  ["R", "Programming", ["r programming", "rstudio"]],
  ["Dart", "Programming", []],
  ["Bash", "Programming", ["shell scripting", "shell script"]],

  // Web & frontend
  ["HTML", "Web", ["html5"]],
  ["CSS", "Web", ["css3"]],
  ["React", "Web", ["reactjs", "react.js"]],
  ["Angular", "Web", ["angularjs"]],
  ["Vue", "Web", ["vue.js", "vuejs"]],
  ["Next.js", "Web", ["nextjs"]],
  ["Tailwind CSS", "Web", ["tailwind"]],
  ["Bootstrap", "Web", []],
  ["Responsive Design", "Web", ["responsive web", "responsive ui", "responsive interfaces", "mobile first"]],
  ["Accessibility", "Web", ["wcag", "a11y", "accessible"]],
  ["Redux", "Web", []],
  ["jQuery", "Web", []],

  // Backend
  ["Node.js", "Backend", ["nodejs", "node js"]],
  ["Express.js", "Backend", ["expressjs", "express js"]],
  ["Spring Boot", "Backend", ["springboot", "spring framework", "spring mvc"]],
  ["Django", "Backend", []],
  ["Flask", "Backend", []],
  ["FastAPI", "Backend", []],
  [".NET", "Backend", ["dotnet", "asp.net", "asp net"]],
  ["Laravel", "Backend", []],
  ["REST API", "Backend", ["rest apis", "restful", "rest services", "web services", "api development"]],
  ["GraphQL", "Backend", []],
  ["Microservices", "Backend", ["microservice"]],
  ["Hibernate", "Backend", ["jpa"]],

  // Databases
  ["SQL", "Database", ["structured query language", "t-sql", "pl/sql"]],
  ["MySQL", "Database", ["mariadb"]],
  ["PostgreSQL", "Database", ["postgres"]],
  ["MongoDB", "Database", ["mongo"]],
  ["Oracle", "Database", ["oracle db"]],
  ["SQLite", "Database", []],
  ["Redis", "Database", []],
  ["Firebase", "Database", []],
  ["DBMS", "Database", ["database management", "database design", "rdbms", "normalization"]],

  // CS fundamentals
  ["Data Structures", "Fundamentals", ["dsa", "data structure"]],
  ["Algorithms", "Fundamentals", ["algorithm", "competitive programming", "leetcode", "codeforces"]],
  ["OOP", "Fundamentals", ["object oriented", "object-oriented", "oops"]],
  ["Operating Systems", "Fundamentals", ["operating system"]],
  ["Computer Networks", "Fundamentals", ["networking", "tcp/ip", "tcp ip", "dns", "lan wan"]],
  ["System Design", "Fundamentals", ["low level design", "high level design"]],
  ["Design Patterns", "Fundamentals", []],

  // Data / AI
  ["Machine Learning", "Data & AI", ["ml", "model training", "supervised learning", "feature engineering", "model evaluation"]],
  ["Deep Learning", "Data & AI", ["neural network", "neural networks", "cnn", "lstm"]],
  ["NLP", "Data & AI", ["natural language processing", "text mining"]],
  ["Computer Vision", "Data & AI", ["opencv", "image processing"]],
  ["TensorFlow", "Data & AI", []],
  ["PyTorch", "Data & AI", ["torch"]],
  ["Scikit-learn", "Data & AI", ["sklearn", "scikit learn"]],
  ["Pandas", "Data & AI", []],
  ["NumPy", "Data & AI", ["numpy"]],
  ["Matplotlib", "Data & AI", ["seaborn"]],
  ["Data Analysis", "Data & AI", ["data analytics", "exploratory data analysis", "eda", "data cleaning", "datasets"]],
  ["Data Visualization", "Data & AI", ["dashboards", "dashboard", "data visualisation"]],
  ["Statistics", "Data & AI", ["statistical analysis", "probability"]],
  ["Power BI", "Data & AI", ["powerbi"]],
  ["Tableau", "Data & AI", []],
  ["Excel", "Data & AI", ["ms excel", "microsoft excel", "advanced excel", "excel sheets", "excel spreadsheets", "pivot table", "pivot tables", "vlookup"]],
  ["Big Data", "Data & AI", ["hadoop", "apache spark", "pyspark", "kafka"]],
  ["ETL", "Data & AI", ["data pipeline", "data pipelines", "data warehouse"]],
  ["Generative AI", "Data & AI", ["llm", "llms", "prompt engineering", "langchain", "openai"]],

  // Cloud & DevOps
  ["AWS", "Cloud & DevOps", ["amazon web services", "ec2", "s3"]],
  ["Azure", "Cloud & DevOps", ["microsoft azure"]],
  ["Google Cloud", "Cloud & DevOps", ["gcp"]],
  ["Cloud Computing", "Cloud & DevOps", ["cloud deployment", "cloud"]],
  ["Docker", "Cloud & DevOps", ["containers", "containerization"]],
  ["Kubernetes", "Cloud & DevOps", ["k8s"]],
  ["CI/CD", "Cloud & DevOps", ["jenkins", "github actions", "gitlab ci", "continuous integration"]],
  ["Linux", "Cloud & DevOps", ["ubuntu", "unix"]],
  ["Monitoring", "Cloud & DevOps", ["observability", "grafana", "prometheus"]],
  ["Terraform", "Cloud & DevOps", ["infrastructure as code"]],
  ["Git", "Cloud & DevOps", ["github", "gitlab", "version control", "bitbucket"]],

  // Testing
  ["Software Testing", "Testing", ["manual testing", "test cases", "automated tests", "automated software tests", "test automation", "unit testing", "qa", "quality assurance"]],
  ["Selenium", "Testing", ["webdriver"]],
  ["JUnit", "Testing", ["testng"]],
  ["Cypress", "Testing", ["playwright"]],
  ["Postman", "Testing", ["api testing"]],
  ["Jest", "Testing", ["pytest"]],

  // Security
  ["Cybersecurity", "Security", ["cyber security", "information security", "infosec", "security analysis"]],
  ["Network Security", "Security", ["firewall", "firewalls", "ids/ips", "vpn"]],
  ["Penetration Testing", "Security", ["pentesting", "ethical hacking", "vulnerability assessment", "kali linux", "burp suite", "owasp"]],
  ["SIEM", "Security", ["splunk", "log analysis", "review logs", "incident response", "soc"]],
  ["Cryptography", "Security", ["encryption"]],

  // Mobile
  ["Android", "Mobile", ["android studio"]],
  ["Flutter", "Mobile", []],
  ["React Native", "Mobile", []],
  ["iOS", "Mobile", ["swiftui"]],

  // Methodology & tools
  ["Agile", "Process", ["scrum", "kanban"]],
  ["Jira", "Process", []],
  ["Code Review", "Process", ["code reviews", "peer review"]],
  ["UI/UX Design", "Design", ["ui design", "ux design", "user experience", "user interface", "figma", "wireframing", "adobe xd"]],

  // Electronics & electrical
  ["Embedded Systems", "Electronics", ["embedded c", "microcontroller", "microcontrollers", "arduino", "raspberry pi", "stm32", "8051", "firmware"]],
  ["IoT", "Electronics", ["internet of things"]],
  ["VLSI", "Electronics", ["verilog", "vhdl", "fpga", "digital design"]],
  ["MATLAB", "Electronics", ["simulink"]],
  ["Circuit Design", "Electronics", ["pcb design", "analog circuits", "circuit analysis", "altium", "multisim", "proteus"]],
  ["Signal Processing", "Electronics", ["dsp"]],
  ["Communication Systems", "Electronics", ["wireless", "5g", "antenna"]],
  ["PLC", "Electrical", ["scada", "plc programming", "industrial automation"]],
  ["Power Systems", "Electrical", ["power electronics", "electrical machines", "transformers", "etap"]],
  ["Control Systems", "Electrical", ["control engineering"]],

  // Mechanical
  ["AutoCAD", "Mechanical", ["auto cad"]],
  ["SolidWorks", "Mechanical", ["solid works", "catia", "creo", "fusion 360"]],
  ["ANSYS", "Mechanical", ["fea", "finite element", "cfd"]],
  ["Thermodynamics", "Mechanical", ["heat transfer", "fluid mechanics"]],
  ["Manufacturing", "Mechanical", ["cnc", "lean manufacturing", "six sigma", "production planning"]],

  // Civil
  ["STAAD Pro", "Civil", ["staad", "etabs"]],
  ["Revit", "Civil", ["bim"]],
  ["Surveying", "Civil", ["total station", "gis"]],
  ["Structural Analysis", "Civil", ["structural design", "rcc", "estimation and costing"]],
  ["Project Management", "Civil", ["ms project", "primavera", "project planning"]],

  // Chemical
  ["Process Engineering", "Chemical", ["aspen plus", "aspen hysys", "hysys", "process simulation", "p&id", "chemical process"]],
  ["Quality Control", "Chemical", ["gmp", "lab analysis", "chromatography"]],

  // Soft skills
  ["Communication", "Soft skills", ["presentation skills", "public speaking", "written communication"]],
  ["Teamwork", "Soft skills", ["team player", "collaboration", "team work"]],
  ["Leadership", "Soft skills", ["team lead", "team leadership"]],
  ["Problem Solving", "Soft skills", ["analytical thinking", "analytical skills"]],
];

// Role templates: a drive whose title/description matches the pattern is expected to need these skills.
const ROLE_TEMPLATES = [
  [/ui (developer|engineer)|front.?end|web designer/, ["HTML", "CSS", "JavaScript", "React", "Responsive Design", "Accessibility"]],
  [/full.?stack/, ["JavaScript", "React", "Node.js", "SQL", "REST API", "HTML", "CSS", "Git"]],
  [/back.?end/, ["REST API", "SQL", "Git", "Data Structures"]],
  [/software (engineer|developer)|sde\b/, ["Data Structures", "Algorithms", "OOP", "REST API", "SQL", "Git"]],
  [/python developer/, ["Python", "Software Testing", "Git", "REST API"]],
  [/java (developer|trainee)/, ["Java", "OOP", "SQL", "Code Review", "Spring Boot"]],
  [/qa|test(er| engineer| automation)|quality assurance/, ["Software Testing", "Selenium", "Python", "Java", "Agile"]],
  [/machine learning|ml (engineer|intern)|\bai\b|data scientist/, ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn", "Statistics"]],
  [/data analyst|business analyst|analytics/, ["SQL", "Excel", "Data Analysis", "Data Visualization", "Python", "Power BI", "Statistics"]],
  [/cyber ?security|security analyst|soc analyst/, ["Cybersecurity", "Network Security", "SIEM", "Linux", "Computer Networks"]],
  [/cloud|devops|site reliability|\bsre\b/, ["Cloud Computing", "AWS", "Linux", "Docker", "Monitoring", "Computer Networks"]],
  [/android|mobile app/, ["Android", "Kotlin", "Java"]],
  [/embedded|firmware/, ["Embedded Systems", "C", "C++", "Circuit Design"]],
  [/vlsi|chip design|rtl/, ["VLSI", "Embedded Systems", "Circuit Design"]],
  [/design engineer|mechanical|cad/, ["AutoCAD", "SolidWorks", "ANSYS", "Manufacturing"]],
  [/site engineer|civil|structural/, ["AutoCAD", "STAAD Pro", "Structural Analysis", "Project Management"]],
  [/electrical|power|plc|automation/, ["PLC", "Power Systems", "Control Systems", "MATLAB"]],
  [/process engineer|chemical|plant/, ["Process Engineering", "Quality Control", "Thermodynamics"]],
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");

// Build one regex per skill. The look-arounds stop "java" matching inside "javascript" and "c" inside "react".
const ALIAS_ONLY = new Set(["C", "R", "Go", "Excel"]); // bare word is too ambiguous ("go to", "excel at", "vitamin C")

const MATCHERS = SKILLS.map(([name, category, aliases]) => {
  const terms = (ALIAS_ONLY.has(name) ? aliases : [name, ...aliases]).map((t) => t.toLowerCase());
  const pattern = terms.map(escapeRe).join("|");
  return { name, category, re: new RegExp(`(?<![a-z0-9+#.])(?:${pattern})(?![a-z0-9+#]|\\.[a-z0-9])`, "i") };
});

const CANONICAL = new Map(SKILLS.map(([name, category]) => [name.toLowerCase(), { name, category }]));

function extractSkills(text) {
  const t = String(text || "");
  if (!t.trim()) return [];
  return MATCHERS.filter((m) => m.re.test(t)).map((m) => m.name);
}

function inferSkillsFromRole(title = "", description = "") {
  const hay = `${title} ${description}`.toLowerCase();
  const out = new Set(extractSkills(hay));
  for (const [re, skills] of ROLE_TEMPLATES) {
    if (re.test(hay)) skills.forEach((s) => out.add(s));
  }
  return [...out];
}

// Turn free input ("python, SQL ,react.js") into canonical skill names where possible.
function normalizeSkillList(input) {
  let list = input;
  if (typeof list === "string") {
    try {
      const parsed = JSON.parse(list);
      list = Array.isArray(parsed) ? parsed : list.split(",");
    } catch (e) {
      list = list.split(",");
    }
  }
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const value = String(raw || "").trim().slice(0, 40);
    if (!value) continue;
    const found = extractSkills(value);
    const name = found.length === 1 && value.length <= found[0].length + 6 ? found[0] : value;
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(name);
    }
  }
  return out.slice(0, 40);
}

function parseSkillColumn(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return String(value).split(",").map((x) => x.trim()).filter(Boolean);
  }
}

function skillCategory(name) {
  return CANONICAL.get(String(name).toLowerCase())?.category || "Other";
}

module.exports = { SKILLS, extractSkills, inferSkillsFromRole, normalizeSkillList, parseSkillColumn, skillCategory };
