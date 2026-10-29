import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { getError } from "../api.js";
import { BRANCHES } from "../branches.js";
import Icon from "../components/Icon.jsx";
import SkillInput from "../components/SkillInput.jsx";
import { Alert, Empty, PageHead, StatCard, money } from "../components/ui.jsx";

const EMPTY = {
  title: "", description: "", package_lpa: "", min_cgpa: "", eligible_branches: "",
  max_backlogs: "0", location: "", drive_date: "", application_deadline: "",
};

// Module 2 - Job Posting (now with required skills for AI matching)
export default function RecruiterDashboard() {
  const [form, setForm] = useState(EMPTY);
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function loadJobs() {
    try {
      const res = await API.get("/recruiters/jobs");
      setJobs(res.data);
      if (res.data.length === 0) setShowForm(true);
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not load placement drives") });
    }
  }
  useEffect(() => { loadJobs(); }, []);

  async function suggest() {
    if (!form.title.trim()) return setMessage({ type: "error", text: "Enter a job title first" });
    setSuggesting(true);
    try {
      const res = await API.post("/recruiters/suggest-skills", { title: form.title, description: form.description });
      setSkills((cur) => [...cur, ...res.data.skills.filter((s) => !cur.some((c) => c.toLowerCase() === s.toLowerCase()))].slice(0, 40));
      setMessage(res.data.skills.length ? null : { type: "info", text: "No skills could be suggested. Add them by hand." });
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not suggest skills") });
    } finally {
      setSuggesting(false);
    }
  }

  async function createJob(e) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const res = await API.post("/recruiters/jobs", {
        ...form,
        required_skills: skills,
        eligible_branches: form.eligible_branches.split(",").map((x) => x.trim()).filter(Boolean),
      });
      setMessage({ type: "success", text: res.data.message });
      setForm(EMPTY);
      setSkills([]);
      setShowForm(false);
      loadJobs();
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not create placement drive") });
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(job) {
    try {
      await API.patch(`/recruiters/jobs/${job.id}/status`, { status: job.status === "OPEN" ? "CLOSED" : "OPEN" });
      loadJobs();
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not update drive") });
    }
  }

  const open = jobs.filter((j) => j.status === "OPEN").length;
  const applicants = jobs.reduce((n, j) => n + Number(j.applicants || 0), 0);

  return (
    <div className="container narrow">
      <PageHead title="Placement drives" subtitle="Post drives, define who can apply, and list the skills you need so AI can match the right students.">
        <button className="btn" onClick={() => setShowForm(!showForm)}><Icon name={showForm ? "x" : "plus"} size={16} />{showForm ? "Close form" : "Post a drive"}</button>
      </PageHead>
      <Alert message={message} />

      <section className="grid cols-3" style={{ marginBottom: 20 }}>
        <StatCard icon="briefcase" label="Total drives" value={jobs.length} />
        <StatCard icon="eye" label="Open drives" value={open} tone="green" />
        <StatCard icon="users" label="Total applicants" value={applicants} tone="blue" />
      </section>

      {showForm && (
        <form className="card" onSubmit={createJob} style={{ marginBottom: 24 }}>
          <div className="card-title"><h3>New placement drive</h3></div>
          <div className="form-grid">
            <div className="form-group"><label>Job title</label><input placeholder="e.g. Software Engineer Intern" value={form.title} onChange={set("title")} required /></div>
            <div className="form-group"><label>Package (LPA)</label><input type="number" step="0.01" min="0" value={form.package_lpa} onChange={set("package_lpa")} required /></div>
            <div className="form-group"><label>Minimum CGPA</label><input type="number" step="0.01" min="0" max="10" value={form.min_cgpa} onChange={set("min_cgpa")} required /></div>
            <div className="form-group"><label>Maximum backlogs</label><input type="number" min="0" value={form.max_backlogs} onChange={set("max_backlogs")} required /></div>
            <div className="form-group full">
              <label>Eligible branches</label>
              <input placeholder="Computer Engineering, Information Technology" value={form.eligible_branches} onChange={set("eligible_branches")} required />
              <div className="hint">Separate branches with commas. Examples: {BRANCHES.slice(0, 2).join(", ")}</div>
            </div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={set("location")} /></div>
            <div className="form-group"><label>Drive date</label><input type="date" value={form.drive_date} onChange={set("drive_date")} /></div>
            <div className="form-group"><label>Application deadline</label><input type="date" value={form.application_deadline} onChange={set("application_deadline")} /></div>
            <div className="form-group full"><label>Job description</label><textarea value={form.description} onChange={set("description")} /></div>
            <div className="form-group full">
              <div className="row between" style={{ marginBottom: 6 }}>
                <label style={{ margin: 0 }}>Required skills <span className="faint">(used for AI matching and applicant ranking)</span></label>
                <button type="button" className="btn small secondary" onClick={suggest} disabled={suggesting}>
                  {suggesting ? <span className="spinner" /> : <Icon name="sparkles" size={14} />}Suggest from title
                </button>
              </div>
              <SkillInput value={skills} onChange={setSkills} placeholder="e.g. Java, SQL, REST API" />
            </div>
          </div>
          <button className="btn" type="submit" disabled={busy}>{busy ? <><span className="spinner" />Posting...</> : "Post placement drive"}</button>
        </form>
      )}

      <div className="section-title" style={{ marginTop: 8 }}><h2>Posted drives</h2></div>
      {jobs.length === 0 ? <Empty icon="briefcase" title="No drives yet">Post your first placement drive above.</Empty> : (
        <div className="stack">
          {jobs.map((job) => (
            <div className="card hover" key={job.id}>
              <div className="app-row">
                <div>
                  <h3>{job.title}</h3>
                  <p className="muted">{money(job.package_lpa)} · Min CGPA {Number(job.min_cgpa).toFixed(2)} · Max {job.max_backlogs} backlogs{job.location ? ` · ${job.location}` : ""}</p>
                </div>
                <span className={`badge ${job.status}`}>{job.status}</span>
              </div>
              <p className="faint" style={{ margin: "10px 0" }}>Branches: {job.eligible_branches.join(", ")}{job.drive_date ? ` · Drive: ${String(job.drive_date).slice(0, 10)}` : ""}{job.application_deadline ? ` · Apply by: ${String(job.application_deadline).slice(0, 10)}` : ""}</p>
              {job.required_skills?.length > 0 && <div className="chips" style={{ marginBottom: 12 }}>{job.required_skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>}
              <div className="job-foot">
                <span className="muted"><Icon name="users" size={14} /> {job.applicants} applicant{job.applicants === 1 ? "" : "s"}</span>
                <div className="btn-row">
                  <Link to={`/recruiter/applicants?job=${job.id}`} className="btn small">View applicants</Link>
                  <button className="btn small secondary" onClick={() => toggleStatus(job)}>{job.status === "OPEN" ? "Close drive" : "Reopen drive"}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
