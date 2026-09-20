import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Save, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTimetable, useUpsertPeriod, useDeletePeriod } from '../../hooks/useTimetable';
import { useClasses } from '../../hooks/useClasses';
import { useSubjects } from '../../hooks/useSubjects';
import { useTeachers } from '../../hooks/useTeachers';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/spinner';

const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { number: 1, label: 'Period 1', default_start: '08:00', default_end: '08:40' },
  { number: 2, label: 'Period 2', default_start: '08:40', default_end: '09:20' },
  { number: 3, label: 'Period 3', default_start: '09:20', default_end: '10:00' },
  { number: 4, label: 'Break',    default_start: '10:00', default_end: '10:20', isBreak: true },
  { number: 5, label: 'Period 4', default_start: '10:20', default_end: '11:00' },
  { number: 6, label: 'Period 5', default_start: '11:00', default_end: '11:40' },
  { number: 7, label: 'Period 6', default_start: '11:40', default_end: '12:20' },
  { number: 8, label: 'Lunch',    default_start: '12:20', default_end: '13:00', isBreak: true },
  { number: 9, label: 'Period 7', default_start: '13:00', default_end: '13:40' },
  { number: 10, label: 'Period 8', default_start: '13:40', default_end: '14:20' },
];

// Subject colour palette — cycles by subject id
const SUBJECT_COLORS = [
  { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  { bg: '#fdf4ff', border: '#e9d5ff', text: '#7e22ce' },
  { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
  { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' },
  { bg: '#fefce8', border: '#fde68a', text: '#b45309' },
  { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' },
];

const getSubjectColor = (subjectId) => SUBJECT_COLORS[(subjectId || 0) % SUBJECT_COLORS.length];

// ── Period cell ───────────────────────────────────────────────────────────────
const PeriodCell = ({ entry, isBreak, onEdit, canEdit }) => {
  if (isBreak) {
    return (
      <td className="border border-gray-100 bg-gray-50 px-2 py-2 text-center">
        <span className="text-xs text-gray-400 font-medium">—</span>
      </td>
    );
  }

  if (!entry) {
    return (
      <td
        className={`border border-gray-100 px-2 py-2 text-center align-middle ${canEdit ? 'cursor-pointer hover:bg-blue-50/40 transition-colors group' : ''}`}
        onClick={canEdit ? onEdit : undefined}
      >
        {canEdit && (
          <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors select-none">
            + Add
          </span>
        )}
      </td>
    );
  }

  const col = getSubjectColor(entry.subject_id);

  return (
    <td
      className={`border border-gray-100 p-1.5 align-top ${canEdit ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={canEdit ? onEdit : undefined}
    >
      <div
        className="rounded-lg px-2 py-1.5 h-full"
        style={{ background: col.bg, borderLeft: `3px solid ${col.border}` }}
      >
        <p className="text-xs font-bold leading-tight" style={{ color: col.text }}>
          {entry.subject_code || entry.subject_name?.split(' ').map(w => w[0]).join('') || '?'}
        </p>
        <p className="text-xs leading-tight mt-0.5 truncate" style={{ color: col.text, opacity: 0.8 }}>
          {entry.subject_name || 'Unknown'}
        </p>
        {entry.teacher_name && (
          <p className="text-xs leading-tight mt-0.5 text-gray-500 truncate">{entry.teacher_name}</p>
        )}
        {entry.room && (
          <p className="text-xs text-gray-400 mt-0.5">{entry.room}</p>
        )}
      </div>
    </td>
  );
};

// ── Period edit modal ─────────────────────────────────────────────────────────
const PeriodModal = ({ isOpen, onClose, classId, day, period, entry }) => {
  const { data: subjectsData } = useSubjects({ limit: 100 });
  const { data: teachersData  } = useTeachers({ limit: 100 });
  const upsert = useUpsertPeriod(classId);
  const remove = useDeletePeriod(classId);

  const [form, setForm] = useState({
    subject_id:  entry?.subject_id  || '',
    teacher_id:  entry?.teacher_id  || '',
    start_time:  entry?.start_time  || period?.default_start || '',
    end_time:    entry?.end_time    || period?.default_end   || '',
    room:        entry?.room        || '',
    notes:       entry?.notes       || '',
  });

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({
        day_of_week: day,
        period:      period.number,
        subject_id:  form.subject_id  || null,
        teacher_id:  form.teacher_id  || null,
        start_time:  form.start_time,
        end_time:    form.end_time,
        room:        form.room  || null,
        notes:       form.notes || null,
      });
      onClose();
    } catch { /* empty */ }
  };

  const handleClear = async () => {
    try {
      await remove.mutateAsync({ day_of_week: day, period: period.number });
      onClose();
    } catch { /* empty */ }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${day} · ${period?.label}`}
      maxWidth="max-w-sm"
    >
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
          <select className="input-field" value={form.subject_id} onChange={set('subject_id')}>
            <option value="">Free period / Not set</option>
            {subjectsData?.data?.filter(s => !s.parent_subject_id && !s.is_split_paper).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Teacher</label>
          <select className="input-field" value={form.teacher_id} onChange={set('teacher_id')}>
            <option value="">Not specified</option>
            {teachersData?.data?.map(t => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start time</label>
            <input type="time" className="input-field" value={form.start_time} onChange={set('start_time')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End time</label>
            <input type="time" className="input-field" value={form.end_time} onChange={set('end_time')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Room / Venue</label>
          <input className="input-field" placeholder="e.g. Room 4, Library..." value={form.room} onChange={set('room')} />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-gray-100">
          {entry && (
            <button
              type="button"
              onClick={handleClear}
              disabled={remove.isPending}
              className="btn-danger w-full sm:w-auto justify-center text-xs"
            >
              <X size={13} /> Clear period
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto justify-center">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={upsert.isPending}
            className="btn-primary w-full sm:w-auto justify-center sm:ml-auto"
          >
            <Save size={13} /> {upsert.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Main timetable page ───────────────────────────────────────────────────────
const ClassTimetable = () => {
  const { classId } = useParams();
  const navigate    = useNavigate();
  const { role, user } = useAuth();

  const { data: timetableData, isLoading } = useTimetable(classId);
  const { data: classesData }               = useClasses();

  const [editing, setEditing] = useState(null); // { day, period }

  const classInfo = classesData?.data?.find(c => String(c.id) === String(classId));

  // Can the current user edit this timetable?
  const canEdit = role === 'admin' ||
    (role === 'teacher' && classInfo?.class_teacher_id === user?.teacher_id);

  const grid = timetableData?.data?.grid ?? {};

  const getEntry = (day, periodNum) => grid[day]?.[periodNum] ?? null;

  const editingPeriod  = editing ? PERIODS.find(p => p.number === editing.period) : null;
  const editingEntry   = editing ? getEntry(editing.day, editing.period) : null;

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/classes')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Back to classes
      </button>

      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-900">
          {classInfo?.name || 'Class'} — Timetable
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {classInfo?.class_teacher_name
            ? `Class teacher: ${classInfo.class_teacher_name}`
            : 'No class teacher assigned'}
          {canEdit && <span className="ml-2 text-blue-600 font-medium">· Click any cell to edit</span>}
        </p>
      </div>

      {/* ── Desktop/tablet grid ───────────────────────────────────────── */}
      <div className="hidden sm:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '640px' }}>
            <thead>
              <tr style={{ background: '#1a2744' }}>
                <th className="px-3 py-2.5 text-left" style={{ width: '90px', minWidth: '90px' }}>
                  <span className="text-xs font-semibold" style={{ color: '#c9a84c', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Period
                  </span>
                </th>
                {DAYS.map(day => (
                  <th key={day} className="px-2 py-2.5 text-center">
                    <span className="text-xs font-semibold" style={{ color: '#c9a84c', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      {day.slice(0, 3)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period.number} style={{ background: period.isBreak ? '#f8fafc' : '#fff' }}>
                  {/* Period label cell */}
                  <td className="border border-gray-100 px-3 py-2 align-top" style={{ minWidth: '90px' }}>
                    <p className={`text-xs font-semibold ${period.isBreak ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                      {period.label}
                    </p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Clock size={9} className="text-gray-300" />
                      <span className="text-xs text-gray-400">
                        {period.default_start}–{period.default_end}
                      </span>
                    </div>
                  </td>

                  {DAYS.map(day => (
                    <PeriodCell
                      key={day}
                      entry={period.isBreak ? null : getEntry(day, period.number)}
                      isBreak={period.isBreak}
                      canEdit={canEdit && !period.isBreak}
                      onEdit={() => setEditing({ day, period: period.number })}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile: day-by-day accordion ─────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {DAYS.map(day => (
          <details key={day} className="bg-white border border-gray-200 rounded-xl overflow-hidden" open={day === 'Monday'}>
            <summary
              className="px-4 py-3 font-semibold text-sm text-gray-900 cursor-pointer list-none flex items-center justify-between"
              style={{ background: '#f8fafc' }}
            >
              {day}
              <span className="text-xs text-gray-400 font-normal">
                {PERIODS.filter(p => !p.isBreak && getEntry(day, p.number)).length} lessons
              </span>
            </summary>
            <div className="divide-y divide-gray-50">
              {PERIODS.map(period => {
                const entry = period.isBreak ? null : getEntry(day, period.number);
                const col   = entry ? getSubjectColor(entry.subject_id) : null;

                if (period.isBreak) {
                  return (
                    <div key={period.number} className="px-4 py-2 bg-gray-50">
                      <p className="text-xs text-gray-400 italic">{period.label} — {period.default_start}–{period.default_end}</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={period.number}
                    className={`flex items-start gap-3 px-4 py-3 ${canEdit ? 'cursor-pointer active:bg-gray-50' : ''}`}
                    onClick={canEdit ? () => setEditing({ day, period: period.number }) : undefined}
                  >
                    <div className="shrink-0 w-16">
                      <p className="text-xs font-semibold text-gray-600">{period.label}</p>
                      <p className="text-xs text-gray-400">{period.default_start}</p>
                    </div>
                    {entry ? (
                      <div
                        className="flex-1 rounded-lg px-3 py-2"
                        style={{ background: col.bg, borderLeft: `3px solid ${col.border}` }}
                      >
                        <p className="text-xs font-bold" style={{ color: col.text }}>{entry.subject_name}</p>
                        {entry.teacher_name && <p className="text-xs text-gray-500 mt-0.5">{entry.teacher_name}</p>}
                        {entry.room && <p className="text-xs text-gray-400">{entry.room}</p>}
                      </div>
                    ) : (
                      <div className="flex-1 rounded-lg px-3 py-2 border border-dashed border-gray-200">
                        {canEdit
                          ? <p className="text-xs text-gray-400">Tap to add a lesson</p>
                          : <p className="text-xs text-gray-300">Empty</p>
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        <p className="text-xs text-gray-400 w-full mb-1 font-medium">Colour key:</p>
        {(timetableData?.data?.periods ?? [])
          .filter((p, i, arr) => arr.findIndex(x => x.subject_id === p.subject_id) === i)
          .slice(0, 8)
          .map(p => {
            const col = getSubjectColor(p.subject_id);
            return (
              <div key={p.subject_id} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: col.bg, border: `2px solid ${col.border}` }} />
                <span className="text-xs text-gray-600">{p.subject_name}</span>
              </div>
            );
          })
        }
      </div>

      {/* Edit modal */}
      {editing && (
        <PeriodModal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          classId={classId}
          day={editing.day}
          period={editingPeriod}
          entry={editingEntry}
        />
      )}
    </div>
  );
};

export default ClassTimetable;