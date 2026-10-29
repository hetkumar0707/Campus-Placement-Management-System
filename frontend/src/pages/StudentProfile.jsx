import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API, { downloadResume, getError } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { BRANCHES } from "../branches.js";
import Icon from "../components/Icon.jsx";
import SkillInput from "../components/SkillInput.jsx";
import { Alert, Loading, PageHead } from "../components/ui.jsx";

const POPULAR = ["Python", "Java", "JavaScript", "React", "Node.js", "SQL", "Git", "HTML", "CSS", "Data Structures", "Machine Learning", "Docker"];

// Module 1 - Student Profile (now with skills, career interests and AI resume analysis)
export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    API.get("/students/profile")
      .then((res) => setProfile(res.data))
      .catch((err) => setMessage({ type: "error", text: getError(err, "Could not load profile") }));
    // Show the existing resume analysis (also reads older resumes once)
    API.get("/recommendations?limit=1").then((r) => r.data.resume?.has_text && setAnalysis({ ...r.data.resume, detected: r.data.skills.detected })).catch(() => {});
  }, []);

  if (!profile) return <div className="container narrow">{message ? <Alert message={message} /> : <Loading rows={3} />}</div>;

  const set = (key) => (e) => setProfile({ ...profile, [key]: e.target.value });

  async function saveProfile(e) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await API.put("/students/profile", profile);
      setProfile(res.data.profile);
      setMessage({ type: "success", text: res.data.message });
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not save profile") });
    } finally {
      setSaving(false);
    }
  }

  function pick(f) {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return setMessage({ type: "error", text: "Resume must be 5 MB or smaller" });
    setFile(f);
    setMessage(null);
  }

  async function uploadResume() {
    if (!file) return setMessage({ type: "error", text: "Please choose a resume file first" });
    const data = new FormData();
    data.append("resume", file);
    setUploading(true);
    try {
      const res = await API.post("/students/resume", data);
      setProfile({ ...profile, has_resume: true, resume_original: res.data.resume_original });
      setAnalysis(res.data.analysis ? { has_text: true, ...res.data.analysis, detected: res.data.analysis.skills } : null);
      setFile(null);
      setMessage({ type: res.data.analysis ? "success" : "info", text: res.data.message });
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not upload resume") });
    } finally {
      setUploading(false);
    }
  }

  const newDetected = (analysis?.detected || []).filter((s) => !profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()));

  return (
    <div className="container narrow">
      <PageHead title="My profile" subtitle={`Signed in as ${user?.email}. Keep this up to date, because it drives your AI matches.`}>
        <Link to="/student/recommendations" className="btn secondary"><Icon name="sparkles" size={16} />See my matches</Link>
      </PageHead>
      <Alert message={message} />

      <form onSubmit={saveProfile} className="stack">
        <div className="card">
          <div className="card-title"><h3>Personal & academic details</h3></div>
          <div className="form-grid">
            <div className="form-group"><label>Name</label><input value={profile.name || ""} onChange={set("name")} required /></div>
            <div className="form-group"><label>Phone</label><input value={profile.phone || ""} onChange={set("phone")} /></div>
            <div className="form-group"><label>Enrollment</label><input value={profile.enrollment_no || ""} onChange={set("enrollment_no")} /></div>
            <div className="form-group">
              <label>Branch</label>
              <input list="branch-list" value={profile.branch || ""} onChange={set("branch")} required />
              <datalist id="branch-list">{BRANCHES.map((b) => <option key={b} value={b} />)}</datalist>
            </div>
            <div className="form-group"><label>CGPA</label><input type="number" step="0.01" min="0" max="10" value={profile.cgpa ?? ""} onChange={set("cgpa")} required /></div>
            <div className="form-group"><label>Backlogs</label><input type="number" min="0" value={profile.backlogs ?? 0} onChange={set("backlogs")} required /></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><h3><Icon name="sparkles" size={16} /> Skills & interests</h3><span className="faint">Used for AI matching</span></div>
          <div className="form-group">
            <label>Your skills</label>
            <SkillInput value={profile.skills || []} onChange={(skills) => setProfile({ ...profile, skills })} suggestions={POPULAR} />
            <div className="hint">Type a skill and press Enter. Be honest: matches are only as good as this list.</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Roles you're interested in</label>
            <input placeholder="e.g. Full Stack Developer, Data Analyst" value={profile.career_interests || ""} onChange={set("career_interests")} maxLength={255} />
            <div className="hint">Separate roles with commas.</div>
          </div>
        </div>

        <div><button className="btn" type="submit" disabled={saving}>{saving ? <><span className="spinner" />Saving...</> : <><Icon name="check" size={16} />Save profile</>}</button></div>
      </form>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title"><h3>Resume</h3><span className="faint">PDF or DOCX, up to 5 MB</span></div>
        <div
          className={`dropzone ${over ? "over" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
        >
          <Icon name="upload" size={30} />
          <p style={{ fontWeight: 650, marginTop: 8 }}>{file ? file.name : "Drop your resume here or click to browse"}</p>
          <p className="faint">We read the text to detect your skills and rate your resume. It is shared only with recruiters you apply to.</p>
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="sr" onChange={(e) => pick(e.target.files[0])} />
        </div>
        <div className="row between" style={{ marginTop: 14 }}>
          <div className="row">
            {profile.has_resume && (
              <>
                <span className="chip"><Icon name="file" size={13} />{profile.resume_original}</span>
                <button type="button" className="btn small secondary" onClick={() => downloadResume(profile.id, profile.resume_original || "resume").catch(() => setMessage({ type: "error", text: "Could not download resume" }))}>
                  <Icon name="download" size={14} />Download
                </button>
              </>
            )}
          </div>
          <button className="btn" type="button" onClick={uploadResume} disabled={!file || uploading}>{uploading ? <><span className="spinner" />Analysing...</> : <><Icon name="upload" size={16} />Upload & analyse</>}</button>
        </div>

        {analysis && (
          <>
            <hr />
            <div className="row between"><h3>AI resume analysis</h3><span className={`badge ${analysis.score >= 70 ? "success" : analysis.score >= 45 ? "warn" : "danger"}`}>Score {analysis.score}/100</span></div>
            <div className="bar" style={{ margin: "10px 0 16px" }}><i style={{ width: `${analysis.score}%` }} /></div>

            <p className="muted" style={{ marginBottom: 8 }}>Skills found in your resume</p>
            <div className="chips">{(analysis.detected || []).map((s) => <span key={s} className="chip primary">{s}</span>)}</div>
            {newDetected.length > 0 && (
              <button type="button" className="btn small secondary" style={{ marginTop: 12 }} onClick={() => setProfile({ ...profile, skills: [...profile.skills, ...newDetected].slice(0, 40) })}>
                <Icon name="plus" size={14} />Add {newDetected.length} detected skill{newDetected.length > 1 ? "s" : ""} to my profile
              </button>
            )}
            {newDetected.length > 0 && <p className="hint">Then press "Save profile" above.</p>}

            {analysis.tips?.length > 0 && (
              <>
                <p className="muted" style={{ margin: "16px 0 8px" }}>How to improve it</p>
                <ul className="insight-list">{analysis.tips.map((t) => <li key={t}>{t}</li>)}</ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
