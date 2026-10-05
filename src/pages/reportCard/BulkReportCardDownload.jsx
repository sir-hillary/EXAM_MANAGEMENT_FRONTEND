import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Loader2, AlertTriangle,
  CheckCircle2, CalendarDays, Users, School,
  BookOpen, FileDown, Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useClassTermReportCards } from "../../hooks/useClasses";
import { useClasses } from "../../hooks/useClasses";
import PageHeader from "../../components/ui/PageHeader";
import SelectField from "../../components/ui/SelectField";
import { Spinner } from "../../components/ui/Spinner";
import ReportCardDocument from "./ReportCardDocument";

const currentAcademicYear = () => {
  const y = new Date().getFullYear();
  return new Date().getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
};

// Double-rAF paint confirmation — same pattern as single report card
const waitForPaint = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );

const useOffscreenSlot = () => {
  const slotRef = useRef(null);
  const [slotElement, setSlotElement] = useState(null);
  useEffect(() => {
    const div = document.createElement("div");
    div.style.cssText = [
      "position:fixed",
      "left:-9999px",
      "top:0",
      "width:794px",
      "background:#fff",
      "z-index:-1",
      "pointer-events:none",
      "visibility:hidden",
    ].join(";");
    document.body.appendChild(div);
    slotRef.current = div;
    const frame = requestAnimationFrame(() => setSlotElement(div));
    return () => {
      cancelAnimationFrame(frame);
      if (slotRef.current) document.body.removeChild(slotRef.current);
      slotRef.current = null;
    };
  }, []);
  return { slotRef, slotElement };
};

// ── Small stat chip ──────────────────────────────────────────────────────────
const StatChip = ({ icon: Icon, label, value, color = "blue" }) => {
  const colors = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",  icon: "text-blue-500"  },
    green:  { bg: "bg-green-50",  text: "text-green-700", icon: "text-green-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-700",icon: "text-purple-500"},
    amber:  { bg: "bg-amber-50",  text: "text-amber-700", icon: "text-amber-500" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 ${c.bg}`}>
      <Icon size={18} className={c.icon} />
      <div>
        <p className={`text-sm font-bold ${c.text}`}>{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
};

// ── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ current, total }) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-600">
          Report card {current} of {total}
        </span>
        <span className="text-xs font-bold text-blue-600">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #1a2744, #3b5bdb)",
          }}
        />
      </div>
    </div>
  );
};

export default function BulkReportCardDownload() {
  const navigate                    = useNavigate();
  const { data: classesData }       = useClasses({ limit: 100 });

  const [selectedClassId, setSelectedClassId] = useState("");
  const [termNumber,      setTermNumber]      = useState("1");
  const [academicYear,    setAcademicYear]    = useState(currentAcademicYear);
  const [isGenerating,    setIsGenerating]    = useState(false);
  const [progress,        setProgress]        = useState({ current: 0, total: 0 });
  const [isDone,          setIsDone]          = useState(false);

  // School-wide dates — still needed since they're not in the API
  const [closingDate, setClosingDate] = useState("");
  const [openingDate, setOpeningDate] = useState("");

  // Current report being painted into the off-screen slot
  const [currentReport,   setCurrentReport]   = useState(null);
  const [currentExamType, setCurrentExamType] = useState("");
  const paintResolveRef = useRef(null);

  const { slotRef, slotElement } = useOffscreenSlot();

  const { data: bulkData, isLoading, isError, error } =
    useClassTermReportCards(selectedClassId, termNumber, academicYear);

  const meta         = bulkData?.data;
  const selectedClass = classesData?.data?.find(
    (c) => String(c.id) === String(selectedClassId)
  );

  // Paint handshake — resolves after two rAF confirming DOM has painted
  useEffect(() => {
    if (!currentReport || !paintResolveRef.current) return;
    waitForPaint().then(() => {
      if (paintResolveRef.current) {
        paintResolveRef.current();
        paintResolveRef.current = null;
      }
    });
  }, [currentReport]);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setIsDone(false);
    setProgress({ current: 0, total: 0 });
  };

  const handleBulkDownload = async () => {
    if (!meta || meta.student_ids.length === 0) return;

    setIsGenerating(true);
    setIsDone(false);
    setProgress({ current: 0, total: meta.student_ids.length });

    const pdf        = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let   isFirst    = true;

    try {
      for (let i = 0; i < meta.student_ids.length; i++) {
        const studentId = meta.student_ids[i];
        setProgress({ current: i + 1, total: meta.student_ids.length });

        // Fetch this student's report card
        const token   = localStorage.getItem("token");
        const apiBase = import.meta.env.VITE_API_URL;
        const res     = await fetch(
          `${apiBase}/students/${studentId}/report-card?term_number=${termNumber}&academic_year=${encodeURIComponent(academicYear)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          console.warn(`Skipping student ${studentId} — ${res.status}`);
          continue;
        }

        const { data: reportData } = await res.json();

        // Paint into the off-screen slot and wait for two rAF
        await new Promise((resolve) => {
          paintResolveRef.current = resolve;
          // No classTeacherName — comes from reportData.class.teacher_name
          setCurrentReport(reportData);
          setCurrentExamType(`Term ${termNumber} — ${academicYear}`);
        });

        if (!slotRef.current) break;

        // Make visible briefly for html2canvas
        slotRef.current.style.visibility = "visible";

        const canvas = await html2canvas(slotRef.current, {
          scale:           2,
          useCORS:         true,
          allowTaint:      false,
          backgroundColor: "#ffffff",
          logging:         false,
          onclone: (clonedDoc) => {
            clonedDoc
              .querySelectorAll("style, link[rel='stylesheet']")
              .forEach((el) => el.remove());
            clonedDoc.body.style.background = "#ffffff";
            clonedDoc.body.style.margin     = "0";
            clonedDoc.body.style.padding    = "0";
          },
        });

        slotRef.current.style.visibility = "hidden";

        const imgData  = canvas.toDataURL("image/png");
        const imgW     = pageWidth;
        const imgH     = (canvas.height / canvas.width) * imgW;

        if (!isFirst) pdf.addPage();
        isFirst = false;

        let heightLeft = imgH;
        let position   = 0;
        pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
          heightLeft -= pageHeight;
        }
      }

      setCurrentReport(null);

      const filename = [
        meta.class.name.replace(/\s+/g, "-"),
        `Term${termNumber}`,
        academicYear.replace("/", "-"),
        "ReportCards.pdf",
      ].join("_");

      pdf.save(filename);
      toast.success(`Downloaded ${meta.student_ids.length} report cards`);
      setIsDone(true);
    } catch (err) {
      console.error(err);
      toast.error("Bulk download failed — check the console for details");
      setCurrentReport(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Portal ───────────────────────────────────────────────────────────────
  const offscreenPortal =
    slotElement && currentReport
      ? createPortal(
          <ReportCardDocument
            report={currentReport}
            examType={currentExamType}
            closingDate={closingDate || null}
            openingDate={openingDate || null}
            // No classTeacherName prop — already in currentReport.class.teacher_name
          />,
          slotElement
        )
      : null;

  return (
    <>
      {offscreenPortal}

      <div className="space-y-6">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={15} />
          </button>
          <PageHeader
            title="Bulk Report Card Download"
            description="Generate and download all learner report cards for a class as a single PDF"
          />
        </div>

        {/* ── Configuration card ────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#1a2744,#243355)" }}>
              <FileDown size={16} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Configure report batch</p>
              <p className="text-xs text-gray-500">Select the class, term, and year</p>
            </div>
          </div>

          {/* Filters grid */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField
              label="Class"
              value={selectedClassId}
              onChange={handleClassChange}
            >
              <option value="">Select class...</option>
              {classesData?.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SelectField>

            <SelectField
              label="Term"
              value={termNumber}
              onChange={(e) => { setTermNumber(e.target.value); setIsDone(false); }}
            >
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </SelectField>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Academic year</label>
              <input
                value={academicYear}
                onChange={(e) => { setAcademicYear(e.target.value); setIsDone(false); }}
                placeholder="2024/2025"
                className="input-field"
              />
            </div>
          </div>

          {/* Closing / opening dates */}
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                School closing date
                <span className="ml-1 text-gray-400 font-normal">(printed on each report)</span>
              </label>
              <input
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                placeholder="e.g. 14th November 2025"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                School re-opening date
                <span className="ml-1 text-gray-400 font-normal">(printed on each report)</span>
              </label>
              <input
                value={openingDate}
                onChange={(e) => setOpeningDate(e.target.value)}
                placeholder="e.g. 6th January 2026"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* ── Warning banner ────────────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-5">
            PDF generation runs entirely in your browser. Keep this tab open and active throughout the process.
            Large classes (30+ learners) may take 2–4 minutes.
          </p>
        </div>

        {/* ── Results area ──────────────────────────────────────────── */}
        {!selectedClassId ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 mb-4">
              <School size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No class selected</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Choose a class, term, and academic year above to begin generating report cards.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-14">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-red-700 mb-1">Failed to load class data</p>
            <p className="text-xs text-red-500">{error?.message}</p>
          </div>
        ) : meta ? (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

            {/* Class summary header */}
            <div className="px-5 py-4 border-b border-gray-100"
              style={{ background: "linear-gradient(135deg,#f8fafc,#fff)" }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-base font-black text-gray-900">{meta.class.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Term {meta.term_number} · {meta.academic_year}
                    {selectedClass?.class_teacher_name
                      ? ` · Class Teacher: ${selectedClass.class_teacher_name}`
                      : ""}
                  </p>
                </div>

                {/* Done badge */}
                {isDone && !isGenerating && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={13} /> Downloaded successfully
                  </div>
                )}
              </div>
            </div>

            {/* Stats chips */}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatChip
                icon={Users}
                label="Learners with results"
                value={meta.count}
                color="blue"
              />
              <StatChip
                icon={BookOpen}
                label="Term"
                value={`Term ${meta.term_number}`}
                color="purple"
              />
              <StatChip
                icon={CalendarDays}
                label="Academic year"
                value={meta.academic_year}
                color="green"
              />
              <StatChip
                icon={Clock}
                label="Est. time"
                value={meta.count > 30 ? "2–4 min" : meta.count > 15 ? "1–2 min" : "< 1 min"}
                color="amber"
              />
            </div>

            {/* Generation area */}
            <div className="px-5 pb-6">
              {isGenerating ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <div className="flex justify-center mb-5">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#1a2744,#243355)" }}>
                        <Loader2 size={24} className="animate-spin text-yellow-400" />
                      </div>
                    </div>
                  </div>
                  <ProgressBar current={progress.current} total={progress.total} />
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Please keep this tab open and active
                  </p>
                </div>
              ) : isDone ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                  <CheckCircle2 size={32} className="text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-800 mb-0.5">
                    All {meta.count} report cards downloaded
                  </p>
                  <p className="text-xs text-green-600 mb-4">
                    Saved as {meta.class.name.replace(/\s+/g, "-")}_Term{termNumber}_{academicYear.replace("/", "-")}_ReportCards.pdf
                  </p>
                  <button
                    onClick={() => { setIsDone(false); setProgress({ current: 0, total: 0 }); }}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    Download again
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleBulkDownload}
                  disabled={meta.count === 0}
                  className="btn-primary w-full justify-center py-3 text-sm"
                  style={meta.count > 0 ? { background: "linear-gradient(135deg,#1a2744,#243355)", boxShadow: "0 4px 14px rgba(26,39,68,0.25)" } : {}}
                >
                  <Download size={16} />
                  Download {meta.count} report card{meta.count !== 1 ? "s" : ""} as PDF
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}