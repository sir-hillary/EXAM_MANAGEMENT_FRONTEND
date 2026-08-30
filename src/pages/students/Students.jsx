import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Phone, Mail } from 'lucide-react';
import { useStudents, useDeleteStudent } from '../../hooks/useStudents';
import { useClasses } from '../../hooks/useClasses';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SelectField from '../../components/ui/SelectField';
import TableSkeleton from '../../components/ui/TableSkeleton';
import { StudentFormModal } from './StudentFormModal';
import { StudentAvatar } from '../../components/ui/StudentAvatar';

const genderBadge = {
  male:   'bg-blue-50 text-blue-700',
  female: 'bg-pink-50 text-pink-700',
  other:  'bg-violet-50 text-violet-700',
};

const Students = () => {
  const [search,       setSearch]       = useState('');
  const [classFilter,  setClassFilter]  = useState('');
  const [page,         setPage]         = useState(1);
  const [formOpen,     setFormOpen]     = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError, error } = useStudents({
    search:   search   || undefined,
    class_id: classFilter || undefined,
    page, limit: 20,
  });
  const { data: classesData } = useClasses({ limit: 100 });
  const deleteStudent = useDeleteStudent();

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student enrollment and parent contact information"
        action={
          <button
            onClick={() => { setEditingStudent(null); setFormOpen(true); }}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Plus size={15} /> Add student
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or admission number..."
            className="input-field pl-8"
          />
        </div>
        <SelectField value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }} className="sm:w-48">
          <option value="">All classes</option>
          {classesData?.data?.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </SelectField>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : isError ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Adm. No.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Class</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Parent contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data?.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <StudentAvatar student={student} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">
                            {student.first_name} {student.last_name}
                          </p>
                          {student.parent_name && (
                            <p className="text-xs text-gray-400">Parent: {student.parent_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                        {student.student_number}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{student.class_name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {student.parent_phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone size={11} className="text-gray-400" />
                            {student.parent_phone}
                          </div>
                        )}
                        {student.parent_email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail size={11} className="text-gray-400" />
                            {student.parent_email}
                          </div>
                        )}
                        {!student.parent_phone && !student.parent_email && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {student.gender ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${genderBadge[student.gender] || 'bg-gray-100 text-gray-600'}`}>
                          {student.gender}
                        </span>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setEditingStudent(student); setFormOpen(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-2.5">
            {data?.data?.map(student => (
              <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <StudentAvatar student={student} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 leading-tight">
                      {student.first_name} {student.last_name}
                    </p>
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                      {student.student_number}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">{student.class_name || 'No class'}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => { setEditingStudent(student); setFormOpen(true); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(student)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {student.parent_phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={11} className="text-gray-400" /> {student.parent_phone}
                    </div>
                  )}
                  {student.parent_email && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail size={11} className="text-gray-400" /> {student.parent_email}
                    </div>
                  )}
                  {student.gender && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${genderBadge[student.gender] || 'bg-gray-100 text-gray-600'}`}>
                      {student.gender}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-xs text-gray-500 hidden sm:inline">
                Page {data.meta.page} of {data.meta.total_pages} · {data.meta.total} students
              </span>
              <div className="flex gap-2 mx-auto sm:mx-0">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-3 py-1.5">
                  Previous
                </button>
                <button disabled={page >= data.meta.total_pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-3 py-1.5">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <StudentFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingStudent}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteStudent.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        title="Delete student"
        message={`Delete "${deleteTarget?.first_name} ${deleteTarget?.last_name}"? Students with existing results cannot be deleted.`}
        isLoading={deleteStudent.isPending}
      />
    </div>
  );
};

export default Students;