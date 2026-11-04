'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { auth, db } from '@/firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

type TaskMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function TasksMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TaskMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Vui lòng gõ "${CONFIRM_WORD}" để xác nhận.`)
      return
    }

    const user = auth.currentUser
    if (!user) {
      toast.error('Vui lòng đăng nhập lại để thực hiện!')
      return
    }

    setIsDeleting(true)
    try {
      // Xóa thật từng task được chọn trên Firestore
      const deletePromises = selectedRows.map((row: any) => {
        const taskId = row.original.id
        const taskRef = doc(db, `users/${user.uid}/tasks`, taskId)
        return deleteDoc(taskRef)
      })

      await Promise.all(deletePromises)

      toast.success(`Đã xóa thành công ${selectedRows.length} nhiệm vụ!`)
      setValue('')
      table.resetRowSelection()
      onOpenChange(false)
    } catch (error) {
      console.error('Lỗi khi xóa nhiều nhiệm vụ:', error)
      toast.error('Đã xảy ra lỗi khi xóa nhiệm vụ trên hệ thống.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='tasks-multi-delete-form'
      disabled={value.trim() !== CONFIRM_WORD || isDeleting}
      title={
        <span className='text-destructive flex items-center'>
          <AlertTriangle className='me-1 inline-block stroke-destructive' size={18} />
          Xóa {selectedRows.length} {selectedRows.length > 1 ? 'nhiệm vụ' : 'nhiệm vụ'}
        </span>
      }
      desc={
        <form
          id='tasks-multi-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Bạn có chắc chắn muốn xóa các nhiệm vụ đã chọn không? <br />
            Hành động này không thể hoàn tác.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>Xác nhận bằng cách gõ chữ "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Nhập "${CONFIRM_WORD}" để xác nhận.`}
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Cảnh báo!</AlertTitle>
            <AlertDescription>
              Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống của bạn.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText={isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
      destructive
    />
  )
}
