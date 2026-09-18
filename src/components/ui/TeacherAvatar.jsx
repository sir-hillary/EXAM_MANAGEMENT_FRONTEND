const COLORS = [
  ["#1a2744", "#c9a84c"],
  ["#1a3a2a", "#86efac"],
  ["#1e3a5f", "#93c5fd"],
  ["#3b0764", "#d8b4fe"],
  ["#431407", "#fdba74"],
  ["#064e3b", "#6ee7b7"],
];

const SIZES = {
  xs: {
    box: "w-7 h-7",
    text: "text-[10px]",
    ring: "ring-1",
  },
  sm: {
    box: "w-9 h-9",
    text: "text-xs",
    ring: "ring-1",
  },
  md: {
    box: "w-11 h-11",
    text: "text-sm",
    ring: "ring-2",
  },
  lg: {
    box: "w-16 h-16",
    text: "text-lg",
    ring: "ring-2",
  },
  xl: {
    box: "w-24 h-24",
    text: "text-2xl",
    ring: "ring-2",
  },
};

const DESIGNATIONS = {
  headteacher: {
    label: "Head Teacher",
    color: "#b45309",
    bg: "#fef3c7",
  },

  deputy_headteacher: {
    label: "Deputy Head Teacher",
    color: "#0369a1",
    bg: "#e0f2fe",
  },

  teacher: {
    label: "Teacher",
    color: "#15803d",
    bg: "#f0fdf4",
  },
};

const getColor = (name = "") => {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return COLORS[0];
  }

  const index = normalizedName.charCodeAt(0) % COLORS.length;

  return COLORS[index];
};

const getInitials = (firstName = "", lastName = "") => {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);

  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }

  return "?";
};

const getFullName = (teacher) => {
  const name = `${teacher?.first_name || ""} ${teacher?.last_name || ""}`.trim();

  return name || "Teacher";
};

export const TeacherAvatar = ({
  teacher,
  size = "md",
  showBadge = false,
  showStatus = false,
  className = "",
}) => {
  const { box, text, ring } = SIZES[size] || SIZES.md;

  const firstName = teacher?.first_name || "";
  const lastName = teacher?.last_name || "";

  const [backgroundColor, foregroundColor] = getColor(firstName || lastName);

  const fullName = getFullName(teacher);

  const designation = teacher?.designation;
  const badge = DESIGNATIONS[designation];

  const isActive = teacher?.is_active !== false;

  return (
    <div
      className={`relative inline-flex shrink-0 flex-col items-center ${className}`}
    >
      {/* Avatar */}
      <div className="relative">
        {teacher?.profile_photo_url ? (
          <img
            src={teacher.profile_photo_url}
            alt={`${fullName} profile`}
            loading="lazy"
            className={`${box} ${ring} rounded-full object-cover ring-white shadow-sm`}
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.nextElementSibling?.classList.remove(
                "hidden"
              );
            }}
          />
        ) : null}

        {/* Initials fallback */}
        <div
          className={`${box} ${ring} ${
            teacher?.profile_photo_url ? "hidden" : "flex"
          } items-center justify-center rounded-full font-bold ${text} ring-white shadow-sm`}
          style={{
            backgroundColor,
            color: foregroundColor,
          }}
          aria-label={`${fullName} initials`}
        >
          {getInitials(firstName, lastName)}
        </div>

        {/* Online / active status */}
        {showStatus && (
          <span
            className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
              isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
            title={isActive ? "Active" : "Inactive"}
            aria-label={isActive ? "Active teacher" : "Inactive teacher"}
          />
        )}
      </div>

      {/* Designation */}
      {showBadge && badge && (
        <span
          className="mt-1 rounded-full px-2 py-0.5 text-center text-[10px] font-semibold leading-tight whitespace-nowrap"
          style={{
            backgroundColor: badge.bg,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
      )}
    </div>
  );
};