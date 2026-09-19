import {
useQuery,
useMutation,
useQueryClient,
} from "@tanstack/react-query";

import { examsApi } from "../api";
import toast from "react-hot-toast";

/**

* Extract a readable error message from the API response.
  */
  const getErrorMessage = (err, fallback) => {
  return (
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  fallback
  );
  };

/**

* Fetch exams with optional filters.
  */
  export const useExams = (params = {}) => {
  return useQuery({
  queryKey: ["exams", params],
  queryFn: () => examsApi.getAll(params),
  });
  };

/**

* Fetch a single exam by ID.
  */
  export const useExam = (id) => {
  return useQuery({
  queryKey: ["exams", id],
  queryFn: () => examsApi.getById(id),
  enabled: Boolean(id),
  });
  };

/**

* Fetch results belonging to an exam.
  */
  export const useExamResults = (id) => {
  return useQuery({
  queryKey: ["exams", id, "results"],
  queryFn: () => examsApi.getResults(id),
  enabled: Boolean(id),
  });
  };

/**

* Create a new exam.
*
* Expected payload:
* {
* title,
* class_id,
* teacher_id,
* exam_date,
* total_questions,
* exam_type_id,
* term_number,
* academic_year,
* subjects: [{ subject_id, question_count }]
* }
  */
  export const useCreateExam = () => {
  const queryClient = useQueryClient();

return useMutation({
mutationFn: (payload) => examsApi.create(payload),

onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ["exams"],
  });

  toast.success("Examination created successfully!");
},

onError: (err) => {
  toast.error(
    getErrorMessage(err, "Failed to create examination.")
  );
},


});
};

/**

* Update an exam using PUT.
  */
  export const useUpdateExam = () => {
  const queryClient = useQueryClient();

return useMutation({
mutationFn: ({ id, payload }) => examsApi.update(id, payload),
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({
    queryKey: ["exams"],
  });

  queryClient.invalidateQueries({
    queryKey: ["exams", variables.id],
  });

  queryClient.invalidateQueries({
    queryKey: ["exams", variables.id, "results"],
  });

  toast.success("Examination updated successfully!");
},

onError: (err) => {
  toast.error(
    getErrorMessage(err, "Failed to update examination.")
  );
},

});
};

/**

* Partially update an exam using PATCH.
  */
  export const usePatchExam = () => {
  const queryClient = useQueryClient();

return useMutation({
mutationFn: ({ id, payload }) => examsApi.patch(id, payload),
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({
    queryKey: ["exams"],
  });

  queryClient.invalidateQueries({
    queryKey: ["exams", variables.id],
  });

  queryClient.invalidateQueries({
    queryKey: ["exams", variables.id, "results"],
  });

  toast.success("Examination updated successfully!");
},

onError: (err) => {
  toast.error(
    getErrorMessage(err, "Failed to update examination.")
  );
},

});
};

/**

* Delete an exam.
  */
  export const useDeleteExam = () => {
  const queryClient = useQueryClient();

return useMutation({
mutationFn: (id) => examsApi.remove(id),

onSuccess: (_, id) => {
  queryClient.invalidateQueries({
    queryKey: ["exams"],
  });

  queryClient.removeQueries({
    queryKey: ["exams", id],
  });

  queryClient.removeQueries({
    queryKey: ["exams", id, "results"],
  });

  toast.success("Examination deleted successfully!");
},

onError: (err) => {
  toast.error(
    getErrorMessage(err, "Failed to delete examination.")
  );
},

});
};
