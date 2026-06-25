export const getDivision = (gradeLevel) => {
  const g = Number(gradeLevel);
  if (g >= 4 && g <= 6) return { label: 'Primary',      color: 'bg-green-100 text-green-700', key: 'primary' };
  if (g >= 7 && g <= 8) return { label: 'Junior School', color: 'bg-blue-100 text-blue-700', key: 'junior' };
  return { label: 'Other', color: 'bg-gray-100 text-gray-600', key: "other" };
};

export const isPrimary = (gradeLevel) => getDivision(gradeLevel).key === 'primary';
export const isJunior  = (gradeLevel) => getDivision(gradeLevel).key === 'junior';