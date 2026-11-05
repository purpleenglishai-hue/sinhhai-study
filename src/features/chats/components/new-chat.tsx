import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type ChatUser } from '../data/chat-types'

// Import Firebase
import { db, auth } from '@/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'

type User = Omit<ChatUser, 'messages'>

type NewChatProps = {
  users: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewChat({ users, onOpenChange, open }: NewChatProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const currentUser = auth.currentUser

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    } else {
      handleRemoveUser(user.id)
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      setSelectedUsers([])
    }
  }

  // Xử lý tạo phòng chat thật trên Firestore khi bấm nút Chat
  const handleStartChat = async () => {
    if (selectedUsers.length === 0 || !currentUser) return

    try {
      const targetUser = selectedUsers[0] // Lấy user đầu tiên được chọn để chat 1-1
      const chatsRef = collection(db, 'conversations')

      // Kiểm tra xem đã có phòng chat giữa 2 user này chưa
      const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid))
      const querySnapshot = await getDocs(q)
      
      let existingChatId: string | null = null
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data()
        if (data.participants && data.participants.includes(targetUser.id)) {
          existingChatId = docSnap.id
        }
      })

      // Nếu chưa có, tạo mới document trong collection conversations
      if (!existingChatId) {
        await addDoc(chatsRef, {
          participants: [currentUser.uid, targetUser.id],
          fullName: targetUser.fullName,
          username: targetUser.username || 'user',
          profile: targetUser.profile || 'https://randomuser.me/api/portraits/lego/1.jpg',
          title: targetUser.title || 'Thành viên hệ thống',
          updatedAt: serverTimestamp(),
          messages: []
        })
      }

      onOpenChange(false)
      setSelectedUsers([])
      // Tải lại trang để cập nhật danh sách phòng chat ở cột Inbox bên trái
      window.location.reload()
    } catch (error) {
      console.error("Lỗi khi tạo phòng chat:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-150'>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-baseline-last gap-2'>
            <span className='min-h-6 text-sm text-muted-foreground'>To:</span>
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant='default'>
                {user.fullName}
                <button
                  className='ms-1 rounded-full ring-offset-background outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRemoveUser(user.id)
                    }
                  }}
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                </button>
              </Badge>
            ))}
          </div>
          <Command className='rounded-lg border'>
            <CommandInput
              placeholder='Search people...'
              className='text-foreground'
            />
            <CommandList>
              <CommandEmpty>No people found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelectUser(user)}
                    className='flex items-center justify-between gap-2 hover:bg-accent hover:text-accent-foreground'
                  >
                    <div className='flex items-center gap-2'>
                      <img
                        src={user.profile || '/placeholder.svg'}
                        alt={user.fullName}
                        className='h-8 w-8 rounded-full'
                      />
                      <div className='flex flex-col'>
                        <span className='text-sm font-medium'>
                          {user.fullName}
                        </span>
                        <span className='text-xs text-accent-foreground/70'>
                          {user.username}
                        </span>
                      </div>
                    </div>

                    {selectedUsers.find((u) => u.id === user.id) && (
                      <Check className='h-4 w-4' />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <Button
            variant={'default'}
            onClick={handleStartChat}
            disabled={selectedUsers.length === 0}
          >
            Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
