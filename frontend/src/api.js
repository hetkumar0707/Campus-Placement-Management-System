import axios from "axios";

const API = axios.create({ baseURL: "/api" });

// Attach the JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token has expired, send the user back to the login page
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function getError(err, fallback = "Something went wrong") {
  const msg = err?.response?.data?.message;
  if (msg) return msg;
  // No JSON message => the request never reached our API (backend stopped or crashed)
  return "Cannot reach the server. Start MySQL in XAMPP, then run 'npm start' in the backend folder.";
}

export async function downloadResume(studentId, fallbackName = "resume") {
  const res = await API.get(`/students/${studentId}/resume`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const STATUS_STEPS = ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED"];

export const fmt2 = (n) => Number(n ?? 0).toFixed(2);

export function homePath(role) {
  if (role === "STUDENT") return "/student/dashboard";
  if (role === "RECRUITER") return "/recruiter/dashboard";
  if (role === "TPO") return "/tpo/dashboard";
  return "/login";
}

export default API;
