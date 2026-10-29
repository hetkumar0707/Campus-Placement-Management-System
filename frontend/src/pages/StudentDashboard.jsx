import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { STATUS_STEPS, fmt2, getError } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import Icon from "../components/Icon.jsx";
import JobCard from "../components/JobCard.jsx";
import { Alert, Empty, Loading, MatchRing, PageHead, StatCard, money, when } from "../components/ui.jsx";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [rec, setRec] = useState(null);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [p, r, a, e] = await Promise.all([API.get("/students/profile"), API.get("/recommendations?limit=3"), API.get("/applications/my"), API.get("/jobs/eligible")]);
      setEligibleCount(e.data.length);
      setProfile(p.data);
      setRec(r.data);
      setApps(a.data);
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not load dashboard") });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function apply(jobId) {
    try {
      const res = await API.post(`/applications/${jobId}/apply`);
      setMessage({ type: "success", text: res.data.message });
      load();
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not apply") });
    }
  }

  if (loading) return <div className="container"><Loading rows={4} /></div>;

  const strength = rec?.profile_strength;
  const active = apps.filter((a) => ["SHORTLISTED", "INTERVIEW"].includes(a.status)).length;
  const selected = apps.filter((a) => a.status === "SELECTED").length;
  const top = rec?.recommendations || [];

  return (
    <div className="container">
      <PageHead title={`Hi, ${user.name.split(" ")[0]} 👋`} subtitle="Here is where your placement journey stands today." />
      <Alert message={message} />

      <section className="grid cols-4">
        <StatCard icon="briefcase" label="Eligible drives" value={eligibleCount} />
        <StatCard icon="file" label="Applications" value={apps.length} tone="blue" />
        <StatCard icon="clock" label="Shortlisted / interviews" value={active} tone="amber" />
        <StatCard icon="award" label="Offers" value={selected} tone="green" />
      </section>

      <section className="grid" style={{ gridTemplateColumns: "2fr 1fr", marginTop: 16 }}>
        <div className="card accent">
          <div className="row between" style={{ alignItems: "center", flexWrap: "nowrap" }}>
            <div>
              <span className="hero-pill"><Icon name="sparkles" size={14} />AI career match</span>
              <h2 style={{ fontSize: 22 }}>{top[0] ? `Your best match: ${top[0].title}` : "Complete your profile to unlock matches"}</h2>
              <p className="muted" style={{ margin: "8px 0 16px", maxWidth: 520 }}>
                {top[0] ? `${top[0].company_name} · ${top[0].match.score}% match. See why, and which skills would push the score higher.` : "Add your skills and upload a resume so we can rank drives for you."}
              </p>
              <Link to="/student/recommendations" className="btn light">View all recommendations<Icon name="arrow" size={16} /></Link>
            </div>
            {top[0] && <div style={{ background: "#fff", borderRadius: "50%", padding: 4, flex: "none" }}><MatchRing score={top[0].match.score} size={92} /></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-title"><h3>Profile strength</h3><span className="badge neutral">{strength?.score ?? 0}%</span></div>
          <div className="bar"><i style={{ width: `${strength?.score ?? 0}%` }} /></div>
          {strength?.todo?.length > 0 ? (
            <ul className="insight-list" style={{ marginTop: 12 }}>
              {strength.todo.slice(0, 3).map((t) => <li key={t}>{t}</li>)}
            </ul>
          ) : <p className="muted" style={{ marginTop: 10 }}>Your profile is complete. Nice work!</p>}
          <Link to="/student/profile" className="btn secondary small" style={{ marginTop: 14 }}>Edit profile</Link>
        </div>
      </section>

      <div className="section-title">
        <h2>Top recommended drives</h2>
        <Link to="/student/recommendations" className="btn ghost small">See all<Icon name="arrow" size={14} /></Link>
      </div>
      {top.length === 0 ? <Empty icon="briefcase" title="No eligible drives right now">New drives that match your branch, CGPA and backlogs will appear here.</Empty> : (
        <div className="grid cols-3">
          {top.map((job) => <JobCard key={job.id} job={job} onApply={apply} showWhy={false} />)}
        </div>
      )}

      <div className="section-title"><h2>My applications</h2><Link to="/student/jobs" className="btn ghost small">Manage<Icon name="arrow" size={14} /></Link></div>
      {apps.length === 0 ? <Empty icon="file" title="No applications yet">Apply to a recommended drive to start tracking it here.</Empty> : (
        <div className="stack">
          {apps.slice(0, 4).map((a) => (
            <div className="card app-row" key={a.id}>
              <div>
                <h3>{a.title}</h3>
                <p className="muted">{a.company_name} · {money(a.package_lpa)} · Applied {when(a.applied_at)}</p>
              </div>
              <div className="row">
                <Timeline status={a.status} />
                <span className={`badge ${a.status}`}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="faint" style={{ marginTop: 18 }}>Signed in with CGPA {fmt2(profile?.cgpa)} · {profile?.branch}</p>
    </div>
  );
}

export function Timeline({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  const rejected = status === "REJECTED";
  return (
    <div className={`timeline ${rejected ? "rejected" : ""}`} title={status}>
      {STATUS_STEPS.map((s, i) => <i key={s} className={rejected ? (i === 0 ? "on" : "") : i <= idx ? "on" : ""} />)}
    </div>
  );
}
