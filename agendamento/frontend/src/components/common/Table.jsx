import LoadingSpinner from './LoadingSpinner';

export default function Table({ columns, data, loading, emptyMessage = 'Nenhum dado encontrado.' }) {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data?.map((row, i) => (
              <tr
                key={row.id || i}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-300">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
