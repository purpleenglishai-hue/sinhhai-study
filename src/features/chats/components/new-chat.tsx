import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getDisplayNameInitials } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Import Firebase
import { db, auth } from '@/firebase'
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore'

type NewChatProps = {
  users?: any[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewChat({ open, onOpenChange }: NewChatProps) {
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const currentUser = auth.currentUser

  // 1. Tải danh sách tất cả users từ Firestore khi mở modal
  useEffect(() => {
    if (!open) return

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'))
        const list = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((u: any) => u.id !== currentUser?.uid) // Loại bỏ chính mình
        setAllUsers(list)
      } catch (error) {
        console.error("Lỗi tải danh sách users:", error)
      }
    }

    fetchUsers()
  }, [open, currentUser])

  // Lọc user theo từ khóa tìm kiếm
  const filteredUsers = allUsers.filter(user => 
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      setSelectedUser(null)
      setSearchQuery('')
    }
  }

  // 2. Tạo hoặc mở phòng chat trên Firestore khi bấm nút Chat
  const handleStartChat = async () => {
    if (!selectedUser || !currentUser) return

    try {
      const chatsRef = collection(db, 'conversations')

      // Kiểm tra xem đã có phòng chat giữa 2 user này chưa
      const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid))
      const querySnapshot = await getDocs(q)
      
      let existingChatId: string | null = null
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data()
        if (data.participants && data.participants.includes(selectedUser.id)) {
          existingChatId = docSnap.id
        }
      })

      // Nếu chưa có, tạo phòng chat mới
      if (!existingChatId) {
        await addDoc(chatsRef, {
          participants: [currentUser.uid, selectedUser.id],
          fullName: selectedUser.fullName || selectedUser.email,
          username: selectedUser.email?.split('@')[0] || 'user',
          profile: selectedUser.profile || 'https://randomuser.me/api/portraits/lego/1.jpg',
          title: 'Thành viên hệ thống',
          updatedAt: serverTimestamp(),
          messages: []
        })
      }

      onOpenChange(false)
      setSelectedUser(null)
      window.location.reload() // Tải lại để hiện phòng chat ở Inbox
    } catch (error) {
      console.error("Lỗi tạo phòng chat:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-150'>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-sm text-muted-foreground'>To:</span>
            {selectedUser && (
              <Badge variant='default' className='flex items-center gap-1'>
                {selectedUser.fullName || selectedUser.email}
                <button onClick={() => setSelectedUser(null)}>
                  <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                </button>
              </Badge>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Input
              placeholder='Search people by name or email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='text-foreground'
            />
            <div className='max-h-60 overflow-y-auto space-y-1 rounded-lg border p-2'>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={user.profile} />
                        <AvatarFallback>{getDisplayNameInitials(user.fullName || user.email)}</AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='text-sm font-medium'>
                          {user.fullName || user.email}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {user.email}
                        </span>
                      </div>
                    </div>

                    {selectedUser?.id === user.id && (
                      <Check className='h-4 w-4' />
                    )}
                  </div>
                ))
              ) : (
                <p className='text-center text-sm text-muted-foreground py-4'>No people found.</p>
              )}
            </div>
          </div>

          <Button
            variant={'default'}
            onClick={handleStartChat}
            disabled={!selectedUser}
          >
            Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
