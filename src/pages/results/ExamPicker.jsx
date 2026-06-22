import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardEdit, BarChart3 } from 'lucide-react';
import { useExams } from '../../hooks/useExams';
import { useClasses } from '../../hooks/useClasses';
import  PageHeader  from '../../components/ui/PageHeader';
import  DataTable  from '../../components/ui/DataTable';
import  SelectField  from '../../components/ui/SelectField';
import  Spinner  from '../../components/ui/spinner';

const examTypeBadge = {
  'Mid-term': 'bg-amber-100 text-amber-700',
  'End-term': 'bg-purple-100 text-purple-700',
};

const ExamPicker =() => {
  const navigate = useNavigate();
  const [classFilter, setClassFilter] = useState('');
  const { data, isLoading } = useExams({ class_id: classFilter || undefined });
  const { data: classesData } = useClasses({ limit: 100 });

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'class_name', header: 'Class' },
    { key: 'subject_name', header: 'Subject' },
    {
      key: 'exam_type',
      header: 'Type',
      render: (row) => <span className={`badge ${examTypeBadge[row.exam_type] || 'bg-gray-100 text-gray-700'}`}>{row.exam_type}</span>,
    },
    { key: 'exam_date', header: 'Date', render: (row) => new Date(row.exam_date).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Results" description="Select an exam to enter marks or view a summary" />

      <div className="mb-4 sm:w-64">
        <SelectField value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All classes</option>
          {classesData?.data?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </SelectField>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data}
          emptyMessage="No exams found"
          actions={(row) => (
            <>
              <button
                onClick={() => navigate(`/results/entry/${row.id}`)}
                className="text-gray-400 hover:text-brand-600"
                aria-label="Enter marks"
                title="Enter marks"
              >
                <ClipboardEdit size={16} />
              </button>
              <button
                onClick={() => navigate(`/results/summary/${row.id}`)}
                className="text-gray-400 hover:text-brand-600"
                aria-label="View summary"
                title="View summary"
              >
                <BarChart3 size={16} />
              </button>
            </>
          )}
        />
      )}
    </div>
  );
}

export default ExamPicker