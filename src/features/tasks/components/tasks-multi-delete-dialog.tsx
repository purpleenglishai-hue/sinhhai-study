'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { auth, db } from '@/firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'

type TaskMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function TasksMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TaskMultiDeleteDialogProps<TData>) {
  const [isDeleting, setIsDeleting] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    const user = auth.currentUser
    if (!user) {
      toast.error('Vui lòng đăng nhập lại để thực hiện!')
      return
    }

    setIsDeleting(true)
    try {
      const deletePromises = selectedRows.map((row: any) => {
        const taskId = row.original.id
        const taskRef = doc(db, `users/${user.uid}/tasks`, taskId)
        return deleteDoc(taskRef)
      })

      await Promise.all(deletePromises)

      toast.success(`Đã xóa thành công ${selectedRows.length} nhiệm vụ!`)
      table.resetRowSelection()
      onOpenChange(false)
    } catch (error) {
      console.error('Lỗi khi xóa nhiệm vụ:', error)
      toast.error('Đã xảy ra lỗi khi xóa nhiệm vụ trên hệ thống.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      disabled={isDeleting}
      title={
        <span className='text-destructive flex items-center'>
          <AlertTriangle className='me-1 inline-block stroke-destructive' size={18} />
          Xác nhận xóa {selectedRows.length} {selectedRows.length > 1 ? 'nhiệm vụ' : 'nhiệm vụ'}
        </span>
      }
      desc={
        <div className='py-3'>
          <p className='text-sm text-muted-foreground'>
            Bạn có chắc chắn muốn xóa các nhiệm vụ đã chọn khỏi danh sách học tập không?
          </p>
        </div>
      }
      confirmText={isDeleting ? 'Đang xóa...' : 'Xóa ngay'}
      destructive
      handleConfirm={handleDelete}
    />
  )
}
