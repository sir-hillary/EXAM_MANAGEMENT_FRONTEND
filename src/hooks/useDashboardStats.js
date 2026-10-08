import { useClasses } from "./useClasses";
import { useTeachers } from "./useTeachers";
import { useSubjects } from "./useSubjects";
import { useStudents, useStudentResults } from "./useStudents";
import { useExams } from "./useExams";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";

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

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn:  () => apiClient.get('/dashboard/stats').then(r => r.data.data),
    staleTime: 2 * 60 * 1000,   // 2 minutes
    refetchOnWindowFocus: false,
  });
export const useTeacherDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'teacher-stats'],
    queryFn:  () => apiClient.get('/dashboard/teacher-stats').then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useStudentDashboard = (studentId) => {
  const myResults = useStudentResults(studentId);

  return {
    results: myResults.data?.data ?? [],
    isLoading: myResults.isLoading,
  };
};

export default useAdminStats;
