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

// Points per CBC grade — used for junior school points column
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

const COLORS = {
  navy: "#17233c",
  navyLight: "#243452",
  gold: "#c9a84c",
  goldLight: "#e8cc85",
  text: "#1f2937",
  muted: "#64748b",
  lightMuted: "#94a3b8",
  border: "#e2e8f0",
  rowAlt: "#f8fafc",
  white: "#ffffff",
  success: "#15803d",
};

/* ================================================================
   HELPERS  (unchanged unless noted)
================================================================ */

const getDivision = (grade) => {
  const g = Number(grade);
  if (g >= 4 && g <= 6) return "Primary";
  if (g >= 7 && g <= 8) return "Junior School";
  return "Other";
};

// ── FIX 2 + 5: columns are now EXAMS, not subjects ──────────────────────────
// Get the percentage for a specific exam by exam_id
const getExamPercentage = (examResults = [], examId) => {
  const match = examResults.find((e) => e.exam_id === examId);
  if (!match) return null;
  const pct = Number(match.percentage);
  return Number.isFinite(pct) ? pct : null;
};

const getExamGrade = (examResults = [], examId) => {
  const match = examResults.find((e) => e.exam_id === examId);
  return match?.grade ?? null;
};

const getLearnerTotal = (student, exams) => {
  const percentages = exams
    .map((exam) => getExamPercentage(student.exam_results, exam.exam_id))
    .filter((p) => p !== null);
  if (!percentages.length) return null;
  // FIX 1: round to nearest integer (no decimals)
  return Math.round(percentages.reduce((s, p) => s + p, 0));
};

// Competition ranking (unchanged)
const calculateCompetitionRanking = (
  items,
  scoreKey,
  positionKey,
  fallbackSort = "",
) => {
  const sorted = [...items].sort((a, b) => {
    const sa = Number.isFinite(Number(a[scoreKey])) ? Number(a[scoreKey]) : -1;
    const sb = Number.isFinite(Number(b[scoreKey])) ? Number(b[scoreKey]) : -1;
    if (sb !== sa) return sb - sa;
    return fallbackSort
      ? String(a[fallbackSort] || "").localeCompare(
          String(b[fallbackSort] || ""),
        )
      : 0;
  });
  let prev = null,
    pos = 0;
  return sorted.map((item, i) => {
    const score = item[scoreKey];
    if (score !== prev) {
      pos = i + 1;
      prev = score;
    }
    return { ...item, [positionKey]: pos };
  });
};

const positionStyle = (position) => {
  if (position === 1) return { color: "#b45309", fontWeight: "800" };
  if (position === 2) return { color: "#64748b", fontWeight: "700" };
  if (position === 3) return { color: "#c2410c", fontWeight: "700" };
  return { color: "#374151", fontWeight: "600" };
};

// ── FIX 5: build exam analysis (replaces buildSubjectAnalysis) ───────────────
// Derives per-exam stats from the students' exam_results arrays
const buildExamAnalysis = (students = [], allExams = []) => {
  const analysis = allExams.map((exam) => {
    const percentages = students
      .map((s) => getExamPercentage(s.exam_results, exam.exam_id))
      .filter((p) => p !== null);

    if (!percentages.length) {
      return {
        ...exam,
        _average: 0,
        _highest: 0,
        _lowest: 0,
        _studentsSat: 0,
      };
    }

    const sum = percentages.reduce((s, p) => s + p, 0);
    return {
      ...exam,
      // FIX 1: two decimal places for exam analysis (requirement 5 says "nearest two decimal places")
      _average: parseFloat((sum / percentages.length).toFixed(2)),
      _highest: parseFloat(Math.max(...percentages).toFixed(2)),
      _lowest: parseFloat(Math.min(...percentages).toFixed(2)),
      _studentsSat: percentages.length,
    };
  });

  return calculateCompetitionRanking(
    analysis,
    "_average",
    "_rank",
    "exam_title",
  );
};

const getSubjectColumnWidth = (count) => {
  if (count <= 6) return 70;
  if (count <= 8) return 64;
  if (count <= 10) return 58;
  return 52;
};

const getNameColumnWidth = (count) => {
  if (count <= 6) return 190;
  if (count <= 8) return 175;
  if (count <= 10) return 160;
  return 145;
};

const getFontScale = (count) => {
  if (count <= 6) return 1;
  if (count <= 8) return 0.96;
  if (count <= 10) return 0.92;
  return 0.88;
};

/* ================================================================
   COMPONENT
================================================================ */

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

  const {
    class: cls = {},
    students: rawStudents = [],
  } = data;

  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const division = getDivision(cls.grade);
  const isPrimary = division === "Primary";

  // ── FIX 2: columns are EXAMS, built from students' exam_results ─────────────
  // Collect all unique exams that appear across all students
  const examMap = new Map();
  rawStudents.forEach((student) => {
    (student.exam_results || []).forEach((er) => {
      if (!examMap.has(er.exam_id)) {
        examMap.set(er.exam_id, {
          exam_id: er.exam_id,
          exam_title: er.exam_title,
          exam_type: er.exam_type,
        });
      }
    });
  });
  // Sort by exam_id so order is consistent
  const allExams = [...examMap.values()].sort((a, b) => a.exam_id - b.exam_id);

  // ── FIX 4: points column only for junior — determine upfront ────────────────
  const showPoints = !isPrimary;

  // ── Learner totals + ranking ────────────────────────────────────────────────
  const studentsWithScores = rawStudents.map((student) => ({
    ...student,
    _pdfTotal: getLearnerTotal(student, allExams),
    // FIX 4: compute total points for junior school
    _totalPoints: showPoints
      ? (student.exam_results || []).reduce(
          (sum, er) => sum + (GRADE_POINTS[er.grade] ?? 0),
          0,
        )
      : null,
  }));

  const students = calculateCompetitionRanking(
    studentsWithScores,
    "_pdfTotal",
    "_pdfPosition",
    "first_name",
  );

  // ── FIX 5: exam analysis replaces subject analysis ──────────────────────────
  const examAnalysis = buildExamAnalysis(rawStudents, allExams);

  // Class total mean score = sum of each exam's mean score
  const classTotalMean = examAnalysis.length
    ? parseFloat(
        examAnalysis.reduce((sum, e) => sum + e._average, 0).toFixed(2),
      )
    : null;

  const bestExam = examAnalysis.length ? examAnalysis[0] : null;

  const examCount = allExams.length;
  const scale = getFontScale(examCount);
  const subjectWidth = getSubjectColumnWidth(examCount);
  const nameWidth = getNameColumnWidth(examCount);

  // Total possible = number of exams × 100 (each exam is out of 100%)
  const totalPossible = examCount * 100;

  const PAGE_WIDTH = 1120;
  const headerFontSize = `${Math.round(18 * scale)}px`;
  const bodyFontSize = `${Math.round(10.5 * scale)}px`;

  return (
    <div
      ref={ref}
      style={{
        width: `${PAGE_WIDTH}px`,
        maxWidth: `${PAGE_WIDTH}px`,
        minHeight: "792px",
        backgroundColor: COLORS.white,
        color: COLORS.text,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: bodyFontSize,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* ── Header (unchanged) ─────────────────────────────────────── */}
      <div
        style={{
          background: COLORS.navy,
          padding: "18px 32px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: COLORS.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: COLORS.navy,
                fontWeight: "800",
                fontSize: "16px",
              }}
            >
              {schoolName.charAt(0)}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: COLORS.white,
                fontSize: headerFontSize,
                fontWeight: "700",
                lineHeight: 1.15,
              }}
            >
              {schoolName}
            </div>
            <div
              style={{
                color: COLORS.goldLight,
                fontSize: "8px",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              {schoolMotto}
            </div>
            {schoolAddress && (
              <div
                style={{ color: "#cbd5e1", fontSize: "8px", marginTop: "2px" }}
              >
                {schoolAddress}
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "20px" }}>
          <div
            style={{
              color: COLORS.goldLight,
              fontSize: "8px",
              fontWeight: "700",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Class Performance Report
          </div>
          <div
            style={{
              color: COLORS.white,
              fontSize: "13px",
              fontWeight: "700",
              marginTop: "3px",
            }}
          >
            {examType}
          </div>
          <div style={{ color: "#cbd5e1", fontSize: "8px", marginTop: "2px" }}>
            {generatedOn}
          </div>
        </div>
      </div>

      <div style={{ height: "3px", background: COLORS.gold }} />

      {/* ── Class info — FIX 6: use cls.class_teacher_name (now returned by backend) */}
      <div
        style={{
          background: "#f8fafc",
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "9px 32px",
          display: "flex",
          alignItems: "center",
          gap: "28px",
          boxSizing: "border-box",
        }}
      >
        {[
          { label: "Class", value: cls.name || `Grade ${cls.grade}` },
          { label: "Division", value: division },
          { label: "Students", value: students.length },
          { label: "Class Teacher", value: cls.class_teacher_name || "—" },
        ].map((item) => (
          <div key={item.label}>
            <div
              style={{
                fontSize: "7px",
                color: COLORS.lightMuted,
                textTransform: "uppercase",
                letterSpacing: "0.7px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "600",
                color: COLORS.navy,
                marginTop: "2px",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main performance table ─────────────────────────────────── */}
      <div style={{ padding: "14px 32px 8px", boxSizing: "border-box" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "7px",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              fontWeight: "700",
              color: COLORS.muted,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Learner Performance
          </div>
          <div style={{ fontSize: "7.5px", color: COLORS.lightMuted }}>
            Total = sum of exam percentages · Maximum {totalPossible}
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <colgroup>
            <col style={{ width: "55px" }} />
            <col style={{ width: `${nameWidth}px` }} />
            <col style={{ width: "75px" }} />
            {allExams.map((exam) => (
              <col key={exam.exam_id} style={{ width: `${subjectWidth}px` }} />
            ))}
            {/* FIX 4: extra col for Points if junior school */}
            {showPoints && <col style={{ width: "55px" }} />}
            <col style={{ width: "78px" }} />
            {/* FIX 4: Grade col */}
            <col style={{ width: "62px" }} />
          </colgroup>

          <thead>
            <tr style={{ background: COLORS.navy }}>
              <th style={{ ...headerCellStyle, textAlign: "center" }}>Pos.</th>
              <th style={{ ...headerCellStyle, textAlign: "left" }}>Learner</th>
              <th style={{ ...headerCellStyle, textAlign: "left" }}>
                Adm. No.
              </th>

              {/* FIX 2: column header = full exam title */}
              {allExams.map((exam) => (
                <th
                  key={exam.exam_id}
                  style={{
                    ...headerCellStyle,
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={exam.exam_title}
                >
                  {exam.exam_title}
                </th>
              ))}

              {/* FIX 4: Points column for junior only */}
              {showPoints && (
                <th style={{ ...headerCellStyle, textAlign: "center" }}>Pts</th>
              )}

              <th style={{ ...headerCellStyle, textAlign: "center" }}>
                <div>Total</div>
                <div
                  style={{
                    fontSize: "6.5px",
                    opacity: 0.75,
                    marginTop: "1px",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  / {totalPossible}
                </div>
              </th>

              {/* FIX 4: Grade column */}
              <th style={{ ...headerCellStyle, textAlign: "center" }}>Grade</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => {
              const total = student._pdfTotal;
              // FIX 4: mean_grade comes from the API
              const learnerGrade = student.mean_grade || null;

              return (
                <tr
                  key={student.student_id}
                  style={{
                    background: index % 2 === 0 ? COLORS.white : COLORS.rowAlt,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <td
                    style={{
                      ...bodyCellStyle,
                      ...positionStyle(student._pdfPosition),
                      textAlign: "center",
                      fontSize: "11px",
                    }}
                  >
                    {student._pdfPosition}
                  </td>
                  <td
                    style={{
                      ...bodyCellStyle,
                      color: "#0f172a",
                      fontWeight: "600",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {student.first_name} {student.last_name}
                  </td>
                  <td
                    style={{
                      ...bodyCellStyle,
                      color: COLORS.muted,
                      textAlign: "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {student.student_number || "—"}
                  </td>

                  {/* FIX 2 + 3: per-exam percentage, no % symbol, FIX 1: rounded */}
                  {allExams.map((exam) => {
                    const pct = getExamPercentage(
                      student.exam_results,
                      exam.exam_id,
                    );
                    const grade = getExamGrade(
                      student.exam_results,
                      exam.exam_id,
                    );
                    const color = grade
                      ? GRADE_COLORS[grade] || COLORS.navy
                      : "#cbd5e1";

                    return (
                      <td
                        key={exam.exam_id}
                        style={{
                          ...bodyCellStyle,
                          textAlign: "center",
                          color,
                          fontWeight: pct !== null ? "700" : "400",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {/* FIX 1: no decimals; FIX 3: no % symbol */}
                        {pct !== null ? Math.round(pct) : "—"}
                      </td>
                    );
                  })}

                  {/* FIX 4: Points for junior school */}
                  {showPoints && (
                    <td
                      style={{
                        ...bodyCellStyle,
                        textAlign: "center",
                        fontWeight: "700",
                        color: COLORS.navy,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {student._totalPoints != null
                        ? student._totalPoints
                        : "—"}
                    </td>
                  )}

                  {/* FIX 1: Total — no decimals */}
                  <td
                    style={{
                      ...bodyCellStyle,
                      textAlign: "center",
                      color: COLORS.navy,
                      fontWeight: "800",
                      fontSize: "11px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {total != null ? Math.round(total) : "—"}
                  </td>

                  {/* FIX 4: Grade circle */}
                  <td style={{ ...bodyCellStyle, textAlign: "center" }}>
                    {learnerGrade ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "28px",
                          height: "22px",
                          padding: "0 5px",
                          borderRadius: "4px",
                          background:
                            GRADE_COLORS[learnerGrade] || COLORS.muted,
                          color: COLORS.white,
                          fontSize: "9px",
                          fontWeight: "700",
                        }}
                      >
                        {learnerGrade}
                      </span>
                    ) : (
                      <span style={{ color: "#cbd5e1", fontSize: "10px" }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Class summary (unchanged structure, FIX 1: no decimals) ── */}
      <div
        style={{
          margin: "2px 32px 12px",
          padding: "8px 12px",
          background: "#f8fafc",
          border: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: "8px", color: COLORS.muted }}>
          <strong style={{ color: COLORS.navy }}>{students.length}</strong>{" "}
          learners assessed
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div>
            <span
              style={{
                fontSize: "7px",
                color: COLORS.lightMuted,
                textTransform: "uppercase",
                marginRight: "5px",
              }}
            >
              Exams
            </span>
            <strong style={{ fontSize: "9px", color: COLORS.navy }}>
              {allExams.length}
            </strong>
          </div>
          <div>
            <span
              style={{
                fontSize: "7px",
                color: COLORS.lightMuted,
                textTransform: "uppercase",
                marginRight: "5px",
              }}
            >
              Top Total
            </span>
            <strong style={{ fontSize: "9px", color: COLORS.navy }}>
              {students.length && students[0]._pdfTotal != null
                ? `${Math.round(students[0]._pdfTotal)} / ${totalPossible}`
                : "—"}
            </strong>
          </div>
          {/* FIX 5: class total mean score */}
          <div>
            <span
              style={{
                fontSize: "7px",
                color: COLORS.lightMuted,
                textTransform: "uppercase",
                marginRight: "5px",
              }}
            >
              Class Mean
            </span>
            <strong style={{ fontSize: "9px", color: COLORS.navy }}>
              {classTotalMean != null ? classTotalMean : "—"}
            </strong>
          </div>
          <div>
            <span
              style={{
                fontSize: "7px",
                color: COLORS.lightMuted,
                textTransform: "uppercase",
                marginRight: "5px",
              }}
            >
              Top Position
            </span>
            <strong style={{ fontSize: "9px", color: COLORS.navy }}>
              {students.length ? students[0]._pdfPosition : "—"}
            </strong>
          </div>
        </div>
      </div>

      {/* ── FIX 5: Exam analysis (replaces subject analysis) ──────── */}
      {examAnalysis.length > 0 && (
        <div style={{ padding: "0 32px 12px", boxSizing: "border-box" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "7px",
            }}
          >
            <div
              style={{
                fontSize: "8px",
                fontWeight: "700",
                color: COLORS.muted,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Exam Performance Analysis
            </div>
            {bestExam && (
              <div style={{ fontSize: "7.5px", color: COLORS.muted }}>
                Best performing exam:{" "}
                <strong style={{ color: COLORS.navy }}>
                  {bestExam.exam_title}
                </strong>
              </div>
            )}
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <colgroup>
              <col style={{ width: "55px" }} />
              <col style={{ width: "320px" }} /> {/* wider for exam title */}
              <col style={{ width: "100px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "100px" }} />
            </colgroup>

            <thead>
              <tr style={{ background: COLORS.navyLight }}>
                <th style={{ ...analysisHeaderCellStyle, textAlign: "center" }}>
                  Rank
                </th>
                <th style={{ ...analysisHeaderCellStyle, textAlign: "left" }}>
                  Exam
                </th>
                <th style={{ ...analysisHeaderCellStyle, textAlign: "left" }}>
                  Type
                </th>
                <th style={{ ...analysisHeaderCellStyle, textAlign: "center" }}>
                  Mean %
                </th>
                <th style={{ ...analysisHeaderCellStyle, textAlign: "center" }}>
                  Highest
                </th>
                <th style={{ ...analysisHeaderCellStyle, textAlign: "center" }}>
                  Lowest
                </th>
                <th style={{ ...analysisHeaderCellStyle, textAlign: "center" }}>
                  Learners
                </th>
              </tr>
            </thead>

            <tbody>
              {examAnalysis.map((exam, index) => (
                <tr
                  key={exam.exam_id}
                  style={{
                    background: index % 2 === 0 ? COLORS.white : COLORS.rowAlt,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <td
                    style={{
                      ...analysisBodyCellStyle,
                      ...positionStyle(exam._rank),
                      textAlign: "center",
                      fontSize: "10px",
                    }}
                  >
                    {exam._rank}
                  </td>
                  <td
                    style={{
                      ...analysisBodyCellStyle,
                      textAlign: "left",
                      fontWeight: "700",
                      color: COLORS.navy,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {exam.exam_title}
                  </td>
                  <td
                    style={{
                      ...analysisBodyCellStyle,
                      textAlign: "left",
                      color: COLORS.muted,
                    }}
                  >
                    {exam.exam_type || "—"}
                  </td>
                  {/* FIX 5: two decimal places on exam analysis */}
                  <td
                    style={{
                      ...analysisBodyCellStyle,
                      textAlign: "center",
                      fontWeight: "800",
                      color: COLORS.navy,
                    }}
                  >
                    {Number.isFinite(exam._average)
                      ? exam._average.toFixed(2)
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...analysisBodyCellStyle,
                      textAlign: "center",
                      color: COLORS.success,
                      fontWeight: "700",
                    }}
                  >
                    {Number.isFinite(exam._highest)
                      ? exam._highest.toFixed(2)
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...analysisBodyCellStyle,
                      textAlign: "center",
                      color: COLORS.muted,
                      fontWeight: "600",
                    }}
                  >
                    {Number.isFinite(exam._lowest)
                      ? exam._lowest.toFixed(2)
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...analysisBodyCellStyle,
                      textAlign: "center",
                      color: COLORS.muted,
                      fontWeight: "600",
                    }}
                  >
                    {exam._studentsSat || "—"}
                  </td>
                </tr>
              ))}

              {/* FIX 5: class total mean score row at the bottom */}
              <tr
                style={{
                  background: "#f0f4f8",
                  borderTop: `2px solid ${COLORS.gold}`,
                }}
              >
                <td style={{ ...analysisBodyCellStyle, textAlign: "center" }} />
                <td
                  style={{
                    ...analysisBodyCellStyle,
                    textAlign: "left",
                    fontWeight: "800",
                    color: COLORS.navy,
                  }}
                  colSpan={2}
                >
                  Class Total Mean Score
                </td>
                <td
                  style={{
                    ...analysisBodyCellStyle,
                    textAlign: "center",
                    fontWeight: "800",
                    color: COLORS.gold,
                    fontSize: "11px",
                  }}
                >
                  {classTotalMean != null ? classTotalMean : "—"}
                </td>
                <td colSpan={3} />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer (unchanged) ────────────────────────────────────── */}
      <div
        style={{
          background: COLORS.navy,
          padding: "7px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <span style={{ color: "#cbd5e1", fontSize: "7px" }}>
          {schoolName} · Class Performance Report
        </span>
        <span
          style={{
            color: COLORS.goldLight,
            fontSize: "7px",
            fontWeight: "600",
          }}
        >
          {generatedOn} · Exam Management System
        </span>
      </div>
    </div>
  );
});

/* ================================================================
   TABLE STYLES  (unchanged)
================================================================ */

const headerCellStyle = {
  padding: "7px 5px",
  color: COLORS.goldLight,
  fontSize: "7.5px",
  fontWeight: "700",
  letterSpacing: "0.35px",
  textTransform: "uppercase",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  borderBottom: `2px solid ${COLORS.gold}`,
  boxSizing: "border-box",
};

const bodyCellStyle = {
  padding: "7px 5px",
  fontSize: "9.5px",
  lineHeight: "1.2",
  boxSizing: "border-box",
};

const analysisHeaderCellStyle = {
  padding: "6px 6px",
  color: COLORS.goldLight,
  fontSize: "7px",
  fontWeight: "700",
  letterSpacing: "0.3px",
  textTransform: "uppercase",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  borderBottom: `1px solid ${COLORS.gold}`,
  boxSizing: "border-box",
};

const analysisBodyCellStyle = {
  padding: "6px 6px",
  fontSize: "8.5px",
  lineHeight: "1.2",
  boxSizing: "border-box",
};

export default ClassPerformancePDF;
