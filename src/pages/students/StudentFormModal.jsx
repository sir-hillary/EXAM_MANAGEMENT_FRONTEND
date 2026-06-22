import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import  Modal  from '../../components/ui/Modal';
import { useCreateStudent, useUpdateStudent } from '../../hooks/useStudents';
import { useClasses } from '../../hooks/useClasses';

const studentSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  student_number: z.string().min(1, 'Student number is required').max(20),
  date_of_birth: z.string().optional().or(z.literal('')),
  class_id: z.union([z.coerce.number().int(), z.literal('')]).optional(),
});

const StudentFormModal = ({ isOpen, onClose, initialData }) => {
  const isEditing = !!initialData;
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const { data: classesData } = useClasses({ limit: 100 });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? { ...initialData, date_of_birth: initialData.date_of_birth?.split('T')[0] || '' }
          : { first_name: '', last_name: '', student_number: '', date_of_birth: '', class_id: '' }
      );
    }
  }, [isOpen, initialData, reset]);

  const isSubmitting = createStudent.isPending || updateStudent.isPending;
  const serverError = createStudent.error?.message || updateStudent.error?.message;

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      date_of_birth: formData.date_of_birth || null,
      class_id: formData.class_id || null,
    };
    const mutation = isEditing
      ? updateStudent.mutateAsync({ id: initialData.id, payload })
      : createStudent.mutateAsync(payload);
    mutation.then(onClose).catch(() => {});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit student' : 'New student'}>
      {serverError && (
        <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">First name</label>
            <input className="input-field" {...register('first_name')} />
            {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last name</label>
            <input className="input-field" {...register('last_name')} />
            {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Student number</label>
          <input className="input-field" {...register('student_number')} />
          {errors.student_number && <p className="mt-1 text-xs text-red-600">{errors.student_number.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date of birth</label>
            <input type="date" className="input-field" {...register('date_of_birth')} />
            {errors.date_of_birth && <p className="mt-1 text-xs text-red-600">{errors.date_of_birth.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
            <select className="input-field" {...register('class_id')}>
              <option value="">Unassigned</option>
              {classesData?.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto justify-center">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto justify-center">
            {isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create student'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentFormModal