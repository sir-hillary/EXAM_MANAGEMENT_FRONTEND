const Tabs = ({ tabs, active, onChange }) => {
  return (
    <div className="border-b border-gray-200 mb-4 overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-3.5 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              active === tab.key
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
