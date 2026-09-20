import { forwardRef } from "react";

// CBC grade colours — used for Junior School grades.
const GRADE_COLORS = {
  EE1: "#15803d",
  EE2: "#22c55e",
  ME1: "#0369a1",
  ME2: "#38bdf8",
  AE1: "#d97706",
  AE2: "#f59e0b",
  BE1: "#dc2626",
  BE2: "#991b1b",
};

const GRADE_BG = {
  EE1: "#dcfce7",
  EE2: "#f0fdf4",
  ME1: "#dbeafe",
  ME2: "#e0f2fe",
  AE1: "#fef3c7",
  AE2: "#fefce8",
  BE1: "#fee2e2",
  BE2: "#fce7f3",
};

const positionSuffix = (n) => {
  if (!n || Number(n) < 1) return "—";

  const value = Number(n);
  const j = value % 10;
  const k = value % 100;

  if (j === 1 && k !== 11) return `${value}st`;
  if (j === 2 && k !== 12) return `${value}nd`;
  if (j === 3 && k !== 13) return `${value}rd`;

  return `${value}th`;
};

const cell = (extra = {}) => ({
  padding: "8px 10px",
  fontSize: "11.5px",
  color: "#1f2937",
  borderBottom: "1px solid #e8edf4",
  verticalAlign: "middle",
  ...extra,
});

const formatSubjects = (subjects = []) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return "—";
  }

  return subjects
    .map((subject) => subject.subject_name)
    .filter(Boolean)
    .join(" & ") || "—";
};

const formatSubjectCodes = (subjects = []) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return "—";
  }

  return subjects
    .map((subject) => subject.subject_code)
    .filter(Boolean)
    .join("/") || "—";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const displayValue = (value, fallback = "—") =>
  value === null || value === undefined || value === ""
    ? fallback
    : value;

const ReportCardDocument = forwardRef(
  function ReportCardDocument(
    {
      report,
      schoolName = "MUKURU OUTREACH ACADEMY",
      schoolMotto = "Learning and achieving together",
      classTeacherName = null,
      closingDate = null,
      openingDate = null,
    },
    ref,
  ) {
    if (!report) return null;

    const {
      student = {},
      class: cls = {},
      term = {},
      division,
      exams = [],
      summary = {},
    } = report;

    const isPrimary = division === "primary";

    const meanGrade = summary.mean_grade ?? null;
    const meanGradeColor =
      GRADE_COLORS[meanGrade] || "#64748b";

    const generatedOn = new Date().toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const safeExams = Array.isArray(exams) ? exams : [];

    const headers = isPrimary
      ? [
          "Exam / Subject",
          "Code",
          "Correct",
          "Out of",
          "%",
          "Remark",
        ]
      : [
          "Exam / Subject",
          "Code",
          "Correct",
          "Out of",
          "%",
          "Points",
          "Grade",
          "Performance",
        ];

    const averagePercentage =
      summary.average_percentage ?? null;

    const hasPosition =
      summary.position !== null &&
      summary.position !== undefined &&
      Number(summary.position) > 0;

    return (
      <div
        ref={ref}
        style={{
          width: "794px",
          minHeight: "1123px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          fontSize: "12px",
          color: "#1f2937",
          position: "relative",
          paddingBottom: "42px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#1a2744 0%,#0f1a30 100%)",
            padding: "26px 36px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#c9a84c,#e8cc85)",
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
                    fontSize: "20px",
                  }}
                >
                  {schoolName.charAt(0)}
                </span>
              </div>

              <div>
                <div
                  style={{
                    color: "#fff",
                    fontSize: "20px",
                    fontWeight: "800",
                  }}
                >
                  {schoolName}
                </div>

                <div
                  style={{
                    color: "#c9a84c",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginTop: "3px",
                  }}
                >
                  {schoolMotto}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg,#c9a84c,#e8cc85)",
                  color: "#1a2744",
                  padding: "5px 16px",
                  borderRadius: "20px",
                  fontSize: "10px",
                  fontWeight: "800",
                  display: "inline-block",
                }}
              >
                Term {displayValue(term.term_number)} ·{" "}
                {term.exam_type && term.exam_type !== "All"
                  ? term.exam_type
                  : "Report Card"}
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "9.5px",
                  marginTop: "5px",
                }}
              >
                {displayValue(term.academic_year)} ·{" "}
                {generatedOn}
              </div>
            </div>
          </div>
        </div>

        {/* Accent bar */}
        <div
          style={{
            height: "4px",
            background:
              "linear-gradient(90deg,#c9a84c,#e8cc85,#c9a84c)",
          }}
        />

        {/* Learner information */}
        <div
          style={{
            padding: "18px 36px",
            background: "#f8fafc",
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
                fontSize: "9px",
                color: "#94a3b8",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Learner
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#0f172a",
              }}
            >
              {student.first_name} {student.last_name}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                marginTop: "6px",
              }}
            >
              <span>
                Adm No:{" "}
                <strong>
                  {displayValue(student.student_number)}
                </strong>
              </span>

              <span>
                Class:{" "}
                <strong>{displayValue(cls.name)}</strong>
              </span>

              <span>
                Grade:{" "}
                <strong>{displayValue(cls.grade)}</strong>
              </span>

              {student.gender && (
                <span style={{ textTransform: "capitalize" }}>
                  Gender: <strong>{student.gender}</strong>
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                marginTop: "5px",
              }}
            >
              <span>
                Class Teacher:{" "}
                <strong>
                  {classTeacherName || cls.teacher_name || "—"}
                </strong>
              </span>

              {closingDate && (
                <span>
                  Closing: <strong>{closingDate}</strong>
                </span>
              )}

              {openingDate && (
                <span>
                  Re-opens: <strong>{openingDate}</strong>
                </span>
              )}
            </div>

            {hasPosition && (
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    background:
                      "linear-gradient(135deg,#1a2744,#243355)",
                    color: "#c9a84c",
                    padding: "3px 12px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {positionSuffix(summary.position)} out of{" "}
                  {displayValue(summary.class_size)}
                </span>

                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "10px",
                  }}
                >
                  in class
                </span>
              </div>
            )}
          </div>

          {/* Junior mean grade OR Primary average percentage */}
          <div
            style={{
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "50%",
                background: isPrimary
                  ? "#1a2744"
                  : `linear-gradient(135deg,${meanGradeColor},${meanGradeColor}cc)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(15,23,42,0.15)",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: isPrimary ? "20px" : "22px",
                  fontWeight: "900",
                  lineHeight: 1,
                }}
              >
                {isPrimary
                  ? averagePercentage !== null
                    ? `${averagePercentage}%`
                    : "—"
                  : meanGrade || "—"}
              </span>
            </div>

            <div
              style={{
                fontSize: "9px",
                color: "#64748b",
                marginTop: "5px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              {isPrimary ? "Average %" : "Mean Grade"}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${isPrimary ? 3 : 4}, 1fr)`,
            borderBottom: "2px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          {[
            {
              label: "Exams sat",
              value: summary.total_exams ?? safeExams.length,
            },
            {
              label: "Average %",
              value:
                averagePercentage !== null
                  ? `${averagePercentage}%`
                  : "—",
            },
            ...(!isPrimary
              ? [
                  {
                    label: "Total Points",
                    value:
                      summary.total_points != null &&
                      summary.max_points != null
                        ? `${summary.total_points} / ${summary.max_points}`
                        : "—",
                  },
                ]
              : []),
            {
              label: "Division",
              value: isPrimary ? "Primary" : "Junior School",
            },
          ].map((item, index, arr) => (
            <div
              key={item.label}
              style={{
                padding: "12px 16px",
                textAlign: "center",
                borderRight:
                  index < arr.length - 1
                    ? "1px solid #e2e8f0"
                    : "none",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#1a2744",
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  fontSize: "9px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Results table */}
        <div style={{ padding: "20px 36px" }}>
          <div
            style={{
              fontSize: "9px",
              fontWeight: "800",
              color: "#94a3b8",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Examination Results
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "auto",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(135deg,#1a2744,#243355)",
                }}
              >
                {headers.map((header, index) => (
                  <th
                    key={header}
                    style={{
                      padding: "9px 8px",
                      textAlign: index <= 1 ? "left" : "center",
                      fontSize: "9px",
                      fontWeight: "700",
                      color: "#c9a84c",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #c9a84c",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {safeExams.length > 0 ? (
                safeExams.map((row, index) => {
                  const gradeColor =
                    GRADE_COLORS[row.grade] || "#64748b";

                  const gradeBg =
                    GRADE_BG[row.grade] || "#f1f5f9";

                  const rowBackground =
                    index % 2 === 0 ? "#fff" : "#f8fafc";

                  return (
                    <tr
                      key={row.exam_id}
                      style={{ background: rowBackground }}
                    >
                      {/* Exam and subject */}
                      <td style={cell({ fontWeight: "600" })}>
                        <div>{row.exam_title || "—"}</div>

                        <div
                          style={{
                            fontSize: "10px",
                            color: "#94a3b8",
                            marginTop: "2px",
                          }}
                        >
                          {formatSubjects(row.subjects)}
                        </div>

                        {row.exam_date && (
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#94a3b8",
                              marginTop: "2px",
                            }}
                          >
                            {formatDate(row.exam_date)}
                          </div>
                        )}
                      </td>

                      {/* Subject codes */}
                      <td style={cell({ textAlign: "center" })}>
                        {formatSubjectCodes(row.subjects)}
                      </td>

                      {/* Correct */}
                      <td
                        style={cell({
                          textAlign: "center",
                          fontWeight: "700",
                        })}
                      >
                        {displayValue(row.questions_correct)}
                      </td>

                      {/* Total questions */}
                      <td
                        style={cell({
                          textAlign: "center",
                        })}
                      >
                        {displayValue(row.total_questions)}
                      </td>

                      {/* Percentage */}
                      <td
                        style={cell({
                          textAlign: "center",
                          fontWeight: "700",
                          color: gradeColor,
                        })}
                      >
                        {row.percentage != null
                          ? `${row.percentage}%`
                          : "—"}
                      </td>

                      {/* Primary: Remarks */}
                      {isPrimary && (
                        <td
                          style={cell({
                            fontSize: "10px",
                            fontStyle: "italic",
                          })}
                        >
                          {displayValue(row.remarks)}
                        </td>
                      )}

                      {/* Junior: Points */}
                      {!isPrimary && (
                        <td
                          style={cell({
                            textAlign: "center",
                          })}
                        >
                          {row.points != null ? (
                            <span
                              style={{
                                background: gradeBg,
                                color: gradeColor,
                                padding: "2px 8px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "700",
                              }}
                            >
                              {row.points}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}

                      {/* Junior: Grade */}
                      {!isPrimary && (
                        <td
                          style={cell({
                            textAlign: "center",
                          })}
                        >
                          {row.grade ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: "30px",
                                padding: "5px",
                                borderRadius: "50%",
                                background: gradeColor,
                                color: "#fff",
                                fontSize: "9px",
                                fontWeight: "800",
                              }}
                            >
                              {row.grade}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}

                      {/* Junior: Performance label */}
                      {!isPrimary && (
                        <td
                          style={cell({
                            fontSize: "10px",
                            textAlign: "center",
                          })}
                        >
                          {displayValue(row.grade_label)}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={headers.length}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#94a3b8",
                    }}
                  >
                    No results found for this term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Class teacher comment */}
        {summary.teacher_comment && (
          <div style={{ padding: "0 36px 16px" }}>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderLeft: "4px solid #c9a84c",
                borderRadius: "8px",
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                  fontWeight: "700",
                }}
              >
                Class Teacher's Comment
              </div>

              <p
                style={{
                  fontSize: "11.5px",
                  color: "#334155",
                  lineHeight: "1.65",
                  margin: 0,
                }}
              >
                {summary.teacher_comment}
              </p>

              {(classTeacherName || cls.teacher_name) && (
                <p
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    margin: "8px 0 0",
                    textAlign: "right",
                    fontStyle: "italic",
                  }}
                >
                  — {classTeacherName || cls.teacher_name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Signatures */}
        <div style={{ padding: "0 36px 24px" }}>
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "16px 20px",
              background: "#fafbfc",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {[
                "Principal's Signature & Date",
                "Parent / Guardian Signature & Date",
              ].map((label) => (
                <div key={label}>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      fontWeight: "600",
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      borderBottom: "1.5px solid #cbd5e1",
                      paddingBottom: "22px",
                    }}
                  />
                </div>
              ))}
            </div>

            {(closingDate || openingDate) && (
              <div
                style={{
                  marginTop: "14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  paddingTop: "12px",
                  borderTop: "1px dashed #e2e8f0",
                }}
              >
                {closingDate && (
                  <div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        marginBottom: "3px",
                      }}
                    >
                      School Closing Date
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
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
                        fontSize: "9px",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        marginBottom: "3px",
                      }}
                    >
                      School Re-opening Date
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
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
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background:
              "linear-gradient(135deg,#1a2744,#0f1a30)",
            padding: "10px 36px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#94a3b8",
              fontSize: "9.5px",
            }}
          >
            {schoolName} · Official Academic Report
          </span>

          <span
            style={{
              color: "#c9a84c",
              fontSize: "9.5px",
              fontWeight: "700",
            }}
          >
            CONFIDENTIAL
          </span>
        </div>
      </div>
    );
  },
);

export default ReportCardDocument;