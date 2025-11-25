import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Public
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Student Pages
import Dashboard from "./pages/Dashboard";
import Exams from "./pages/Exams";
import ExamDetail from "./pages/ExamDetail";
import ExamResult from "./pages/ExamResult";   
import Performance from "./pages/Performance";
import AiAssistant from "./pages/AiAssistant";
import Profile from "./pages/Profile";

// Layouts
import StudentLayout from "./layout/studentlayout";
import AdminLayout from "./layout/AdminLayout";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudent";
import AdminExams from "./pages/AdminExams";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ADMIN PANEL */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="exams" element={<AdminExams />} />
        </Route>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* STUDENT PANEL */}
        <Route
          path="/student"
          element={
            <StudentLayout>
              <Outlet />
            </StudentLayout>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exam/:id" element={<ExamDetail />} />
          <Route path="exam/:id/result" element={<ExamResult />} /> {/* ← BURASI RESULT */}
          <Route path="performance" element={<Performance />} />
          <Route path="ai" element={<AiAssistant />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
