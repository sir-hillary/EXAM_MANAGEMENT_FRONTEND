import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateClass, useUpdateClass } from "../../hooks/useClasses";
import Modal from "../../components/ui/Modal";
import { getDivision } from "../../utils/schoolDivisions";

const classSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  grade: z.coerce.number().int().min(1).max(13),
});

const ClassFormModal = ({ isOpen, onClose, initialData }) => {
  const isEditing = !!initialData;
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(classSchema) });

  const gradeValue = useWatch({ control, name: "grade" });
  const division = gradeValue ? getDivision(gradeValue) : null;

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { name: "", grade: "" });
    }
  }, [isOpen, initialData, reset]);

  const isSubmitting = createClass.isPending || updateClass.isPending;
  const serverError = createClass.error?.message || updateClass.error?.message;

  const onSubmit = (formData) => {
    const payload = { ...(formData || null) };

    const mutation = isEditing
      ? updateClass.mutateAsync({ id: initialData.id, payload })
      : createClass.mutateAsync(payload);

    mutation.then(onClose).catch(() => {});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit class" : "New class"}
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
            placeholder="Form 1 East"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Grade 
            </label>
            <input
              type="number"
              className="input-field"
              {...register("grade")}
            />
            {division && (
              <p className="mt-1 text-xs">
                Division:{" "}
                <span className={`badge ${division.color}`}>
                  {division.label}
                </span>
              </p>
            )}
            {errors.grade && (
              <p className="mt-1 text-xs text-red-600">
                {errors.grade.message}
              </p>
            )}
          </div>
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
                : "Create class"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassFormModal;
