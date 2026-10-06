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

const GRADE_BG = {
  EE1: "#dcfce7",
  EE2: "#f0fdf4",
  ME1: "#d1fae5",
  ME2: "#ecfdf5",
  AE1: "#fef3c7",
  AE2: "#fefce8",
  BE1: "#ffedd5",
  BE2: "#fee2e2",
};

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
  EE1: 8,
  EE2: 7,
  ME1: 6,
  ME2: 5,
  AE1: 4,
  AE2: 3,
  BE1: 2,
  BE2: 1,
};

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
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
};

// Tighter cell padding for print
const cell = (extra = {}) => ({
  padding: "5px 8px",
  fontSize: "10.5px",
  color: "#1f2937",
  borderBottom: "1px solid #e8edf4",
  verticalAlign: "middle",
  ...extra,
});

const formatSubjects = (subjects = []) =>
  subjects?.length ? subjects.map((s) => s.subject_name).join(" & ") : "—";

const formatSubjectCodes = (subjects = []) =>
  subjects?.length ? subjects.map((s) => s.subject_code).join("/") : "—";

const ReportCardDocument = forwardRef(function ReportCardDocument(
  {
    report,
    examType,
    schoolName = "MUKURU OUTREACH ACADEMY",
    schoolMotto = "Learning and achieving together",
    closingDate = null,
    openingDate = null,
  },
  ref,
) {
  if (!report) return null;

  const { student, class: cls, term, division, exams, summary } = report;
  const isPrimary = division === "primary";
  const meanGrade = summary?.mean_grade;
  const gradeColor = GRADE_COLORS[meanGrade] || "#64748b";

  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const examRows = exams || [];
  const totalPercentage = examRows.reduce(
    (s, r) => s + (parseFloat(r.percentage) || 0),
    0,
  );
  const maxPercentage = examRows.length * 100;

  const sortedByPct = [...examRows].sort(
    (a, b) => (parseFloat(b.percentage) || 0) - (parseFloat(a.percentage) || 0),
  );
  const strongestExam = sortedByPct[0] ?? null;
  const weakestExam = sortedByPct[sortedByPct.length - 1] ?? null;

  const totalPoints = isPrimary
    ? null
    : examRows.reduce((s, r) => s + (GRADE_POINTS[r.grade] ?? 0), 0);
  const maxPoints = isPrimary ? null : examRows.length * 8;

  const headers = isPrimary
    ? [
        "Exam / Subject",
        "Code",
        "Correct",
        "Out of",
        "%",
        "Remark",
        "Performance",
        "Grade",
      ]
    : [
        "Exam / Subject",
        "Code",
        "Correct",
        "Out of",
        "%",
        "Points",
        "Performance",
        "Grade",
      ];

  // Analytics grid columns — 3 for primary (no points card), 4 for junior
  const analyticsColCount = isPrimary ? 3 : 4;

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        minWidth: "794px", // ← prevents collapse in flex containers
        backgroundColor: "#ffffff",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "11px",
        color: "#1f2937",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a2744 0%,#0f1a30 100%)",
          padding: "18px 28px 14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#c9a84c,#e8cc85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: "#1a2744",
                  fontWeight: "900",
                  fontSize: "18px",
                }}
              >
                {schoolName.charAt(0)}
              </span>
            </div>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontSize: "17px",
                  fontWeight: "800",
                  letterSpacing: "0.2px",
                }}
              >
                {schoolName}
              </div>
              <div
                style={{
                  color: "#c9a84c",
                  fontSize: "9px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}
              >
                {schoolMotto}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                background: "linear-gradient(135deg,#c9a84c,#e8cc85)",
                color: "#1a2744",
                padding: "4px 12px",
                borderRadius: "16px",
                fontSize: "9px",
                fontWeight: "800",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                display: "inline-block",
              }}
            >
              Term {term?.term_number} ·{" "}
              {examType !== "All" ? examType : "Report Card"}
            </div>
            <div
              style={{ color: "#94a3b8", fontSize: "8.5px", marginTop: "4px" }}
            >
              {term?.academic_year} · {generatedOn}
            </div>
          </div>
        </div>
      </div>

      {/* ── Gold bar ─────────────────────────────────────────────── */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg,#c9a84c,#e8cc85,#c9a84c)",
          flexShrink: 0,
        }}
      />

      {/* ── Student strip ─────────────────────────────────────────── */}
      <div
        style={{
          padding: "12px 28px",
          background: "linear-gradient(180deg,#f8fafc,#fff)",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "8px",
              color: "#94a3b8",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "3px",
            }}
          >
            Learner
          </div>
          <div
            style={{
              fontSize: "17px",
              fontWeight: "800",
              color: "#0f172a",
              letterSpacing: "-0.3px",
            }}
          >
            {student.first_name} {student.last_name}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              marginTop: "5px",
            }}
          >
            {[
              { label: "Adm No", value: student.student_number },
              { label: "Class", value: cls?.name },
              { label: "Grade", value: cls?.grade },
              ...(student.gender
                ? [{ label: "Gender", value: student.gender }]
                : []),
            ].map(({ label, value }) => (
              <span key={label} style={{ fontSize: "10px", color: "#64748b" }}>
                {label}:{" "}
                <strong style={{ color: "#1a2744" }}>{value || "—"}</strong>
              </span>
            ))}
          </div>

          {cls?.teacher_name && (
            <div
              style={{ marginTop: "4px", fontSize: "10px", color: "#64748b" }}
            >
              Class Teacher:{" "}
              <strong style={{ color: "#1a2744" }}>{cls.teacher_name}</strong>
            </div>
          )}

          {summary?.position && (
            <div
              style={{
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg,#1a2744,#243355)",
                  color: "#c9a84c",
                  padding: "2px 10px",
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontWeight: "700",
                }}
              >
                {positionSuffix(summary.position)} out of {summary.class_size}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "9px" }}>
                in class
              </span>
            </div>
          )}
        </div>

        {/* Mean grade circle — slightly smaller */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: `linear-gradient(135deg,${gradeColor},${gradeColor}cc)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${gradeColor}44`,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "18px",
                fontWeight: "900",
                lineHeight: 1,
              }}
            >
              {meanGrade || "—"}
            </span>
          </div>
          <div
            style={{
              fontSize: "8px",
              color: "#64748b",
              marginTop: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Mean Grade
          </div>
          {meanGrade && GRADE_LABELS[meanGrade] && (
            <div
              style={{
                fontSize: "7.5px",
                color: gradeColor,
                fontWeight: "600",
                marginTop: "2px",
              }}
            >
              {GRADE_LABELS[meanGrade]}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${isPrimary ? 3 : 4}, 1fr)`,
          borderBottom: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        {[
          { label: "Exams sat", value: examRows.length },
          {
            label: "Average %",
            value: `${summary?.average_percentage ?? "—"}%`,
          },
          ...(!isPrimary
            ? [
                {
                  label: "Total Points",
                  value: `${totalPoints ?? "—"} / ${maxPoints ?? "—"}`,
                },
              ]
            : []),
          {
            label: isPrimary ? "Primary" : "Junior School",
            value: isPrimary ? "Grades 4–6" : "Grades 7–8",
          },
        ].map((s, i, arr) => (
          <div
            key={i}
            style={{
              padding: "8px 12px",
              textAlign: "center",
              borderRight: i < arr.length - 1 ? "1px solid #e2e8f0" : "none",
            }}
          >
            <div
              style={{ fontSize: "15px", fontWeight: "800", color: "#1a2744" }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "8px",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                marginTop: "1px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Results table ─────────────────────────────────────────── */}
      <div style={{ padding: "12px 28px 0" }}>
        <div
          style={{
            fontSize: "8px",
            fontWeight: "800",
            color: "#94a3b8",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Examination Results
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{ background: "linear-gradient(135deg,#1a2744,#243355)" }}
            >
              {headers.map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "7px 8px",
                    textAlign: i <= 1 ? "left" : "center",
                    fontSize: "8.5px",
                    fontWeight: "700",
                    color: "#c9a84c",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                    borderBottom: "2px solid #c9a84c",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {examRows.length > 0 ? (
              examRows.map((row, i) => {
                const gColor = GRADE_COLORS[row.grade] || "#64748b";
                const gBg = GRADE_BG[row.grade] || "#f1f5f9";
                const pct = parseFloat(row.percentage) || 0;
                const pts = GRADE_POINTS[row.grade] ?? null;
                const even = i % 2 === 0;

                return (
                  <tr
                    key={row.exam_id}
                    style={{ background: even ? "#fff" : "#f8fafc" }}
                  >
                    <td style={cell({ fontWeight: "600", color: "#0f172a" })}>
                      <div style={{ fontSize: "10.5px" }}>{row.exam_title}</div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#94a3b8",
                          marginTop: "1px",
                        }}
                      >
                        {formatSubjects(row.subjects)}
                      </div>
                    </td>

                    <td style={cell({ textAlign: "center" })}>
                      <span
                        style={{
                          background: "#e8edf4",
                          color: "#374151",
                          padding: "1px 5px",
                          borderRadius: "6px",
                          fontSize: "8.5px",
                          fontWeight: "600",
                        }}
                      >
                        {formatSubjectCodes(row.subjects)}
                      </span>
                    </td>

                    <td
                      style={cell({
                        textAlign: "center",
                        fontWeight: "700",
                        color: "#1a2744",
                        fontSize: "12px",
                      })}
                    >
                      {row.questions_correct ?? "—"}
                    </td>

                    <td style={cell({ textAlign: "center", color: "#64748b" })}>
                      {row.total_questions ?? "—"}
                    </td>

                    <td
                      style={cell({
                        textAlign: "center",
                        fontWeight: "700",
                        color: gColor,
                        fontSize: "11px",
                      })}
                    >
                      {pct}%
                    </td>

                    {isPrimary ? (
                      <td
                        style={cell({
                          fontSize: "9px",
                          color: gColor,
                          fontWeight: "600",
                        })}
                      >
                        {row.grade && GRADE_SHORT_REMARKS[row.grade]
                          ? GRADE_SHORT_REMARKS[row.grade]
                          : row.remarks || "—"}
                      </td>
                    ) : (
                      <td style={cell({ textAlign: "center" })}>
                        <span
                          style={{
                            background: gBg,
                            color: gColor,
                            padding: "2px 6px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: "700",
                          }}
                        >
                          {pts !== null ? `${pts}/8` : "—"}
                        </span>
                      </td>
                    )}

                    <td style={cell({ width: "90px", padding: "5px 10px" })}>
                      <div
                        style={{
                          background: "#e2e8f0",
                          borderRadius: "999px",
                          height: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            height: "100%",
                            background: `linear-gradient(90deg,${gColor}99,${gColor})`,
                            borderRadius: "999px",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: "8px",
                          color: "#94a3b8",
                          marginTop: "2px",
                          textAlign: "center",
                        }}
                      >
                        {GRADE_LABELS[row.grade] || ""}
                      </div>
                    </td>

                    <td style={cell({ textAlign: "center" })}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: gColor,
                          color: "#fff",
                          fontSize: "8.5px",
                          fontWeight: "800",
                        }}
                      >
                        {row.grade || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "10px",
                  }}
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Analytics section ─────────────────────────────────────── */}
      {examRows.length > 0 && (
        <div
          style={{
            margin: "0 28px 12px",
            padding: "10px 12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderTop: "2px solid #c9a84c",
            borderRadius: "0 0 6px 6px",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              fontWeight: "800",
              color: "#94a3b8",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Performance Analytics
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${analyticsColCount}, 1fr)`,
              gap: "8px",
            }}
          >
            {/* Total percentage */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "900",
                  color: "#1a2744",
                }}
              >
                {Math.round(totalPercentage)}
              </div>
              <div
                style={{
                  fontSize: "8px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  marginTop: "2px",
                }}
              >
                Total % (max {maxPercentage})
              </div>
            </div>

            {/* Junior only: total points */}
            {!isPrimary && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "900",
                    color: "#1a2744",
                  }}
                >
                  {totalPoints} / {maxPoints}
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    marginTop: "2px",
                  }}
                >
                  Total Points
                </div>
              </div>
            )}

            {/* Strongest */}
            {strongestExam && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "6px",
                  padding: "8px 10px",
                }}
              >
                <div
                  style={{
                    fontSize: "8px",
                    color: "#15803d",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    fontWeight: "700",
                    marginBottom: "3px",
                  }}
                >
                  ↑ Strongest
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#15803d",
                    lineHeight: 1.3,
                  }}
                >
                  {formatSubjects(strongestExam.subjects)}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#15803d",
                    opacity: 0.8,
                    marginTop: "2px",
                  }}
                >
                  {parseFloat(strongestExam.percentage).toFixed(1)}% ·{" "}
                  {strongestExam.grade}
                </div>
              </div>
            )}

            {/* Weakest — only show when different from strongest */}
            {weakestExam && weakestExam.exam_id !== strongestExam?.exam_id && (
              <div
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "6px",
                  padding: "8px 10px",
                }}
              >
                <div
                  style={{
                    fontSize: "8px",
                    color: "#c2410c",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    fontWeight: "700",
                    marginBottom: "3px",
                  }}
                >
                  ↓ Needs focus
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#c2410c",
                    lineHeight: 1.3,
                  }}
                >
                  {formatSubjects(weakestExam.subjects)}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#c2410c",
                    opacity: 0.8,
                    marginTop: "2px",
                  }}
                >
                  {parseFloat(weakestExam.percentage).toFixed(1)}% ·{" "}
                  {weakestExam.grade}
                </div>
              </div>
            )}

            {/* Position */}
            {summary?.position && (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "900",
                    color: "#1e40af",
                  }}
                >
                  {positionSuffix(summary.position)}
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    marginTop: "2px",
                  }}
                >
                  Class position
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#1e40af",
                    marginTop: "1px",
                  }}
                >
                  of {summary.class_size}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Teacher comment ───────────────────────────────────────── */}
      {(summary?.teacher_comment || TEACHER_COMMENTS[meanGrade]) && (
        <div style={{ padding: "0 28px 10px" }}>
          <div
            style={{
              background: "linear-gradient(135deg,#f8fafc,#f0f4f8)",
              border: "1px solid #e2e8f0",
              borderLeft: "3px solid #c9a84c",
              borderRadius: "6px",
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: "8px",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "4px",
                fontWeight: "700",
              }}
            >
              Class Teacher's Comment
            </div>
            <p
              style={{
                fontSize: "10.5px",
                color: "#334155",
                lineHeight: "1.55",
                margin: 0,
              }}
            >
              {summary?.teacher_comment || TEACHER_COMMENTS[meanGrade]}
            </p>
            {cls?.teacher_name && (
              <p
                style={{
                  fontSize: "9px",
                  color: "#94a3b8",
                  margin: "6px 0 0",
                  textAlign: "right",
                  fontStyle: "italic",
                }}
              >
                — {cls.teacher_name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Signature + dates ─────────────────────────────────────── */}
      <div style={{ padding: "0 28px 12px" }}>
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px 16px",
            background: "#fafbfc",
          }}
        >
          {/* Closing / Opening dates — only rendered when provided */}
          {(closingDate || openingDate) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "12px",
                paddingBottom: "10px",
                borderBottom: "1px dashed #e2e8f0",
              }}
            >
              {closingDate && (
                <div>
                  <div
                    style={{
                      fontSize: "8px",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.7px",
                      marginBottom: "2px",
                    }}
                  >
                    School Closing Date
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#1a2744",
                    }}
                  >
                    {closingDate}
                  </div>
                </div>
              )}
              {openingDate && (
                <div>
                  <div
                    style={{
                      fontSize: "8px",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.7px",
                      marginBottom: "2px",
                    }}
                  >
                    School Re-opening Date
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#1a2744",
                    }}
                  >
                    {openingDate}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Three signature slots */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
            }}
          >
            {[
              "Class Teacher's Signature & Date",
              "Head Teacher's Signature & Date",
              "Parent / Guardian Signature & Date",
            ].map((label) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "8px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  {label}
                </div>
                {/* Signature space */}
                <div
                  style={{
                    borderBottom: "1.5px solid #cbd5e1",
                    paddingBottom: "20px",
                    marginBottom: "4px",
                  }}
                />
                {/* Date line */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <span
                    style={{
                      fontSize: "7.5px",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Date:
                  </span>
                  <div style={{ flex: 1, borderBottom: "1px solid #e2e8f0" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer — in normal flow, no absolute positioning ─────── */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a2744,#0f1a30)",
          padding: "8px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto",
        }}
      >
        <span style={{ color: "#64748b", fontSize: "8.5px" }}>
          {schoolName} · Official Academic Report
        </span>
        <span
          style={{ color: "#c9a84c", fontSize: "8.5px", fontWeight: "700" }}
        >
          CONFIDENTIAL
        </span>
      </div>
    </div>
  );
});

export default ReportCardDocument;
