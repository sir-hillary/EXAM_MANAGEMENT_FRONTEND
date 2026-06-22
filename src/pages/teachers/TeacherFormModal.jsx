import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import  Modal  from "../../components/ui/Modal";
import { useCreateTeacher, useUpdateTeacher } from "../../hooks/useTeachers";

const teacherSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Enter a valid email"),
  employee_number: z.string().min(1, "Employee number is required").max(20),
});

const TeacherFormModal = ({ isOpen, onClose, initialData }) => {
  const isEditing = !!initialData;
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData || {
          first_name: "",
          last_name: "",
          email: "",
          employee_number: "",
        },
      );
    }
  }, [isOpen, initialData, reset]);

  const isSubmitting = createTeacher.isPending || updateTeacher.isPending;
  const serverError =
    createTeacher.error?.message || updateTeacher.error?.message;

  const onSubmit = (formData) => {
    const mutation = isEditing
      ? updateTeacher.mutateAsync({ id: initialData.id, payload: formData })
      : createTeacher.mutateAsync(formData);
    mutation.then(onClose).catch(() => {});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit teacher" : "New teacher"}
    >
      {serverError && (
        <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              First name
            </label>
            <input className="input-field" {...register("first_name")} />
            {errors.first_name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Last name
            </label>
            <input className="input-field" {...register("last_name")} />
            {errors.last_name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Email
          </label>
          <input type="email" className="input-field" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Employee number
          </label>
          <input className="input-field" {...register("employee_number")} />
          {errors.employee_number && (
            <p className="mt-1 text-xs text-red-600">
              {errors.employee_number.message}
            </p>
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
                : "Create teacher"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TeacherFormModal;
