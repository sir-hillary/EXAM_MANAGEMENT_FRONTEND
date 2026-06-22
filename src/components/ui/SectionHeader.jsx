import { Link } from "react-router-dom";
const SectionHeader = ({ title, linkTo, linkLabel }) => (
  <div className="flex items-center justify-between mb-2.5">
    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
    {linkTo && (
      <Link
        to={linkTo}
        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
      >
        {linkLabel || "View all →"}
      </Link>
    )}
  </div>
);

export default SectionHeader;
