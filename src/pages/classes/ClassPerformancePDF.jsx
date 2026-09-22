import { forwardRef } from "react";

const GRADE_COLORS = {
  EE1: "#16a34a",
  EE2: "#22c55e",
  ME1: "#059669",
  ME2: "#10b981",
  AE1: "#d97706",
  AE2: "#f59e0b",
  BE1: "#ea580c",
  BE2: "#dc2626",
};

const positionStyle = (pos) => {
  if (pos === 1) return { color: "#b45309", fontWeight: "800" };
  if (pos === 2) return { color: "#64748b", fontWeight: "700" };
  if (pos === 3) return { color: "#c2410c", fontWeight: "700" };
  return { color: "#374151", fontWeight: "500" };
};

const positionSuffix = (n) => {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
};

const getColWidths = (subjectCount) => {
  if (subjectCount <= 6)
    return { pos: 36, name: 130, adm: 70, subj: 52, total: 52, grade: 46 };
  if (subjectCount <= 8)
    return { pos: 32, name: 115, adm: 62, subj: 46, total: 48, grade: 42 };
  if (subjectCount <= 10)
    return { pos: 28, name: 100, adm: 56, subj: 40, total: 44, grade: 38 };
  return { pos: 26, name: 90, adm: 50, subj: 36, total: 42, grade: 36 };
};

const getDivision = (grade) => {
  const g = Number(grade);
  if (g >= 4 && g <= 6) return "Primary";
  if (g >= 7 && g <= 8) return "Junior School";
  return "Other";
};

// ── Key helper: given a student's exam_results array and a subject name,
// find the percentage the student achieved in any exam that covers that subject.
// If the subject appears in multiple exams (edge case), return the average.
const getSubjectPercentage = (examResults = [], subjectName) => {
  const matching = examResults.filter((er) =>
    (er.subjects || []).some((s) => s.subject_name === subjectName),
  );
  if (matching.length === 0) return null;
  const avg =
    matching.reduce((sum, er) => sum + parseFloat(er.percentage || 0), 0) /
    matching.length;
  return parseFloat(avg.toFixed(1));
};

// ── Get the grade for a subject from exam_results
const getSubjectGrade = (examResults = [], subjectName) => {
  const match = examResults.find((er) =>
    (er.subjects || []).some((s) => s.subject_name === subjectName),
  );
  return match?.grade ?? null;
};

const ClassPerformancePDF = forwardRef(function ClassPerformancePDF(
  {
    data,
    examType,
    schoolName = "MUKURU OUTREACH ACADEMY",
    schoolMotto = "learning · achieving · together",
    schoolAddress = "P.O.BOX 402-00507",
  },
  ref,
) {
  if (!data) return null;

  const { class: cls, students, subjectSummaries } = data;

  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // All unique subject names — driven by subjectSummaries (already sorted by average DESC)
  const allSubjects = subjectSummaries?.map((s) => s.subject_name) ?? [];
  const colW = getColWidths(allSubjects.length);
  const division = getDivision(cls.grade);

  const tableWidth =
    colW.pos +
    colW.name +
    colW.adm +
    allSubjects.length * colW.subj +
    colW.total +
    colW.grade;
  const rootWidth = Math.max(tableWidth + 72, 900);

  const baseFontSize = allSubjects.length <= 8 ? "12px" : "11px";
  const cellPadding = allSubjects.length <= 8 ? "8px 10px" : "6px 8px";
  const headerPad = allSubjects.length <= 8 ? "9px 10px" : "7px 7px";

  return (
    <div
      ref={ref}
      style={{
        width: `${rootWidth}px`,
        backgroundColor: "#fff",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: baseFontSize,
        color: "#1f2937",
      }}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#1a2744",
          padding: "20px 36px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#c9a84c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{ color: "#1a2744", fontWeight: "800", fontSize: "18px" }}
            >
              {schoolName.charAt(0)}
            </span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>
              {schoolName}
            </div>
            <div
              style={{
                color: "#c9a84c",
                fontSize: "9px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              {schoolMotto}
            </div>
            {schoolAddress && (
              <div
                style={{ color: "#64748b", fontSize: "9px", marginTop: "2px" }}
              >
                {schoolAddress}
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              background: "#c9a84c",
              color: "#1a2744",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {examType} Performance Report
          </div>
          <div style={{ color: "#64748b", fontSize: "9px", marginTop: "5px" }}>
            {generatedOn}
          </div>
        </div>
      </div>

      {/* ── Gold rule ─────────────────────────────────────────────── */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg,#c9a84c,#e8cc85,#c9a84c)",
        }}
      />

      {/* ── Class info strip ──────────────────────────────────────── */}
      <div
        style={{
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 36px",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          alignItems: "center",
        }}
      >
        {[
          { label: "Class", value: cls.name },
          { label: "Grade", value: `Grade ${cls.grade}` },
          { label: "Division", value: division },
          { label: "Exam type", value: examType },
          { label: "Students", value: students.length },
          {
            label: "Class teacher",
            value: cls.class_teacher_name || "—",
          },
        ].map((item, i) => (
          <div key={i}>
            <div
              style={{
                fontSize: "8px",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#1a2744",
                marginTop: "2px",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Rankings table ────────────────────────────────────────── */}
      <div style={{ padding: "20px 36px" }}>
        <div
          style={{
            fontSize: "8px",
            fontWeight: "700",
            color: "#94a3b8",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Student rankings — sorted by average percentage
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: `${colW.pos}px` }} />
            <col style={{ width: `${colW.name}px` }} />
            <col style={{ width: `${colW.adm}px` }} />
            {allSubjects.map((_, i) => (
              <col key={i} style={{ width: `${colW.subj}px` }} />
            ))}
            {/* Avg % column + Grade column */}
            <col style={{ width: `${colW.total}px` }} />
            <col style={{ width: `${colW.grade}px` }} />
          </colgroup>

          <thead>
            <tr style={{ background: "#1a2744" }}>
              {[
                { label: "Pos", align: "left" },
                { label: "Name", align: "left" },
                { label: "Adm No.", align: "left" },
              ].map(({ label, align }) => (
                <th
                  key={label}
                  style={{
                    padding: headerPad,
                    fontSize: "9px",
                    fontWeight: "600",
                    color: "#c9a84c",
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                    borderBottom: "2px solid #c9a84c",
                    textAlign: align,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </th>
              ))}

              {/* One column per subject — use subject_code from summaries */}
              {subjectSummaries.map((sub, i) => (
                <th
                  key={i}
                  style={{
                    padding: headerPad,
                    fontSize: "9px",
                    fontWeight: "600",
                    color: "#c9a84c",
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                    borderBottom: "2px solid #c9a84c",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sub.subject_code ||
                    sub.subject_name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                </th>
              ))}

              {/* Avg % + Grade */}
              {[
                { label: "Avg %", align: "center" },
                { label: "Grade", align: "center" },
              ].map(({ label, align }) => (
                <th
                  key={label}
                  style={{
                    padding: headerPad,
                    fontSize: "9px",
                    fontWeight: "600",
                    color: "#c9a84c",
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                    borderBottom: "2px solid #c9a84c",
                    textAlign: align,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((s, i) => (
              <tr
                key={s.student_id}
                style={{
                  background: i % 2 === 0 ? "#fff" : "#f8fafc",
                  borderBottom: "1px solid #e8edf2",
                }}
              >
                {/* Position */}
                <td
                  style={{
                    padding: cellPadding,
                    ...positionStyle(s.position),
                    fontSize: "10px",
                  }}
                >
                  {positionSuffix(s.position)}
                </td>

                {/* Name */}
                <td
                  style={{
                    padding: cellPadding,
                    fontWeight: "500",
                    color: "#0f172a",
                    fontSize: "11px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: `${colW.name}px`,
                  }}
                >
                  {s.first_name} {s.last_name}
                </td>

                {/* Adm No */}
                <td
                  style={{
                    padding: cellPadding,
                    color: "#64748b",
                    fontSize: "10px",
                  }}
                >
                  {s.student_number}
                </td>

                {/* Per-subject percentage cells */}
                {allSubjects.map((subjectName) => {
                  const pct = getSubjectPercentage(s.exam_results, subjectName);
                  const grade = getSubjectGrade(s.exam_results, subjectName);
                  const color = grade
                    ? GRADE_COLORS[grade] || "#374151"
                    : "#d1d5db";

                  return (
                    <td
                      key={subjectName}
                      style={{
                        padding: cellPadding,
                        textAlign: "center",
                        color,
                        fontWeight: pct !== null ? "600" : "400",
                        fontSize: "11px",
                      }}
                    >
                      {pct !== null ? `${pct}%` : "—"}
                    </td>
                  );
                })}

                {/* Average percentage across all exams */}
                <td
                  style={{
                    padding: cellPadding,
                    textAlign: "center",
                    fontWeight: "700",
                    color: "#1a2744",
                    fontSize: "12px",
                  }}
                >
                  {s.avg_percentage != null
                    ? `${parseFloat(s.avg_percentage).toFixed(1)}%`
                    : "—"}
                </td>

                {/* Mean grade circle */}
                <td style={{ padding: cellPadding, textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: GRADE_COLORS[s.mean_grade] || "#94a3b8",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "700",
                    }}
                  >
                    {s.mean_grade || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Subject summary footer ────────────────────────────────── */}
      {subjectSummaries && subjectSummaries.length > 0 && (
        <div style={{ padding: "0 36px 20px", marginTop: "12px" }}>
          <div
            style={{
              fontSize: "8px",
              fontWeight: "700",
              color: "#94a3b8",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Subject performance summary — ranked by average percentage
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {[
                  "Rank",
                  "Subject",
                  "Highest %",
                  "Lowest %",
                  "Average %",
                  "Students sat",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 10px",
                      fontSize: "8px",
                      fontWeight: "600",
                      color: "#64748b",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Already sorted DESC by average from the backend query */}
              {subjectSummaries.map((sub, i) => (
                <tr
                  key={sub.subject_name}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td
                    style={{
                      padding: "6px 10px",
                      fontWeight: "600",
                      color: "#1a2744",
                      fontSize: "11px",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      fontWeight: "500",
                      fontSize: "11px",
                    }}
                  >
                    {sub.subject_name}
                  </td>
                  {/* highest / lowest / average are now percentage floats from the backend */}
                  <td
                    style={{
                      padding: "6px 10px",
                      color: "#15803d",
                      fontWeight: "600",
                      fontSize: "11px",
                    }}
                  >
                    {sub.highest != null ? `${sub.highest}%` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      color: "#dc2626",
                      fontWeight: "600",
                      fontSize: "11px",
                    }}
                  >
                    {sub.lowest != null ? `${sub.lowest}%` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      fontWeight: "700",
                      color: "#1a2744",
                      fontSize: "11px",
                    }}
                  >
                    {sub.average != null ? `${sub.average}%` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      color: "#64748b",
                      fontSize: "11px",
                    }}
                  >
                    {sub.students_sat}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div
        style={{
          background: "#1a2744",
          padding: "8px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#64748b", fontSize: "9px" }}>
          {schoolName} · Class Performance Report
        </span>
        <span style={{ color: "#c9a84c", fontSize: "9px", fontWeight: "600" }}>
          Generated {generatedOn} · Exam Management System
        </span>
      </div>
    </div>
  );
});

export default ClassPerformancePDF;
