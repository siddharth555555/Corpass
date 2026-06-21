import { cn } from "@/lib/admin-utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr key={String(row[keyField])} className="hover:bg-paper-2 transition-colors">
              {columns.map((col) => (
                <td key={String(col.key)} className={cn("px-6 py-4 text-ink", col.className)}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
