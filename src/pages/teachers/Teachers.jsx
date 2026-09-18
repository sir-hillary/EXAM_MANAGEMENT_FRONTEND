import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  UserX,
  UserCheck,
  Phone,
  Hash,
  Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useTeachers, useDeleteTeacher } from "../../hooks/useTeachers";
import { teachersApi } from "../../api/teachers.api";

import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { TeacherAvatar } from "../../components/ui/TeacherAvatar";

import TeacherFormModal from "./TeacherFormModal";

// ─────────────────────────────────────────────────────────────────────────────
// Designation configuration
// ─────────────────────────────────────────────────────────────────────────────

const DESIGNATION_CONFIG = {
  headteacher: {
    label: "Head Teacher",
    color: "#b45309",
    bg: "#fef3c7",
    icon: "⭐",
  },

  deputy_headteacher: {
    label: "Deputy Head Teacher",
    color: "#0369a1",
    bg: "#e0f2fe",
    icon: "🔹",
  },

  teacher: {
    label: "Teacher",
    color: "#15803d",
    bg: "#f0fdf4",
    icon: null,
  },
};

const DesignationBadge = ({ designation }) => {
  const config = DESIGNATION_CONFIG[designation] || DESIGNATION_CONFIG.teacher;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.icon && (
        <span aria-hidden="true" style={{ fontSize: "10px" }}>
          {config.icon}
        </span>
      )}

      {config.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
      isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        isActive ? "bg-green-500" : "bg-gray-400"
      }`}
    />

    {isActive ? "Active" : "Inactive"}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Action button
// ─────────────────────────────────────────────────────────────────────────────

const ActionButton = ({
  onClick,
  title,
  disabled = false,
  variant = "default",
  children,
}) => {
  const variants = {
    default: "text-gray-400 hover:bg-gray-100 hover:text-gray-700",

    primary: "text-gray-400 hover:bg-blue-50 hover:text-blue-600",

    warning: "text-gray-400 hover:bg-amber-50 hover:text-amber-600",

    success: "text-gray-400 hover:bg-green-50 hover:text-green-600",

    danger: "text-gray-400 hover:bg-red-50 hover:text-red-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Teachers page
// ─────────────────────────────────────────────────────────────────────────────

const Teachers = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = role === "admin";

  const { data, isLoading, isError, error } = useTeachers();

  const deleteTeacher = useDeleteTeacher();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggling, setToggling] = useState(null);

  const teachers = data?.data ?? [];

  // ───────────────────────────────────────────────────────────────────────────
  // Open create/edit modal
  // ───────────────────────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setEditingTeacher(null);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Activate / deactivate teacher
  // ───────────────────────────────────────────────────────────────────────────

  const handleToggleActive = async (teacher) => {
    if (!teacher?.id) return;

    setToggling(teacher.id);

    try {
      if (teacher.is_active) {
        await teachersApi.deactivate(teacher.id);

        toast.success(`${teacher.first_name} ${teacher.last_name} deactivated`);
      } else {
        await teachersApi.activate(teacher.id);

        toast.success(`${teacher.first_name} ${teacher.last_name} reactivated`);
      }

      await queryClient.invalidateQueries({
        queryKey: ["teachers"],
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to update teacher status",
      );
    } finally {
      setToggling(null);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Delete teacher
  // ───────────────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    if (!deleteTarget?.id) return;

    deleteTeacher.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Loading / error states
  // ───────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return <TableSkeleton rows={8} cols={7} />;
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-5 py-4"
      >
        <p className="text-sm font-semibold text-red-800">
          Unable to load teachers
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error?.response?.data?.error ||
            error?.message ||
            "Something went wrong while loading teachers."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ─────────────────────────────────────────────────────────────────────
          Page header
      ───────────────────────────────────────────────────────────────────── */}

      <PageHeader
        title="Teachers"
        description="Manage teaching staff, designations, contact details, and class assignments"
        action={
          isAdmin && (
            <button
              type="button"
              onClick={openCreateModal}
              className="btn-primary w-full justify-center sm:w-auto"
            >
              <Plus size={15} />
              Add teacher
            </button>
          )
        }
      />

      {/* ─────────────────────────────────────────────────────────────────────
          Empty state
      ───────────────────────────────────────────────────────────────────── */}

      {teachers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <Users size={24} className="text-blue-400" />
          </div>

          <p className="text-sm font-semibold text-gray-700">
            No teachers found
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs text-gray-400">
            Add your teaching staff to start managing designations and class
            assignments.
          </p>

          {isAdmin && (
            <button
              type="button"
              onClick={openCreateModal}
              className="btn-primary mt-4"
            >
              <Plus size={14} />
              Add teacher
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ───────────────────────────────────────────────────────────────
              Desktop table
          ─────────────────────────────────────────────────────────────── */}

          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Teacher
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Designation
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Contact
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      IDs
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Class
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    {isAdmin && (
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {teachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className={`transition-colors hover:bg-gray-50/50 ${
                        !teacher.is_active ? "opacity-60" : ""
                      }`}
                    >
                      {/* Teacher */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <TeacherAvatar
                            teacher={teacher}
                            size="sm"
                            showStatus
                          />

                          <div className="min-w-0">
                            <p className="truncate font-semibold leading-tight text-gray-900">
                              {teacher.first_name} {teacher.last_name}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-gray-400">
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="px-4 py-3">
                        <DesignationBadge designation={teacher.designation} />
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        {teacher.phone ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone
                              size={11}
                              className="shrink-0 text-gray-400"
                            />

                            <span>{teacher.phone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* IDs */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Hash
                              size={10}
                              className="shrink-0 text-gray-400"
                            />

                            <span className="font-mono text-xs text-gray-700">
                              {teacher.employee_number || "—"}
                            </span>
                          </div>

                          {teacher.tsc_number && (
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck
                                size={10}
                                className="shrink-0 text-gray-400"
                              />

                              <span className="font-mono text-xs text-gray-500">
                                TSC: {teacher.tsc_number}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Class */}
                      <td className="px-4 py-3">
                        {teacher.class_name ? (
                          <span className="inline-flex rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {teacher.class_name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No class assigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge isActive={teacher.is_active} />
                      </td>

                      {/* Actions */}
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <ActionButton
                              title="Edit teacher"
                              variant="primary"
                              onClick={() => openEditModal(teacher)}
                            >
                              <Pencil size={14} />
                            </ActionButton>

                            <ActionButton
                              title={
                                teacher.is_active
                                  ? "Deactivate teacher"
                                  : "Reactivate teacher"
                              }
                              variant={
                                teacher.is_active ? "warning" : "success"
                              }
                              disabled={toggling === teacher.id}
                              onClick={() => handleToggleActive(teacher)}
                            >
                              {teacher.is_active ? (
                                <UserX size={14} />
                              ) : (
                                <UserCheck size={14} />
                              )}
                            </ActionButton>

                            <ActionButton
                              title="Delete teacher"
                              variant="danger"
                              onClick={() => setDeleteTarget(teacher)}
                            >
                              <Trash2 size={14} />
                            </ActionButton>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────────
              Mobile cards
          ─────────────────────────────────────────────────────────────── */}

          <div className="space-y-3 md:hidden">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className={`rounded-xl border border-gray-200 bg-white p-4 ${
                  !teacher.is_active ? "opacity-60" : ""
                }`}
              >
                {/* Header */}
                <div className="mb-4 flex items-start gap-3">
                  <TeacherAvatar teacher={teacher} size="md" showStatus />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-bold leading-tight text-gray-900">
                          {teacher.first_name} {teacher.last_name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <DesignationBadge designation={teacher.designation} />
                    </div>
                  </div>
                </div>

                {/* Information */}
                <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Hash size={10} className="shrink-0 text-gray-400" />

                    <span className="truncate font-mono">
                      {teacher.employee_number || "No employee #"}
                    </span>
                  </div>

                  {teacher.tsc_number ? (
                    <div className="flex min-w-0 items-center gap-1.5">
                      <ShieldCheck
                        size={10}
                        className="shrink-0 text-gray-400"
                      />

                      <span className="truncate font-mono">
                        TSC: {teacher.tsc_number}
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}

                  {teacher.phone && (
                    <div className="col-span-2 flex items-center gap-1.5">
                      <Phone size={10} className="shrink-0 text-gray-400" />

                      <span>{teacher.phone}</span>
                    </div>
                  )}

                  <div className="col-span-2 flex items-center gap-1.5">
                    <Users size={10} className="shrink-0 text-gray-400" />

                    {teacher.class_name ? (
                      <span className="rounded-lg bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                        {teacher.class_name}
                      </span>
                    ) : (
                      <span className="text-gray-400">No class assigned</span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <StatusBadge isActive={teacher.is_active} />

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <ActionButton
                        title="Edit teacher"
                        variant="primary"
                        onClick={() => openEditModal(teacher)}
                      >
                        <Pencil size={14} />
                      </ActionButton>

                      <ActionButton
                        title={
                          teacher.is_active
                            ? "Deactivate teacher"
                            : "Reactivate teacher"
                        }
                        variant={teacher.is_active ? "warning" : "success"}
                        disabled={toggling === teacher.id}
                        onClick={() => handleToggleActive(teacher)}
                      >
                        {teacher.is_active ? (
                          <UserX size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}
                      </ActionButton>

                      <ActionButton
                        title="Delete teacher"
                        variant="danger"
                        onClick={() => setDeleteTarget(teacher)}
                      >
                        <Trash2 size={14} />
                      </ActionButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Create / edit teacher modal
      ───────────────────────────────────────────────────────────────────── */}

      <TeacherFormModal
        isOpen={formOpen}
        onClose={closeFormModal}
        initialData={editingTeacher}
      />

      {/* ─────────────────────────────────────────────────────────────────────
          Delete confirmation
      ───────────────────────────────────────────────────────────────────── */}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete teacher"
        message={
          deleteTarget
            ? `Permanently delete "${deleteTarget.first_name} ${deleteTarget.last_name}"? This action cannot be undone.`
            : ""
        }
        isLoading={deleteTeacher.isPending}
      />
    </div>
  );
};

export default Teachers;
