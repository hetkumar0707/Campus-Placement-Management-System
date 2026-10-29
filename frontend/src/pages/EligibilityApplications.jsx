import { useEffect, useMemo, useState } from "react";
import API, { fmt2, getError } from "../api.js";
import Icon from "../components/Icon.jsx";
import JobCard from "../components/JobCard.jsx";
import { Alert, Empty, Loading, PageHead, StatCard, money, when } from "../components/ui.jsx";
import { Timeline } from "./StudentDashboard.jsx";

// Module 3 - Eligibility & Applications (search, filters, saved drives, application tracking)
export default function EligibilityApplications() {
  const [profile, setProfile] = useState(null);
  const [recs, setRecs] = useState([]);
  const [apps, setApps] = useState([]);
  const [tab, setTab] = useState("eligible");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("match");
  const [minPackage, setMinPackage] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [p, r, a] = await Promise.all([API.get("/students/profile"), API.get("/recommendations?all=1&limit=50"), API.get("/applications/my")]);
      setProfile(p.data);
      setRecs(r.data.recommendations);
      setApps(a.data);
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not load jobs") });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function apply(jobId) {
    try {
      await API.post(`/applications/${jobId}/apply`);
      setMessage({ type: "success", text: "Application submitted successfully" });
      load();
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not apply") });
    }
  }
  async function save(jobId) {
    try {
      const res = await API.post(`/jobs/${jobId}/save`);
      setRecs((list) => list.map((j) => (j.id === jobId ? { ...j, saved: res.data.saved } : j)));
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not save drive") });
    }
  }
  async function withdraw(id) {
    if (!window.confirm("Withdraw this application?")) return;
    try {
      const res = await API.delete(`/applications/${id}`);
      setMessage({ type: "success", text: res.data.message });
      load();
    } catch (err) {
      setMessage({ type: "error", text: getError(err, "Could not withdraw") });
    }
  }

  const visible = useMemo(() => {
    let list = recs;
    if (tab === "eligible") list = list.filter((j) => j.eligible);
    if (tab === "saved") list = list.filter((j) => j.saved);
    if (tab === "other") list = list.filter((j) => !j.eligible);
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((j) => `${j.title} ${j.company_name} ${j.location || ""} ${(j.required_skills || []).join(" ")}`.toLowerCase().includes(term));
    if (minPackage) list = list.filter((j) => Number(j.package_lpa) >= Number(minPackage));
    const by = { match: (a, b) => b.match.score - a.match.score, package: (a, b) => b.package_lpa - a.package_lpa, deadline: (a, b) => String(a.application_deadline || "9999").localeCompare(String(b.application_deadline || "9999")) };
    return [...list].sort(by[sort]);
  }, [recs, tab, q, sort, minPackage]);

  if (loading) return <div className="container"><Loading rows={4} /></div>;

  const count = (f) => recs.filter(f).length;
  const tabs = [["eligible", "Eligible", count((j) => j.eligible)], ["saved", "Saved", count((j) => j.saved)], ["other", "Not eligible", count((j) => !j.eligible)], ["applications", "My applications", apps.length]];

  return (
    <div className="container">
      <PageHead title="Jobs & applications" subtitle="Drives are checked against your branch, CGPA and backlogs." />
      <Alert message={message} />

      {profile && (
        <section className="grid cols-3" style={{ marginBottom: 20 }}>
          <StatCard icon="cap" label="Branch" value={<span style={{ fontSize: 16 }}>{profile.branch}</span>} />
          <StatCard icon="award" label="CGPA" value={fmt2(profile.cgpa)} tone="green" />
          <StatCard icon="alert" label="Backlogs" value={profile.backlogs} tone="amber" />
        </section>
      )}

      <div className="row between" style={{ marginBottom: 16 }}>
        <div className="segmented" style={{ flexWrap: "wrap" }}>
          {tabs.map(([k, l, n]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}<span className="count">{n}</span></button>)}
        </div>
      </div>

      {tab !== "applications" && (
        <div className="row" style={{ marginBottom: 18 }}>
          <div className="input-icon" style={{ flex: "1 1 260px" }}>
            <Icon name="search" size={16} />
            <input placeholder="Search title, company, location or skill" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search drives" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 190 }} aria-label="Sort">
            <option value="match">Sort: Best AI match</option>
            <option value="package">Sort: Highest package</option>
            <option value="deadline">Sort: Closing soon</option>
          </select>
          <select value={minPackage} onChange={(e) => setMinPackage(e.target.value)} style={{ width: 170 }} aria-label="Minimum package">
            <option value="">Any package</option>
            {[3, 5, 8, 12].map((n) => <option key={n} value={n}>₹{n}+ LPA</option>)}
          </select>
        </div>
      )}

      {tab === "applications" ? (
        apps.length === 0 ? <Empty icon="file" title="No applications yet">Apply to a drive and track its progress here.</Empty> : (
          <div className="stack">
            {apps.map((a) => (
              <div className="card app-row" key={a.id}>
                <div>
                  <h3>{a.title}</h3>
                  <p className="muted">{a.company_name} · {money(a.package_lpa)}</p>
                  <p className="faint">Applied on {when(a.applied_at)}{a.drive_date ? ` · Drive on ${when(a.drive_date)}` : ""}</p>
                </div>
                <div className="row">
                  <Timeline status={a.status} />
                  <span className={`badge ${a.status}`}>{a.status}</span>
                  {a.status === "APPLIED" && <button className="btn small danger" onClick={() => withdraw(a.id)}>Withdraw</button>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : visible.length === 0 ? (
        <Empty icon="search" title="Nothing to show">{tab === "saved" ? "Tap the bookmark on a drive to save it here." : "Try clearing your search or filters."}</Empty>
      ) : (
        <div className="grid cols-2">
          {visible.map((job) => <JobCard key={job.id} job={job} onApply={apply} onSave={save} />)}
        </div>
      )}
    </div>
  );
}
