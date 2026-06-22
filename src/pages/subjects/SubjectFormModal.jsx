import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/ui/Modal";
import { useCreateSubject, useUpdateSubject } from "../../hooks/useSubjects";

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z
    .string()
    .min(1, "Code is required")
    .max(20)
    .transform((v) => v.toUpperCase()),
});

const SubjectFormModal = ({ isOpen, onClose, initialData }) => {
  const isEditing = !!initialData;
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subjectSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { name: "", code: ""});
    }
  }, [isOpen, initialData, reset]);

  const isSubmitting = createSubject.isPending || updateSubject.isPending;
  const serverError =
    createSubject.error?.message || updateSubject.error?.message;

  const onSubmit = (formData) => {
    const payload = { ...formData || null };
    const mutation = isEditing
      ? updateSubject.mutateAsync({ id: initialData.id, payload })
      : createSubject.mutateAsync(payload);
    mutation.then(onClose).catch(() => {});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit subject" : "New subject"}
    >
      {serverError && (
        <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Name
          </label>
          <input
            className="input-field"
            placeholder="Mathematics"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Code
          </label>
          <input
            className="input-field"
            placeholder="MATH"
            {...register("code")}
          />
          {errors.code && (
            <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full sm:w-auto justify-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full sm:w-auto justify-center"
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
