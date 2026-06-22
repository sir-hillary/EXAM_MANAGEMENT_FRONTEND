import { Link } from "react-router-dom";

const StatCard = ({ label, value, icon: Icon, to, color = "brand" }) => {
  const colorMap = {
    brand: { icon: "text-brand-600", bg: "bg-brand-50" },
    green: { icon: "text-green-600", bg: "bg-green-50" },
    amber: { icon: "text-amber-600", bg: "bg-amber-50" },
    purple: { icon: "text-purple-600", bg: "bg-purple-50" },
  };
  const c = colorMap[color] || colorMap.brand;

  const inner = (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-3 hover:border-gray-300 transition-colors">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">
          {value === null ? (
            <span className="inline-block h-6 w-12 bg-gray-100 rounded animate-pulse" />
          ) : (
            value
          )}
        </p>
      </div>
      {Icon && (
        <div className={`${c.bg} p-2 rounded-md`}>
          <Icon size={18} className={c.icon} />
        </div>
      )}
    </div>
  );

  return to ? <Link to={to}>{inner}</Link> : inner;
};

export default StatCard;
