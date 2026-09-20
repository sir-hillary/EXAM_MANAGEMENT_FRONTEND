import { forwardRef } from "react";

// CBC grade colours — used for Junior School grades.
const GRADE_COLORS = {
  EE1: "#15803d",
  EE2: "#16a34a",
  ME1: "#0369a1",
  ME2: "#0284c7",
  AE1: "#b45309",
  AE2: "#d97706",
  BE1: "#dc2626",
  BE2: "#991b1b",
};

const GRADE_BG = {
  EE1: "#dcfce7",
  EE2: "#dcfce7",
  ME1: "#dbeafe",
  ME2: "#e0f2fe",
  AE1: "#fef3c7",
  AE2: "#fef3c7",
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

const displayValue = (value, fallback = "—") =>
  value === null || value === undefined || value === ""
    ? fallback
    : value;

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatSubjects = (subjects = []) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return "—";
  }

  const names = subjects
    .map((subject) => subject?.subject_name)
    .filter(Boolean);

  return names.length > 0 ? names.join(" · ") : "—";
};

const formatSubjectCodes = (subjects = []) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return "—";
  }

  const codes = subjects
    .map((subject) => subject?.subject_code)
    .filter(Boolean);

  return codes.length > 0 ? codes.join(" / ") : "—";
};

const tableCell = (extra = {}) => ({
  padding: "8px 9px",
  fontSize: "10.5px",
  color: "#334155",
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "middle",
  ...extra,
});

const labelStyle = {
  fontSize: "8px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.9px",
};

const ReportCardDocument = forwardRef(function ReportCardDocument(
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

  const safeExams = Array.isArray(exams) ? exams : [];
  const isPrimary = division === "primary";
  const isJunior = !isPrimary;

  const meanGrade = summary.mean_grade ?? null;

  const meanGradeColor =
    GRADE_COLORS[meanGrade] || "#475569";

  const meanGradeBackground =
    GRADE_BG[meanGrade] || "#f1f5f9";

  const averagePercentage =
    summary.average_percentage !== null &&
    summary.average_percentage !== undefined
      ? Number(summary.average_percentage)
      : null;

  const hasPosition =
    summary.position !== null &&
    summary.position !== undefined &&
    Number(summary.position) > 0;

  const generatedOn = new Date().toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const teacherName =
    classTeacherName ||
    cls.teacher_name ||
    "—";

  const reportTitle =
    term.exam_type && term.exam_type !== "All"
      ? `${term.exam_type} Examination Report`
      : "Academic Report Card";

  const summaryItems = [
    {
      label: "Examinations",
      value: summary.total_exams ?? safeExams.length,
    },
    {
      label: "Average",
      value:
        averagePercentage !== null
          ? `${averagePercentage}%`
          : "—",
    },
    ...(isJunior
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
      label: "School Division",
      value: isPrimary ? "Primary" : "Junior",
    },
  ];

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        minHeight: "1123px",
        boxSizing: "border-box",
        background: "#ffffff",
        color: "#1e293b",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "12px",
        lineHeight: 1.4,
        position: "relative",
        paddingBottom: "48px",
        overflow: "hidden",
      }}
    >
      {/* =========================================================
          SCHOOL HEADER
      ========================================================= */}
      <div
        style={{
          padding: "25px 38px 20px",
          background:
            "linear-gradient(135deg, #10213f 0%, #172f55 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          {/* School identity */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "13px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                border: "2px solid #d7b75d",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  color: "#10213f",
                  fontSize: "21px",
                  fontWeight: "900",
                }}
              >
                {schoolName.charAt(0)}
              </span>
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "20px",
                  lineHeight: 1.15,
                  fontWeight: "800",
                  letterSpacing: "0.2px",
                }}
              >
                {schoolName}
              </div>

              <div
                style={{
                  marginTop: "5px",
                  color: "#d7b75d",
                  fontSize: "9px",
                  fontWeight: "600",
                  letterSpacing: "1.6px",
                  textTransform: "uppercase",
                }}
              >
                {schoolMotto}
              </div>
            </div>
          </div>

          {/* Report metadata */}
          <div
            style={{
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "5px 12px",
                borderRadius: "4px",
                background: "#d7b75d",
                color: "#10213f",
                fontSize: "9px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {reportTitle}
            </div>

            <div
              style={{
                marginTop: "7px",
                color: "#cbd5e1",
                fontSize: "9px",
              }}
            >
              Term {displayValue(term.term_number)}
              {"  "}·{"  "}
              {displayValue(term.academic_year)}
            </div>
          </div>
        </div>

        {/* Document title */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "13px",
            borderTop: "1px solid rgba(255,255,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: "#e2e8f0",
            }}
          >
            Learner Academic Performance
          </div>

          <div
            style={{
              fontSize: "8.5px",
              color: "#94a3b8",
            }}
          >
            Generated {generatedOn}
          </div>
        </div>
      </div>

      {/* Gold accent */}
      <div
        style={{
          height: "4px",
          background:
            "linear-gradient(90deg, #b8943f 0%, #e4cb82 50%, #b8943f 100%)",
        }}
      />

      {/* =========================================================
          LEARNER DETAILS
      ========================================================= */}
      <div
        style={{
          padding: "17px 38px",
          borderBottom: "1px solid #dbe3ec",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "25px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>Learner Details</div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "19px",
                lineHeight: 1.2,
                fontWeight: "800",
                color: "#0f172a",
              }}
            >
              {displayValue(
                `${student.first_name || ""} ${student.last_name || ""}`.trim(),
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "10px 20px",
                marginTop: "11px",
              }}
            >
              <div>
                <div style={labelStyle}>Admission No.</div>
                <div
                  style={{
                    marginTop: "2px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  {displayValue(student.student_number)}
                </div>
              </div>

              <div>
                <div style={labelStyle}>Class</div>
                <div
                  style={{
                    marginTop: "2px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  {displayValue(cls.name)}
                </div>
              </div>

              <div>
                <div style={labelStyle}>Grade</div>
                <div
                  style={{
                    marginTop: "2px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  {displayValue(cls.grade)}
                </div>
              </div>

              {student.gender && (
                <div>
                  <div style={labelStyle}>Gender</div>
                  <div
                    style={{
                      marginTop: "2px",
                      fontWeight: "700",
                      color: "#334155",
                      textTransform: "capitalize",
                    }}
                  >
                    {student.gender}
                  </div>
                </div>
              )}

              <div>
                <div style={labelStyle}>Class Teacher</div>
                <div
                  style={{
                    marginTop: "2px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  {teacherName}
                </div>
              </div>

              {cls.teacher_tsc && (
                <div>
                  <div style={labelStyle}>Teacher TSC No.</div>
                  <div
                    style={{
                      marginTop: "2px",
                      fontWeight: "700",
                      color: "#334155",
                    }}
                  >
                    {cls.teacher_tsc}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overall performance */}
          <div
            style={{
              width: "100px",
              flexShrink: 0,
              textAlign: "center",
              borderLeft: "1px solid #dbe3ec",
              paddingLeft: "20px",
            }}
          >
            <div style={labelStyle}>
              {isPrimary ? "Average" : "Mean Grade"}
            </div>

            <div
              style={{
                width: "70px",
                height: "70px",
                margin: "6px auto 0",
                borderRadius: "50%",
                background: isPrimary
                  ? "#10213f"
                  : meanGradeBackground,
                border: isPrimary
                  ? "4px solid #d7b75d"
                  : `4px solid ${meanGradeColor}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: isPrimary
                    ? "#ffffff"
                    : meanGradeColor,
                  fontSize: isPrimary ? "19px" : "21px",
                  fontWeight: "900",
                }}
              >
                {isPrimary
                  ? averagePercentage !== null
                    ? `${averagePercentage}%`
                    : "—"
                  : meanGrade || "—"}
              </span>
            </div>

            {hasPosition && (
              <div
                style={{
                  marginTop: "7px",
                  fontSize: "8.5px",
                  color: "#64748b",
                  lineHeight: 1.3,
                }}
              >
                <strong
                  style={{
                    color: "#10213f",
                    fontSize: "10px",
                  }}
                >
                  {positionSuffix(summary.position)}
                </strong>{" "}
                out of {displayValue(summary.class_size)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          PERFORMANCE SUMMARY
      ========================================================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${summaryItems.length}, 1fr)`,
          borderBottom: "1px solid #dbe3ec",
          background: "#ffffff",
        }}
      >
        {summaryItems.map((item, index) => (
          <div
            key={item.label}
            style={{
              padding: "11px 10px",
              textAlign: "center",
              borderRight:
                index < summaryItems.length - 1
                  ? "1px solid #e2e8f0"
                  : "none",
            }}
          >
            <div
              style={{
                color: "#10213f",
                fontSize: "15px",
                fontWeight: "800",
                lineHeight: 1.2,
              }}
            >
              {item.value}
            </div>

            <div
              style={{
                marginTop: "3px",
                color: "#64748b",
                fontSize: "7.5px",
                fontWeight: "700",
                letterSpacing: "0.7px",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================
          RESULTS
      ========================================================= */}
      <div style={{ padding: "18px 38px 12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#10213f",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Examination Results
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "8.5px",
                color: "#64748b",
              }}
            >
              {isPrimary
                ? "Performance is shown as percentage achievement."
                : "CBC performance is shown using grades and points."}
            </div>
          </div>

          <div
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              background: "#f1f5f9",
              color: "#475569",
              fontSize: "8px",
              fontWeight: "700",
            }}
          >
            {safeExams.length}{" "}
            {safeExams.length === 1 ? "Examination" : "Examinations"}
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#10213f",
              }}
            >
              <th
                style={{
                  width: isPrimary ? "31%" : "28%",
                  padding: "8px 8px",
                  textAlign: "left",
                  color: "#ffffff",
                  fontSize: "8px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}
              >
                Examination
              </th>

              <th
                style={{
                  width: isPrimary ? "13%" : "12%",
                  padding: "8px 6px",
                  textAlign: "center",
                  color: "#ffffff",
                  fontSize: "8px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                Code
              </th>

              <th
                style={{
                  width: "9%",
                  padding: "8px 5px",
                  textAlign: "center",
                  color: "#ffffff",
                  fontSize: "8px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                Correct
              </th>

              <th
                style={{
                  width: "9%",
                  padding: "8px 5px",
                  textAlign: "center",
                  color: "#ffffff",
                  fontSize: "8px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                Out of
              </th>

              <th
                style={{
                  width: "8%",
                  padding: "8px 5px",
                  textAlign: "center",
                  color: "#ffffff",
                  fontSize: "8px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                %
              </th>

              {isPrimary ? (
                <th
                  style={{
                    width: "20%",
                    padding: "8px 6px",
                    textAlign: "left",
                    color: "#ffffff",
                    fontSize: "8px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  Remark
                </th>
              ) : (
                <>
                  <th
                    style={{
                      width: "8%",
                      padding: "8px 5px",
                      textAlign: "center",
                      color: "#ffffff",
                      fontSize: "8px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Pts
                  </th>

                  <th
                    style={{
                      width: "9%",
                      padding: "8px 5px",
                      textAlign: "center",
                      color: "#ffffff",
                      fontSize: "8px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Grade
                  </th>

                  <th
                    style={{
                      width: "18%",
                      padding: "8px 6px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontSize: "8px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Performance
                  </th>
                </>
              )}
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
                  index % 2 === 0
                    ? "#ffffff"
                    : "#f8fafc";

                return (
                  <tr
                    key={row.exam_id ?? index}
                    style={{
                      background: rowBackground,
                    }}
                  >
                    {/* Examination */}
                    <td
                      style={tableCell({
                        fontWeight: "700",
                        color: "#1e293b",
                      })}
                    >
                      <div
                        style={{
                          fontSize: "10.5px",
                          fontWeight: "800",
                        }}
                      >
                        {displayValue(row.exam_title)}
                      </div>

                      <div
                        style={{
                          marginTop: "2px",
                          color: "#64748b",
                          fontSize: "8.5px",
                          lineHeight: 1.35,
                        }}
                      >
                        {formatSubjects(row.subjects)}
                      </div>

                      {row.exam_date && (
                        <div
                          style={{
                            marginTop: "2px",
                            color: "#94a3b8",
                            fontSize: "8px",
                          }}
                        >
                          {formatDate(row.exam_date)}
                        </div>
                      )}
                    </td>

                    {/* Subject code */}
                    <td
                      style={tableCell({
                        textAlign: "center",
                        fontSize: "8.5px",
                        color: "#475569",
                        wordBreak: "break-word",
                      })}
                    >
                      {formatSubjectCodes(row.subjects)}
                    </td>

                    {/* Correct */}
                    <td
                      style={tableCell({
                        textAlign: "center",
                        fontWeight: "800",
                        color: "#10213f",
                      })}
                    >
                      {displayValue(row.questions_correct)}
                    </td>

                    {/* Out of */}
                    <td
                      style={tableCell({
                        textAlign: "center",
                      })}
                    >
                      {displayValue(row.total_questions)}
                    </td>

                    {/* Percentage */}
                    <td
                      style={tableCell({
                        textAlign: "center",
                        fontWeight: "800",
                        color:
                          row.grade
                            ? gradeColor
                            : "#10213f",
                      })}
                    >
                      {row.percentage != null
                        ? `${row.percentage}%`
                        : "—"}
                    </td>

                    {/* Primary remark */}
                    {isPrimary && (
                      <td
                        style={tableCell({
                          fontSize: "9px",
                          color: "#475569",
                        })}
                      >
                        {displayValue(row.remarks)}
                      </td>
                    )}

                    {/* Junior points */}
                    {isJunior && (
                      <td
                        style={tableCell({
                          textAlign: "center",
                        })}
                      >
                        {row.points != null ? (
                          <span
                            style={{
                              display: "inline-block",
                              minWidth: "24px",
                              padding: "3px 5px",
                              borderRadius: "4px",
                              background: gradeBg,
                              color: gradeColor,
                              fontSize: "9px",
                              fontWeight: "800",
                              boxSizing: "border-box",
                            }}
                          >
                            {row.points}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}

                    {/* Junior grade */}
                    {isJunior && (
                      <td
                        style={tableCell({
                          textAlign: "center",
                        })}
                      >
                        {row.grade ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "29px",
                              height: "24px",
                              padding: "0 5px",
                              borderRadius: "4px",
                              background: gradeColor,
                              color: "#ffffff",
                              fontSize: "8.5px",
                              fontWeight: "900",
                            }}
                          >
                            {row.grade}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}

                    {/* Junior performance */}
                    {isJunior && (
                      <td
                        style={tableCell({
                          fontSize: "8.5px",
                          color: "#475569",
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
                  colSpan={isPrimary ? 6 : 8}
                  style={{
                    padding: "25px 10px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "10px",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  No examination results are available
                  for this term.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Important data-model note */}
        <div
          style={{
            marginTop: "7px",
            color: "#94a3b8",
            fontSize: "7.5px",
            lineHeight: 1.35,
          }}
        >
          Note: Where an examination covers multiple subjects,
          the score shown represents the learner's total
          performance for that examination; subject names indicate
          the subjects covered and do not represent separate
          subject scores.
        </div>
      </div>

      {/* =========================================================
          TEACHER COMMENT
      ========================================================= */}
      {summary.teacher_comment && (
        <div style={{ padding: "3px 38px 13px" }}>
          <div
            style={{
              border: "1px solid #dbe3ec",
              borderLeft: "4px solid #d7b75d",
              borderRadius: "5px",
              background: "#f8fafc",
              padding: "11px 14px",
            }}
          >
            <div style={labelStyle}>
              Class Teacher's Comment
            </div>

            <p
              style={{
                margin: "5px 0 0",
                color: "#334155",
                fontSize: "10px",
                lineHeight: 1.55,
              }}
            >
              {summary.teacher_comment}
            </p>

            {teacherName !== "—" && (
              <div
                style={{
                  marginTop: "6px",
                  textAlign: "right",
                  color: "#64748b",
                  fontSize: "8.5px",
                  fontStyle: "italic",
                }}
              >
                — {teacherName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          SIGNATURES + SCHOOL DATES
      ========================================================= */}
      <div style={{ padding: "0 38px 18px" }}>
        <div
          style={{
            borderTop: "1px solid #dbe3ec",
            paddingTop: "13px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "28px",
            }}
          >
            {[
              "Principal's Signature",
              "Parent / Guardian Signature",
            ].map((label) => (
              <div key={label}>
                <div style={labelStyle}>{label}</div>

                <div
                  style={{
                    height: "30px",
                    borderBottom: "1px solid #94a3b8",
                    marginTop: "5px",
                  }}
                />

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "7.5px",
                    color: "#94a3b8",
                  }}
                >
                  Signature & Date
                </div>
              </div>
            ))}
          </div>

          {(closingDate || openingDate) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "28px",
                marginTop: "14px",
                paddingTop: "10px",
                borderTop: "1px dashed #dbe3ec",
              }}
            >
              {closingDate && (
                <div>
                  <div style={labelStyle}>
                    School Closing Date
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      color: "#10213f",
                      fontSize: "10px",
                      fontWeight: "800",
                    }}
                  >
                    {closingDate}
                  </div>
                </div>
              )}

              {openingDate && (
                <div>
                  <div style={labelStyle}>
                    School Re-opening Date
                  </div>

                  <div
                    style={{
                      marginTop: "3px",
                      color: "#10213f",
                      fontSize: "10px",
                      fontWeight: "800",
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

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "36px",
          padding: "0 38px",
          boxSizing: "border-box",
          background: "#10213f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: "#cbd5e1",
            fontSize: "8px",
          }}
        >
          {schoolName} · Official Academic Report
        </span>

        <span
          style={{
            color: "#d7b75d",
            fontSize: "8px",
            fontWeight: "800",
            letterSpacing: "0.8px",
          }}
        >
          CONFIDENTIAL
        </span>
      </div>
    </div>
  );
});

export default ReportCardDocument;