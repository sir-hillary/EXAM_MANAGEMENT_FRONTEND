import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Phone,
  Mail,
  Users,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { useStudents, useDeleteStudent } from "../../hooks/useStudents";
import { useClasses } from "../../hooks/useClasses";
import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SelectField from "../../components/ui/SelectField";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { StudentFormModal } from "./StudentFormModal";
import { StudentAvatar } from "../../components/ui/StudentAvatar";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  navy: "#1a3a2a",
  navyLight: "#2d5a3e",
  gold: "#c9a84c",
  goldLight: "#e8cc85",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const genderBadge = {
  male: "bg-blue-50 text-blue-700 border-blue-100",
  female: "bg-pink-50 text-pink-700 border-pink-100",
  other: "bg-violet-50 text-violet-700 border-violet-100",
};

const roleLabel = {
  male: "Male",
  female: "Female",
  other: "Other",
};

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable UI pieces
// ─────────────────────────────────────────────────────────────────────────────

const ActionButton = ({ label, icon: Icon, variant = "default", onClick }) => {
  const variants = {
    default:
      "text-gray-400 hover:text-slate-700 hover:bg-gray-100",
    danger:
      "text-gray-400 hover:text-red-600 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-2 rounded-lg transition-all duration-150 ${variants[variant]}`}
    >
      <Icon size={15} strokeWidth={2} />
    </button>
  );
};

const GenderBadge = ({ gender }) => {
  if (!gender) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${
        genderBadge[gender] || "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {roleLabel[gender] || gender}
    </span>
  );
};

const StudentNumber = ({ number }) => (
  <span
    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide"
    style={{
      color: COLORS.navy,
      background: "rgba(26,58,42,0.06)",
      border: "1px solid rgba(26,58,42,0.08)",
    }}
  >
    {number}
  </span>
);

const ParentContact = ({ student }) => {
  const hasPhone = Boolean(student.parent_phone);
  const hasEmail = Boolean(student.parent_email);

  if (!hasPhone && !hasEmail) {
    return (
      <span className="text-xs text-gray-400">
        No contact information
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      {hasPhone && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-50">
            <Phone size={10} className="text-gray-400" />
          </span>
          <span className="truncate">{student.parent_phone}</span>
        </div>
      )}

      {hasEmail && (
        <div className="flex items-center gap-2 text-xs text-gray-500 max-w-[220px]">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-50 shrink-0">
            <Mail size={10} className="text-gray-400" />
          </span>
          <span className="truncate">{student.parent_email}</span>
        </div>
      )}
    </div>
  );
};

const EmptyStudents = () => (
  <div className="bg-white border border-gray-200 rounded-2xl py-14 px-6 text-center">
    <div
      className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
      style={{
        background: "rgba(201,168,76,0.12)",
        color: COLORS.gold,
      }}
    >
      <Users size={25} />
    </div>

    <h3 className="text-sm font-bold text-gray-900 mb-1">
      No students found
    </h3>

    <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
      There are no students matching your current search or class filter.
      Try adjusting your filters or add a new student.
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Desktop table
// ─────────────────────────────────────────────────────────────────────────────

const StudentTable = ({
  students,
  onEdit,
  onDelete,
}) => (
  <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(26,58,42,0.04)]">
    <table className="w-full text-sm">
      <thead>
        <tr
          className="border-b"
          style={{
            background: "#fafcfb",
            borderColor: "#edf1ee",
          }}
        >
          <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
            Student
          </th>

          <th className="text-left px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
            Admission No.
          </th>

          <th className="text-left px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
            Class
          </th>

          <th className="text-left px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
            Parent contact
          </th>

          <th className="text-left px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
            Gender
          </th>

          <th className="px-5 py-3.5" />
        </tr>
      </thead>

      <tbody>
        {students.map((student) => (
          <tr
            key={student.id}
            className="border-b border-gray-50 last:border-0 hover:bg-[#fbfdfc] transition-colors"
          >
            {/* Student */}
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <StudentAvatar student={student} size="sm" />

                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 leading-tight truncate">
                    {student.first_name} {student.last_name}
                  </p>

                  {student.parent_name && (
                    <p className="text-[11px] text-gray-400 mt-1 truncate">
                      Parent: {student.parent_name}
                    </p>
                  )}
                </div>
              </div>
            </td>

            {/* Admission */}
            <td className="px-4 py-3.5">
              <StudentNumber number={student.student_number} />
            </td>

            {/* Class */}
            <td className="px-4 py-3.5">
              {student.class_name ? (
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-lg"
                    style={{
                      background: "rgba(26,58,42,0.06)",
                      color: COLORS.navyLight,
                    }}
                  >
                    <GraduationCap size={13} />
                  </span>

                  <span className="text-sm text-gray-700">
                    {student.class_name}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">
                  No class assigned
                </span>
              )}
            </td>

            {/* Parent contact */}
            <td className="px-4 py-3.5">
              <ParentContact student={student} />
            </td>

            {/* Gender */}
            <td className="px-4 py-3.5">
              <GenderBadge gender={student.gender} />
            </td>

            {/* Actions */}
            <td className="px-5 py-3.5">
              <div className="flex items-center justify-end gap-1">
                <ActionButton
                  label="Edit student"
                  icon={Pencil}
                  onClick={() => onEdit(student)}
                />

                <ActionButton
                  label="Delete student"
                  icon={Trash2}
                  variant="danger"
                  onClick={() => onDelete(student)}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Mobile cards
// ─────────────────────────────────────────────────────────────────────────────

const StudentMobileCard = ({
  student,
  onEdit,
  onDelete,
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-[0_2px_10px_rgba(26,58,42,0.03)]">
    <div className="flex items-start gap-3">
      <StudentAvatar student={student} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 leading-tight truncate">
              {student.first_name} {student.last_name}
            </p>

            <div className="mt-1.5">
              <StudentNumber number={student.student_number} />
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <ActionButton
              label="Edit student"
              icon={Pencil}
              onClick={() => onEdit(student)}
            />

            <ActionButton
              label="Delete student"
              icon={Trash2}
              variant="danger"
              onClick={() => onDelete(student)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <GraduationCap
            size={12}
            style={{ color: COLORS.gold }}
          />

          <span className="text-xs text-gray-500">
            {student.class_name || "No class assigned"}
          </span>
        </div>
      </div>
    </div>

    {(student.parent_phone ||
      student.parent_email ||
      student.gender) && (
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2">
        {student.parent_phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Phone size={11} className="text-gray-400" />
            {student.parent_phone}
          </div>
        )}

        {student.parent_email && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 max-w-full">
            <Mail size={11} className="text-gray-400 shrink-0" />
            <span className="truncate">{student.parent_email}</span>
          </div>
        )}

        {student.gender && (
          <GenderBadge gender={student.gender} />
        )}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

const Pagination = ({ meta, page, setPage }) => {
  if (!meta || meta.total_pages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-5 px-1">
      <div className="hidden sm:block">
        <p className="text-xs text-gray-400">
          Page{" "}
          <span className="font-semibold text-gray-600">
            {meta.page}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-600">
            {meta.total_pages}
          </span>
        </p>

        <p className="text-[11px] text-gray-400 mt-0.5">
          {meta.total} students total
        </p>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={13} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div
          className="px-3 py-2 rounded-lg text-xs font-bold"
          style={{
            background: "rgba(26,58,42,0.07)",
            color: COLORS.navy,
          }}
        >
          {page}
        </div>

        <button
          type="button"
          disabled={page >= meta.total_pages}
          onClick={() => setPage((p) => p + 1)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const Students = () => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── API hooks — unchanged ────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useStudents({
    search: search || undefined,
    class_id: classFilter || undefined,
    page,
    limit: 20,
  });

  const { data: classesData } = useClasses({ limit: 100 });

  const deleteStudent = useDeleteStudent();

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleDeleteStudent = (student) => {
    setDeleteTarget(student);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleClassChange = (e) => {
    setClassFilter(e.target.value);
    setPage(1);
  };

  const students = data?.data || [];

  return (
    <div className="pb-6">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <PageHeader
        title="Students"
        description="Manage student enrollment and parent contact information"
        action={
          <button
            type="button"
            onClick={handleAddStudent}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Plus size={15} />
            Add student
          </button>
        }
      />

      {/* ── Search / filters ────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 mb-5 shadow-[0_2px_10px_rgba(26,58,42,0.03)]">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name or admission number..."
              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/5"
            />
          </div>

          {/* Class filter */}
          <SelectField
            value={classFilter}
            onChange={handleClassChange}
            className="sm:w-52"
          >
            <option value="">All classes</option>

            {classesData?.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      {/* ── Results summary ─────────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: COLORS.gold }}
            />

            <p className="text-xs font-semibold text-gray-600">
              {data?.meta?.total ?? students.length}{" "}
              {data?.meta?.total === 1 ? "student" : "students"}
            </p>
          </div>

          {(search || classFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setClassFilter("");
                setPage(1);
              }}
              className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : isError ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-4">
          <p className="text-sm font-semibold text-red-700">
            Unable to load students
          </p>

          <p className="text-xs text-red-500 mt-1">
            {error?.message || "Something went wrong while loading students."}
          </p>
        </div>
      ) : students.length === 0 ? (
        <EmptyStudents />
      ) : (
        <>
          {/* Desktop */}
          <StudentTable
            students={students}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {students.map((student) => (
              <StudentMobileCard
                key={student.id}
                student={student}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            meta={data?.meta}
            page={page}
            setPage={setPage}
          />
        </>
      )}

      {/* ── Student form ─────────────────────────────────────────────────── */}
      <StudentFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingStudent}
      />

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteStudent.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Student deleted");
              setDeleteTarget(null);
            },
            onError: (err) => {
              toast.error(err?.message || "Delete failed");
            },
          })
        }
        title="Delete student"
        message={`Delete "${deleteTarget?.first_name} ${deleteTarget?.last_name}"? Students with existing results cannot be deleted.`}
        isLoading={deleteStudent.isPending}
      />
    </div>
  );
};

export default Students;