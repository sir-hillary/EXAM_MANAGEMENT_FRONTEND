/* eslint-disable no-unused-vars */
import { forwardRef } from "react";

// Grade colors (matches ReportCardDocument.js)
const GRADE_COLORS = {
  EE1: "#16a34a", // Excellent
  EE2: "#22c55e",
  ME1: "#059669", // Meets Expectations
  ME2: "#10b981",
  AE1: "#d97706", // Approaching Expectations
  AE2: "#f59e0b",
  BE1: "#ea580c", // Below Expectations
  BE2: "#dc2626",
};

// Light backgrounds for badges/cards
const GRADE_BG = {
  EE1: "#dcfce7",
  EE2: "#bbf7d0",
  ME1: "#d1fae5",
  ME2: "#a7f3d0",
  AE1: "#fef3c7",
  AE2: "#fde68a",
  BE1: "#ffedd5",
  BE2: "#fee2e2",
};

// CBC grade points
const gradePoints = {
  EE1: 8,
  EE2: 7,
  ME1: 6,
  ME2: 5,
  AE1: 4,
  AE2: 3,
  BE1: 2,
  BE2: 1,
};
const SUBJECT_GRADE_POINTS = { EE1: 8, EE2: 7, ME1: 6, ME2: 5, AE1: 4, AE2: 3, BE1: 2, BE2: 1 };

const positionSuffix = (n) => {
  const j = n % 10, k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
};

const cell = (extra = {}) => ({
  padding: "8px 10px",
  fontSize: "11.5px",
  color: "#1f2937",
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "middle",
  ...extra,
});

const calculateMeanGrade = (grades = []) => {
  if (!grades.length) return "—";
  const avg = grades.reduce((s, g) => s + (gradePoints[g] ?? 0), 0) / grades.length;
  return Object.entries(gradePoints)
    .sort((a, b) => b[1] - a[1])
    .find(([, p]) => avg >= p)?.[0] ?? "F";
};

const ReportCardDocument = forwardRef(function ReportCardDocument(
  {
    report,
    examType,
    isTermReport     = false,
    schoolName       = "MUKURU OUTREACH ACADEMY",
    schoolMotto      = "Learning and achieving together",
    classTeacherName = null,
    closingDate      = null,
    openingDate      = null,
  },
  ref,
) {
  if (!report) return null;
  const { student, subjects, summary } = report;
  const isPrimary = report.division === "primary";
  const meanGrade = summary.mean_grade || calculateMeanGrade(subjects.map(s => s.grade));

  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });

  // ── Headers vary by division and report type ──────────────────────────────
  const headers = isTermReport
    ? isPrimary
      ? ["Subject", "Code", "Midterm", "Endterm", "Average", "%", "Remarks", "Performance", "Grade"]
      : ["Subject", "Code", "Midterm", "Endterm", "Average", "%", "Points", "Performance", "Grade"]
    : isPrimary
      ? ["Subject", "Code", "Marks", "Out of", "%", "Remarks", "Performance", "Grade"]
      : ["Subject", "Code", "Marks", "Out of", "%", "Points", "Performance", "Grade"];

  // ── Summary strip ─────────────────────────────────────────────────────────
  const summaryStats = isPrimary
    ? [
        { label: "Subjects",    value: summary.subjects_count },
        { label: "Total Marks", value: summary.total_marks },
        { label: "Out Of",      value: summary.total_possible },
        { label: "Average",     value: `${summary.average_percentage}%` },
      ]
    : [
        { label: "Subjects",     value: summary.subjects_count },
        { label: "Total Marks",  value: summary.total_marks },
        { label: "Total Points", value: `${summary.total_points} / ${summary.max_points}` },
        { label: "Average",      value: `${summary.average_percentage}%` },
      ];

  // ── Row renderer ──────────────────────────────────────────────────────────
  const renderRow = (row, i) => {
    const displayMarks = isTermReport
      ? (row.average_marks ?? row.marks_obtained ?? 0)
      : (row.marks_obtained ?? 0);
    const pct = row.percentage
      ?? parseFloat(((displayMarks / (row.max_marks || 100)) * 100).toFixed(1));
    const even = i % 2 === 0;
    const gradeColor = GRADE_COLORS[row.grade] || "#64748b";
    const gradeBg    = GRADE_BG[row.grade]    || "#f1f5f9";

    // Shared midterm/endterm cells for term reports
    const termCells = isTermReport ? (
      <>
        <td style={cell({ textAlign: "center", color: "#475569", fontSize: "11px" })}>
          {row.midterm_marks ?? "—"}
        </td>
        <td style={cell({ textAlign: "center", color: "#475569", fontSize: "11px" })}>
          {row.endterm_marks ?? "—"}
        </td>
      </>
    ) : null;

    // ── Combined row (e.g. English COMBINED) ─────────────────────────────
    if (row.is_combined) {
      return (
        <tr key={`combined-${row.subject_id}-${i}`}
          style={{ background: "#f0f7ff", borderTop: "2px solid #c9a84c", borderBottom: "2px solid #e2e8f0" }}>
          <td style={cell({ fontWeight: "700", color: "#1a2744", fontSize: "12px" })}>
            {row.subject_name}
            <span style={{ marginLeft: "6px", fontSize: "9px", background: "#c9a84c", color: "#1a2744", padding: "1px 6px", borderRadius: "8px", fontWeight: "700" }}>
              TOTAL
            </span>
          </td>
          <td style={cell({ textAlign: "center" })}>
            <span style={{ background: "#1a2744", color: "#c9a84c", padding: "2px 7px", borderRadius: "8px", fontSize: "9px", fontWeight: "700" }}>
              {row.subject_code}
            </span>
          </td>
          {termCells}
          <td style={cell({ textAlign: "center", fontWeight: "800", color: "#1a2744", fontSize: "13px" })}>
            {displayMarks}
          </td>
          {!isTermReport && (
            <td style={cell({ textAlign: "center", color: "#64748b" })}>{row.max_marks}</td>
          )}
          <td style={cell({ textAlign: "center", fontWeight: "800", color: gradeColor, fontSize: "12px" })}>
            {pct}%
          </td>
          {isPrimary
            ? <td style={cell({ fontSize: "10.5px", color: "#475569", fontStyle: "italic" })}>{row.subject_remark ?? ""}</td>
            : <td style={cell({ textAlign: "center" })}>
                <span style={{ background: gradeBg, color: gradeColor, padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>
                  {row.points ?? 0}/8
                </span>
              </td>
          }
          <td style={cell({ width: "110px", padding: "8px 12px" })} />
          <td style={cell({ textAlign: "center" })}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", background: gradeColor, color: "#fff", fontSize: "11px", fontWeight: "800", boxShadow: `0 2px 6px ${gradeColor}66` }}>
              {row.grade}
            </span>
          </td>
        </tr>
      );
    }

    // ── Paper sub-row ─────────────────────────────────────────────────────
    if (row.is_paper_row) {
      return (
        <tr key={`paper-${row.subject_id}-${i}`}
          style={{ background: even ? "#fafbfd" : "#f4f7fb" }}>
          <td style={cell({ color: "#64748b", paddingLeft: "22px", fontSize: "11px" })}>
            <span style={{ color: "#c9a84c", marginRight: "4px" }}>↳</span>
            {row.subject_name}
          </td>
          <td style={cell({ textAlign: "center" })}>
            <span style={{ background: "#e8edf4", color: "#64748b", padding: "1px 6px", borderRadius: "6px", fontSize: "9px", fontWeight: "600" }}>
              {row.subject_code}
            </span>
          </td>
          {termCells}
          <td style={cell({ textAlign: "center", fontWeight: "600", color: "#334155", fontSize: "11px" })}>{displayMarks}</td>
          {!isTermReport && (
            <td style={cell({ textAlign: "center", color: "#94a3b8", fontSize: "10px" })}>{row.max_marks}</td>
          )}
          <td style={cell({ textAlign: "center", color: gradeColor, fontSize: "11px", fontWeight: "600" })}>{pct}%</td>
          <td style={cell({})} />
          <td style={cell({ width: "110px", padding: "8px 12px" })}>
            <div style={{ background: "#e2e8f0", borderRadius: "999px", height: "5px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: gradeColor, borderRadius: "999px", opacity: 0.6 }} />
            </div>
          </td>
          <td style={cell({ textAlign: "center" })}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "50%", background: gradeColor, color: "#fff", fontSize: "9px", fontWeight: "700" }}>
              {row.grade}
            </span>
          </td>
        </tr>
      );
    }

    // ── Regular row ───────────────────────────────────────────────────────
    return (
      <tr key={`subject-${row.subject_id}-${i}`}
        style={{ background: even ? "#ffffff" : "#f8fafc" }}>
        <td style={cell({ fontWeight: "600", color: "#0f172a" })}>{row.subject_name}</td>
        <td style={cell({ textAlign: "center" })}>
          <span style={{ background: "#e8edf4", color: "#374151", padding: "2px 7px", borderRadius: "8px", fontSize: "9.5px", fontWeight: "600" }}>
            {row.subject_code}
          </span>
        </td>
        {termCells}
        <td style={cell({ textAlign: "center", fontWeight: "700", color: "#1a2744", fontSize: "12px" })}>{displayMarks}</td>
        {!isTermReport && (
          <td style={cell({ textAlign: "center", color: "#64748b" })}>{row.max_marks}</td>
        )}
        <td style={cell({ textAlign: "center", fontWeight: "700", fontSize: "12px", color: gradeColor })}>{pct}%</td>
        {isPrimary
          ? <td style={cell({ fontSize: "10.5px", color: "#475569", fontStyle: "italic" })}>{row.subject_remark ?? ""}</td>
          : <td style={cell({ textAlign: "center" })}>
              <span style={{ background: gradeBg, color: gradeColor, padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>
                {row.points ?? 0}/8
              </span>
            </td>
        }
        <td style={cell({ width: "110px", padding: "8px 12px" })}>
          <div style={{ background: "#e2e8f0", borderRadius: "999px", height: "7px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${gradeColor}99, ${gradeColor})`, borderRadius: "999px" }} />
          </div>
        </td>
        <td style={cell({ textAlign: "center" })}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", background: gradeColor, color: "#fff", fontSize: "11px", fontWeight: "800", boxShadow: `0 2px 6px ${gradeColor}55` }}>
            {row.grade}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div ref={ref} style={{ width: "794px", minHeight: "1123px", backgroundColor: "#ffffff", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "12px", color: "#1f2937", position: "relative" }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #1a2744 0%, #0f1a30 100%)", padding: "26px 36px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #e8cc85)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(201,168,76,0.4)" }}>
              <span style={{ color: "#1a2744", fontWeight: "900", fontSize: "20px", letterSpacing: "-0.5px" }}>{schoolName.charAt(0)}</span>
            </div>
            <div>
              <div style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", letterSpacing: "0.5px" }}>{schoolName}</div>
              <div style={{ color: "#c9a84c", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginTop: "3px", opacity: 0.9 }}>{schoolMotto}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: "linear-gradient(135deg, #c9a84c, #e8cc85)", color: "#1a2744", padding: "5px 16px", borderRadius: "20px", fontSize: "10px", fontWeight: "800", letterSpacing: "1.2px", textTransform: "uppercase", display: "inline-block" }}>
              {examType} Report
            </div>
            <div style={{ color: "#94a3b8", fontSize: "9.5px", marginTop: "6px" }}>{generatedOn}</div>
          </div>
        </div>
      </div>

      {/* ── Gold accent bar ────────────────────────────────────────────── */}
      <div style={{ height: "5px", background: "linear-gradient(90deg, #c9a84c 0%, #e8cc85 50%, #c9a84c 100%)" }} />

      {/* ── Student identity strip ─────────────────────────────────────── */}
      <div style={{ padding: "18px 36px", background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "9px", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>Student</div>
          <div style={{ fontSize: "21px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
            {student.first_name} {student.last_name}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Reg. No: <strong style={{ color: "#1a2744" }}>{student.student_number}</strong>
            </span>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Class: <strong style={{ color: "#1a2744" }}>{student.class_name || "—"}</strong>
            </span>
            {student.gender && (
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Gender: <strong style={{ color: "#1a2744", textTransform: "capitalize" }}>{student.gender}</strong>
              </span>
            )}
          </div>

          {/* Class teacher + dates row */}
          <div style={{ display: "flex", gap: "16px", marginTop: "5px", flexWrap: "wrap" }}>
            {classTeacherName && (
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Class Teacher: <strong style={{ color: "#1a2744" }}>{classTeacherName}</strong>
              </span>
            )}
            {closingDate && (
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Closing: <strong style={{ color: "#1a2744" }}>{closingDate}</strong>
              </span>
            )}
            {openingDate && (
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Re-opens: <strong style={{ color: "#1a2744" }}>{openingDate}</strong>
              </span>
            )}
          </div>

          {/* Position badge */}
          {summary.position && (
            <div style={{ marginTop: "8px" }}>
              <span style={{ background: "linear-gradient(135deg, #1a2744, #243355)", color: "#c9a84c", padding: "3px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", boxShadow: "0 2px 6px rgba(26,39,68,0.25)" }}>
                {positionSuffix(summary.position)} out of {summary.class_size}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "10px", marginLeft: "8px" }}>in class</span>
            </div>
          )}
        </div>

        {/* Mean grade badge */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: `linear-gradient(135deg, ${GRADE_COLORS[meanGrade] || "#64748b"}, ${GRADE_COLORS[meanGrade] || "#64748b"}cc)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px ${GRADE_COLORS[meanGrade] || "#64748b"}55` }}>
            <span style={{ color: "#fff", fontSize: "30px", fontWeight: "900", lineHeight: 1 }}>{meanGrade}</span>
          </div>
          <div style={{ fontSize: "9px", color: "#64748b", marginTop: "5px", letterSpacing: "1px", textTransform: "uppercase" }}>Mean Grade</div>
        </div>
      </div>

      {/* ── Summary strip ──────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }}>
        {summaryStats.map((s, i) => (
          <div key={i} style={{ padding: "12px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid #e2e8f0" : "none" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#1a2744" }}>{s.value}</div>
            <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Results table ──────────────────────────────────────────────── */}
      <div style={{ padding: "20px 36px" }}>
        <div style={{ fontSize: "9px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
          Subject Results
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #1a2744, #243355)" }}>
              {headers.map((h, i) => (
                <th key={`h-${i}`} style={{ padding: "10px 10px", textAlign: i >= 2 ? "center" : "left", fontSize: "9.5px", fontWeight: "700", color: "#c9a84c", letterSpacing: "0.8px", textTransform: "uppercase", borderBottom: "2px solid #c9a84c" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects && subjects.length > 0
              ? subjects.map((row, i) => renderRow(row, i))
              : (
                <tr>
                  <td colSpan={headers.length} style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
                    No subject results found
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>

      {/* ── Class teacher comment ──────────────────────────────────────── */}
      {summary.teacher_remark && (
        <div style={{ padding: "0 36px 16px" }}>
          <div style={{ background: "linear-gradient(135deg, #f8fafc, #f0f4f8)", border: "1px solid #e2e8f0", borderLeft: "4px solid #c9a84c", borderRadius: "8px", padding: "14px 18px" }}>
            <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", fontWeight: "700" }}>
              Class Teacher's Comment
            </div>
            <p style={{ fontSize: "11.5px", color: "#334155", lineHeight: "1.65", margin: 0 }}>
              {summary.teacher_remark}
            </p>
            {classTeacherName && (
              <p style={{ fontSize: "10.5px", color: "#94a3b8", margin: "8px 0 0", textAlign: "right", fontStyle: "italic" }}>
                — {classTeacherName}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Signature section ──────────────────────────────────────────── */}
      <div style={{ padding: "0 36px 24px" }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 20px", background: "#fafbfc" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {[
              { label: "Principal's Signature & Date",        line: true },
              { label: "Parent / Guardian Signature & Date",  line: true },
            ].map(({ label }) => (
              <div key={label}>
                <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px", fontWeight: "600" }}>{label}</div>
                <div style={{ borderBottom: "1.5px solid #cbd5e1", paddingBottom: "22px" }} />
              </div>
            ))}
          </div>

          {/* Closing / Opening dates row */}
          {(closingDate || openingDate) && (
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", paddingTop: "12px", borderTop: "1px dashed #e2e8f0" }}>
              {closingDate && (
                <div>
                  <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>School Closing Date</div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a2744" }}>{closingDate}</div>
                </div>
              )}
              {openingDate && (
                <div>
                  <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>School Re-opening Date</div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a2744" }}>{openingDate}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(135deg, #1a2744, #0f1a30)", padding: "10px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#64748b", fontSize: "9.5px" }}>{schoolName} · Official Academic Report</span>
        <span style={{ color: "#c9a84c", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.5px" }}>CONFIDENTIAL</span>
      </div>
    </div>
  );
});

export default ReportCardDocument;