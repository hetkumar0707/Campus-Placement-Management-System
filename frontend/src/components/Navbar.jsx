import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import API from "../api.js";
import { useTheme } from "../theme.js";
import Icon from "./Icon.jsx";
import { initials } from "./ui.jsx";

const LINKS = {
  STUDENT: [
    ["/student/dashboard", "Dashboard", "home"],
    ["/student/recommendations", "AI Matches", "sparkles"],
    ["/student/jobs", "Jobs", "briefcase"],
    ["/student/profile", "Profile", "user"],
  ],
  RECRUITER: [
    ["/recruiter/dashboard", "Drives", "briefcase"],
    ["/recruiter/applicants", "Applicants", "users"],
  ],
  TPO: [["/tpo/dashboard", "Dashboard", "chart"]],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, toggleTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => setOpen(false), [location.pathname]);

  // Unread badge on the bell: refresh on every page change
  useEffect(() => {
    if (!user) return setUnread(0);
    API.get("/notifications").then((r) => setUnread(r.data.filter((n) => !n.is_read).length)).catch(() => {});
  }, [user, location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="row" style={{ gap: 4 }}>
          <Link to="/" className="brand">
            <span className="brand-mark"><Icon name="cap" size={19} /></span>CPMS
          </Link>
          <nav className={`nav-links ${open ? "open" : ""}`}>
            {user && (LINKS[user.role] || []).map(([to, label, icon]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <Icon name={icon} size={16} />{label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="nav-right">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle dark mode">
            <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
          </button>
          {user ? (
            <>
              <Link to="/notifications" className="icon-btn" aria-label="Notifications">
                <Icon name="bell" size={18} />
                {unread > 0 && <span className="dot">{unread > 9 ? "9+" : unread}</span>}
              </Link>
              <div className="user-chip">
                <span className="avatar">{initials(user.name)}</span>
                <div><b>{user.name}</b><span>{user.role}</span></div>
              </div>
              <button className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out"><Icon name="logout" size={18} /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn secondary small">Login</Link>
              <Link to="/signup" className="btn small">Sign up</Link>
            </>
          )}
          {user && <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menu"><Icon name={open ? "x" : "menu"} size={18} /></button>}
        </div>
      </div>
    </header>
  );
}
