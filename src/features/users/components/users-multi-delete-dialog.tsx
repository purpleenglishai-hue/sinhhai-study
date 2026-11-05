'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserMultiDeleteDialogProps<TData>) {
  const [loading, setLoading] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (selectedRows.length === 0) return
    setLoading(true)
    try {
      // Xóa đồng thời tất cả các dòng được chọn trên Firebase Firestore
      const deletePromises = selectedRows.map((row) => {
        const user = row.original as User
        if (user.id) {
          return deleteDoc(doc(db, 'study_members', user.id))
        }
        return Promise.resolve()
      })

      await Promise.all(deletePromises)

      table.resetRowSelection()
      onOpenChange(false)
      window.location.reload() // Tải lại trang để cập nhật lại bảng
    } catch (error) {
      console.error('Lỗi khi xóa nhiều thành viên: ', error)
      alert('Không thể xóa các thành viên đã chọn, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={loading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Xóa {selectedRows.length} thành viên đã chọn
        </span>
      }
      desc={
        <p className='mb-2'>
          Bạn có chắc chắn muốn xóa vĩnh viễn {selectedRows.length} thành viên đã chọn khỏi hệ thống?
          <br />
          Hành động này không thể hoàn tác.
        </p>
      }
      confirmText={loading ? 'Đang xóa...' : 'Xóa tất cả'}
      destructive
    />
  )
}
