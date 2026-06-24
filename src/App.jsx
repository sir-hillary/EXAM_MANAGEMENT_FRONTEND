import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import Classes from "./pages/classes/Classes";
import Subjects from "./pages/subjects/Subjects";
import Students from "./pages/students/Students";
import Teachers from "./pages/teachers/Teachers";
import Assignments from "./pages/assignments/Assignments";
import Exams from "./pages/exams/Exams";
import ExamPicker from "./pages/results/ExamPicker";
import MarkEntry from "./pages/results/MarkEntry";
import ExamSummary from "./pages/results/ExamSummary";
import ReportCard from "./pages/reportCard/ReportCard";
import ClassPerformance from "./pages/classes/ClassPerformance";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Any authenticated role */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                element={<ProtectedRoute allowedRoles={["admin", "teacher"]} />}
              >
                <Route path="/classes" element={<Classes />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/students" element={<Students />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/assignments" element={<Assignments />} />
              </Route>

              <Route
                element={<ProtectedRoute allowedRoles={["admin", "teacher"]} />}
              >
                <Route path="/exams" element={<Exams />} />
                <Route path="/classes/:classId/performance" element={<ClassPerformance />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/teachers" element={<Teachers />} />
              </Route>
              <Route
                element={<ProtectedRoute allowedRoles={["admin", "teacher"]} />}
              >
                <Route path="/results" element={<ExamPicker />} />
                <Route path="/results/entry/:examId" element={<MarkEntry />} />
                <Route
                  path="/results/summary/:examId"
                  element={<ExamSummary />}
                />
              </Route>

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "teacher", "student"]}
                  />
                }
              >
                <Route path="/report-card" element={<ReportCard />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
