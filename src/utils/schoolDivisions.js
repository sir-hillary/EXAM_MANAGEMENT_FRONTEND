export const getDivision = (gradeLevel) => {
  const g = Number(gradeLevel);
  if (g >= 4 && g <= 6) return { label: 'Primary',      color: 'bg-green-100 text-green-700' };
  if (g >= 7 && g <= 8) return { label: 'Junior School', color: 'bg-blue-100 text-blue-700' };
  return { label: 'Other', color: 'bg-gray-100 text-gray-600' };
};

export const divisionFromGrade = (g) => getDivision(g).label;