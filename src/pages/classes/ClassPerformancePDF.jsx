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
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
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

  return (
    <div
      ref={ref}
      style={{
        width: "1000px",
        backgroundColor: "#fff",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "12px",
        color: "#1f2937",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#1a2744",
          padding: "22px 36px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#c9a84c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{ color: "#1a2744", fontWeight: "800", fontSize: "20px" }}
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
                fontSize: "10px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              {schoolMotto}
            </div>
            {schoolAddress && (
              <div
                style={{ color: "#64748b", fontSize: "10px", marginTop: "2px" }}
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
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {examType} Performance Report
          </div>
          <div style={{ color: "#64748b", fontSize: "10px", marginTop: "5px" }}>
            {generatedOn}
          </div>
        </div>
      </div>

      {/* Gold rule */}
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg,#c9a84c,#e8cc85,#c9a84c)",
        }}
      />

      {/* Class info strip */}
      <div
        style={{
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          padding: "14px 36px",
          display: "flex",
          gap: "32px",
          alignItems: "center",
        }}
      >
        {[
          { label: "Class", value: cls.name },
          { label: "Grade", value: `Grade ${cls.grade}` },
          {
            label: "Division",
            value: Number(cls.grade) <= 6 ? "Primary" : "Junior School",
          },
          { label: "Exam type", value: examType },
          { label: "Students", value: students.length },
        ].map((item, i) => (
          <div key={i}>
            <div
              style={{
                fontSize: "9px",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "13px",
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

      {/* Main rankings table */}
      <div style={{ padding: "20px 36px" }}>
        <div
          style={{
            fontSize: "9px",
            fontWeight: "700",
            color: "#94a3b8",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Student rankings
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a2744" }}>
              {[
                "Pos",
                "Name",
                "Adm. No.",
                ...allSubjects,
                "Total",
                "Mean Grade",
              ].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "8px 10px",
                    fontSize: "9px",
                    fontWeight: "600",
                    color: "#c9a84c",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                    borderBottom: "2px solid #c9a84c",
                    textAlign: i < 3 ? "left" : "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr
                key={s.student_id}
                style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}
              >
                <td
                  style={{
                    padding: "7px 10px",
                    ...positionStyle(s.position),
                    fontSize: "11px",
                  }}
                >
                  {positionSuffix(s.position)}
                </td>
                <td
                  style={{
                    padding: "7px 10px",
                    fontWeight: "500",
                    color: "#0f172a",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.first_name} {s.last_name}
                </td>
                <td
                  style={{
                    padding: "7px 10px",
                    color: "#64748b",
                    fontSize: "11px",
                  }}
                >
                  {s.student_number}
                </td>

                {/* Per-subject mark cells */}
                {allSubjects.map((sub) => {
                  const result = s.subject_results?.find(
                    (r) => r.subject_name === sub,
                  );
                  return (
                    <td
                      key={sub}
                      style={{
                        padding: "7px 10px",
                        textAlign: "center",
                        color: result
                          ? GRADE_COLORS[result.grade] || "#374151"
                          : "#d1d5db",
                        fontWeight: result ? "600" : "400",
                      }}
                    >
                      {result ? result.marks_obtained : "—"}
                    </td>
                  );
                })}

                <td
                  style={{
                    padding: "7px 10px",
                    textAlign: "center",
                    fontWeight: "700",
                    color: "#1a2744",
                    fontSize: "13px",
                  }}
                >
                  {s.total_marks}
                </td>
                <td style={{ padding: "7px 10px", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: GRADE_COLORS[s.mean_grade] || "#94a3b8",
                      color: "#fff",
                      fontSize: "11px",
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

      {/* Subject performance summary footer */}
      {subjectSummaries && subjectSummaries.length > 0 && (
        <div style={{ padding: "0 36px 24px" }}>
          <div
            style={{
              fontSize: "9px",
              fontWeight: "700",
              color: "#94a3b8",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Subject performance summary (ranked by average)
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {[
                  "Rank",
                  "Subject",
                  "Highest",
                  "Lowest",
                  "Average",
                  "Students sat",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "7px 10px",
                      fontSize: "9px",
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
              {[...subjectSummaries]
                .sort((a, b) => b.average - a.average)
                .map((sub, i) => (
                  <tr
                    key={sub.subject_name}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "7px 10px",
                        fontWeight: "600",
                        color: "#1a2744",
                      }}
                    >
                      {i + 1}
                    </td>
                    <td style={{ padding: "7px 10px", fontWeight: "500" }}>
                      {sub.subject_name}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        color: "#15803d",
                        fontWeight: "600",
                      }}
                    >
                      {sub.highest}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        color: "#dc2626",
                        fontWeight: "600",
                      }}
                    >
                      {sub.lowest}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        fontWeight: "700",
                        color: "#1a2744",
                      }}
                    >
                      {sub.average}
                    </td>
                    <td style={{ padding: "7px 10px", color: "#64748b" }}>
                      {sub.students_sat}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          background: "#1a2744",
          padding: "9px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#64748b", fontSize: "10px" }}>
          {schoolName} · Class Performance Report
        </span>
        <span style={{ color: "#c9a84c", fontSize: "10px", fontWeight: "600" }}>
          CONFIDENTIAL
        </span>
      </div>
    </div>
  );
});

export default ClassPerformancePDF;
