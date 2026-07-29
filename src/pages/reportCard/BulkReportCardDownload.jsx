/* eslint-disable react-hooks/refs */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useClassTermReportCards } from "../../hooks/useClasses";
import { useClasses } from "../../hooks/useClasses";
import PageHeader from "../../components/ui/PageHeader";
import SelectField from "../../components/ui/SelectField";
import Spinner from "../../components/ui/spinner";
import ReportCardDocument from "./ReportCardDocument";

const currentAcademicYear = () => {
  const y = new Date().getFullYear();
  return new Date().getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
};

// ── Off-screen render slot ────────────────────────────────────────────────────
// A single persistent div that lives in document.body throughout the component's
// life. We render one report card at a time into it, wait for paint, capture,
// then swap in the next one. This is far more reliable than creating/destroying
// roots in a loop.
const useOffscreenSlot = () => {
  const slotRef = useRef(null);

  useEffect(() => {
    const div = document.createElement("div");
    div.style.cssText = [
      "position:fixed",
      "left:-9999px",
      "top:0",
      "width:794px", // match ReportCardDocument width
      "background:#fff",
      "z-index:-1",
      "pointer-events:none",
      "visibility:hidden", // hidden from user but still painted by browser
    ].join(";");
    document.body.appendChild(div);
    slotRef.current = div;

    return () => {
      if (slotRef.current) document.body.removeChild(slotRef.current);
    };
  }, []);

  return slotRef;
};

// ── Wait for next paint cycle ─────────────────────────────────────────────────
// requestAnimationFrame fires BEFORE paint, so we need two of them to ensure
// the DOM has actually been composited to screen before html2canvas reads it.
const waitForPaint = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );

// ── Capture a DOM element to canvas ──────────────────────────────────────────
const captureElement = async (element) => {
  // Temporarily make visible so html2canvas can compute styles
  element.style.visibility = "visible";

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    // Strip Tailwind stylesheets from the clone so oklch colors
    // don't crash html2canvas (same fix as single report card)
    onclone: (clonedDoc) => {
      clonedDoc
        .querySelectorAll('style, link[rel="stylesheet"]')
        .forEach((el) => el.remove());
      clonedDoc.body.style.background = "#ffffff";
      clonedDoc.body.style.margin = "0";
      clonedDoc.body.style.padding = "0";
    },
  });

  element.style.visibility = "hidden";
  return canvas;
};

export default function BulkReportCardDownload() {
  const navigate = useNavigate();
  const { data: classesData } = useClasses({ limit: 100 });

  const [selectedClassId, setSelectedClassId] = useState("");
  const [termNumber, setTermNumber] = useState("1");
  const [academicYear, setAcademicYear] = useState(currentAcademicYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [closingDate, setClosingDate] = useState("");
  const [openingDate, setOpeningDate] = useState("");
  const [classTeacherName, setClassTeacherName] = useState("");

  // Current report being rendered into the off-screen slot
  const [currentReport, setCurrentReport] = useState(null);
  const [currentExamType, setCurrentExamType] = useState("");

  // Resolves when the ReportCardDocument inside the slot has painted
  const paintResolveRef = useRef(null);

  const slotRef = useOffscreenSlot();

  const {
    data: bulkData,
    isLoading,
    isError,
    error,
  } = useClassTermReportCards(selectedClassId, termNumber, academicYear);

  const meta = bulkData?.data;

  // ── Effect: fires every time currentReport changes ────────────────────────
  // After React renders the new ReportCardDocument into the portal, we wait
  // for two paint frames and then resolve the promise the generator is
  // awaiting — at that point html2canvas can safely capture the element.
  useEffect(() => {
    if (!currentReport || !paintResolveRef.current) return;

    waitForPaint().then(() => {
      if (paintResolveRef.current) {
        paintResolveRef.current();
        paintResolveRef.current = null;
      }
    });
  }, [currentReport]);

  // ── Core generator ────────────────────────────────────────────────────────
  const handleBulkDownload = async () => {
    if (!meta || meta.student_ids.length === 0) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: meta.student_ids.length });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let isFirst = true;

    try {
      for (let i = 0; i < meta.student_ids.length; i++) {
        const studentId = meta.student_ids[i];
        setProgress({ current: i + 1, total: meta.student_ids.length });

        // 1. Fetch this student's term report card data
        const token = localStorage.getItem("token");
        const apiBase = import.meta.env.VITE_API_URL;
        const res = await fetch(
          `${apiBase}/students/${studentId}/term-report-card?term_number=${termNumber}&academic_year=${encodeURIComponent(academicYear)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok) {
          console.warn(
            `Skipping student ${studentId} — API returned ${res.status}`,
          );
          continue;
        }

        const { data: reportData } = await res.json();

        // 2. Render into the off-screen slot.
        //    We set state and then AWAIT a promise that resolves only after
        //    the useEffect above confirms two paint frames have elapsed.
        await new Promise((resolve) => {
          paintResolveRef.current = resolve;
          setCurrentReport(reportData);
          setCurrentExamType(`Term ${termNumber} — ${academicYear}`);
        });

        // 3. At this point the DOM is painted — safe to capture
        if (!slotRef.current) break;
        const canvas = await captureElement(slotRef.current);

        // 4. Add to PDF
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;

        if (!isFirst) pdf.addPage();
        isFirst = false;

        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      // 5. Clear the slot and save
      setCurrentReport(null);

      const filename = [
        meta.class.name,
        `Term${termNumber}`,
        academicYear.replace("/", "-"),
        "ReportCards.pdf",
      ].join("_");

      pdf.save(filename);
      toast.success(`Downloaded ${meta.student_ids.length} report cards`);
    } catch (err) {
      console.error("Bulk download error:", err);
      toast.error("Bulk download failed — check console for details");
      setCurrentReport(null);
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // ── Portal: renders the current report card into the off-screen slot ──────
 const offscreenPortal =
  slotRef.current && currentReport
    ? createPortal(
        <ReportCardDocument
          report={currentReport}
          examType={currentExamType}
          isTermReport={true}
          classTeacherName={classTeacherName || null}
          closingDate={closingDate || null}
          openingDate={openingDate || null}
        />,
        slotRef.current
      )
    : null;

  return (
    <>
      {/* The portal renders into document.body outside the normal React tree */}
      {offscreenPortal}

      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <PageHeader
          title="Bulk Report Card Download"
          description="Download all term report cards for a class as a single PDF"
        />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="sm:w-56">
            <SelectField
              label="Class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">Select class...</option>
              {classesData?.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="sm:w-32">
            <SelectField
              label="Term"
              value={termNumber}
              onChange={(e) => setTermNumber(e.target.value)}
            >
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </SelectField>
          </div>

          <div className="sm:w-36">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Academic year
            </label>
            <input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2024/2025"
              className="input-field"
            />
          </div>
          <div className="sm:w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Class teacher name
          </label>
          <input
            value={classTeacherName}
            onChange={(e) => setClassTeacherName(e.target.value)}
            placeholder="e.g. Mrs. Wanjiku"
            className="input-field"
          />
        </div>

        <div className="sm:w-44">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Closing date
          </label>
          <input
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
            placeholder="e.g. 14th November 2025"
            className="input-field"
          />
        </div>

        <div className="sm:w-44">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Re-opening date
          </label>
          <input
            value={openingDate}
            onChange={(e) => setOpeningDate(e.target.value)}
            placeholder="e.g. 6th January 2026"
            className="input-field"
          />
        </div>
        </div>

        {/* Safety warning */}
        <div className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            Bulk PDF generation runs in your browser tab. Keep this tab open and
            active during the download. Large classes may take 2–4 minutes.
          </span>
        </div>

        {/* Content area */}
        {!selectedClassId ? (
          <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-500">
            Select a class, term, and year to begin
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="bg-white border border-gray-200 rounded-lg py-10 text-center">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        ) : meta ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {meta.class.name}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Term {meta.term_number} · {meta.academic_year}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-medium text-gray-800">{meta.count}</span>{" "}
              students with results
            </p>

            {isGenerating ? (
              <div>
                <div className="flex justify-center mb-3">
                  <Loader2 size={24} className="animate-spin text-brand-600" />
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Generating report card {progress.current} of {progress.total}…
                </p>
                <div className="w-full max-w-xs mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Please keep this tab open and active
                </p>
              </div>
            ) : (
              <button
                onClick={handleBulkDownload}
                className="btn-primary justify-center"
              >
                <Download size={15} />
                Download all {meta.count} report cards as PDF
              </button>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
