import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Upload } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../../components/ui/Modal";
import {
  useCreateTeacher,
  useUpdateTeacher,
} from "../../hooks/useTeachers";
import { teachersApi } from "../../api/teachers.api";
import { TeacherAvatar } from "../../components/ui/TeacherAvatar";

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

const kenyaPhoneRegex = /^(\+254|254|0)[17]\d{8}$/;

const teacherSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or fewer"),

  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or fewer"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(150, "Email must be 150 characters or fewer"),

  employee_number: z
    .string()
    .trim()
    .min(1, "Employee number is required")
    .max(20, "Employee number must be 20 characters or fewer"),

  tsc_number: z
    .string()
    .trim()
    .max(20, "TSC number must be 20 characters or fewer")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value) return true;

        return kenyaPhoneRegex.test(value.replace(/\s/g, ""));
      },
      {
        message: "Enter a valid Kenya phone e.g. 0712345678",
      }
    ),

  // School designation only.
  // System access is controlled separately by users.role.
  designation: z
    .enum(["teacher", "headteacher", "deputy_headteacher"])
    .default("teacher"),

  bio: z
    .string()
    .trim()
    .max(500, "Bio must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
});

// ─────────────────────────────────────────────────────────────────────────────
// Designation configuration
// ─────────────────────────────────────────────────────────────────────────────

const DESIGNATIONS = [
  {
    value: "teacher",
    label: "Teacher",
  },
  {
    value: "deputy_headteacher",
    label: "Deputy Head Teacher",
  },
  {
    value: "headteacher",
    label: "Head Teacher",
  },
];

const DESIGNATION_CONFIG = {
  teacher: {
    label: "Teacher",
    color: "#15803d",
    bg: "#f0fdf4",
  },

  deputy_headteacher: {
    label: "Deputy Head Teacher",
    color: "#0369a1",
    bg: "#e0f2fe",
  },

  headteacher: {
    label: "Head Teacher",
    color: "#b45309",
    bg: "#fef3c7",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getDesignationConfig = (designation) =>
  DESIGNATION_CONFIG[designation] || DESIGNATION_CONFIG.teacher;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const TeacherFormModal = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();

  // ───────────────────────────────────────────────────────────────────────────
  // Photo state
  // ───────────────────────────────────────────────────────────────────────────

  const fileInputRef = useRef(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // Form
  // ───────────────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(teacherSchema),

    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      employee_number: "",
      tsc_number: "",
      phone: "",
      designation: "teacher",
      bio: "",
    },
  });

  const watchedDesignation = watch("designation");

  // ───────────────────────────────────────────────────────────────────────────
  // Populate/reset form
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    setPhotoPreview(initialData?.profile_photo_url || null);
    setPhotoFile(null);

    reset(
      initialData
        ? {
            first_name: initialData.first_name || "",
            last_name: initialData.last_name || "",
            email: initialData.email || "",
            employee_number: initialData.employee_number || "",
            tsc_number: initialData.tsc_number || "",
            phone: initialData.phone || "",
            designation:
              initialData.designation || "teacher",
            bio: initialData.bio || "",
          }
        : {
            first_name: "",
            last_name: "",
            email: "",
            employee_number: "",
            tsc_number: "",
            phone: "",
            designation: "teacher",
            bio: "",
          }
    );
  }, [isOpen, initialData, reset]);

  // ───────────────────────────────────────────────────────────────────────────
  // Cleanup temporary object URLs
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // ───────────────────────────────────────────────────────────────────────────
  // Photo selection
  // ───────────────────────────────────────────────────────────────────────────

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Client-side validation
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Submit
  // ───────────────────────────────────────────────────────────────────────────

  const onSubmit = async (formData) => {
    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      employee_number: formData.employee_number.trim(),

      tsc_number: formData.tsc_number?.trim() || null,
      phone: formData.phone?.trim() || null,
      designation: formData.designation || "teacher",
      bio: formData.bio?.trim() || null,
    };

    let teacherId = initialData?.id;

    try {
      // ─────────────────────────────────────────────────────────────────────
      // Create / update teacher
      // ─────────────────────────────────────────────────────────────────────

      if (isEditing) {
        await updateTeacher.mutateAsync({
          id: teacherId,
          payload,
        });
      } else {
        const result = await createTeacher.mutateAsync(payload);

        teacherId =
          result?.data?.id ||
          result?.id;
      }

      // ─────────────────────────────────────────────────────────────────────
      // Upload photo after teacher exists
      // ─────────────────────────────────────────────────────────────────────

      if (photoFile && teacherId) {
        setUploadingPhoto(true);

        try {
          const formData = new FormData();

          formData.append("photo", photoFile);

          await teachersApi.uploadPhoto(
            teacherId,
            formData
          );
        } catch (photoError) {
          console.error(
            "Teacher photo upload failed:",
            photoError
          );

          toast.error(
            "Teacher saved, but photo upload failed. You can retry from the edit form."
          );

          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      onClose();
    } catch (error) {
      console.error("Teacher save failed:", error);

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to save teacher."
      );
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Derived state
  // ───────────────────────────────────────────────────────────────────────────

  const isLoading =
    isSubmitting || uploadingPhoto;

  const serverError =
    createTeacher.error?.response?.data?.error ||
    createTeacher.error?.message ||
    updateTeacher.error?.response?.data?.error ||
    updateTeacher.error?.message;

  const designationConfig =
    getDesignationConfig(watchedDesignation);

  const previewTeacher = {
    id: initialData?.id,
    first_name:
      watch("first_name") ||
      initialData?.first_name ||
      "",

    last_name:
      watch("last_name") ||
      initialData?.last_name ||
      "",

    profile_photo_url: photoPreview,

    designation:
      watchedDesignation || "teacher",

    is_active:
      initialData?.is_active !== false,
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? "Edit teacher"
          : "Add new teacher"
      }
      maxWidth="max-w-lg"
    >
      {serverError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-0"
      >
        {/* ─────────────────────────────────────────────────────────────
            Profile photo
        ───────────────────────────────────────────────────────────── */}

        <div className="mb-5 flex items-center gap-4 border-b border-gray-100 pb-5">
          <div className="relative shrink-0">
            <TeacherAvatar
              teacher={previewTeacher}
              size="lg"
              showBadge={false}
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={isLoading}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Choose profile photo"
            >
              <Camera size={12} />
            </button>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Profile photo
            </p>

            <p className="mb-1.5 text-xs text-gray-500">
              Optional — JPEG, PNG, or WebP, max 5 MB
            </p>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={isLoading}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={11} />

              {photoPreview
                ? "Change photo"
                : "Upload photo"}
            </button>
          </div>

          {watchedDesignation && (
            <div className="ml-auto shrink-0">
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  backgroundColor:
                    designationConfig.bg,
                  color:
                    designationConfig.color,
                }}
              >
                {designationConfig.label}
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            Name
        ───────────────────────────────────────────────────────────── */}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              First name *
            </label>

            <input
              className="input-field"
              autoComplete="given-name"
              {...register("first_name")}
            />

            {errors.first_name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Last name *
            </label>

            <input
              className="input-field"
              autoComplete="family-name"
              {...register("last_name")}
            />

            {errors.last_name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            Email
        ───────────────────────────────────────────────────────────── */}

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Email address *
            <span className="ml-1 font-normal text-gray-400">
              (used for login)
            </span>
          </label>

          <input
            type="email"
            className="input-field"
            placeholder="teacher@school.ac.ke"
            autoComplete="email"
            {...register("email")}
          />

          {errors.email && (
            <p className="mt-1 text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            Employee + TSC
        ───────────────────────────────────────────────────────────── */}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Employee number *
            </label>

            <input
              className="input-field"
              placeholder="e.g. EMP001"
              {...register("employee_number")}
            />

            {errors.employee_number && (
              <p className="mt-1 text-xs text-red-600">
                {errors.employee_number.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              TSC number
              <span className="ml-1 font-normal text-gray-400">
                (if available)
              </span>
            </label>

            <input
              className="input-field"
              placeholder="e.g. TSC/0001234"
              {...register("tsc_number")}
            />

            {errors.tsc_number && (
              <p className="mt-1 text-xs text-red-600">
                {errors.tsc_number.message}
              </p>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            Phone + designation
        ───────────────────────────────────────────────────────────── */}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Phone number
            </label>

            <input
              type="tel"
              className="input-field"
              placeholder="e.g. 0712345678"
              autoComplete="tel"
              {...register("phone")}
            />

            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Designation
            </label>

            <select
              className="input-field"
              {...register("designation")}
            >
              {DESIGNATIONS.map(
                (designation) => (
                  <option
                    key={designation.value}
                    value={designation.value}
                  >
                    {designation.label}
                  </option>
                )
              )}
            </select>

            {errors.designation && (
              <p className="mt-1 text-xs text-red-600">
                {errors.designation.message}
              </p>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            Designation information
        ───────────────────────────────────────────────────────────── */}

        {watchedDesignation !== "teacher" && (
          <div
            className="mb-4 rounded-xl border px-3 py-2.5 text-xs leading-relaxed"
            style={{
              backgroundColor:
                designationConfig.bg,
              color:
                designationConfig.color,
              borderColor:
                designationConfig.bg,
            }}
          >
            {watchedDesignation ===
              "headteacher" && (
              <>
                <strong>Head Teacher</strong> — a
                school leadership designation. System
                access is controlled separately through
                the user's account role.
              </>
            )}

            {watchedDesignation ===
              "deputy_headteacher" && (
              <>
                <strong>
                  Deputy Head Teacher
                </strong>{" "}
                — a school leadership designation.
                System access is controlled separately
                through the user's account role.
              </>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            Bio
        ───────────────────────────────────────────────────────────── */}

        <div className="mb-5">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Bio
            <span className="ml-1 font-normal text-gray-400">
              (optional)
            </span>
          </label>

          <textarea
            rows={2}
            className="input-field resize-none"
            placeholder="Short bio or notes about this teacher..."
            {...register("bio")}
          />

          {errors.bio && (
            <p className="mt-1 text-xs text-red-600">
              {errors.bio.message}
            </p>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            Actions
        ───────────────────────────────────────────────────────────── */}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary w-full justify-center sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center sm:w-auto"
          >
            {isLoading
              ? uploadingPhoto
                ? "Uploading photo…"
                : "Saving…"
              : isEditing
              ? "Save changes"
              : "Add teacher"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TeacherFormModal;