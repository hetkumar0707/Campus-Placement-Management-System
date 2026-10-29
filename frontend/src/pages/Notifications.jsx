import { useEffect, useState } from "react";
import API, { getError } from "../api.js";
import Icon from "../components/Icon.jsx";
import { Alert, Empty, Loading, PageHead } from "../components/ui.jsx";

function iconFor(msg) {
  const m = msg.toLowerCase();
  if (m.includes("selected")) return ["award", "green"];
  if (m.includes("rejected") || m.includes("withdrew")) return ["alert", "amber"];
  if (m.includes("new placement")) return ["briefcase", ""];
  return ["bell", "blue"];
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await API.get("/notifications");
      setItems(res.data);
    } catch (err) {
      setError({ type: "error", text: getError(err, "Could not load notifications") });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function markAll() { await API.patch("/notifications/read-all"); load(); }
  async function markOne(id) { await API.patch(`/notifications/${id}/read`); load(); }

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="container narrow">
      <PageHead title="Notifications" subtitle={unread ? `${unread} unread` : "You're all caught up"}>
        {items.length > 0 && <button className="btn secondary" onClick={markAll} disabled={!unread}><Icon name="check" size={16} />Mark all as read</button>}
      </PageHead>
      <Alert message={error} />
      {loading ? <Loading /> : items.length === 0 ? <Empty icon="bell" title="No notifications yet">Updates about drives and applications will show up here.</Empty> : (
        <div className="stack" style={{ gap: 10 }}>
          {items.map((n) => {
            const [icon, tone] = iconFor(n.message);
            return (
              <div key={n.id} className={`card notif ${n.is_read ? "" : "unread"}`}>
                <div className={`stat-icon ${tone}`}><Icon name={icon} size={18} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: n.is_read ? 500 : 700 }}>{n.message}</p>
                  <p className="faint" style={{ marginTop: 2 }}>{String(n.created_at).replace("T", " ").slice(0, 16)}</p>
                </div>
                {!n.is_read && <button className="btn small ghost" onClick={() => markOne(n.id)}>Mark read</button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
