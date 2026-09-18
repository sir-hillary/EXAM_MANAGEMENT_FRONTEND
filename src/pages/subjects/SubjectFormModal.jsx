import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Modal from "../../components/ui/Modal";
import { useCreateSubject, useUpdateSubject } from "../../hooks/useSubjects";

const subjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),

  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20, "Code cannot exceed 20 characters")
    .transform((value) => value.toUpperCase()),

  max_marks: z.coerce
    .number()
    .int("Max marks must be a whole number")
    .min(1, "Max marks must be greater than 0"),
});

const defaultValues = {
  name: "",
  code: "",
  max_marks: 100,
};

const SubjectFormModal = ({ isOpen, onClose, initialData }) => {
  const isEditing = Boolean(initialData);

  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) return;

    reset(
      initialData
        ? {
            name: initialData.name ?? "",
            code: initialData.code ?? "",
            max_marks: initialData.max_marks ?? 100,
          }
        : defaultValues,
    );
  }, [isOpen, initialData, reset]);

  const isSubmitting = createSubject.isPending || updateSubject.isPending;

  const serverError =
    createSubject.error?.message || updateSubject.error?.message;

  const onSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        max_marks: Number(formData.max_marks),
      };

      if (isEditing) {
        await updateSubject.mutateAsync({
          id: initialData.id,
          payload,
        });
      } else {
        await createSubject.mutateAsync(payload);
      }

      onClose();
    } catch {
      // Mutation error is displayed through serverError.
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit subject" : "New subject"}
    >
      {serverError && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Name */}
        <div>
          <label
            htmlFor="subject-name"
            className="mb-1 block text-xs font-medium text-gray-600"
          >
            Name
          </label>

          <input
            id="subject-name"
            type="text"
            className="input-field"
            placeholder="Mathematics"
            autoComplete="off"
            {...register("name")}
          />

          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Code */}
        <div>
          <label
            htmlFor="subject-code"
            className="mb-1 block text-xs font-medium text-gray-600"
          >
            Code
          </label>

          <input
            id="subject-code"
            type="text"
            className="input-field uppercase"
            placeholder="MATH"
            autoComplete="off"
            {...register("code")}
          />

          {errors.code && (
            <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
          )}
        </div>

        {/* Max marks */}
        <div>
          <label
            htmlFor="subject-max-marks"
            className="mb-1 block text-xs font-medium text-gray-600"
          >
            Max marks
          </label>

          <input
            id="subject-max-marks"
            type="number"
            min="1"
            step="1"
            className="input-field"
            placeholder="100"
            {...register("max_marks", {
              valueAsNumber: true,
            })}
          />

          {errors.max_marks && (
            <p className="mt-1 text-xs text-red-600">
              {errors.max_marks.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn-secondary w-full justify-center sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center sm:w-auto"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create subject"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SubjectFormModal;
