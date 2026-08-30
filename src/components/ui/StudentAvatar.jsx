const COLORS = [
  ['#1a2744','#c9a84c'], ['#1a3a2a','#86efac'], ['#1e3a5f','#93c5fd'],
  ['#3b0764','#d8b4fe'], ['#431407','#fdba74'], ['#064e3b','#6ee7b7'],
];

const getColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

const initials = (first = '', last = '') =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export const StudentAvatar = ({ student, size = 'md', className = '' }) => {
  const sizes = {
    xs:  { box: 'w-7 h-7',   text: 'text-xs'  },
    sm:  { box: 'w-9 h-9',   text: 'text-sm'  },
    md:  { box: 'w-11 h-11', text: 'text-sm'  },
    lg:  { box: 'w-16 h-16', text: 'text-lg'  },
    xl:  { box: 'w-24 h-24', text: 'text-2xl' },
  };

  const { box, text } = sizes[size] || sizes.md;
  const [bg, fg] = getColor(student?.first_name);

  if (student?.photo_url) {
    return (
      <img
        src={student.photo_url}
        alt={`${student.first_name} ${student.last_name}`}
        className={`${box} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${box} rounded-full flex items-center justify-center font-bold shrink-0 ${text} ${className}`}
      style={{ background: bg, color: fg }}
    >
      {initials(student?.first_name, student?.last_name)}
    </div>
  );
};