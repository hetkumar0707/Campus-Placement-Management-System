import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { getError } from "../api.js";
import Icon from "../components/Icon.jsx";
import JobCard from "../components/JobCard.jsx";
import { Alert, Empty, Loading, PageHead } from "../components/ui.jsx";

// Job recommendations ranked locally using profile, resume, skills, interests and academic fit.
export default function Recommendations() {
  const [data, setData] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load(all = showAll) {
    try {
      const res = await API.get(`/recommendations?limit=30${all ? "&all=1" : ""}`);
      setData(res.data);
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not load recommendations") });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(showAll); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [showAll]);

  async function apply(jobId) {
    try {
      const res = await API.post(`/applications/${jobId}/apply`);
      setMessage({ type: "success", text: res.data.message });
      load();
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not apply") });
    }
  }

  async function save(jobId) {
    try {
      const res = await API.post(`/jobs/${jobId}/save`);
      setData((d) => ({ ...d, recommendations: d.recommendations.map((j) => (j.id === jobId ? { ...j, saved: res.data.saved } : j)) }));
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not save drive") });
    }
  }


  if (loading) return <div className="container"><Loading rows={4} /></div>;
  if (!data) return <div className="container"><Alert message={message} /></div>;

  const { profile_strength: ps, skills, resume, skill_gaps: gaps, recommendations: recs } = data;
  const lowConfidence = !skills.all.length;

  return (
    <div className="container">
      <PageHead title="AI job recommendations" subtitle="Drives ranked by how well your skills, resume and interests fit each role." />
      <Alert message={message} />
      {lowConfidence && (
        <div className="alert info">
          <Icon name="bulb" size={18} />
          <span>We don't know your skills yet, so these scores rely mostly on academics. <Link to="/student/profile" style={{ fontWeight: 700, textDecoration: "underline" }}>Add skills and upload your resume</Link> for much better matches.</span>
        </div>
      )}

      <div className="split">
        {/* ---------- Left: insights ---------- */}
        <aside className="stack sticky">
          <div className="card">
            <div className="card-title"><h3>Profile strength</h3><span className="badge neutral">{ps.score}%</span></div>
            <div className="bar"><i style={{ width: `${ps.score}%` }} /></div>
            {ps.todo.length > 0 && <ul className="insight-list" style={{ marginTop: 12 }}>{ps.todo.map((t) => <li key={t}>{t}</li>)}</ul>}
            <Link to="/student/profile" className="btn secondary small" style={{ marginTop: 14 }}>Improve profile</Link>
          </div>

          <div className="card">
            <div className="card-title"><h3>Your skills</h3><span className="faint">{skills.all.length} found</span></div>
            {skills.all.length === 0 ? <p className="muted">No skills yet.</p> : (
              <div className="chips">
                {skills.all.slice(0, 24).map((s) => <span key={s} className="chip primary">{s}</span>)}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title"><h3>Resume check</h3>{resume.has_text && <span className={`badge ${resume.score >= 70 ? "success" : resume.score >= 45 ? "warn" : "danger"}`}>{resume.score}/100</span>}</div>
            {resume.has_text ? (
              resume.tips.length ? <ul className="insight-list">{resume.tips.slice(0, 4).map((t) => <li key={t}>{t}</li>)}</ul> : <p className="muted">Your resume covers the key sections. Great job!</p>
            ) : resume.has_file ? (
              <p className="muted">We couldn't read your resume's text. Re-upload it as a text-based PDF or DOCX.</p>
            ) : (
              <p className="muted">Upload your resume so we can analyze its text and improve job matching.</p>
            )}
          </div>

          {gaps.length > 0 && (
            <div className="card">
              <div className="card-title"><h3>Skills worth learning</h3></div>
              <p className="muted" style={{ marginBottom: 10 }}>Missing most often across drives you're eligible for:</p>
              {gaps.slice(0, 6).map((g) => (
                <div className="metric" key={g.skill} style={{ gridTemplateColumns: "1fr auto", marginBottom: 6 }}>
                  <span>{g.skill}</span><b>{g.drives} drive{g.drives > 1 ? "s" : ""}</b>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ---------- Right: matches ---------- */}
        <section className="stack">
          <div className="row between">
            <h2>{recs.length} drive{recs.length === 1 ? "" : "s"} ranked for you</h2>
            <label className="row" style={{ margin: 0, fontWeight: 500, cursor: "pointer", gap: 8 }}>
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} style={{ width: "auto" }} />
              Include drives I'm not eligible for
            </label>
          </div>

          {recs.length === 0 ? <Empty icon="briefcase" title="No drives to recommend yet">Check back when new placement drives are posted.</Empty> : (
            recs.map((job, i) => (
              <div key={job.id}>
                {i === 0 && !job.applied && job.eligible && <p className="faint" style={{ margin: "0 0 6px 4px" }}><Icon name="award" size={13} /> Top pick for you</p>}
                <JobCard job={job} onApply={apply} onSave={save} />
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

