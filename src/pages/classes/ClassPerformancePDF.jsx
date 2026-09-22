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

const getDivision = (grade) => {
  const value = Number(grade);

  if (value >= 4 && value <= 6) return "Primary";
  if (value >= 7 && value <= 8) return "Junior School";

  return "School";
};

const positionStyle = (position) => {
  switch (Number(position)) {
    case 1:
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
      };

    case 2:
      return {
        background: "#f1f5f9",
        color: "#475569",
        border: "1px solid #cbd5e1",
      };

    case 3:
      return {
        background: "#ffedd5",
        color: "#9a3412",
        border: "1px solid #fed7aa",
      };

    default:
      return {
        background: "#f8fafc",
        color: "#475569",
        border: "1px solid #e2e8f0",
      };
  }
};

const positionSuffix = (value) => {
  const n = Number(value);

  if (!Number.isFinite(n) || n < 1) return "—";

  const j = n % 10;
  const k = n % 100;

  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;

  return `${n}th`;
};

const getStudentName = (student) =>
  [student?.first_name, student?.last_name].filter(Boolean).join(" ") ||
  "Unnamed student";

const formatPercentage = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return `${number.toFixed(1)}%`;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return number.toLocaleString();
};

const getGradeColor = (grade) => {
  return GRADE_COLORS[grade] || "#64748b";
};

const getGradeBackground = (grade) => {
  if (!grade) return "#f1f5f9";

  const colors = {
    EE1: "#dcfce7",
    EE2: "#dcfce7",
    ME1: "#d1fae5",
    ME2: "#d1fae5",
    AE1: "#fef3c7",
    AE2: "#fef3c7",
    BE1: "#ffedd5",
    BE2: "#fee2e2",
  };

  return colors[grade] || "#f1f5f9";
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

  const {
    class: cls,
    students = [],
    division: apiDivision,
    meta = {},
  } = data;

  const division =
    apiDivision === "primary"
      ? "Primary"
      : apiDivision === "junior"
        ? "Junior School"
        : getDivision(cls?.grade);

  const isPrimary = apiDivision === "primary";

  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const academicYear =
    data.academic_year ||
    data.academicYear ||
    meta.academic_year ||
    "—";

  const termNumber =
    data.term_number ||
    data.termNumber ||
    meta.term_number ||
    "—";

  const classAverage =
    meta.class_avg_percentage ??
    meta.class_average ??
    null;

  const topStudent = meta.top_student;

  /*
   * The API result model is exam-level.
   *
   * Therefore the table intentionally does NOT create subject columns.
   * A learner's percentage represents:
   *
   *     total questions correct / total questions across included exams
   *
   * or the API's calculated avg_percentage.
   */

  const columns = isPrimary
    ? [
        { key: "position", label: "Position", width: 70 },
        { key: "student", label: "Learner", width: 230 },
        { key: "admission", label: "Adm. No.", width: 105 },
        { key: "percentage", label: "Average %", width: 105 },
        { key: "correct", label: "Correct", width: 90 },
        { key: "exams", label: "Exams", width: 75 },
        { key: "grade", label: "Grade", width: 85 },
      ]
    : [
        { key: "position", label: "Position", width: 70 },
        { key: "student", label: "Learner", width: 220 },
        { key: "admission", label: "Adm. No.", width: 100 },
        { key: "percentage", label: "Average %", width: 100 },
        { key: "correct", label: "Correct", width: 85 },
        { key: "exams", label: "Exams", width: 70 },
        { key: "points", label: "Points", width: 80 },
        { key: "grade", label: "Mean Grade", width: 90 },
      ];

  const tableWidth = columns.reduce(
    (total, column) => total + column.width,
    0,
  );

  const rootWidth = Math.max(tableWidth + 72, 900);

  return (
    <div
      ref={ref}
      style={{
        width: `${rootWidth}px`,
        backgroundColor: "#ffffff",
        color: "#1e293b",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "12px",
      }}
    >
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div
        style={{
          background: "#172554",
          padding: "24px 36px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#facc15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#172554",
                fontSize: "20px",
                fontWeight: "800",
              }}
            >
              {schoolName.charAt(0)}
            </span>
          </div>

          <div>
            <div
              style={{
                color: "#ffffff",
                fontSize: "21px",
                fontWeight: "700",
                letterSpacing: "0.2px",
              }}
            >
              {schoolName}
            </div>

            <div
              style={{
                color: "#facc15",
                fontSize: "9px",
                fontWeight: "600",
                letterSpacing: "1.8px",
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
                  fontSize: "9px",
                  marginTop: "4px",
                }}
              >
                {schoolAddress}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            CLASS PERFORMANCE
          </div>

          <div
            style={{
              color: "#facc15",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginTop: "4px",
            }}
          >
            {examType || "Exam"} Report
          </div>

          <div
            style={{
              color: "#cbd5e1",
              fontSize: "9px",
              marginTop: "6px",
            }}
          >
            Generated {generatedOn}
          </div>
        </div>
      </div>

      <div
        style={{
          height: "4px",
          background:
            "linear-gradient(90deg, #eab308, #fde68a, #eab308)",
        }}
      />

      {/* =========================================================
          ACADEMIC INFORMATION
      ========================================================= */}
      <div
        style={{
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          padding: "13px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", gap: "30px" }}>
          {[
            {
              label: "Class",
              value: cls?.name || "—",
            },
            {
              label: "Grade",
              value: cls?.grade ? `Grade ${cls.grade}` : "—",
            },
            {
              label: "Division",
              value: division,
            },
            {
              label: "Academic Year",
              value: academicYear,
            },
            {
              label: "Term",
              value: termNumber !== "—" ? `Term ${termNumber}` : "—",
            },
          ].map((item) => (
            <div key={item.label}>
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "8px",
                  fontWeight: "600",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  color: "#172554",
                  fontSize: "11px",
                  fontWeight: "700",
                  marginTop: "3px",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#172554",
            color: "#ffffff",
            borderRadius: "20px",
            padding: "6px 14px",
            fontSize: "9px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >
          {students.length} Learner
          {students.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* =========================================================
          SUMMARY CARDS
      ========================================================= */}
      <div
        style={{
          padding: "18px 36px 6px",
          display: "flex",
          gap: "10px",
        }}
      >
        {[
          {
            label: "Learners assessed",
            value: meta.total_students ?? students.length,
          },
          {
            label: "Class average",
            value: formatPercentage(classAverage),
          },
          {
            label: "Top learner",
            value: topStudent ? getStudentName(topStudent) : "—",
          },
          {
            label: "Boys / Girls",
            value: `${meta.boys ?? 0} / ${meta.girls ?? 0}`,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "7px",
              padding: "10px 12px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                color: "#94a3b8",
                fontSize: "7px",
                fontWeight: "700",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                color: "#172554",
                fontSize: "13px",
                fontWeight: "700",
                marginTop: "4px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================
          PERFORMANCE TABLE
      ========================================================= */}
      <div style={{ padding: "18px 36px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "8px",
          }}
        >
          <div>
            <div
              style={{
                color: "#172554",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              Learner Performance
            </div>

            <div
              style={{
                color: "#94a3b8",
                fontSize: "8px",
                marginTop: "3px",
              }}
            >
              Ranked by average percentage performance
            </div>
          </div>

          <div
            style={{
              color: "#64748b",
              fontSize: "8px",
            }}
          >
            {examType || "Selected exam"}
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.key}
                style={{ width: `${column.width}px` }}
              />
            ))}
          </colgroup>

          <thead>
            <tr style={{ background: "#172554" }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    padding: "9px 8px",
                    color: "#facc15",
                    fontSize: "8px",
                    fontWeight: "700",
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                    textAlign:
                      column.key === "student" ||
                      column.key === "admission"
                        ? "left"
                        : "center",
                    borderBottom: "2px solid #eab308",
                    whiteSpace: "nowrap",
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => {
              const position = Number(student.position);
              const grade = student.mean_grade;

              return (
                <tr
                  key={student.student_id}
                  style={{
                    background:
                      index % 2 === 0 ? "#ffffff" : "#f8fafc",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {/* Position */}
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "38px",
                        padding: "4px 7px",
                        borderRadius: "12px",
                        fontSize: "8px",
                        fontWeight: "700",
                        ...positionStyle(position),
                      }}
                    >
                      {positionSuffix(position)}
                    </span>
                  </td>

                  {/* Learner */}
                  <td
                    style={{
                      padding: "8px",
                      color: "#0f172a",
                      fontSize: "10px",
                      fontWeight: "600",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {getStudentName(student)}
                  </td>

                  {/* Admission number */}
                  <td
                    style={{
                      padding: "8px",
                      color: "#64748b",
                      fontSize: "9px",
                    }}
                  >
                    {student.student_number || "—"}
                  </td>

                  {/* Average */}
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      color: "#172554",
                      fontSize: "11px",
                      fontWeight: "800",
                    }}
                  >
                    {formatPercentage(student.avg_percentage)}
                  </td>

                  {/* Correct */}
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      color: "#475569",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {formatNumber(student.total_correct)}
                  </td>

                  {/* Exams */}
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      color: "#475569",
                      fontSize: "10px",
                    }}
                  >
                    {formatNumber(student.exams_count)}
                  </td>

                  {/* Points - junior only */}
                  {!isPrimary && (
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        color: "#475569",
                        fontSize: "10px",
                        fontWeight: "600",
                      }}
                    >
                      {formatNumber(student.total_points)}
                    </td>
                  )}

                  {/* Mean grade */}
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {grade ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "32px",
                          height: "23px",
                          padding: "0 6px",
                          borderRadius: "12px",
                          background: getGradeBackground(grade),
                          color: getGradeColor(grade),
                          fontSize: "9px",
                          fontWeight: "800",
                        }}
                      >
                        {grade}
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

      {/* =========================================================
          PERFORMANCE NOTES
      ========================================================= */}
      <div
        style={{
          margin: "0 36px 20px",
          padding: "11px 14px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderLeft: "3px solid #eab308",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            color: "#475569",
            fontSize: "8px",
            lineHeight: "1.6",
          }}
        >
          <strong style={{ color: "#172554" }}>
            Performance note:
          </strong>{" "}
          Average percentage represents performance across the recorded
          exam results for the selected examination period. Correct answers
          are based on the questions recorded for each exam.
          {!isPrimary &&
            " Mean grades and points are applicable to the Junior School grading structure."}
        </div>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <div
        style={{
          background: "#172554",
          padding: "9px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#cbd5e1",
            fontSize: "8px",
          }}
        >
          {schoolName} · Class Performance Report
        </span>

        <span
          style={{
            color: "#facc15",
            fontSize: "8px",
            fontWeight: "600",
          }}
        >
          {academicYear} · Term {termNumber} · Exam Management System
        </span>
      </div>
    </div>
  );
});

export default ClassPerformancePDF;