import Icon from "./Icon.jsx";
import { MatchRing, SkillChips, daysLeft, money } from "./ui.jsx";

// One placement drive. When `job.match` is present the AI match score, skills and reasons are shown.
export default function JobCard({ job, onApply, onSave, showWhy = true }) {
  const m = job.match;
  const branches = Array.isArray(job.eligible_branches) ? job.eligible_branches.join(", ") : job.eligible_branches;
  const left = daysLeft(job.application_deadline);
  const urgent = left !== null && left >= 0 && left <= 5;
  const blocked = job.eligible === false;

  return (
    <article className="card job-card hover">
      <div className="job-top">
        <div className="company-logo">{(job.company_name || "?")[0].toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row between" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
            <div>
              <h3>{job.title}</h3>
              <p className="muted">{job.company_name}</p>
            </div>
            {m && !blocked && <MatchRing score={m.score} />}
          </div>
        </div>
      </div>

      {m && !blocked && <span className={`badge ${m.score >= 75 ? "success" : m.score >= 50 ? "" : "warn"}`} style={{ justifySelf: "start" }}><Icon name="sparkles" size={12} />{m.label}</span>}
      {blocked && <span className="badge danger" style={{ justifySelf: "start" }}>Not eligible</span>}

      {job.description && <p className="muted">{job.description}</p>}

      <div className="job-meta">
        <span><b style={{ color: "var(--text)" }}>{money(job.package_lpa)}</b></span>
        {job.location && <span><Icon name="pin" size={14} />{job.location}</span>}
        {job.application_deadline && (
          <span style={urgent ? { color: "var(--danger)", fontWeight: 650 } : undefined}>
            <Icon name="clock" size={14} />{left !== null && left >= 0 ? (left === 0 ? "Closes today" : `${left} day${left === 1 ? "" : "s"} left`) : `Apply by ${job.application_deadline}`}
          </span>
        )}
        <span><Icon name="target" size={14} />CGPA ≥ {Number(job.min_cgpa).toFixed(2)} · ≤ {job.max_backlogs} backlog{job.max_backlogs === 1 ? "" : "s"}</span>
      </div>
      {branches && <p className="faint">Eligible branches: {branches}</p>}

      {m && !blocked && (m.matched_skills.length > 0 || m.missing_skills.length > 0) && (
        <div>
          <p className="faint" style={{ marginBottom: 6 }}>Skills for this role: <span style={{ color: "var(--success)" }}>you have</span> · <span>to learn</span></p>
          <SkillChips matched={m.matched_skills} missing={m.missing_skills} />
        </div>
      )}


      {showWhy && m && m.reasons.length > 0 && (
        <ul className="why" style={{ margin: 0, paddingLeft: 30 }}>
          {m.reasons.map((r) => <li key={r}>{r}</li>)}
        </ul>
      )}
      {blocked && job.reasons?.length > 0 && (
        <ul className="why" style={{ margin: 0, paddingLeft: 30 }}>{job.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
      )}

      <div className="job-foot">
        <span className="faint">{job.applied ? `Application status: ${job.application_status}` : blocked ? "You can't apply to this drive" : "Ready to apply"}</span>
        <div className="btn-row">
          {onSave && (
            <button className={`icon-btn save-btn ${job.saved ? "on" : ""}`} onClick={() => onSave(job.id)} aria-label={job.saved ? "Remove from saved" : "Save drive"} title={job.saved ? "Saved" : "Save for later"}>
              <Icon name="bookmark" size={17} />
            </button>
          )}
          {job.applied ? (
            <button className="btn secondary" disabled><Icon name="check" size={16} />Applied</button>
          ) : (
            <button className="btn" disabled={blocked || !onApply} onClick={() => onApply(job.id)}>Apply now<Icon name="arrow" size={16} /></button>
          )}
        </div>
      </div>
    </article>
  );
}
