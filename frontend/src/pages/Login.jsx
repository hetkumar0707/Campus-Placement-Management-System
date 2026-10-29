import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { getError, homePath } from "../api.js";
import Icon from "../components/Icon.jsx";
import { Alert } from "../components/ui.jsx";

const DEMOS = [
  ["Student", "student@demo.com", "Student@123"],
  ["Recruiter", "recruiter@demo.com", "Recruiter@123"],
  ["TPO", "tpo@cpms.com", "Admin@123"],
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(location.state?.from || homePath(user.role), { replace: true });
    } catch (err) {
      setError({ type: "error", text: getError(err, "Login failed") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <aside className="auth-side">
        <h2>Welcome back to your placement portal.</h2>
        <ul>
          <li><Icon name="sparkles" />AI recommendations ranked by your skills and resume</li>
          <li><Icon name="shield" />Automatic eligibility checks for every drive</li>
          <li><Icon name="chart" />Track every application from applied to selected</li>
        </ul>
      </aside>
      <div className="auth-form">
        <form onSubmit={handleSubmit}>
          <h1 style={{ fontSize: 26 }}>Login</h1>
          <p className="muted" style={{ margin: "6px 0 22px" }}>Enter your details to continue.</p>
          <Alert message={error} />
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn block" type="submit" disabled={busy}>{busy ? <><span className="spinner" />Please wait...</> : "Login"}</button>
          <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>New here? <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 650 }}>Create an account</Link></p>
          <div className="demo-box">
            <b>Demo accounts</b> (after <code>npm run db:init</code>)
            <div className="row" style={{ marginTop: 6, gap: 14 }}>
              {DEMOS.map(([label, e, p]) => <button type="button" key={label} onClick={() => { setEmail(e); setPassword(p); }}>{label}</button>)}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
