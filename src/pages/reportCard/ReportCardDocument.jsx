import { forwardRef } from "react";

const GRADE_COLORS = {
  EE1: "#16a34a", EE2: "#22c55e",
  ME1: "#059669", ME2: "#10b981",
  AE1: "#d97706", AE2: "#f59e0b",
  BE1: "#ea580c", BE2: "#dc2626",
};

const GRADE_BG = {
  EE1: "#dcfce7", EE2: "#f0fdf4",
  ME1: "#d1fae5", ME2: "#ecfdf5",
  AE1: "#fef3c7", AE2: "#fefce8",
  BE1: "#ffedd5", BE2: "#fee2e2",
};

// Full label for each CBC grade code
const GRADE_LABELS = {
  EE1: "Exceeds Expectation",
  EE2: "Exceeds Expectation",
  ME1: "Meets Expectation",
  ME2: "Meets Expectation",
  AE1: "Approaches Expectation",
  AE2: "Approaches Expectation",
  BE1: "Below Expectation",
  BE2: "Below Expectation",
};

// Short remark for use inside the table cell
const GRADE_SHORT_REMARKS = {
  EE1: "Exceeds — Outstanding",
  EE2: "Exceeds — Very Good",
  ME1: "Meets — Good",
  ME2: "Meets — Satisfactory",
  AE1: "Approaches — Fair",
  AE2: "Approaches — Needs work",
  BE1: "Below — Improvement needed",
  BE2: "Below — Urgent support",
};

const GRADE_POINTS = {
  EE1: 8, EE2: 7, ME1: 6, ME2: 5,
  AE1: 4, AE2: 3, BE1: 2, BE2: 1,
};

// Teacher comments keyed by mean grade — used at the bottom of the card
const TEACHER_COMMENTS = {
  EE1: "An exceptional learner who consistently demonstrates mastery. Keep up the outstanding work.",
  EE2: "A highly capable learner who exceeds expectations. Encourage continued excellence.",
  ME1: "A dedicated learner who meets all expectations. With continued effort, greater heights await.",
  ME2: "A hardworking learner who meets most expectations. Focus on identified gaps to improve further.",
  AE1: "A learner who is approaching the expected level. More practice and support is encouraged.",
  AE2: "Progress is noted but more effort is required. Please seek additional support where needed.",
  BE1: "Performance is below expectation. Intervention and extra support are strongly recommended.",
  BE2: "Urgent support is needed. Please consult with the class teacher for a learning support plan.",
};

const positionSuffix = (n) => {
  if (!n) return "—";
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
  borderBottom: "1px solid #e8edf4",
  verticalAlign: "middle",
  ...extra,
});

// Format exam subjects for display
const formatSubjects = (subjects = []) =>
  subjects?.length ? subjects.map(s => s.subject_name).join(" & ") : "—";

const formatSubjectCodes = (subjects = []) =>
  subjects?.length ? subjects.map(s => s.subject_code).join("/") : "—";

const ReportCardDocument = forwardRef(function ReportCardDocument(
  {
    report,
    examType,
    schoolName   = "MUKURU OUTREACH ACADEMY",
    schoolMotto  = "Learning and achieving together",
    closingDate  = null,
    openingDate  = null,
  },
  ref,
) {
  if (!report) return null;

  const { student, class: cls, term, division, exams, summary } = report;
  const isPrimary  = division === "primary";
  const meanGrade  = summary?.mean_grade;
  const gradeColor = GRADE_COLORS[meanGrade] || "#64748b";

  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });

  // ── Fix 1 + 2: per-exam analytics ──────────────────────────────────
  const examRows = exams || [];

  // Total percentage = sum of all exam percentages
  const totalPercentage = examRows.reduce(
    (sum, r) => sum + (parseFloat(r.percentage) || 0), 0
  );
  const maxPercentage = examRows.length * 100;

  // Strongest and weakest exams by percentage
  const sortedByPct = [...examRows].sort(
    (a, b) => (parseFloat(b.percentage) || 0) - (parseFloat(a.percentage) || 0)
  );
  const strongestExam = sortedByPct[0] ?? null;
  const weakestExam   = sortedByPct[sortedByPct.length - 1] ?? null;

  // Junior: total points
  const totalPoints = isPrimary
    ? null
    : examRows.reduce((sum, r) => sum + (GRADE_POINTS[r.grade] ?? 0), 0);
  const maxPoints = isPrimary ? null : examRows.length * 8;

  // Table headers vary by division
  const headers = isPrimary
    ? ["Exam / Subject", "Code", "Correct", "Out of", "%", "Remark", "Performance", "Grade"]
    : ["Exam / Subject", "Code", "Correct", "Out of", "%", "Points", "Performance", "Grade"];

  return (
    <div
      ref={ref}
      style={{
        width: "794px", minHeight: "1123px",
        backgroundColor: "#ffffff",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "12px", color: "#1f2937",
        position: "relative",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg,#1a2744 0%,#0f1a30 100%)", padding: "26px 36px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#c9a84c,#e8cc85)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(201,168,76,0.4)" }}>
              <span style={{ color: "#1a2744", fontWeight: "900", fontSize: "20px" }}>{schoolName.charAt(0)}</span>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: "20px", fontWeight: "800", letterSpacing: "0.3px" }}>{schoolName}</div>
              <div style={{ color: "#c9a84c", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginTop: "3px" }}>{schoolMotto}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: "linear-gradient(135deg,#c9a84c,#e8cc85)", color: "#1a2744", padding: "5px 16px", borderRadius: "20px", fontSize: "10px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase", display: "inline-block" }}>
              Term {term?.term_number} · {examType !== "All" ? examType : "Report Card"}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "9.5px", marginTop: "5px" }}>{term?.academic_year} · {generatedOn}</div>
          </div>
        </div>
      </div>

      {/* ── Gold bar ────────────────────────────────────────────────── */}
      <div style={{ height: "4px", background: "linear-gradient(90deg,#c9a84c,#e8cc85,#c9a84c)" }} />

      {/* ── Student strip ────────────────────────────────────────────── */}
      <div style={{ padding: "18px 36px", background: "linear-gradient(180deg,#f8fafc,#fff)", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "9px", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>Learner</div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.3px" }}>
            {student.first_name} {student.last_name}
          </div>

          {/* Metadata row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "6px" }}>
            {[
              { label: "Adm No", value: student.student_number },
              { label: "Class",  value: cls?.name },
              { label: "Grade",  value: cls?.grade },
              ...(student.gender ? [{ label: "Gender", value: student.gender }] : []),
            ].map(({ label, value }) => (
              <span key={label} style={{ fontSize: "11px", color: "#64748b" }}>
                {label}: <strong style={{ color: "#1a2744" }}>{value || "—"}</strong>
              </span>
            ))}
          </div>

          {/* Class teacher */}
          {cls?.teacher_name && (
            <div style={{ marginTop: "5px", fontSize: "11px", color: "#64748b" }}>
              Class Teacher: <strong style={{ color: "#1a2744" }}>{cls.teacher_name}</strong>
            </div>
          )}

          {/* Position badge */}
          {summary?.position && (
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "linear-gradient(135deg,#1a2744,#243355)", color: "#c9a84c", padding: "3px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", boxShadow: "0 2px 6px rgba(26,39,68,0.25)" }}>
                {positionSuffix(summary.position)} out of {summary.class_size}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "10px" }}>in class</span>
            </div>
          )}
        </div>

        {/* Mean grade circle */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: `linear-gradient(135deg,${gradeColor},${gradeColor}cc)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px ${gradeColor}44` }}>
            <span style={{ color: "#fff", fontSize: "22px", fontWeight: "900", lineHeight: 1 }}>{meanGrade || "—"}</span>
          </div>
          <div style={{ fontSize: "9px", color: "#64748b", marginTop: "5px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Mean Grade</div>
          {meanGrade && GRADE_LABELS[meanGrade] && (
            <div style={{ fontSize: "8px", color: gradeColor, fontWeight: "600", marginTop: "2px" }}>{GRADE_LABELS[meanGrade]}</div>
          )}
        </div>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${isPrimary ? 3 : 4}, 1fr)`, borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }}>
        {[
          { label: "Exams sat",     value: examRows.length },
          { label: "Average %",     value: `${summary?.average_percentage ?? "—"}%` },
          ...(!isPrimary ? [{ label: "Total Points", value: `${totalPoints ?? "—"} / ${maxPoints ?? "—"}` }] : []),
          { label: isPrimary ? "Primary" : "Junior School", value: isPrimary ? "Grades 4–6" : "Grades 7–8" },
        ].map((s, i, arr) => (
          <div key={i} style={{ padding: "12px 16px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid #e2e8f0" : "none" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#1a2744" }}>{s.value}</div>
            <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Results table ─────────────────────────────────────────────── */}
      <div style={{ padding: "20px 36px 0" }}>
        <div style={{ fontSize: "9px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
          Examination Results
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg,#1a2744,#243355)" }}>
              {headers.map((h, i) => (
                <th key={h} style={{ padding: "9px 10px", textAlign: i <= 1 ? "left" : "center", fontSize: "9.5px", fontWeight: "700", color: "#c9a84c", letterSpacing: "0.7px", textTransform: "uppercase", borderBottom: "2px solid #c9a84c" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {examRows.length > 0 ? examRows.map((row, i) => {
              const gColor = GRADE_COLORS[row.grade] || "#64748b";
              const gBg    = GRADE_BG[row.grade]    || "#f1f5f9";
              const pct    = parseFloat(row.percentage) || 0;
              const pts    = GRADE_POINTS[row.grade] ?? null;
              const even   = i % 2 === 0;

              return (
                <tr key={row.exam_id} style={{ background: even ? "#fff" : "#f8fafc" }}>
                  {/* Exam / Subject */}
                  <td style={cell({ fontWeight: "600", color: "#0f172a" })}>
                    <div>{row.exam_title}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
                      {formatSubjects(row.subjects)}
                    </div>
                  </td>

                  {/* Subject code */}
                  <td style={cell({ textAlign: "center" })}>
                    <span style={{ background: "#e8edf4", color: "#374151", padding: "2px 7px", borderRadius: "8px", fontSize: "9.5px", fontWeight: "600" }}>
                      {formatSubjectCodes(row.subjects)}
                    </span>
                  </td>

                  {/* Questions correct */}
                  <td style={cell({ textAlign: "center", fontWeight: "700", color: "#1a2744", fontSize: "13px" })}>
                    {row.questions_correct ?? "—"}
                  </td>

                  {/* Total questions */}
                  <td style={cell({ textAlign: "center", color: "#64748b" })}>
                    {row.total_questions ?? "—"}
                  </td>

                  {/* Percentage */}
                  <td style={cell({ textAlign: "center", fontWeight: "700", color: gColor, fontSize: "12px" })}>
                    {pct}%
                  </td>

                  {/* Fix 2: Remark (primary) OR Points (junior) */}
                  {isPrimary ? (
                    // Fix 2: primary gets grade label instead of dash
                    <td style={cell({ fontSize: "10px", color: gColor, fontWeight: "600" })}>
                      {row.grade && GRADE_SHORT_REMARKS[row.grade]
                        ? GRADE_SHORT_REMARKS[row.grade]
                        : (row.remarks || "—")}
                    </td>
                  ) : (
                    // Fix 2: junior gets percentage + points
                    <td style={cell({ textAlign: "center" })}>
                      <span style={{ background: gBg, color: gColor, padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", display: "inline-block" }}>
                        {pts !== null ? `${pts}/8` : "—"}
                      </span>
                    </td>
                  )}

                  {/* Performance bar */}
                  <td style={cell({ width: "100px", padding: "8px 12px" })}>
                    <div style={{ background: "#e2e8f0", borderRadius: "999px", height: "7px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: `linear-gradient(90deg,${gColor}99,${gColor})`, borderRadius: "999px" }} />
                    </div>
                    <div style={{ fontSize: "9px", color: "#94a3b8", marginTop: "2px", textAlign: "center" }}>
                      {GRADE_LABELS[row.grade] || ""}
                    </div>
                  </td>

                  {/* Grade circle */}
                  <td style={cell({ textAlign: "center" })}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "50%", background: gColor, color: "#fff", fontSize: "9px", fontWeight: "800", boxShadow: `0 2px 6px ${gColor}55` }}>
                      {row.grade || "—"}
                    </span>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={headers.length} style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Fix 1 + 2: Analytics section below the table ─────────────── */}
      {examRows.length > 0 && (
        <div style={{ margin: "0 36px 16px", padding: "14px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderTop: "2px solid #c9a84c", borderRadius: "0 0 8px 8px" }}>
          <div style={{ fontSize: "9px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "10px" }}>
            Performance Analytics
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>

            {/* Total percentage */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "900", color: "#1a2744" }}>
                {Math.round(totalPercentage)}
              </div>
              <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginTop: "2px" }}>
                Total % ({maxPercentage} max)
              </div>
            </div>

            {/* Junior only: total points */}
            {!isPrimary && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#1a2744" }}>
                  {totalPoints} / {maxPoints}
                </div>
                <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginTop: "2px" }}>
                  Total Points
                </div>
              </div>
            )}

            {/* Strongest subject */}
            {strongestExam && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 12px" }}>
                <div style={{ fontSize: "9px", color: "#15803d", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: "700", marginBottom: "4px" }}>
                  ↑ Strongest
                </div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#15803d", lineHeight: 1.3 }}>
                  {formatSubjects(strongestExam.subjects)}
                </div>
                <div style={{ fontSize: "10px", color: "#15803d", opacity: 0.8, marginTop: "2px" }}>
                  {parseFloat(strongestExam.percentage).toFixed(1)}% · {strongestExam.grade}
                </div>
              </div>
            )}

            {/* Weakest subject */}
            {weakestExam && weakestExam.exam_id !== strongestExam?.exam_id && (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "10px 12px" }}>
                <div style={{ fontSize: "9px", color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: "700", marginBottom: "4px" }}>
                  ↓ Needs focus
                </div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#c2410c", lineHeight: 1.3 }}>
                  {formatSubjects(weakestExam.subjects)}
                </div>
                <div style={{ fontSize: "10px", color: "#c2410c", opacity: 0.8, marginTop: "2px" }}>
                  {parseFloat(weakestExam.percentage).toFixed(1)}% · {weakestExam.grade}
                </div>
              </div>
            )}

            {/* Position */}
            {summary?.position && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#1e40af" }}>
                  {positionSuffix(summary.position)}
                </div>
                <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginTop: "2px" }}>
                  Class position
                </div>
                <div style={{ fontSize: "9px", color: "#1e40af", marginTop: "2px" }}>
                  out of {summary.class_size}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Teacher comment ────────────────────────────────────────── */}
      {(summary?.teacher_comment || TEACHER_COMMENTS[meanGrade]) && (
        <div style={{ padding: "0 36px 16px" }}>
          <div style={{ background: "linear-gradient(135deg,#f8fafc,#f0f4f8)", border: "1px solid #e2e8f0", borderLeft: "4px solid #c9a84c", borderRadius: "8px", padding: "14px 18px" }}>
            <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", fontWeight: "700" }}>
              Class Teacher's Comment
            </div>
            <p style={{ fontSize: "11.5px", color: "#334155", lineHeight: "1.65", margin: 0 }}>
              {summary?.teacher_comment || TEACHER_COMMENTS[meanGrade]}
            </p>
            {cls?.teacher_name && (
              <p style={{ fontSize: "10px", color: "#94a3b8", margin: "8px 0 0", textAlign: "right", fontStyle: "italic" }}>
                — {cls.teacher_name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Fix 3: Signature + dates section ─────────────────────────── */}
      <div style={{ padding: "0 36px 24px" }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 20px", background: "#fafbfc" }}>

          {/* Closing / Opening dates */}
          {(closingDate || openingDate) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px dashed #e2e8f0" }}>
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

          {/* Three signature slots */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            {[
              "Class Teacher's Signature & Date",
              "Head Teacher's Signature & Date",
              "Parent / Guardian Signature & Date",
            ].map((label) => (
              <div key={label}>
                <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "6px", fontWeight: "600" }}>
                  {label}
                </div>
                {/* Signature line */}
                <div style={{ borderBottom: "1.5px solid #cbd5e1", paddingBottom: "24px", marginBottom: "4px" }} />
                {/* Date line below */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "8px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date:</span>
                  <div style={{ flex: 1, borderBottom: "1px solid #e2e8f0", paddingBottom: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(135deg,#1a2744,#0f1a30)", padding: "10px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#64748b", fontSize: "9.5px" }}>{schoolName} · Official Academic Report</span>
        <span style={{ color: "#c9a84c", fontSize: "9.5px", fontWeight: "700" }}>CONFIDENTIAL</span>
      </div>
    </div>
  );
});

export default ReportCardDocument;