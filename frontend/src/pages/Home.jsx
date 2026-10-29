import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { homePath } from "../api.js";
import Icon from "../components/Icon.jsx";

const FEATURES = [
  { icon: "sparkles", tone: "", title: "AI job matching", text: "Upload your resume and get every drive ranked by how well your skills fit, with the reasons shown." },
  { icon: "shield", tone: "green", title: "Smart eligibility", text: "Branch, CGPA and backlog rules are checked automatically, so you only apply where you qualify." },
  { icon: "briefcase", tone: "blue", title: "Easy job posting", text: "Recruiters publish drives with required skills and get applicants ranked by fit." },
  { icon: "chart", tone: "amber", title: "Placement insights", text: "The TPO tracks applications, selections and branch-wise placement in real time." },
];
const STEPS = [
  ["Create your profile", "Add your branch, CGPA and skills, then upload your resume."],
  ["Get AI recommendations", "See which drives suit you best and which skills would raise your match."],
  ["Apply and track", "Apply in one click and follow each application through to selection."],
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="container">
      <section className="hero">
        <span className="hero-pill"><Icon name="sparkles" size={14} />Now with AI job recommendations</span>
        <h1>Your campus placements, in one smart portal.</h1>
        <p>Manage profiles, placement drives, eligibility, applications and interviews, and let AI point every student to the roles they are most likely to land.</p>
        <div className="btn-row">
          {user ? (
            <Link to={homePath(user.role)} className="btn light">Go to dashboard<Icon name="arrow" size={16} /></Link>
          ) : (
            <>
              <Link to="/signup" className="btn light">Get started<Icon name="arrow" size={16} /></Link>
              <Link to="/login" className="btn outline-light">Login</Link>
            </>
          )}
        </div>
      </section>

      <section className="grid cols-4">
        {FEATURES.map((f) => (
          <div className="card feature-card hover" key={f.title}>
            <div className={`stat-icon ${f.tone}`}><Icon name={f.icon} size={22} /></div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <div className="section-title"><h2>How it works</h2></div>
      <section className="grid cols-3 steps" style={{ marginTop: 22 }}>
        {STEPS.map(([t, d]) => (
          <div className="card" key={t}><h3>{t}</h3><p className="muted" style={{ marginTop: 6 }}>{d}</p></div>
        ))}
      </section>
    </div>
  );
}
