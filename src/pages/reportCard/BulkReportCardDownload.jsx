/* eslint-disable no-unused-vars */
import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClassTermReportCards } from '../../hooks/useClasses';
import { useStudentTermReportCard } from '../../hooks/useStudents';
import { useClasses } from '../../hooks/useClasses';
import  PageHeader  from '../../components/ui/PageHeader';
import  SelectField  from '../../components/ui/SelectField';
import  Spinner  from '../../components/ui/spinner';
import { ReportCardDocument } from '../reportcard/ReportCardDocument';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const currentAcademicYear = () => {
  const y = new Date().getFullYear();
  return new Date().getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
};

// Single student report card — rendered offscreen for capture
const OffscreenReport = ({ studentId, termNumber, academicYear, onReady }) => {
  const { data } = useStudentTermReportCard(studentId, termNumber, academicYear);
  if (data?.data) onReady(studentId, data.data);
  return null;
};

export const BulkReportCardDownload = ()=> {
  const navigate  = useNavigate();
  const { data: classesData } = useClasses({ limit: 100 });

  const [selectedClassId, setSelectedClassId] = useState('');
  const [termNumber,      setTermNumber]      = useState('1');
  const [academicYear,    setAcademicYear]    = useState(currentAcademicYear);
  const [isGenerating,    setIsGenerating]    = useState(false);
  const [progress,        setProgress]        = useState({ current: 0, total: 0 });

  const { data: bulkData, isLoading, isError, error } =
    useClassTermReportCards(selectedClassId, termNumber, academicYear);

  const meta = bulkData?.data;

  const handleBulkDownload = async () => {
    if (!meta || meta.student_ids.length === 0) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: meta.student_ids.length });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let isFirst = true;

    try {
      for (let i = 0; i < meta.student_ids.length; i++) {
        const studentId = meta.student_ids[i];
        setProgress({ current: i + 1, total: meta.student_ids.length });

        // Fetch this student's report data
        const res = await fetch(
          `/api/students/${studentId}/term-report-card?term_number=${termNumber}&academic_year=${academicYear}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!res.ok) continue;
        const { data: reportData } = await res.json();

        // Render to a temporary DOM node
        const container = document.createElement('div');
        container.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;background:#fff';
        document.body.appendChild(container);

        // Dynamically render the report card into the container
        const { createRoot } = await import('react-dom/client');
        const root = createRoot(container);

        await new Promise(resolve => {
          root.render(
            <ReportCardDocument
              report={reportData}
              examType={`Term ${termNumber} — ${academicYear}`}
              isTermReport={true}
            />
          );
          // Give React time to paint
          setTimeout(resolve, 800);
        });

        const canvas = await html2canvas(container, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (doc) => {
            doc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
          },
        });

        root.unmount();
        document.body.removeChild(container);

        const imgData  = canvas.toDataURL('image/png');
        const imgW     = pageWidth;
        const imgH     = (canvas.height / canvas.width) * imgW;

        if (!isFirst) pdf.addPage();
        isFirst = false;

        let heightLeft = imgH;
        let position   = 0;
        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
          heightLeft -= pageHeight;
        }
      }

      const filename = `${meta.class.name}_Term${termNumber}_${academicYear.replace('/', '-')}_ReportCards.pdf`;
      pdf.save(filename);
      toast.success(`Downloaded ${meta.student_ids.length} report cards`);
    } catch (err) {
      console.error(err);
      toast.error('Bulk download failed — try again or download individually');
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
        <ArrowLeft size={14} /> Back
      </button>

      <PageHeader
        title="Bulk Report Card Download"
        description="Download all term report cards for a class as a single PDF"
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="sm:w-56">
          <SelectField label="Class" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
            <option value="">Select class...</option>
            {classesData?.data?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </SelectField>
        </div>

        <div className="sm:w-32">
          <SelectField label="Term" value={termNumber} onChange={e => setTermNumber(e.target.value)}>
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </SelectField>
        </div>

        <div className="sm:w-36">
          <label className="block text-xs font-medium text-gray-600 mb-1">Academic year</label>
          <input value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="2024/2025" className="input-field" />
        </div>
      </div>

      {/* Safety warning */}
      <div className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        <span>Bulk PDF generation runs in your browser tab. Keep this tab open and active during download. Large classes (30+ students) may take 1–3 minutes.</span>
      </div>

      {!selectedClassId ? (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-sm text-gray-500">
          Select a class, term, and year to begin
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="bg-white border border-gray-200 rounded-lg py-10 text-center">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      ) : meta ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-lg font-semibold text-gray-900 mb-1">{meta.class.name}</p>
          <p className="text-sm text-gray-500 mb-1">Term {meta.term_number} · {meta.academic_year}</p>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-medium text-gray-800">{meta.count}</span> students with results
          </p>

          {isGenerating ? (
            <div>
              <div className="flex justify-center mb-3"><Loader2 size={24} className="animate-spin text-brand-600" /></div>
              <p className="text-sm text-gray-600 mb-2">
                Generating report card {progress.current} of {progress.total}...
              </p>
              <div className="w-full max-w-xs mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <button onClick={handleBulkDownload} className="btn-primary justify-center">
              <Download size={15} />
              Download all {meta.count} report cards as PDF
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}