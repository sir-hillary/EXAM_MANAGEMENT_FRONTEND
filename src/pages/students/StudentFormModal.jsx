import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Camera,
  Upload,
  User,
  CalendarDays,
  GraduationCap,
  Users,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../../components/ui/Modal";
import { useCreateStudent, useUpdateStudent } from "../../hooks/useStudents";
import { useClasses } from "../../hooks/useClasses";
import { StudentAvatar } from "../../components/ui/StudentAvatar";
import { studentsApi } from "../../api/students.api";

const kenyaPhoneRegex = /^(\+254|254|0)[17]\d{8}$/;

const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  date_of_birth: z.string().optional().or(z.literal("")),
  class_id: z.union([z.coerce.number().int(), z.literal("")]).optional(),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  parent_name: z.string().max(150).optional().or(z.literal("")),
  parent_email: z
    .string()
    .email("Must be a valid email")
    .optional()
    .or(z.literal("")),
  parent_phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || kenyaPhoneRegex.test(v.replace(/\s/g, "")), {
      message: "Enter a valid Kenya phone e.g. 0712345678",
    }),
});

const inputClass =
  "input-field w-full transition-all focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/10";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5";

const errorClass = "mt-1.5 text-xs text-red-600";

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 mb-4">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{
        background: "rgba(201,168,76,0.12)",
        color: "#c9a84c",
      }}
    >
      <Icon size={15} />
    </div>

    <div>
      <h3 className="text-sm font-semibold text-[#1a3a2a]">{title}</h3>

      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
  </div>
);

export const StudentFormModal = ({ isOpen, onClose, initialData }) => {
  const isEditing = !!initialData;

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const { data: classesData } = useClasses({ limit: 100 });

  // ── Photo upload state ───────────────────────────────────────────────
  const fileInputRef = useRef(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [, setSavedStudentId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(studentSchema),
  });

  // ── Reset form when modal opens ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const resetModalState = () => {
      setPhotoPreview(initialData?.photo_url || null);
      setPhotoFile(null);
      setSavedStudentId(null);
    };

    queueMicrotask(resetModalState);

    reset(
      initialData
        ? {
            ...initialData,
            date_of_birth: initialData.date_of_birth?.split("T")[0] || "",
            gender: initialData.gender || "",
          }
        : {
            first_name: "",
            last_name: "",
            date_of_birth: "",
            class_id: "",
            gender: "",
            parent_name: "",
            parent_email: "",
            parent_phone: "",
          },
    );
  }, [isOpen, initialData, reset]);

  // ── Photo selection ─────────────────────────────────────────────────
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── Submit ───────────────────────────────────────────────────────────
  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      date_of_birth: formData.date_of_birth || null,
      class_id: formData.class_id || null,
      gender: formData.gender || null,
      parent_email: formData.parent_email || null,
      parent_phone: formData.parent_phone || null,
      parent_name: formData.parent_name || null,
    };

    let studentId = initialData?.id;

    try {
      if (isEditing) {
        await updateStudent.mutateAsync({
          id: studentId,
          payload,
        });
      } else {
        const result = await createStudent.mutateAsync(payload);

        studentId = result.data.id;
        setSavedStudentId(studentId);
      }

      // Upload photo if selected
      if (photoFile && studentId) {
        setUploadingPhoto(true);

        try {
          const fd = new FormData();

          fd.append("photo", photoFile);

          await studentsApi.uploadPhoto(studentId, fd);

          toast.success(
            isEditing
              ? "Student updated with photo"
              : "Student added with photo",
          );
        } catch {
          toast.error(
            "Student saved but photo upload failed. You can retry from the edit form.",
          );
        } finally {
          setUploadingPhoto(false);
        }
      } else {
        toast.success(isEditing ? "Student updated" : "Student added");
      }

      onClose();
    } catch (err) {
      toast.error(err.message || "Save failed");
    }
  };

  const isLoading = isSubmitting || uploadingPhoto;

  const serverError =
    createStudent.error?.message || updateStudent.error?.message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit student" : "Add new student"}
      maxWidth="max-w-2xl"
    >
      <div className="max-h-[78vh] overflow-y-auto pr-1 -mr-1">
        {/* ── Header accent ───────────────────────────────────────────── */}
        <div
          className="h-1 rounded-full mb-5"
          style={{
            background: "linear-gradient(90deg, #1a3a2a, #c9a84c, #1a3a2a)",
          }}
        />

        {/* ── Server error ────────────────────────────────────────────── */}
        {serverError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={17} className="text-red-500 shrink-0 mt-0.5" />

            <div>
              <p className="text-xs font-semibold text-red-700">
                Unable to save student
              </p>

              <p className="text-xs text-red-600 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Student photo ──────────────────────────────────────────── */}
          <section
            className="rounded-2xl border border-gray-200 p-4 sm:p-5"
            style={{ background: "#fbfdfb" }}
          >
            <SectionHeader
              icon={Camera}
              title="Student photo"
              description="Add an optional profile photo for identification"
            />

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Student preview"
                    className="w-[76px] h-[76px] rounded-2xl object-cover"
                    style={{
                      border: "2px solid rgba(201,168,76,0.5)",
                    }}
                  />
                ) : (
                  <div className="rounded-2xl overflow-hidden">
                    <StudentAvatar
                      student={
                        initialData || {
                          first_name: "?",
                          last_name: "",
                        }
                      }
                      size="lg"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105"
                  style={{
                    background: "#c9a84c",
                    color: "#1a3a2a",
                  }}
                  aria-label="Change student photo"
                >
                  <Camera size={13} />
                </button>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1a3a2a]">
                  {photoPreview ? "Photo selected" : "No photo selected"}
                </p>

                <p className="text-xs text-gray-400 mt-0.5 mb-2">
                  JPEG, PNG or WebP · Maximum 5 MB
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  style={{ color: "#1a3a2a" }}
                >
                  <Upload size={12} />
                  {photoPreview ? "Change photo" : "Upload photo"}
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </section>

          {/* ── Basic information ─────────────────────────────────────── */}
          <section>
            <SectionHeader
              icon={User}
              title="Basic information"
              description="Student identity and personal details"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First name *</label>

                <input
                  className={inputClass}
                  placeholder="e.g. Brian"
                  {...register("first_name")}
                />

                {errors.first_name && (
                  <p className={errorClass}>{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Last name *</label>

                <input
                  className={inputClass}
                  placeholder="e.g. Otieno"
                  {...register("last_name")}
                />

                {errors.last_name && (
                  <p className={errorClass}>{errors.last_name.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* ── Admission number ──────────────────────────────────────── */}
          {isEditing && initialData?.student_number && (
            <div
              className="rounded-xl border border-gray-200 px-4 py-3"
              style={{ background: "#f8faf8" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className={labelClass}>Admission number</label>

                  <div className="font-mono text-sm font-semibold text-[#1a3a2a]">
                    {initialData.student_number}
                  </div>
                </div>

                <span
                  className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full"
                  style={{
                    background: "rgba(201,168,76,0.14)",
                    color: "#8c7020",
                  }}
                >
                  Auto-generated
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-1">
                This number cannot be changed.
              </p>
            </div>
          )}

          {/* ── Academic information ──────────────────────────────────── */}
          <section>
            <SectionHeader
              icon={GraduationCap}
              title="Academic information"
              description="Class placement and student details"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Date of birth</label>

                <div className="relative">
                  <CalendarDays
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    type="date"
                    className={`${inputClass} pl-9`}
                    {...register("date_of_birth")}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Gender</label>

                <select className={inputClass} {...register("gender")}>
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Class</label>

                <select className={inputClass} {...register("class_id")}>
                  <option value="">Unassigned</option>

                  {classesData?.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ── Parent / guardian ─────────────────────────────────────── */}
          <section
            className="rounded-2xl border border-gray-200 p-4 sm:p-5"
            style={{ background: "#fbfdfb" }}
          >
            <SectionHeader
              icon={Users}
              title="Parent / Guardian"
              description="Contact information used for communication and login"
            />

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full name</label>

                <input
                  className={inputClass}
                  placeholder="e.g. Jane Kamau"
                  {...register("parent_name")}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Phone number
                  <span className="ml-1 normal-case font-normal tracking-normal text-gray-400">
                    (Kenya format)
                  </span>
                </label>

                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    className={`${inputClass} pl-9`}
                    placeholder="0712345678"
                    {...register("parent_phone")}
                  />
                </div>

                {errors.parent_phone ? (
                  <p className={errorClass}>{errors.parent_phone.message}</p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-gray-400">
                    Accepts 07XXXXXXXX or 01XXXXXXXX
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Email
                  <span className="ml-1 normal-case font-normal tracking-normal text-gray-400">
                    (used for parent login)
                  </span>
                </label>

                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <input
                    type="email"
                    className={`${inputClass} pl-9`}
                    placeholder="parent@email.com"
                    {...register("parent_email")}
                  />
                </div>

                {errors.parent_email ? (
                  <p className={errorClass}>{errors.parent_email.message}</p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-gray-400">
                    One parent email can link multiple children.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto justify-center"
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "#1a3a2a",
                color: "#ffffff",
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                  {uploadingPhoto ? "Uploading photo…" : "Saving…"}
                </>
              ) : (
                <>{isEditing ? "Save changes" : "Add student"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
