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
  const j = n % 10;
  const k = n % 100;

  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;

  return `${n}th`;
};

// Abbreviate subject names for column headers so they don't blow out width.
const abbreviateSubject = (name) => {
  const map = {
    "mathematics": "Math",
    "english": "Eng",
    "kiswahili": "Kis",
    "integrated science": "Int Sci",
    "agriculture and nutrition": "Agri",
    "creative arts": "Cr Arts",
    "christian religious education": "CRE",
    "social studies and life skills": "SSLS",
    "social studies and cre": "SS & CRE",
    "pretechnical studies": "Pre-Tech",
  };
  const key = name.toLowerCase().trim();
  if (map[key]) return map[key];
  // Try partial match for anything with "paper" or "karatasi"
  if (key.includes("paper 1"))
    return (
      name
        .split(" ")
        .slice(0, -2)
        .map((w) => w[0])
        .join("") + " P1"
    );
  if (key.includes("paper 2"))
    return (
      name
        .split(" ")
        .slice(0, -2)
        .map((w) => w[0])
        .join("") + " P2"
    );
  // Fallback: first word up to 7 chars
  return name.split(" ")[0].slice(0, 7);
};

const getColWidths = (subjectCount) => {
  if (subjectCount <= 6)
    return { pos: 36, name: 130, adm: 70, subj: 52, total: 48, grade: 46 };
  if (subjectCount <= 8)
    return { pos: 32, name: 115, adm: 62, subj: 46, total: 44, grade: 42 };
  if (subjectCount <= 10)
    return { pos: 28, name: 100, adm: 56, subj: 40, total: 40, grade: 38 };
  return { pos: 26, name: 90, adm: 50, subj: 36, total: 38, grade: 36 };
};

const getDivision = (grade) => {
  const g = Number(grade);
  if (g >= 4 && g <= 6) return "Primary";
  if (g >= 7 && g <= 8) return "Junior School";
  return "Other";
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

  // Collect all unique subjects from students
  const allSubjects = subjectSummaries?.map((s) => s.subject_name) ?? [];
  const colW = getColWidths(allSubjects.length);
  const division = getDivision(cls.grade);

  // Compute total table width so we can set the root div exactly
  const tableWidth =
    colW.pos +
    colW.name +
    colW.adm +
    allSubjects.length * colW.subj +
    colW.total +
    colW.grade;

  // Root width: table + padding (36px each side)
  const rootWidth = Math.max(tableWidth + 72, 900);

  // Font size scales down slightly when there are many columns
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
      <div style={{ background: "#1a2744", padding: "20px 36px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#c9a84c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#1a2744", fontWeight: "800", fontSize: "18px" }}>{schoolName.charAt(0)}</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>{schoolName}</div>
            <div style={{ color: "#c9a84c", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "2px" }}>{schoolMotto}</div>
            {schoolAddress && <div style={{ color: "#64748b", fontSize: "9px", marginTop: "2px" }}>{schoolAddress}</div>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ background: "#c9a84c", color: "#1a2744", padding: "4px 12px", borderRadius: "20px", fontSize: "9px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>
            {examType} Performance Report
          </div>
          <div style={{ color: "#64748b", fontSize: "9px", marginTop: "5px" }}>{generatedOn}</div>
        </div>
      </div>

      {/* ── Gold rule ─────────────────────────────────────────────── */}
      <div style={{ height: "3px", background: "linear-gradient(90deg,#c9a84c,#e8cc85,#c9a84c)" }} />

      {/* ── Class info strip ──────────────────────────────────────── */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "12px 36px", display: "flex", gap: "28px", alignItems: "center" }}>
        {[
          { label: "Class",    value: cls.name },
          { label: "Grade",    value: `Grade ${cls.grade}` },
          { label: "Division", value: division },
          { label: "Exam",     value: examType },
          { label: "Students", value: students.length },
          { label: "class teacher", value: cls.class_teacher_name},
        ].map((item, i) => (
          <div key={i}>
            <div style={{ fontSize: "8px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px" }}>{item.label}</div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#1a2744", marginTop: "2px" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* ── Rankings table ────────────────────────────────────────── */}
      <div style={{ padding: "24px 36px" }}>
        <div style={{ fontSize: "8px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "8px" }}>
          Student rankings
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: `${colW.pos}px` }} />
            <col style={{ width: `${colW.name}px` }} />
            <col style={{ width: `${colW.adm}px` }} />
            {allSubjects.map((_, i) => (
              <col key={i} style={{ width: `${colW.subj}px` }} />
            ))}
            <col style={{ width: `${colW.total}px` }} />
            <col style={{ width: `${colW.grade}px` }} />
          </colgroup>

          <thead>
            <tr style={{ background: "#1a2744" }}>
              {/* Fixed columns */}
              {[
                { label: "Pos",     align: "left"   },
                { label: "Name",    align: "left"   },
                { label: "Adm No.", align: "left"   },
              ].map(({ label, align }) => (
                <th key={label} style={{ padding: headerPad, fontSize: "9px", fontWeight: "600", color: "#c9a84c", letterSpacing: "0.4px", textTransform: "uppercase", borderBottom: "2px solid #c9a84c", textAlign: align, whiteSpace: "nowrap" }}>
                  {label}
                </th>
              ))}

              {/* Subject columns — abbreviated */}
              {allSubjects.map((sub, i) => (
                <th key={i} style={{ padding: headerPad, fontSize: "9px", fontWeight: "600", color: "#c9a84c", letterSpacing: "0.3px", textTransform: "uppercase", borderBottom: "2px solid #c9a84c", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {abbreviateSubject(sub)}
                </th>
              ))}

              {/* Totals */}
              {["Total", "Grade"].map((label) => (
                <th key={label} style={{ padding: headerPad, fontSize: "9px", fontWeight: "600", color: "#c9a84c", letterSpacing: "0.4px", textTransform: "uppercase", borderBottom: "2px solid #c9a84c", textAlign: "center", whiteSpace: "nowrap" }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((s, i) => (
              <tr key={s.student_id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e8edf2" }}>
                {/* Position */}
                <td style={{ padding: cellPadding, ...positionStyle(s.position), fontSize: "10px" }}>
                  {positionSuffix(s.position)}
                </td>

                {/* Name — truncated if too long for column */}
                <td style={{ padding: cellPadding, fontWeight: "500", color: "#0f172a", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: `${colW.name}px` }}>
                  {s.first_name} {s.last_name}
                </td>

                {/* Adm No */}
                <td style={{ padding: cellPadding, color: "#64748b", fontSize: "10px" }}>
                  {s.student_number}
                </td>

                {/* Per-subject marks */}
                {allSubjects.map((sub) => {
                  const result = s.subject_results?.find((r) => r.subject_name === sub);
                  return (
                    <td key={sub} style={{ padding: cellPadding, textAlign: "center", color: result ? (GRADE_COLORS[result.grade] || "#374151") : "#d1d5db", fontWeight: result ? "600" : "400", fontSize: "11px" }}>
                      {result ? result.marks_obtained : "—"}
                    </td>
                  );
                })}

                {/* Total marks */}
                <td style={{ padding: cellPadding, textAlign: "center", fontWeight: "700", color: "#1a2744", fontSize: "12px" }}>
                  {s.total_marks}
                </td>

                {/* Mean grade circle */}
                <td style={{ padding: cellPadding, textAlign: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "50%", background: GRADE_COLORS[s.mean_grade] || "#94a3b8", color: "#fff", fontSize: "10px", fontWeight: "700" }}>
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
          <div style={{ fontSize: "8px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "8px" }}>
            Subject performance summary — ranked by average
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {["Rank", "Subject", "Highest", "Lowest", "Average", "Students sat"].map((h) => (
                  <th key={h} style={{ padding: "6px 10px", fontSize: "8px", fontWeight: "600", color: "#64748b", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...subjectSummaries]
                .sort((a, b) => b.average - a.average)
                .map((sub, i) => (
                  <tr key={sub.subject_name} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "6px 10px", fontWeight: "600", color: "#1a2744", fontSize: "11px" }}>{i + 1}</td>
                    <td style={{ padding: "6px 10px", fontWeight: "500", fontSize: "11px" }}>{sub.subject_name}</td>
                    <td style={{ padding: "6px 10px", color: "#15803d", fontWeight: "600", fontSize: "11px" }}>{sub.highest}</td>
                    <td style={{ padding: "6px 10px", color: "#dc2626", fontWeight: "600", fontSize: "11px" }}>{sub.lowest}</td>
                    <td style={{ padding: "6px 10px", fontWeight: "700", color: "#1a2744", fontSize: "11px" }}>{sub.average}</td>
                    <td style={{ padding: "6px 10px", color: "#64748b", fontSize: "11px" }}>{sub.students_sat}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div style={{ background: "#1a2744", padding: "8px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#64748b", fontSize: "9px" }}>{schoolName} · Class Performance Report</span>
        <span style={{ color: "#c9a84c", fontSize: "9px", fontWeight: "600" }}>
          Generated {generatedOn} · Exam Management System
        </span>
      </div>
    </div>
  );
});

export default ClassPerformancePDF;
