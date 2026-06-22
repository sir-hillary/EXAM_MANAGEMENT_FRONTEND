export const gradeBadgeColor = {
  EE1: 'bg-green-100 text-green-700',
  EE2: 'bg-green-50 text-green-500',
  ME1: 'bg-emerald-100 text-emerald-700',
  ME2: 'bg-emerald-50 text-emerald-500',
  AE1: 'bg-amber-100 text-amber-700',
  AE2: 'bg-amber-50 text-amber-500',
  BE1: 'bg-orange-100 text-orange-700',
  BE2: 'bg-red-50 text-red-500',
};

export const gradeBadge = (grade) => gradeBadgeColor[grade] || 'bg-gray-100 text-gray-700';