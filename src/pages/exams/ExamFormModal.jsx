import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import  Modal  from '../../components/ui/Modal';
import  SelectField  from '../../components/ui/SelectField';
import { useCreateExam, useUpdateExam } from '../../hooks/useExams';
import { useClasses } from '../../hooks/useClasses';
import { useClassSubjects } from '../../hooks/useClassSubjects';
import { useTeacherSubjects } from '../../hooks/useTeacherSubjects';

const EXAM_TYPES = ['Mid-term', 'End-term'];

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  class_id: z.coerce.number().int().min(1, 'Select a class'),
  subject_id: z.coerce.number().int().min(1, 'Select a subject'),
  teacher_id: z.union([z.coerce.number().int(), z.literal('')]).optional(),
  exam_date: z.string().min(1, 'Exam date is required'),
  total_marks: z.coerce.number().int().min(1).max(1000),
  exam_type: z.enum(EXAM_TYPES, { errorMap: () => ({ message: 'Select an exam type' }) }),
});

const ExamFormModal = ({ isOpen, onClose, initialData }) => {
  const isEditing = !!initialData;
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: classSubjectsData } = useClassSubjects(); // all class-subject pairings
  const { data: teacherSubjectsData } = useTeacherSubjects();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedClassId = useWatch({ control, name: 'class_id' });
  const selectedSubjectId = useWatch({ control, name: 'subject_id' });

  // Only subjects actually offered to the selected class
  const subjectsForClass = (classSubjectsData?.data || []).filter(
    (cs) => String(cs.class_id) === String(selectedClassId)
  );

  // Only teachers qualified for the selected subject
  const qualifiedTeachers = (teacherSubjectsData?.data || []).filter(
    (ts) => String(ts.subject_id) === String(selectedSubjectId)
  );

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? { ...initialData, exam_date: initialData.exam_date?.split('T')[0] || '' }
          : { title: '', class_id: '', subject_id: '', teacher_id: '', exam_date: '', total_marks: 100, exam_type: '' }
      );
    }
  }, [isOpen, initialData, reset]);

  const isSubmitting = createExam.isPending || updateExam.isPending;
  const serverError = createExam.error?.message || updateExam.error?.message;

  const onSubmit = (formData) => {
    const payload = { ...formData, teacher_id: formData.teacher_id || null };
    const mutation = isEditing
      ? updateExam.mutateAsync({ id: initialData.id, payload })
      : createExam.mutateAsync(payload);
    mutation.then(onClose).catch(() => {});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit exam' : 'New exam'} maxWidth="max-w-lg">
      {serverError && (
        <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input className="input-field" placeholder="Term 1 CAT" {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField label="Class" error={errors.class_id?.message} {...register('class_id')}>
            <option value="">Select class...</option>
            {classesData?.data?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </SelectField>

          <SelectField
            label="Subject"
            error={errors.subject_id?.message}
            {...register('subject_id')}
            disabled={!selectedClassId}
          >
            <option value="">
              {selectedClassId
                ? subjectsForClass.length === 0 ? 'No subjects offered to this class' : 'Select subject...'
                : 'Select a class first'}
            </option>
            {subjectsForClass.map((cs) => (
              <option key={cs.subject_id} value={cs.subject_id}>{cs.subject_name} ({cs.code})</option>
            ))}
          </SelectField>
        </div>

        {selectedClassId && subjectsForClass.length === 0 && (
          <p className="text-xs text-amber-600">
            This class has no subjects assigned yet. Go to Assignments → Class Subjects first.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField label="Teacher (optional)" {...register('teacher_id')} disabled={!selectedSubjectId}>
            <option value="">{selectedSubjectId ? 'Unassigned' : 'Select a subject first'}</option>
            {qualifiedTeachers.map((t) => (
              <option key={t.teacher_id} value={t.teacher_id}>{t.first_name} {t.last_name}</option>
            ))}
          </SelectField>

          <SelectField label="Exam type" error={errors.exam_type?.message} {...register('exam_type')}>
            <option value="">Select type...</option>
            {EXAM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </SelectField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exam date</label>
            <input type="date" className="input-field" {...register('exam_date')} />
            {errors.exam_date && <p className="mt-1 text-xs text-red-600">{errors.exam_date.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total marks</label>
            <input type="number" className="input-field" {...register('total_marks')} />
            {errors.total_marks && <p className="mt-1 text-xs text-red-600">{errors.total_marks.message}</p>}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto justify-center">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto justify-center">
            {isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create exam'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExamFormModal