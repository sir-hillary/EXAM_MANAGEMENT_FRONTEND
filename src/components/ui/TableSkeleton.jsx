const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full table-compact">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri}>
              {Array.from({ length: cols }).map((_, ci) => (
                <td key={ci}>
                  <div
                    className={`h-4 bg-gray-100 rounded animate-pulse ${ci === 0 ? "w-1/2" : "w-3/4"}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TableSkeleton;
