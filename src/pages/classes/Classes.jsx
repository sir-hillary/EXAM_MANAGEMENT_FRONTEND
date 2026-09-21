import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  CalendarDays,
  Users,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useClasses,
  useDeleteClass,
} from "../../hooks/useClasses";
import { useAuth } from "../../context/AuthContext";

import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ClassFormModal from "./ClassFormModal";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { getDivision } from "../../utils/schoolDivisions";
import { TeacherAvatar } from "../../components/ui/TeacherAvatar";

/* ─────────────────────────────────────────────
   Capacity bar
───────────────────────────────────────────── */

const CapacityBar = ({ count = 0, capacity }) => {
  if (!capacity) {
    return (
      <span className="text-xs font-medium text-gray-500">
        {count} students
      </span>
    );
  }

  const percentage = Math.min(
    Math.round((Number(count) / Number(capacity)) * 100),
    100
  );

  const barColor =
    percentage >= 90
      ? "#dc2626"
      : percentage >= 75
      ? "#d97706"
      : "#15803d";

  return (
    <div className="flex min-w-32.5 items-center gap-2.5">
      <span className="w-16 shrink-0 text-xs font-medium text-gray-700">
        {count}/{capacity}
      </span>

      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      <span className="w-9 text-right text-[10px] font-medium text-gray-400">
        {percentage}%
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Normalize class teacher data
───────────────────────────────────────────── */

const getClassTeacher = (classItem) => {
  if (!classItem?.class_teacher_id || !classItem?.class_teacher_name) {
    return null;
  }

  const fullName = classItem.class_teacher_name.trim();
  const nameParts = fullName.split(/\s+/);

  return {
    id: classItem.class_teacher_id,
    first_name: nameParts[0] || "",
    last_name: nameParts.slice(1).join(" "),
    profile_photo_url: classItem.teacher_photo_url,
    designation: classItem.teacher_designation,
    is_active: true,
  };
};

/* ─────────────────────────────────────────────
   Action button
───────────────────────────────────────────── */

const ActionButton = ({
  label,
  onClick,
  children,
  tone = "default",
}) => {
  const toneClasses = {
    default:
      "text-gray-400 hover:bg-gray-100 hover:text-gray-700",
    timetable:
      "text-gray-400 hover:bg-purple-50 hover:text-purple-600",
    performance:
      "text-gray-400 hover:bg-blue-50 hover:text-blue-600",
    edit:
      "text-gray-400 hover:bg-blue-50 hover:text-blue-600",
    delete:
      "text-gray-400 hover:bg-red-50 hover:text-red-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-lg p-1.5 transition-colors ${
        toneClasses[tone] || toneClasses.default
      }`}
    >
      {children}
    </button>
  );
};

/* ─────────────────────────────────────────────
   Classes page
───────────────────────────────────────────── */

const Classes = () => {
  const { role } = useAuth();

  const isAdmin = role === "admin";
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useClasses();

  const deleteClass = useDeleteClass();

  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ───────────────────────────────────────────
     Loading
  ─────────────────────────────────────────── */

  if (isLoading) {
    return <TableSkeleton rows={6} cols={6} />;
  }

  /* ───────────────────────────────────────────
     Error
  ─────────────────────────────────────────── */

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-medium text-red-700">
          Failed to load classes
        </p>

        <p className="mt-1 text-xs text-red-600">
          {error?.response?.data?.error ||
            error?.message ||
            "Something went wrong while loading classes."}
        </p>
      </div>
    );
  }

  const classes = data?.data ?? [];

  /* ───────────────────────────────────────────
     Handlers
  ─────────────────────────────────────────── */

  const openCreateModal = () => {
    setEditingClass(null);
    setFormOpen(true);
  };

  const openEditModal = (classItem) => {
    setEditingClass(classItem);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setEditingClass(null);
  };

  const openTimetable = (classId) => {
    navigate(`/classes/${classId}/timetable`);
  };

  const openPerformance = (classId) => {
    navigate(`/classes/${classId}/performance`);
  };

  /* ───────────────────────────────────────────
     Render
  ─────────────────────────────────────────── */

  return (
    <div className="space-y-5">
      <PageHeader
        title="Classes"
        description={
          isAdmin
            ? "Manage classes, class teachers and enrolment"
            : "View your assigned class"
        }
        action={
          isAdmin && (
            <button
              type="button"
              onClick={openCreateModal}
              className="btn-primary flex w-full items-center justify-center gap-1.5 sm:w-auto"
            >
              <Plus size={15} />
              New class
            </button>
          )
        }
      />

      {/* ─────────────────────────────────────────
          Empty state
      ───────────────────────────────────────── */}

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-5 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <Users
              size={24}
              className="text-gray-300"
            />
          </div>

          <p className="text-sm font-medium text-gray-700">
            {isAdmin
              ? "No classes yet"
              : "No class assigned to you"}
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs text-gray-400">
            {isAdmin
              ? "Create your first class to start managing learners, teachers and class activities."
              : "You will see your class here once you have been assigned as a class teacher."}
          </p>

          {isAdmin && (
            <button
              type="button"
              onClick={openCreateModal}
              className="btn-primary mt-4 inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Create class
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ─────────────────────────────────────
              Desktop table
          ───────────────────────────────────── */}

          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Class
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Division
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Class teacher
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Enrolment
                    </th>

                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Boys
                    </th>

                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Girls
                    </th>

                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {classes.map((classItem) => {
                    const division = getDivision(
                      classItem.grade
                    );

                    const classTeacher =
                      getClassTeacher(classItem);

                    return (
                      <tr
                        key={classItem.id}
                        className="group transition-colors hover:bg-gray-50/60"
                      >
                        {/* Class */}
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {classItem.name}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              Grade {classItem.grade}
                            </p>
                          </div>
                        </td>

                        {/* Division */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`badge ${division.color}`}
                          >
                            {division.label}
                          </span>
                        </td>

                        {/* Class teacher */}
                        <td className="px-4 py-3.5">
                          {classTeacher ? (
                            <div className="flex items-center gap-2.5">
                              <TeacherAvatar
                                teacher={classTeacher}
                                size="sm"
                                showStatus
                              />

                              <div className="min-w-0">
                                <p className="max-w-45 truncate text-sm font-medium text-gray-800">
                                  {
                                    classItem.class_teacher_name
                                  }
                                </p>

                                {classItem.teacher_designation &&
                                  classItem.teacher_designation !==
                                    "teacher" && (
                                    <p className="mt-0.5 text-[11px] text-gray-400">
                                      {classItem.teacher_designation ===
                                      "headteacher"
                                        ? "Head Teacher"
                                        : "Deputy Head Teacher"}
                                    </p>
                                  )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <UserCheck
                                size={14}
                                className="shrink-0"
                              />

                              <span className="text-xs">
                                Unassigned
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Enrolment */}
                        <td className="px-4 py-3.5">
                          <CapacityBar
                            count={
                              classItem.student_count ?? 0
                            }
                            capacity={classItem.capacity}
                          />
                        </td>

                        {/* Boys */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-600">
                            {classItem.boys ?? 0}
                          </span>
                        </td>

                        {/* Girls */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-pink-50 px-2 py-1 text-sm font-semibold text-pink-600">
                            {classItem.girls ?? 0}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-0.5 opacity-80 transition-opacity group-hover:opacity-100">
                            <ActionButton
                              label="View timetable"
                              tone="timetable"
                              onClick={() =>
                                openTimetable(
                                  classItem.id
                                )
                              }
                            >
                              <CalendarDays size={15} />
                            </ActionButton>

                            <ActionButton
                              label="View performance"
                              tone="performance"
                              onClick={() =>
                                openPerformance(
                                  classItem.id
                                )
                              }
                            >
                              <BarChart3 size={15} />
                            </ActionButton>

                            {isAdmin && (
                              <>
                                <ActionButton
                                  label="Edit class"
                                  tone="edit"
                                  onClick={() =>
                                    openEditModal(
                                      classItem
                                    )
                                  }
                                >
                                  <Pencil size={15} />
                                </ActionButton>

                                <ActionButton
                                  label="Delete class"
                                  tone="delete"
                                  onClick={() =>
                                    setDeleteTarget(
                                      classItem
                                    )
                                  }
                                >
                                  <Trash2 size={15} />
                                </ActionButton>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─────────────────────────────────────
              Mobile cards
          ───────────────────────────────────── */}

          <div className="space-y-3 md:hidden">
            {classes.map((classItem) => {
              const division = getDivision(
                classItem.grade
              );

              const classTeacher =
                getClassTeacher(classItem);

              return (
                <div
                  key={classItem.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-900">
                        {classItem.name}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`badge ${division.color}`}
                        >
                          {division.label}
                        </span>

                        <span className="text-xs text-gray-400">
                          Grade {classItem.grade}
                        </span>
                      </div>
                    </div>

                    {/* Mobile actions */}
                    <div className="flex shrink-0 items-center gap-0.5">
                      <ActionButton
                        label="View timetable"
                        tone="timetable"
                        onClick={() =>
                          openTimetable(classItem.id)
                        }
                      >
                        <CalendarDays size={14} />
                      </ActionButton>

                      <ActionButton
                        label="View performance"
                        tone="performance"
                        onClick={() =>
                          openPerformance(classItem.id)
                        }
                      >
                        <BarChart3 size={14} />
                      </ActionButton>

                      {isAdmin && (
                        <>
                          <ActionButton
                            label="Edit class"
                            tone="edit"
                            onClick={() =>
                              openEditModal(classItem)
                            }
                          >
                            <Pencil size={14} />
                          </ActionButton>

                          <ActionButton
                            label="Delete class"
                            tone="delete"
                            onClick={() =>
                              setDeleteTarget(classItem)
                            }
                          >
                            <Trash2 size={14} />
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Teacher */}
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    {classTeacher ? (
                      <div className="flex items-center gap-2.5">
                        <TeacherAvatar
                          teacher={classTeacher}
                          size="sm"
                          showStatus
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {classItem.class_teacher_name}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {classItem.teacher_designation
                              ? classItem.teacher_designation ===
                                "headteacher"
                                ? "Head Teacher"
                                : classItem.teacher_designation ===
                                  "deputy_headteacher"
                                ? "Deputy Head Teacher"
                                : "Teacher"
                              : "Class Teacher"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <UserCheck size={14} />
                        <span>No class teacher assigned</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-gray-50 px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-gray-900">
                        {classItem.student_count ?? 0}
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-500">
                        Students
                      </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-blue-600">
                        {classItem.boys ?? 0}
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-500">
                        Boys
                      </p>
                    </div>

                    <div className="rounded-lg bg-pink-50 px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-pink-600">
                        {classItem.girls ?? 0}
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-500">
                        Girls
                      </p>
                    </div>
                  </div>

                  {/* Capacity */}
                  {classItem.capacity && (
                    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-gray-500">
                          Class capacity
                        </span>

                        <span className="text-[11px] text-gray-400">
                          {classItem.student_count ?? 0}/
                          {classItem.capacity}
                        </span>
                      </div>

                      <CapacityBar
                        count={
                          classItem.student_count ?? 0
                        }
                        capacity={classItem.capacity}
                      />
                    </div>
                  )}

                  {/* Parent representative */}
                  {classItem.parent_rep && (
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-[11px] text-gray-400">
                        Parent representative
                      </span>

                      <span className="max-w-[55%] truncate text-xs font-medium text-gray-700">
                        {classItem.parent_rep}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────
          Create / Edit modal
      ───────────────────────────────────────── */}

      <ClassFormModal
        isOpen={formOpen}
        onClose={closeFormModal}
        initialData={editingClass}
      />

      {/* ─────────────────────────────────────────
          Delete confirmation
      ───────────────────────────────────────── */}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;

          deleteClass.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
            },
          });
        }}
        title="Delete class"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This cannot be undone. Classes with enrolled students cannot be deleted.`
            : ""
        }
        isLoading={deleteClass.isPending}
      />
    </div>
  );
};

export default Classes;