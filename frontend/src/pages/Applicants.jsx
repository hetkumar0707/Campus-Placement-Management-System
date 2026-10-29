import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API, { downloadResume, fmt2, getError } from "../api.js";
import Icon from "../components/Icon.jsx";
import { Alert, Empty, MatchRing, PageHead } from "../components/ui.jsx";

const STATUSES = ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];

// Interview & Placement - recruiters review applicants (ranked by AI match) and update their status
export default function Applicants() {
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState(null);
  const [sort, setSort] = useState("match");
  const [filter, setFilter] = useState("ALL");
  const [open, setOpen] = useState(null);
  const jobId = params.get("job");

  useEffect(() => {
    API.get("/recruiters/jobs")
      .then((res) => {
        setJobs(res.data);
        if (!jobId && res.data[0]) setParams({ job: res.data[0].id }, { replace: true });
      })
      .catch((err) => setMessage({ type: "error", text: getError(err, "Could not load drives") }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadApplicants() {
    if (!jobId) return;
    try {
      const res = await API.get(`/recruiters/jobs/${jobId}/applications`);
      setApplications(res.data.applications);
      setJob(res.data.job);
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not load applicants") });
    }
  }
  useEffect(() => { loadApplicants(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [jobId]);

  async function updateStatus(id, status) {
    try {
      await API.patch(`/recruiters/applications/${id}/status`, { status });
      setMessage({ type: "success", text: "Application status updated" });
      loadApplicants();
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not update status") });
    }
  }

  const rows = useMemo(() => {
    let list = filter === "ALL" ? applications : applications.filter((a) => a.status === filter);
    const by = { match: (a, b) => b.match.score - a.match.score, cgpa: (a, b) => b.cgpa - a.cgpa, recent: (a, b) => String(b.applied_at).localeCompare(String(a.applied_at)) };
    return [...list].sort(by[sort]);
  }, [applications, sort, filter]);

  return (
    <div className="container">
      <PageHead title="Applicants" subtitle="Applicants are ranked by AI match against the drive's required skills, resume and CGPA." />
      <Alert message={message} />

      {jobs.length === 0 ? (
        <Empty icon="briefcase" title="No drives yet">Post a placement drive first to start receiving applications.</Empty>
      ) : (
        <>
          <div className="row" style={{ marginBottom: 16 }}>
            <select value={jobId || ""} onChange={(e) => setParams({ job: e.target.value })} style={{ maxWidth: 380 }} aria-label="Placement drive">
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} ({j.applicants})</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 190 }} aria-label="Sort">
              <option value="match">Sort: AI match</option>
              <option value="cgpa">Sort: CGPA</option>
              <option value="recent">Sort: Most recent</option>
            </select>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 170 }} aria-label="Filter by status">
              <option value="ALL">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {job?.required_skills?.length > 0 && (
            <div className="row" style={{ marginBottom: 16 }}>
              <span className="muted">Required skills:</span>
              <div className="chips">{job.required_skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            </div>
          )}

          {rows.length === 0 ? (
            <Empty icon="users" title="No applicants to show">{applications.length ? "No applicants match this status filter." : "No students have applied to this drive yet."}</Empty>
          ) : (
            <div className="card table-wrap">
              <table>
                <thead>
                  <tr><th>AI match</th><th>Student</th><th>Branch</th><th>CGPA</th><th>Backlogs</th><th>Resume</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <Fragment key={a.id}>
                      <tr>
                        <td>
                          <button type="button" onClick={() => setOpen(open === a.id ? null : a.id)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }} aria-label="Show match details">
                            <MatchRing score={a.match.score} size={46} />
                            <Icon name="eye" size={14} />
                          </button>
                        </td>
                        <td><b>{a.name}</b><div className="faint">{a.email}{a.enrollment_no ? ` · ${a.enrollment_no}` : ""}</div></td>
                        <td>{a.branch}</td>
                        <td>{fmt2(a.cgpa)}</td>
                        <td>{a.backlogs}</td>
                        <td>
                          {a.has_resume ? (
                            <button className="btn small secondary" onClick={() => downloadResume(a.student_id, `${a.name}-resume`).catch(() => setMessage({ type: "error", text: "Could not download resume" }))}>
                              <Icon name="download" size={14} />Resume
                            </button>
                          ) : <span className="faint">Not uploaded</span>}
                        </td>
                        <td>
                          <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)} style={{ padding: "6px 10px", width: 150 }} aria-label={`Status for ${a.name}`}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                      {open === a.id && (
                        <tr>
                          <td colSpan={7} style={{ background: "var(--surface-2)", whiteSpace: "normal" }}>
                            <div className="grid cols-2">
                              <div>
                                <p className="faint" style={{ marginBottom: 6 }}>{a.match.label}: skills vs this drive</p>
                                <div className="chips">
                                  {a.match.matched_skills.map((s) => <span key={s} className="chip match"><Icon name="check" size={12} stroke={3} />{s}</span>)}
                                  {a.match.missing_skills.map((s) => <span key={s} className="chip miss">{s}</span>)}
                                  {!a.match.matched_skills.length && !a.match.missing_skills.length && <span className="faint">This drive lists no required skills.</span>}
                                </div>
                              </div>
                              <div>
                                <p className="faint" style={{ marginBottom: 6 }}>Skills on profile / resume</p>
                                <div className="chips">{a.match.skills.length ? a.match.skills.map((s) => <span key={s} className="chip">{s}</span>) : <span className="faint">None listed</span>}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
