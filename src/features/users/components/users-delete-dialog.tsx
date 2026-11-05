'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!currentRow?.id) return
    setLoading(true)
    try {
      // Xóa thật khỏi collection 'study_members' trên Firebase Firestore
      await deleteDoc(doc(db, 'study_members', currentRow.id))
      onOpenChange(false)
      window.location.reload() // Tải lại trang để cập nhật lại bảng
    } catch (error) {
      console.error('Lỗi khi xóa thành viên: ', error)
      alert('Không thể xóa thành viên, vui lòng thử lại!')
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
          Xóa thành viên
        </span>
      }
      desc={
        <p className='mb-2'>
          Bạn có chắc chắn muốn xóa thành viên{' '}
          <span className='font-bold'>{currentRow.name || currentRow.username}</span> khỏi hệ thống không?
          <br />
          Hành động này không thể hoàn tác.
        </p>
      }
      confirmText={loading ? 'Đang xóa...' : 'Xóa'}
      destructive
    />
  )
}
