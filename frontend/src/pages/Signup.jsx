import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { getError, homePath } from "../api.js";
import { BRANCHES } from "../branches.js";
import Icon from "../components/Icon.jsx";
import { Alert } from "../components/ui.jsx";

const EMPTY = {
  role: "STUDENT", name: "", phone: "", enrollment_no: "", branch: "", cgpa: "", backlogs: "0",
  graduation_year: "", company_name: "", email: "", password: "",
};

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const isStudent = form.role === "STUDENT";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await register(form);
      navigate(user.role === "STUDENT" ? "/student/profile" : homePath(user.role), { replace: true });
    } catch (err) {
      setError({ type: "error", text: getError(err, "Could not create account") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <aside className="auth-side">
        <h2>Join the portal and find the right drive faster.</h2>
        <ul>
          <li><Icon name="user" />Students: build a profile, upload your resume and get AI matches</li>
          <li><Icon name="briefcase" />Recruiters: post drives and see applicants ranked by fit</li>
          <li><Icon name="bell" />Instant notifications for new drives and status changes</li>
        </ul>
      </aside>
      <div className="auth-form wide">
        <form onSubmit={handleSubmit}>
          <h1 style={{ fontSize: 26 }}>Create account</h1>
          <p className="muted" style={{ margin: "6px 0 18px" }}>It takes less than a minute.</p>
          <Alert message={error} />

          <div className="segmented" style={{ marginBottom: 18 }} role="tablist">
            {[["STUDENT", "I'm a student"], ["RECRUITER", "I'm a recruiter"]].map(([v, l]) => (
              <button type="button" key={v} className={form.role === v ? "on" : ""} onClick={() => setForm({ ...form, role: v })}>{l}</button>
            ))}
          </div>

          <div className="form-grid">
            <div className="form-group"><label>Name</label><input value={form.name} onChange={set("name")} required /></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={set("phone")} /></div>
            {isStudent ? (
              <>
                <div className="form-group"><label>Enrollment No.</label><input value={form.enrollment_no} onChange={set("enrollment_no")} /></div>
                <div className="form-group">
                  <label>Branch</label>
                  <input list="branch-list" value={form.branch} onChange={set("branch")} required />
                  <datalist id="branch-list">{BRANCHES.map((b) => <option key={b} value={b} />)}</datalist>
                </div>
                <div className="form-group"><label>CGPA</label><input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={set("cgpa")} required /></div>
                <div className="form-group"><label>Backlogs</label><input type="number" min="0" value={form.backlogs} onChange={set("backlogs")} required /></div>
                <div className="form-group"><label>Graduation year</label><input type="number" min="2000" max="2100" value={form.graduation_year} onChange={set("graduation_year")} /></div>
              </>
            ) : (
              <div className="form-group"><label>Company name</label><input value={form.company_name} onChange={set("company_name")} required /></div>
            )}
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={set("email")} required /></div>
            <div className="form-group"><label>Password</label><input type="password" minLength={6} value={form.password} onChange={set("password")} required /><div className="hint">At least 6 characters</div></div>
          </div>

          <button className="btn block" type="submit" disabled={busy}>{busy ? <><span className="spinner" />Please wait...</> : "Create account"}</button>
          <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>Already registered? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 650 }}>Login</Link></p>
        </form>
      </div>
    </div>
  );
}
