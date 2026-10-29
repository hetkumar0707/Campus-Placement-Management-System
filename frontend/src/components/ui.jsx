import Icon from "./Icon.jsx";

export function matchTone(score) {
  if (score == null) return "none";
  if (score >= 75) return "high";
  if (score >= 50) return "mid";
  return "low";
}

// Circular match-score gauge
export function MatchRing({ score, size = 64 }) {
  return (
    <div className={`ring ${matchTone(score)}`} style={{ "--pct": score ?? 0, "--size": `${size}px` }} title={`${score ?? 0}% match`}>
      <span>{score == null ? "–" : `${score}%`}</span>
    </div>
  );
}

export function StatCard({ icon, label, value, tone = "", to }) {
  return (
    <div className="card stat-card">
      <div className={`stat-icon ${tone}`}><Icon name={icon} size={22} /></div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export function Empty({ icon = "inbox", title, children }) {
  return (
    <div className="card empty">
      <Icon name={icon} size={36} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Alert({ message }) {
  if (!message) return null;
  return (
    <div className={`alert ${message.type}`} role={message.type === "error" ? "alert" : "status"}>
      <Icon name={message.type === "error" ? "alert" : message.type === "success" ? "check" : "bulb"} size={18} />
      <span>{message.text}</span>
    </div>
  );
}

export function Loading({ rows = 3 }) {
  return (
    <div className="stack" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton" style={{ height: 96 }} />)}
    </div>
  );
}

export function PageHead({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function SkillChips({ matched = [], missing = [], max = 8 }) {
  const m = matched.slice(0, max);
  const x = missing.slice(0, Math.max(0, max - m.length) || 4);
  return (
    <div className="chips">
      {m.map((s) => <span key={`m-${s}`} className="chip match"><Icon name="check" size={12} stroke={3} />{s}</span>)}
      {x.map((s) => <span key={`x-${s}`} className="chip miss" title="Skill to learn">{s}</span>)}
    </div>
  );
}

export const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "U";
export const money = (n) => `₹${Number(n ?? 0).toFixed(2)} LPA`;
export const when = (d) => (d ? String(d).slice(0, 10) : "");
export function daysLeft(date) {
  if (!date) return null;
  const diff = Math.ceil((new Date(String(date).slice(0, 10)) - new Date(new Date().toDateString())) / 86400000);
  return diff;
}
