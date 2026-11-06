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
import { collection, getDocs, addDoc, serverTimestamp, query, where, doc, getDoc, setDoc } from 'firebase/firestore'

type NewChatProps = {
  users?: any[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectNewChat?: (chatData: any) => void
}

export function NewChat({ open, onOpenChange, onSelectNewChat }: NewChatProps) {
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const currentUser = auth.currentUser

  useEffect(() => {
    if (!open || !currentUser) return

    const syncAndFetchUsers = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            fullName: currentUser.displayName || currentUser.email?.split('@')[0],
            profile: currentUser.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
            createdAt: serverTimestamp()
          })
        }

        const querySnapshot = await getDocs(collection(db, 'users'))
        const list = querySnapshot.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((u: any) => u.id !== currentUser.uid)
        setAllUsers(list)
      } catch (error) {
        console.error("Lỗi tải users:", error)
      }
    }

    syncAndFetchUsers()
  }, [open, currentUser])

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

  const handleStartChat = async () => {
    if (!selectedUser || !currentUser) return

    try {
      const chatsRef = collection(db, 'conversations')
      const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid))
      const querySnapshot = await getDocs(q)
      
      let existingChatId: string | null = null
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data()
        if (data.participants && data.participants.includes(selectedUser.id)) {
          existingChatId = docSnap.id
        }
      })

      let chatId = existingChatId

      if (!chatId) {
        const newDocRef = await addDoc(chatsRef, {
          participants: [currentUser.uid, selectedUser.id],
          fullName: selectedUser.fullName || selectedUser.email,
          username: selectedUser.email?.split('@')[0] || 'user',
          profile: selectedUser.profile || 'https://randomuser.me/api/portraits/lego/1.jpg',
          title: 'Thành viên hệ thống',
          updatedAt: serverTimestamp(),
          messages: []
        })
        chatId = newDocRef.id
      }

      onOpenChange(false)
      if (onSelectNewChat && chatId) {
        onSelectNewChat({
          id: chatId,
          fullName: selectedUser.fullName || selectedUser.email,
          username: selectedUser.email?.split('@')[0] || 'user',
          profile: selectedUser.profile || 'https://randomuser.me/api/portraits/lego/1.jpg',
          title: 'Thành viên hệ thống',
          messages: []
        })
      }

      setSelectedUser(null)
    } catch (error) {
      console.error("Lỗi tạo phòng chat:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-sm text-muted-foreground'>To:</span>
            {selectedUser && (
              <Badge variant={'default' as any} className='flex items-center gap-1'>
                {selectedUser.fullName || selectedUser.email}
                <button type="button" onClick={() => setSelectedUser(null)}>
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
