const SelectField = ({ label, error, children, ...props }) => (
  <div>
    {label && (
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
    )}
    <select className="input-field" {...props}>
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default SelectField;
