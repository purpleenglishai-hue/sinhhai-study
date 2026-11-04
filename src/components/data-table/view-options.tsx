import { type Table } from '@tanstack/react-table'

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table: _table,
}: DataTableViewOptionsProps<TData>) {
  return null
}
