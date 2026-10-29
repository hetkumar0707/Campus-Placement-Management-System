import { useEffect, useMemo, useState } from "react";
import API, { fmt2, getError } from "../api.js";
import Icon from "../components/Icon.jsx";
import { Alert, Empty, Loading, PageHead, StatCard, when } from "../components/ui.jsx";

function downloadCsv(filename, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function TpoDashboard() {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [onlyUnplaced, setOnlyUnplaced] = useState(false);

  useEffect(() => {
    Promise.all([API.get("/admin/stats"), API.get("/admin/applications"), API.get("/admin/students")])
      .then(([s, a, st]) => { setStats(s.data); setApps(a.data); setStudents(st.data); })
      .catch((err) => setError({ type: "error", text: getError(err, "Could not load dashboard") }));
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return students.filter((s) => (!onlyUnplaced || !s.placed) && (!t || `${s.name} ${s.email} ${s.enrollment_no || ""} ${s.branch}`.toLowerCase().includes(t)));
  }, [students, q, onlyUnplaced]);

  if (error) return <div className="container"><Alert message={error} /></div>;
  if (!stats) return <div className="container"><Loading rows={4} /></div>;

  const maxStatus = Math.max(1, ...stats.by_status.map((s) => s.count));

  return (
    <div className="container">
      <PageHead title="Placement overview" subtitle="Live statistics across students, drives and applications." />

      <section className="grid cols-3">
        <StatCard icon="users" label="Students" value={stats.students} />
        <StatCard icon="building" label="Recruiters" value={stats.recruiters} tone="blue" />
        <StatCard icon="briefcase" label="Placement drives" value={stats.jobs} tone="amber" />
        <StatCard icon="file" label="Applications" value={stats.applications} tone="blue" />
        <StatCard icon="award" label="Students placed" value={stats.placed} tone="green" />
        <StatCard icon="trending" label="Placement rate" value={`${stats.placement_rate}%`} tone="green" />
      </section>

      <section className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title"><h3>Applications by status</h3></div>
          {stats.by_status.length === 0 ? <p className="muted">No applications yet.</p> : stats.by_status.map((s) => (
            <div className="hbar" key={s.status}>
              <span><span className={`badge ${s.status}`}>{s.status}</span></span>
              <div className="bar"><i style={{ width: `${(s.count / maxStatus) * 100}%` }} /></div>
              <b>{s.count}</b>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title"><h3>Placement by branch</h3></div>
          {(stats.by_branch || []).length === 0 ? <p className="muted">No students yet.</p> : stats.by_branch.map((b) => (
            <div className="hbar" key={b.branch}>
              <span title={b.branch} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.branch}</span>
              <div className="bar green"><i style={{ width: `${b.students ? (b.placed / b.students) * 100 : 0}%` }} /></div>
              <b>{b.placed}/{b.students}</b>
            </div>
          ))}
        </div>
      </section>

      <div className="section-title">
        <h2>Recent applications</h2>
        <button className="btn secondary small" onClick={() => downloadCsv("applications.csv", [["Student", "Enrollment", "Branch", "Drive", "Company", "Status", "Applied"], ...apps.map((a) => [a.student_name, a.enrollment_no, a.branch, a.title, a.company_name, a.status, when(a.applied_at)])])} disabled={!apps.length}>
          <Icon name="download" size={14} />Export CSV
        </button>
      </div>
      {apps.length === 0 ? <Empty icon="file" title="No applications yet" /> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Enrollment</th><th>Branch</th><th>Drive</th><th>Company</th><th>Status</th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.student_name}</b></td><td>{a.enrollment_no || "—"}</td><td>{a.branch}</td><td>{a.title}</td><td>{a.company_name}</td>
                  <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-title">
        <h2>Registered students <span className="faint">({filtered.length})</span></h2>
        <div className="row">
          <label className="row" style={{ margin: 0, fontWeight: 500, gap: 6 }}><input type="checkbox" style={{ width: "auto" }} checked={onlyUnplaced} onChange={(e) => setOnlyUnplaced(e.target.checked)} />Not placed yet</label>
          <div className="input-icon"><Icon name="search" size={15} /><input placeholder="Search students" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 220 }} aria-label="Search students" /></div>
          <button className="btn secondary small" onClick={() => downloadCsv("students.csv", [["Name", "Email", "Enrollment", "Branch", "CGPA", "Backlogs", "Placed"], ...filtered.map((s) => [s.name, s.email, s.enrollment_no, s.branch, fmt2(s.cgpa), s.backlogs, s.placed ? "Yes" : "No"])])} disabled={!filtered.length}>
            <Icon name="download" size={14} />Export CSV
          </button>
        </div>
      </div>
      {filtered.length === 0 ? <Empty icon="users" title="No students match" /> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Enrollment</th><th>Branch</th><th>CGPA</th><th>Backlogs</th><th>Placed</th></tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td><b>{s.name}</b><div className="faint">{s.email}</div></td><td>{s.enrollment_no || "—"}</td><td>{s.branch}</td>
                  <td>{fmt2(s.cgpa)}</td><td>{s.backlogs}</td>
                  <td>{s.placed ? <span className="badge SELECTED">Placed</span> : <span className="faint">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
