import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import EligibilityApplications from "./pages/EligibilityApplications.jsx";
import RecruiterDashboard from "./pages/RecruiterDashboard.jsx";
import Applicants from "./pages/Applicants.jsx";
import Notifications from "./pages/Notifications.jsx";
import TpoDashboard from "./pages/TpoDashboard.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/student/dashboard" element={<ProtectedRoute roles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute roles={["STUDENT"]}><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/recommendations" element={<ProtectedRoute roles={["STUDENT"]}><Recommendations /></ProtectedRoute>} />
        <Route path="/student/jobs" element={<ProtectedRoute roles={["STUDENT"]}><EligibilityApplications /></ProtectedRoute>} />

        <Route path="/recruiter/dashboard" element={<ProtectedRoute roles={["RECRUITER"]}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/recruiter/applicants" element={<ProtectedRoute roles={["RECRUITER"]}><Applicants /></ProtectedRoute>} />

        <Route path="/tpo/dashboard" element={<ProtectedRoute roles={["TPO"]}><TpoDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
