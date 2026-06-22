import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-1">
        Page not found
      </h1>
      <Link to="/dashboard" className="btn-secondary mt-3">
        Back to dashboard
      </Link>
    </div>
  );
};

export default NotFound;
