import { useClasses } from "./useClasses";
import { useTeachers } from "./useTeachers";
import { useSubjects } from "./useSubjects";
import { useStudents, useStudentResults } from "./useStudents";
import { useExams } from "./useExams";

const useAdminStats = () => {
  const classes = useClasses({ limit: 1 });
  const teachers = useTeachers({ limit: 1 });
  const students = useStudents({ limit: 1 });
  const subjects = useSubjects({ limit: 1 });
  const recentExams = useExams({ limit: 5 });

  return {
    counts: {
      classes: classes.data?.meta?.total ?? null,
      teachers: teachers.data?.meta?.total ?? null,
      students: students.data?.meta?.total ?? null,
      subjects: subjects.data?.meta?.total ?? null,
    },
    recentExams: recentExams.data?.data ?? [],
    isLoading:
      classes.isLoading ||
      teachers.isLoading ||
      students.isLoading ||
      subjects.isLoading,
  };
};

export const useTeacherDashboard = (teacherId) => {
  const myExams = useExams({ teacher_id: teacherId, limit: 10 });

  return {
    exams: myExams.data?.data ?? [],
    isLoading: myExams.isLoading,
  };
};

export const useStudentDashboard = (studentId) => {
  const results = useStudents(
    {},
    { enabled: false }, // not needed — we use the direct results hook
  );
  const myResults = useStudentResults(studentId);

  return {
    results: myResults.data?.data ?? [],
    isLoading: myResults.isLoading,
  };
};

export default useAdminStats;
