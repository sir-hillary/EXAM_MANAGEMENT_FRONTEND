const DataTable = ({
  columns,
  data,
  keyField = "id",
  actions,
  emptyMessage = "No records found",
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg py-10 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-compact">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.header}</th>
                ))}
                {actions && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row[keyField]}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-2.5">
        {data.map((row) => (
          <div
            key={row[keyField]}
            className="bg-white border border-gray-200 rounded-lg p-3.5"
          >
            <div className="space-y-1.5">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">
                    {col.header}
                  </span>
                  <span className="text-sm text-gray-800 text-right">
                    {col.render ? col.render(row) : row[col.key]}
                  </span>
                </div>
              ))}
            </div>
            {actions && (
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                {actions(row)}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default DataTable;
