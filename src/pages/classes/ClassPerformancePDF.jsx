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
   HELPERS
================================================================ */

const getDivision = (grade) => {
  const g = Number(grade);

  if (g >= 4 && g <= 6) return "Primary";
  if (g >= 7 && g <= 8) return "Junior School";

  return "Other";
};

/**
 * Get the percentage for a subject from a learner's exam results.
 *
 * If a subject appears in more than one exam, the percentages are
 * averaged for that subject.
 */
const getSubjectPercentage = (examResults = [], subjectName) => {
  const matching = examResults.filter((exam) =>
    (exam.subjects || []).some(
      (subject) => subject.subject_name === subjectName,
    ),
  );

  if (!matching.length) return null;

  const percentages = matching
    .map((exam) => Number(exam.percentage))
    .filter(Number.isFinite);

  if (!percentages.length) return null;

  const average =
    percentages.reduce((sum, value) => sum + value, 0) / percentages.length;

  return Number(average.toFixed(1));
};

/**
 * Safely get a learner's subject grade.
 *
 * The current results structure is exam-level, so the grade comes
 * from the matching exam where available.
 */
const getSubjectGrade = (examResults = [], subjectName) => {
  const matching = examResults.filter((exam) =>
    (exam.subjects || []).some(
      (subject) => subject.subject_name === subjectName,
    ),
  );

  if (!matching.length) return null;

  const grades = matching
    .map((exam) => exam.grade)
    .filter(Boolean);

  return grades.length ? grades[0] : null;
};

/**
 * TOTAL = SUM OF SUBJECT PERCENTAGES.
 *
 * Example:
 *
 * Mathematics       80
 * Kiswahili         90
 * English           80
 * Integrated Sci.   50
 *
 * TOTAL = 300
 *
 * Maximum for 4 subjects = 400.
 *
 * IMPORTANT:
 * This is NOT an average and should NOT be displayed with a "%" sign.
 */
const getLearnerTotal = (student, subjects) => {
  const percentages = subjects
    .map((subject) =>
      getSubjectPercentage(
        student.exam_results,
        subject.subject_name,
      ),
    )
    .filter((percentage) => percentage !== null);

  if (!percentages.length) return null;

  return Number(
    percentages
      .reduce((sum, percentage) => sum + percentage, 0)
      .toFixed(1),
  );
};

/**
 * Competition ranking.
 *
 * Example:
 *
 * 400 → 1
 * 350 → 2
 * 350 → 2
 * 300 → 4
 */
const calculateCompetitionRanking = (
  items,
  scoreKey,
  positionKey,
  fallbackSort = "",
) => {
  const sorted = [...items].sort((a, b) => {
    const scoreA = Number(a[scoreKey]);
    const scoreB = Number(b[scoreKey]);

    const safeA = Number.isFinite(scoreA) ? scoreA : -1;
    const safeB = Number.isFinite(scoreB) ? scoreB : -1;

    if (safeB !== safeA) {
      return safeB - safeA;
    }

    return fallbackSort
      ? String(a[fallbackSort] || "").localeCompare(
          String(b[fallbackSort] || ""),
        )
      : 0;
  });

  let previousScore = null;
  let position = 0;

  return sorted.map((item, index) => {
    const score = item[scoreKey];

    if (score !== previousScore) {
      position = index + 1;
      previousScore = score;
    }

    return {
      ...item,
      [positionKey]: position,
    };
  });
};

const positionStyle = (position) => {
  if (position === 1) {
    return {
      color: "#b45309",
      fontWeight: "800",
    };
  }

  if (position === 2) {
    return {
      color: "#64748b",
      fontWeight: "700",
    };
  }

  if (position === 3) {
    return {
      color: "#c2410c",
      fontWeight: "700",
    };
  }

  return {
    color: "#374151",
    fontWeight: "600",
  };
};

/**
 * Resolve teacher name from the different teacher fields that
 * may be returned by the backend.
 */
const getTeacherName = (subject) => {
  if (subject.teacher_name) {
    return subject.teacher_name;
  }

  if (subject.teacher_first_name || subject.teacher_last_name) {
    return [
      subject.teacher_first_name,
      subject.teacher_last_name,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (subject.teacher) {
    return subject.teacher;
  }

  return "—";
};

/**
 * Build subject analysis from backend subject summaries.
 *
 * Ranking is based on subject mean/average.
 */
const buildSubjectAnalysis = (subjectSummaries = []) => {
  const subjects = subjectSummaries.map((subject) => ({
    ...subject,
    _average: Number(
      subject.average ??
        subject.mean ??
        subject.mean_score ??
        subject.avg_percentage ??
        0,
    ),
    _highest: Number(
      subject.highest ??
        subject.highest_percentage ??
        0,
    ),
    _lowest: Number(
      subject.lowest ??
        subject.lowest_percentage ??
        0,
    ),
    _studentsSat: Number(
      subject.students_sat ??
        subject.student_count ??
        subject.students_count ??
        0,
    ),
  }));

  return calculateCompetitionRanking(
    subjects,
    "_average",
    "_rank",
    "subject_name",
  );
};

const getSubjectColumnWidth = (subjectCount) => {
  if (subjectCount <= 6) return 70;
  if (subjectCount <= 8) return 64;
  if (subjectCount <= 10) return 58;
  return 52;
};

const getNameColumnWidth = (subjectCount) => {
  if (subjectCount <= 6) return 190;
  if (subjectCount <= 8) return 175;
  if (subjectCount <= 10) return 160;
  return 145;
};

const getFontScale = (subjectCount) => {
  if (subjectCount <= 6) return 1;
  if (subjectCount <= 8) return 0.96;
  if (subjectCount <= 10) return 0.92;
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
    subjectSummaries: rawSubjectSummaries = [],
  } = data;

  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const division = getDivision(cls.grade);

  /* ================================================================
     SUBJECT LIST
  ================================================================= */

  const subjects = rawSubjectSummaries.map((subject) => ({
    ...subject,
    subject_name: subject.subject_name,
    subject_code: subject.subject_code,
  }));

  /*
   * Fallback:
   * If subjectSummaries is missing, derive subjects from learner
   * exam results.
   */
  if (!subjects.length) {
    const subjectMap = new Map();

    rawStudents.forEach((student) => {
      (student.exam_results || []).forEach((exam) => {
        (exam.subjects || []).forEach((subject) => {
          if (!subjectMap.has(subject.subject_name)) {
            subjectMap.set(subject.subject_name, {
              subject_name: subject.subject_name,
              subject_code: subject.subject_code,
            });
          }
        });
      });
    });

    subjects.push(...subjectMap.values());
  }

  /* ================================================================
     LEARNER TOTALS + RANKING
  ================================================================= */

  const studentsWithScores = rawStudents.map((student) => ({
    ...student,

    /*
     * This is the actual total shown in the PDF.
     *
     * Example:
     * 80 + 90 + 80 + 50 = 300
     */
    _pdfTotal: getLearnerTotal(student, subjects),
  }));

  const students = calculateCompetitionRanking(
    studentsWithScores,
    "_pdfTotal",
    "_pdfPosition",
    "first_name",
  );

  /* ================================================================
     SUBJECT ANALYSIS
  ================================================================= */

  const subjectAnalysis = buildSubjectAnalysis(
    rawSubjectSummaries,
  );

  const bestSubject =
    subjectAnalysis.length > 0 ? subjectAnalysis[0] : null;

  const subjectCount = subjects.length;

  /*
   * Example:
   * 4 subjects × 100 = 400 maximum total.
   */
  const totalPossible = subjectCount * 100;

  const subjectWidth = getSubjectColumnWidth(subjectCount);
  const nameWidth = getNameColumnWidth(subjectCount);
  const scale = getFontScale(subjectCount);

  /*
   * A4 landscape approximately at 96 DPI.
   */
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
      {/* ============================================================
          HEADER
      ============================================================ */}

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
                style={{
                  color: "#cbd5e1",
                  fontSize: "8px",
                  marginTop: "2px",
                }}
              >
                {schoolAddress}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
            flexShrink: 0,
            marginLeft: "20px",
          }}
        >
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

          <div
            style={{
              color: "#cbd5e1",
              fontSize: "8px",
              marginTop: "2px",
            }}
          >
            {generatedOn}
          </div>
        </div>
      </div>

      <div
        style={{
          height: "3px",
          background: COLORS.gold,
        }}
      />

      {/* ============================================================
          CLASS INFORMATION
      ============================================================ */}

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
          {
            label: "Class",
            value: cls.name || `Grade ${cls.grade}`,
          },
          {
            label: "Division",
            value: division,
          },
          {
            label: "Students",
            value: students.length,
          },
          {
            label: "Class Teacher",
            value: cls.class_teacher_name || "—",
          },
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

      {/* ============================================================
          MAIN PERFORMANCE TABLE
      ============================================================ */}

      <div
        style={{
          padding: "14px 32px 8px",
          boxSizing: "border-box",
        }}
      >
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

          <div
            style={{
              fontSize: "7.5px",
              color: COLORS.lightMuted,
            }}
          >
            Total = sum of subject percentages · Maximum {totalPossible}
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

            {subjects.map((subject) => (
              <col
                key={subject.subject_name}
                style={{
                  width: `${subjectWidth}px`,
                }}
              />
            ))}

            <col style={{ width: "78px" }} />
            <col style={{ width: "62px" }} />
          </colgroup>

          <thead>
            <tr
              style={{
                background: COLORS.navy,
              }}
            >
              <th
                style={{
                  ...headerCellStyle,
                  textAlign: "center",
                }}
              >
                Pos.
              </th>

              <th
                style={{
                  ...headerCellStyle,
                  textAlign: "left",
                }}
              >
                Learner
              </th>

              <th
                style={{
                  ...headerCellStyle,
                  textAlign: "left",
                }}
              >
                Adm. No.
              </th>

              {subjects.map((subject) => (
                <th
                  key={subject.subject_name}
                  style={{
                    ...headerCellStyle,
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={subject.subject_name}
                >
                  {subject.subject_code ||
                    subject.subject_name
                      .split(/\s+/)
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 6)}
                </th>
              ))}

              <th
                style={{
                  ...headerCellStyle,
                  textAlign: "center",
                }}
              >
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

              <th
                style={{
                  ...headerCellStyle,
                  textAlign: "center",
                }}
              >
                Grade
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => {
              const total = student._pdfTotal;

              const learnerGrade =
                student.mean_grade ||
                student.grade ||
                null;

              return (
                <tr
                  key={student.student_id}
                  style={{
                    background:
                      index % 2 === 0
                        ? COLORS.white
                        : COLORS.rowAlt,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {/* Position */}

                  <td
                    style={{
                      ...bodyCellStyle,
                      ...positionStyle(
                        student._pdfPosition,
                      ),
                      textAlign: "center",
                      fontSize: "11px",
                    }}
                  >
                    {student._pdfPosition}
                  </td>

                  {/* Learner */}

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
                    {student.first_name}{" "}
                    {student.last_name}
                  </td>

                  {/* Admission number */}

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

                  {/* Subject percentages */}

                  {subjects.map((subject) => {
                    const percentage =
                      getSubjectPercentage(
                        student.exam_results,
                        subject.subject_name,
                      );

                    const subjectGrade =
                      getSubjectGrade(
                        student.exam_results,
                        subject.subject_name,
                      );

                    const gradeColor =
                      GRADE_COLORS[subjectGrade] ||
                      COLORS.navy;

                    return (
                      <td
                        key={subject.subject_name}
                        style={{
                          ...bodyCellStyle,
                          textAlign: "center",
                          color:
                            percentage !== null
                              ? gradeColor
                              : "#cbd5e1",
                          fontWeight:
                            percentage !== null
                              ? "700"
                              : "400",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {percentage !== null
                          ? `${percentage.toFixed(1)}%`
                          : "—"}
                      </td>
                    );
                  })}

                  {/* TOTAL */}

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
                    {total !== null &&
                    total !== undefined
                      ? Number(total).toFixed(1)
                      : "—"}
                  </td>

                  {/* Grade */}

                  <td
                    style={{
                      ...bodyCellStyle,
                      textAlign: "center",
                    }}
                  >
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
                            GRADE_COLORS[
                              learnerGrade
                            ] || COLORS.muted,
                          color: COLORS.white,
                          fontSize: "9px",
                          fontWeight: "700",
                        }}
                      >
                        {learnerGrade}
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#cbd5e1",
                          fontSize: "10px",
                        }}
                      >
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

      {/* ============================================================
          CLASS SUMMARY
      ============================================================ */}

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
        <div
          style={{
            fontSize: "8px",
            color: COLORS.muted,
          }}
        >
          <strong
            style={{
              color: COLORS.navy,
            }}
          >
            {students.length}
          </strong>{" "}
          learners assessed
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "7px",
                color: COLORS.lightMuted,
                textTransform: "uppercase",
                marginRight: "5px",
              }}
            >
              Subjects
            </span>

            <strong
              style={{
                fontSize: "9px",
                color: COLORS.navy,
              }}
            >
              {subjects.length}
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

            <strong
              style={{
                fontSize: "9px",
                color: COLORS.navy,
              }}
            >
              {students.length &&
              students[0]._pdfTotal != null
                ? `${Number(
                    students[0]._pdfTotal,
                  ).toFixed(1)} / ${totalPossible}`
                : "—"}
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

            <strong
              style={{
                fontSize: "9px",
                color: COLORS.navy,
              }}
            >
              {students.length
                ? students[0]._pdfPosition
                : "—"}
            </strong>
          </div>
        </div>
      </div>

      {/* ============================================================
          SUBJECT ANALYSIS
      ============================================================ */}

      {subjectAnalysis.length > 0 && (
        <div
          style={{
            padding: "0 32px 12px",
            boxSizing: "border-box",
          }}
        >
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
              Subject Performance Analysis
            </div>

            {bestSubject && (
              <div
                style={{
                  fontSize: "7.5px",
                  color: COLORS.muted,
                }}
              >
                Best performing subject:{" "}
                <strong
                  style={{
                    color: COLORS.navy,
                  }}
                >
                  {bestSubject.subject_name}
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
              <col style={{ width: "240px" }} />
              <col style={{ width: "210px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "90px" }} />
              <col style={{ width: "100px" }} />
            </colgroup>

            <thead>
              <tr
                style={{
                  background: COLORS.navyLight,
                }}
              >
                <th
                  style={{
                    ...analysisHeaderCellStyle,
                    textAlign: "center",
                  }}
                >
                  Rank
                </th>

                <th
                  style={{
                    ...analysisHeaderCellStyle,
                    textAlign: "left",
                  }}
                >
                  Subject
                </th>

                <th
                  style={{
                    ...analysisHeaderCellStyle,
                    textAlign: "left",
                  }}
                >
                  Teacher
                </th>

                <th
                  style={{
                    ...analysisHeaderCellStyle,
                    textAlign: "center",
                  }}
                >
                  Mean %
                </th>

                <th
                  style={{
                    ...analysisHeaderCellStyle,
                    textAlign: "center",
                  }}
                >
                  Highest
                </th>

                <th
                  style={{
                    ...analysisHeaderCellStyle,
                    textAlign: "center",
                  }}
                >
                  Lowest
                </th>

                <th
                  style={{
                    ...analysisHeaderCellStyle,
                    textAlign: "center",
                  }}
                >
                  Learners
                </th>
              </tr>
            </thead>

            <tbody>
              {subjectAnalysis.map(
                (subject, index) => {
                  const rank = subject._rank;

                  return (
                    <tr
                      key={
                        subject.subject_id ||
                        subject.subject_code ||
                        subject.subject_name
                      }
                      style={{
                        background:
                          index % 2 === 0
                            ? COLORS.white
                            : COLORS.rowAlt,
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {/* Subject rank */}

                      <td
                        style={{
                          ...analysisBodyCellStyle,
                          ...positionStyle(rank),
                          textAlign: "center",
                          fontSize: "10px",
                        }}
                      >
                        {rank}
                      </td>

                      {/* Subject */}

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
                        {subject.subject_name}

                        {subject.subject_code && (
                          <span
                            style={{
                              marginLeft: "7px",
                              color: COLORS.lightMuted,
                              fontSize: "7px",
                              fontWeight: "500",
                            }}
                          >
                            {subject.subject_code}
                          </span>
                        )}
                      </td>

                      {/* Teacher */}

                      <td
                        style={{
                          ...analysisBodyCellStyle,
                          textAlign: "left",
                          color: COLORS.muted,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {getTeacherName(subject)}
                      </td>

                      {/* Mean */}

                      <td
                        style={{
                          ...analysisBodyCellStyle,
                          textAlign: "center",
                          fontWeight: "800",
                          color: COLORS.navy,
                        }}
                      >
                        {Number.isFinite(
                          subject._average,
                        )
                          ? `${subject._average.toFixed(
                              1,
                            )}%`
                          : "—"}
                      </td>

                      {/* Highest */}

                      <td
                        style={{
                          ...analysisBodyCellStyle,
                          textAlign: "center",
                          color: COLORS.success,
                          fontWeight: "700",
                        }}
                      >
                        {Number.isFinite(
                          subject._highest,
                        )
                          ? `${subject._highest.toFixed(
                              1,
                            )}%`
                          : "—"}
                      </td>

                      {/* Lowest */}

                      <td
                        style={{
                          ...analysisBodyCellStyle,
                          textAlign: "center",
                          color: COLORS.muted,
                          fontWeight: "600",
                        }}
                      >
                        {Number.isFinite(
                          subject._lowest,
                        )
                          ? `${subject._lowest.toFixed(
                              1,
                            )}%`
                          : "—"}
                      </td>

                      {/* Learners */}

                      <td
                        style={{
                          ...analysisBodyCellStyle,
                          textAlign: "center",
                          color: COLORS.muted,
                          fontWeight: "600",
                        }}
                      >
                        {subject._studentsSat || "—"}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================
          FOOTER
      ============================================================ */}

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
        <span
          style={{
            color: "#cbd5e1",
            fontSize: "7px",
          }}
        >
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
   TABLE STYLES
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