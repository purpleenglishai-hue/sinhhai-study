import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { labels, priorities, statuses } from '../data/data'
import { type Task } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { CalendarIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Chọn tất cả'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Chọn hàng'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã NV' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      const shortId = id && id.length > 8 ? `#${id.substring(0, 6)}` : id
      return <div className='w-[70px] font-mono text-xs text-muted-foreground'>{shortId}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tiêu đề nhiệm vụ' />
    ),
    cell: ({ row }) => {
      const label = labels.find((l) => l.value === row.original.label)

      return (
        <div className='flex items-center space-x-2'>
          {label && <Badge variant='outline'>{label.label}</Badge>}
          <span className='max-w-[200px] truncate font-medium sm:max-w-[280px]'>
            {row.getValue('title')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày bắt đầu' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('startDate') as string
      return (
        <div className='flex items-center text-xs text-muted-foreground'>
          <CalendarIcon className='mr-1.5 h-3.5 w-3.5' />
          {date || 'Chưa đặt'}
        </div>
      )
    },
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hạn chót (Deadline)' />
    ),
    cell: ({ row }) => {
      const dueDateStr = row.getValue('dueDate') as string
      const status = row.getValue('status') as string
      
      // Kiểm tra tính toán cảnh báo deadline
      let isOverdue = false
      if (dueDateStr && status !== 'done' && status !== 'canceled') {
        const today = new Date()
        const due = new Date(dueDateStr)
        if (due < today) {
          isOverdue = true
        }
      }

      return (
        <div className='flex items-center space-x-1.5 text-xs'>
          <CalendarIcon className='h-3.5 w-3.5 text-muted-foreground' />
          <span className={isOverdue ? 'font-bold text-destructive' : 'text-muted-foreground'}>
            {dueDateStr || 'Không có'}
          </span>
          {isOverdue && (
            <span title='Đã quá hạn!' className='flex items-center text-destructive'>
              <ExclamationTriangleImportIcon className='h-4 w-4 animate-pulse' />
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (s) => s.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[130px] items-center'>
          {status.icon && (
            <status.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Độ ưu tiên' />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (p) => p.value === row.getValue('priority')
      )

      if (!priority) {
        return null
      }

      return (
        <div className='flex items-center'>
          {priority.icon && (
            <priority.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
