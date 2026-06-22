import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useClassSubjects,
  useAssignClassSubject,
  useUnassignClassSubject,
} from '../../hooks/useClassSubjects';
import { useTeacherSubjects } from '../../hooks/useTeacherSubjects';
import { useClasses } from '../../hooks/useClasses';
import { useSubjects } from '../../hooks/useSubjects';
import  DataTable  from '../../components/ui/DataTable';
import  ConfirmDialog  from '../../components/ui/ConfirmDialog';
import  Spinner  from '../../components/ui/spinner';
import  SelectField  from '../../components/ui/SelectField';

const currentAcademicYear = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1; // Sept+ rolls into next year
  return `${startYear}/${startYear + 1}`;
};

const schema = z.object({
  class_id: z.coerce.number().int().min(1, 'Select a class'),
  subject_id: z.coerce.number().int().min(1, 'Select a subject'),
  teacher_id: z.union([z.coerce.number().int(), z.literal('')]).optional(),
  academic_year: z.string().regex(/^\d{4}\/\d{4}$/, 'Format must be 2025/2026'),
});

const  ClassSubjectsTab = ()=> {
  const { data, isLoading, isError, error } = useClassSubjects();
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: subjectsData } = useSubjects({ limit: 100 });
  const { data: teacherSubjectsData } = useTeacherSubjects(); // all qualifications
  const assign = useAssignClassSubject();
  const unassign = useUnassignClassSubject();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { academic_year: currentAcademicYear() },
  });

  // Watch the selected subject so we can filter qualified teachers live
  const selectedSubjectId = useWatch({ control, name: 'subject_id' });

  const qualifiedTeachers = (teacherSubjectsData?.data || []).filter(
    (ts) => String(ts.subject_id) === String(selectedSubjectId)
  );

  const onSubmit = (formData) => {
    const payload = { ...formData, teacher_id: formData.teacher_id || null };
    assign.mutate(payload, {
      onSuccess: () => reset({ class_id: '', subject_id: '', teacher_id: '', academic_year: currentAcademicYear() }),
    });
  };

  const columns = [
    { key: 'class_name', header: 'Class' },
    { key: 'subject_name', header: 'Subject', render: (row) => `${row.subject_name} (${row.code})` },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (row) => row.first_name ? `${row.first_name} ${row.last_name}` : <span className="text-gray-400">Unassigned</span>,
    },
    { key: 'academic_year', header: 'Year' },
  ];

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Offer a subject to a class</h3>

        {assign.error && (
          <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {assign.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectField label="Class" error={errors.class_id?.message} {...register('class_id')}>
              <option value="">Select class...</option>
              {classesData?.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SelectField>

            <SelectField label="Subject" error={errors.subject_id?.message} {...register('subject_id')}>
              <option value="">Select subject...</option>
              {subjectsData?.data?.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </SelectField>

            <SelectField
              label="Teacher"
              error={errors.teacher_id?.message}
              {...register('teacher_id')}
              disabled={!selectedSubjectId}
            >
              <option value="">
                {selectedSubjectId
                  ? qualifiedTeachers.length === 0 ? 'No qualified teachers' : 'Unassigned for now'
                  : 'Select a subject first'}
              </option>
              {qualifiedTeachers.map((t) => (
                <option key={t.teacher_id} value={t.teacher_id}>{t.first_name} {t.last_name}</option>
              ))}
            </SelectField>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Academic year</label>
              <input className="input-field" placeholder="2025/2026" {...register('academic_year')} />
              {errors.academic_year && <p className="mt-1 text-xs text-red-600">{errors.academic_year.message}</p>}
            </div>
          </div>

          {selectedSubjectId && qualifiedTeachers.length === 0 && (
            <p className="text-xs text-amber-600">
              No teachers are qualified for this subject yet — assign one in the "Teacher Qualifications" tab first, or leave the teacher unassigned for now.
            </p>
          )}

          <button type="submit" disabled={assign.isPending} className="btn-primary w-full sm:w-auto justify-center">
            <Plus size={16} /> {assign.isPending ? 'Assigning...' : 'Assign subject to class'}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : isError ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data}
          emptyMessage="No subjects offered to any class yet"
          actions={(row) => (
            <button onClick={() => setDeleteTarget(row)} className="text-gray-400 hover:text-red-600" aria-label="Remove">
              <Trash2 size={16} />
            </button>
          )}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => unassign.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        title="Remove subject from class"
        message={`Remove ${deleteTarget?.subject_name} from ${deleteTarget?.class_name}? Any exams already created for this pairing will be unaffected, but no new ones can be added.`}
        isLoading={unassign.isPending}
      />
    </div>
  );
}

export default ClassSubjectsTab