import { forwardRef } from 'react';

const GRADE_COLORS = {
  EE1: '#16a34a',
  EE2: '#22c55e',
  ME1: '#059669',
  ME2: '#10b981',
  AE1: '#d97706',
  AE2: '#f59e0b',
  BE1: '#ea580c',
  BE2: '#dc2626',
};

const gradePoints = { EE1: 8, EE2: 7, ME1: 6, ME2: 5, AE1: 4, AE2: 3, BE1: 2, BE2: 1 };

const calculateMeanGrade = (grades) => {
  if (!grades.length) return '—';
  const avg = grades.reduce((s, g) => s + (gradePoints[g] ?? 0), 0) / grades.length;
  const sorted = Object.entries(gradePoints).sort((a, b) => b[1] - a[1]);
  return sorted.find(([, pts]) => avg >= pts)?.[0] ?? 'F';
};

const ReportCardDocument = forwardRef(function ReportCardDocument(
  { report, examType, schoolName = 'MUKKURU OUTREACH ACADEMY', schoolMotto = 'Learning and achieving together' },
  ref
) {
  if (!report) return null;

  const { student, subjects, summary } = report;
  const meanGrade = summary.mean_grade || calculateMeanGrade(subjects.map((s) => s.grade));
  const generatedOn = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div
      ref={ref}
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: '13px',
        color: '#1f2937',
        position: 'relative',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#1a2744', padding: '28px 40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
              {/* School crest placeholder */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                backgroundColor: '#c9a84c', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ color: '#1a2744', fontWeight: '800', fontSize: '18px' }}>
                  {schoolName.charAt(0)}
                </span>
              </div>
              <div>
                <div style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px' }}>
                  {schoolName}
                </div>
                <div style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>
                  {schoolMotto}
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              backgroundColor: '#c9a84c', color: '#1a2744',
              padding: '4px 14px', borderRadius: '20px',
              fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              {examType} Report
            </div>
            <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '6px' }}>{generatedOn}</div>
          </div>
        </div>
      </div>

      {/* ── Gold rule ───────────────────────────────────────────────────── */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #c9a84c, #e8cc85, #c9a84c)' }} />

      {/* ── Student identity strip ──────────────────────────────────────── */}
      <div style={{ padding: '20px 40px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Student</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.3px' }}>
            {student.first_name} {student.last_name}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
            Reg. No: <strong style={{ color: '#334155' }}>{student.student_number}</strong>
            &nbsp;·&nbsp; Class: <strong style={{ color: '#334155' }}>{student.class_name || '—'}</strong>
          </div>
        </div>

        {/* Mean grade circle */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            backgroundColor: GRADE_COLORS[meanGrade] || '#64748b',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <span style={{ color: '#fff', fontSize: '26px', fontWeight: '800', lineHeight: 1 }}>{meanGrade}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Mean Grade</div>
        </div>
      </div>

      {/* ── Performance summary strip ───────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0', borderBottom: '1px solid #e2e8f0',
      }}>
        {[
          { label: 'Subjects', value: summary.subjects_count },
          { label: 'Total Points', value: `${summary.total_marks}` },
          { label: 'Out Of',  value: `${summary.total_possible}` },
          { label: 'Average', value: `${summary.average_percentage}%` },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '14px 20px',
            borderRight: i < 3 ? '1px solid #e2e8f0' : 'none',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a2744' }}>{stat.value}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Results table ───────────────────────────────────────────────── */}
      <div style={{ padding: '24px 40px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Subject Results
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a2744' }}>
              {['Subject', 'Code', 'Points', 'Total', 'Percentage', 'Performance', 'Grade'].map((h) => (
                <th key={h} style={{
                  padding: '9px 12px', textAlign: h === 'Performance' ? 'left' : 'center',
                  fontSize: '10px', fontWeight: '600', color: '#c9a84c',
                  letterSpacing: '0.8px', textTransform: 'uppercase',
                  borderBottom: '2px solid #c9a84c',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((row, i) => {
              const pct = parseFloat(((row.marks_obtained / row.total_marks) * 100).toFixed(1));
              return (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '500', color: '#0f172a', fontSize: '12px' }}>
                    {row.subject_name}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: '#e2e8f0', color: '#475569',
                      padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600',
                    }}>
                      {row.subject_code}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: '#1a2744', fontSize: '13px' }}>
                    {row.marks_obtained}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                    {row.total_marks}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', fontSize: '13px', color: GRADE_COLORS[row.grade] || '#1f2937' }}>
                    {pct}%
                  </td>
                  <td style={{ padding: '10px 18px', width: '180px' }}>
                    {/* Percentage bar */}
                    <div style={{ backgroundColor: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${pct}%`,
                        backgroundColor: GRADE_COLORS[row.grade] || '#94a3b8',
                        borderRadius: '999px',
                      }} />
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: GRADE_COLORS[row.grade] || '#94a3b8',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '28px', height: '28px',
                      lineHeight: '28px', textAlign: 'center',
                      fontSize: '12px', fontWeight: '700',
                    }}>
                      {row.grade}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Remarks section ─────────────────────────────────────────────── */}
      <div style={{ padding: '0 40px 28px' }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Class Teacher's Remarks
              </div>
              <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Principal's Remarks
              </div>
              <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }} />
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Class Teacher's Signature &amp; Date
              </div>
              <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Parent / Guardian Signature &amp; Date
              </div>
              <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#1a2744', padding: '10px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: '#64748b', fontSize: '10px' }}>
          {schoolName} · Official Academic Report
        </span>
        <span style={{ color: '#c9a84c', fontSize: '10px', fontWeight: '600' }}>
          CONFIDENTIAL
        </span>
      </div>
    </div>
  );
});


export default ReportCardDocument;