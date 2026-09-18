import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/layout/AppShell";

import AuthPage from "./pages/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

import Classes from "./pages/classes/Classes";
import ClassPerformance from "./pages/classes/ClassPerformance";
import ClassTimetable from "./pages/classes/ClassesTimetable";

import Subjects from "./pages/subjects/Subjects";
import Students from "./pages/students/Students";
import Teachers from "./pages/teachers/Teachers";
import Assignments from "./pages/assignments/Assignments";

import Exams from "./pages/exams/Exams";
import ExamFeeManager from "./pages/examFees/ExamFeeManager";

import ExamPicker from "./pages/results/ExamPicker";
import MarkEntry from "./pages/results/MarkEntry";
import ExamSummary from "./pages/results/ExamSummary";

import ReportCard from "./pages/reportCard/ReportCard";
import TermReportCard from "./pages/reportCard/TermReportCard";
import BulkReportCardDownload from "./pages/reportCard/BulkReportCardDownload";

import BannerManagement from "./pages/admin/BannerManagement";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ─────────────────────────────────────────────────────────────
              Public routes
          ───────────────────────────────────────────────────────────── */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ─────────────────────────────────────────────────────────────
              Authenticated application
          ───────────────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>

              {/* Dashboard — all authenticated users */}
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              {/* ───────────────────────────────────────────────────────
                  Academic management
                  Admin + Teacher
              ─────────────────────────────────────────────────────── */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "teacher"]}
                  />
                }
              >
                <Route
                  path="/classes"
                  element={<Classes />}
                />

                <Route
                  path="/classes/:classId/timetable"
                  element={<ClassTimetable />}
                />

                <Route
                  path="/classes/:classId/performance"
                  element={<ClassPerformance />}
                />

                <Route
                  path="/subjects"
                  element={<Subjects />}
                />

                <Route
                  path="/students"
                  element={<Students />}
                />

                <Route
                  path="/exams"
                  element={<Exams />}
                />

                <Route
                  path="/exam-fees/:examId"
                  element={<ExamFeeManager />}
                />
              </Route>

              {/* ───────────────────────────────────────────────────────
                  Teacher management
                  Admin only
              ─────────────────────────────────────────────────────── */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["admin"]}
                  />
                }
              >
                <Route
                  path="/teachers"
                  element={<Teachers />}
                />

                <Route
                  path="/assignments"
                  element={<Assignments />}
                />
              </Route>

              {/* ───────────────────────────────────────────────────────
                  Results management
                  Admin + Teacher
              ─────────────────────────────────────────────────────── */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["admin", "teacher"]}
                  />
                }
              >
                <Route
                  path="/results"
                  element={<ExamPicker />}
                />

                <Route
                  path="/results/entry/:examId"
                  element={<MarkEntry />}
                />

                <Route
                  path="/results/summary/:examId"
                  element={<ExamSummary />}
                />

                <Route
                  path="/bulk-report-cards"
                  element={<BulkReportCardDownload />}
                />
              </Route>

              {/* ───────────────────────────────────────────────────────
                  Report cards
                  Admin + Teacher + Student
              ─────────────────────────────────────────────────────── */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                      "teacher",
                      "student",
                    ]}
                  />
                }
              >
                <Route
                  path="/report-card"
                  element={<ReportCard />}
                />

                <Route
                  path="/term-report-card"
                  element={<TermReportCard />}
                />
              </Route>

              {/* ───────────────────────────────────────────────────────
                  Administration
                  Admin only
              ─────────────────────────────────────────────────────── */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["admin"]}
                  />
                }
              >
                <Route
                  path="/banners"
                  element={<BannerManagement />}
                />
              </Route>
            </Route>
          </Route>

          {/* ─────────────────────────────────────────────────────────────
              Fallback routes
          ───────────────────────────────────────────────────────────── */}
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;