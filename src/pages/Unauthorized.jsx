import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-1">
        Access denied
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        You don't have permission to view this page.
      </p>
      <Link to="/dashboard" className="btn-secondary">
        Back to dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
