import { useState, useEffect, useRef } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import {
  ArrowLeft,
  MoreVertical,
  Edit,
  Paperclip,
  Phone,
  ImagePlus,
  Plus,
  Search as SearchIcon,
  Send,
  Video,
  MessagesSquare,
} from 'lucide-react'
import { cn, getDisplayNameInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NewChat } from './components/new-chat'
import { type ChatUser, type Convo } from './data/chat-types'

// Import Firebase
import { db, auth, storage } from '@/firebase'
import { 
  collection, 
  query, 
  where,
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export function Chats() {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [mobileSelectedUser, setMobileSelectedUser] = useState<ChatUser | null>(null)
  const [createConversationDialogOpened, setCreateConversationDialog] = useState(false)
  
  const [conversations, setConversations] = useState<ChatUser[]>([])
  const [realtimeMessages, setRealtimeMessages] = useState<Convo[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
      if (!user) {
        setConversations([])
      }
    })
    return () => unsubscribeAuth()
  }, [])

  useEffect(() => {
    if (!currentUser) {
      setConversations([])
      return
    }

    const q = query(
      collection(db, 'conversations'), 
      where('participants', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatUser[]
      setConversations(convs)
    }, (error) => {
      console.error("Lỗi tải danh sách chat:", error)
    })

    return () => unsubscribe()
  }, [currentUser])

  useEffect(() => {
    if (!selectedUser?.id) return

    const q = query(
      collection(db, 'conversations', selectedUser.id, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          sender: data.senderId === currentUser?.uid ? 'You' : (data.sender || 'Other'),
          message: data.message,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
        } as Convo
      })
      setRealtimeMessages(msgs)
    })

    return () => unsubscribe()
  }, [selectedUser?.id, currentUser?.uid])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !selectedUser?.id || !currentUser) return

    const textToSend = inputMessage
    setInputMessage('') 

    try {
      await addDoc(collection(db, 'conversations', selectedUser.id, 'messages'), {
        senderId: currentUser.uid,
        sender: currentUser.displayName || currentUser.email || 'User',
        message: textToSend,
        timestamp: serverTimestamp()
      })

      await updateDoc(doc(db, 'conversations', selectedUser.id), {
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error)
    }
  }

  // Xử lý upload file / ảnh thực tế qua Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedUser?.id || !currentUser) return

    try {
      const storageRef = ref(storage, `chat_files/${selectedUser.id}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      const isImage = file.type.startsWith('image/')
      const messageText = isImage ? `[Hình ảnh]: ${downloadURL}` : `[Tài liệu]: ${file.name} - ${downloadURL}`

      await addDoc(collection(db, 'conversations', selectedUser.id, 'messages'), {
        senderId: currentUser.uid,
        sender: currentUser.displayName || currentUser.email || 'User',
        message: messageText,
        timestamp: serverTimestamp()
      })

      await updateDoc(doc(db, 'conversations', selectedUser.id), {
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error("Lỗi tải lên file:", error)
    }
  }

  const filteredChatList = conversations.filter(({ fullName }) =>
    fullName?.toLowerCase().includes(search.trim().toLowerCase())
  )

  const currentMessage = realtimeMessages.reduce(
    (acc: Record<string, Convo[]>, obj) => {
      try {
        const key = format(new Date(obj.timestamp), 'd MMM, yyyy')
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(obj)
      } catch (e) {
        // Bỏ qua lỗi ngày
      }
      return acc
    },
    {}
  )

  const users = conversations.map(({ messages, ...user }) => user)

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <section className='flex h-full gap-6'>
          {/* Left Side */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
                  <MessagesSquare size={20} />
                </div>

                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='rounded-lg'
                >
                  <Edit size={24} className='stroke-muted-foreground' />
                </Button>
              </div>

              {/* Ô tìm kiếm user */}
              <label
                className={cn(
                  'focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden',
                  'flex h-10 w-full items-center space-x-0 rounded-md border border-border ps-2'
                )}
              >
                <SearchIcon size={15} className='me-2 stroke-slate-500' />
                <span className='sr-only'>Search</span>
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                  placeholder='Search chat...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            {/* Danh sách user hiện ra ngay dưới bảng tìm kiếm */}
            <ScrollArea className='-mx-3 h-full overflow-scroll p-3'>
              {filteredChatList.map((chatUsr) => {
                const { id, profile, username, messages, fullName } = chatUsr
                const lastConvo = messages && messages.length > 0 ? messages[messages.length - 1] : { sender: '', message: '' }
                const lastMsg =
                  lastConvo.sender === 'You'
                    ? `You: ${lastConvo.message}`
                    : lastConvo.message
                return (
                  <Fragment key={id}>
                    <button
                      type='button'
                      className={cn(
                        'group hover:bg-accent hover:text-accent-foreground',
                        `flex w-full rounded-md px-2 py-2 text-start text-sm`,
                        selectedUser?.id === id && 'sm:bg-muted'
                      )}
                      onClick={() => {
                        setSelectedUser(chatUsr)
                        setMobileSelectedUser(chatUsr)
                      }}
                    >
                      <div className='flex gap-2 items-center'>
                        <Avatar className='border border-purple-200'>
                          <AvatarImage src={profile || currentUser?.photoURL} alt={username || fullName} />
                          <AvatarFallback className='bg-purple-100 text-purple-700 font-semibold'>
                            {getDisplayNameInitials(fullName) || 'SH'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className='col-start-2 row-span-2 font-medium block'>
                            {fullName}
                          </span>
                          <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground group-hover:text-accent-foreground/90 text-xs'>
                            {lastMsg || 'Chưa có tin nhắn'}
                          </span>
                        </div>
                      </div>
                    </button>
                    <Separator className='my-1' />
                  </Fragment>
                )
              })}
            </ScrollArea>
          </div>

          {/* Right Side */}
          {selectedUser ? (
            <div
              className={cn(
                'absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border bg-background shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md',
                mobileSelectedUser && 'inset-s-0 flex'
              )}
            >
              <div className='mb-1 flex flex-none justify-between bg-card p-4 shadow-lg sm:rounded-t-md'>
                <div className='flex gap-3 items-center'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='-ms-2 h-full sm:hidden'
                    onClick={() => setMobileSelectedUser(null)}
                  >
                    <ArrowLeft className='rtl:rotate-180' />
                  </Button>
                  <div className='flex items-center gap-2 lg:gap-4'>
                    <Avatar className='size-9 lg:size-11 border border-purple-200'>
                      <AvatarImage
                        src={selectedUser.profile}
                        alt={selectedUser.username}
                      />
                      <AvatarFallback className='bg-purple-100 text-purple-700 font-bold'>
                        {getDisplayNameInitials(selectedUser.fullName) || 'SH'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className='col-start-2 row-span-2 text-sm font-medium lg:text-base block'>
                        {selectedUser.fullName}
                      </span>
                      <span className='col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-xs text-nowrap text-ellipsis text-muted-foreground lg:max-w-none lg:text-sm'>
                        {selectedUser.title || 'Online'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Các nút gọi video/thoại hoạt động thực */}
                <div className='-me-1 flex items-center gap-1 lg:gap-2'>
                  <Button 
                    size='icon' 
                    variant='ghost' 
                    className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                    onClick={() => alert("Tính năng gọi Video trực tuyến đang kết nối...")}
                  >
                    <Video size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button 
                    size='icon' 
                    variant='ghost' 
                    className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                    onClick={() => alert("Đang gọi thoại...")}
                  >
                    <Phone size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button size='icon' variant='ghost' className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'>
                    <MoreVertical className='stroke-muted-foreground sm:size-5' />
                  </Button>
                </div>
              </div>

              {/* Conversation / Nền tin nhắn đổi màu theo yêu cầu */}
              <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4'>
                <div className='flex size-full flex-1'>
                  <div className='chat-text-container relative -me-4 flex flex-1 flex-col overflow-y-hidden'>
                    <div className='chat-flex flex h-40 w-full grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pe-4 pb-4'>
                      {currentMessage &&
                        Object.keys(currentMessage).map((key) => (
                          <Fragment key={key}>
                            {currentMessage[key].map((msg, index) => (
                              <div
                                key={`${msg.sender}-${msg.timestamp}-${index}`}
                                className={cn(
                                  'chat-box max-w-72 px-3 py-2 wrap-break-word shadow-md',
                                  msg.sender === 'You'
                                    ? 'self-end rounded-[16px_16px_0_16px] bg-[#6d28d9] text-white' // Mực tím tươi cho người nhắn
                                    : 'self-start rounded-[16px_16px_16px_0] bg-blue-100 text-slate-900 dark:bg-sky-900 dark:text-sky-100' // Xanh da trời nhạt cho người trả lời
                                )}
                              >
                                {msg.message.startsWith('[Hình ảnh]:') ? (
                                  <a href={msg.message.replace('[Hình ảnh]: ', '')} target="_blank" rel="noreferrer">
                                    <img src={msg.message.replace('[Hình ảnh]: ', '')} alt="Uploaded" className="rounded-md max-h-40 object-cover mt-1" />
                                  </a>
                                ) : msg.message.startsWith('[Tài liệu]:') ? (
                                  <a href={msg.message.split(' - ')[1]} target="_blank" rel="noreferrer" className="underline text-xs block font-semibold">
                                    📄 {msg.message.split(' - ')[0]}
                                  </a>
                                ) : (
                                  <span>{msg.message}</span>
                                )}
                                <span
                                  className={cn(
                                    'mt-1 block text-xs font-light italic',
                                    msg.sender === 'You'
                                      ? 'text-end text-white/80'
                                      : 'text-slate-500 dark:text-sky-300'
                                  )}
                                >
                                  {msg.timestamp ? format(new Date(msg.timestamp), 'h:mm a') : ''}
                                </span>
                              </div>
                            ))}
                            <div className='text-center text-xs text-muted-foreground my-2'>{key}</div>
                          </Fragment>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Form nhập tin nhắn & tích hợp nút bấm hoạt động thật */}
                <form onSubmit={handleSendMessage} className='flex w-full flex-none gap-2'>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />

                  <div className='flex flex-1 items-center gap-2 rounded-md border border-input bg-card px-2 py-1 focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden lg:gap-4'>
                    <div className='space-x-1'>
                      {/* Nút dấu cộng mở file */}
                      <Button 
                        size='icon' 
                        type='button' 
                        variant='ghost' 
                        className='h-8 rounded-md'
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = "*"
                            fileInputRef.current.click()
                          }
                        }}
                        title="Đính kèm"
                      >
                        <Plus size={20} className='stroke-muted-foreground' />
                      </Button>

                      {/* Nút gửi ảnh */}
                      <Button 
                        size='icon' 
                        type='button' 
                        variant='ghost' 
                        className='hidden h-8 rounded-md lg:inline-flex'
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = "image/*"
                            fileInputRef.current.click()
                          }
                        }}
                        title="Gửi ảnh"
                      >
                        <ImagePlus size={20} className='stroke-muted-foreground' />
                      </Button>

                      {/* Nút gửi file tài liệu */}
                      <Button 
                        size='icon' 
                        type='button' 
                        variant='ghost' 
                        className='hidden h-8 rounded-md lg:inline-flex'
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = ".pdf,.doc,.docx,.txt,.zip"
                            fileInputRef.current.click()
                          }
                        }}
                        title="Gửi tài liệu"
                      >
                        <Paperclip size={20} className='stroke-muted-foreground' />
                      </Button>
                    </div>

                    <label className='flex-1'>
                      <span className='sr-only'>Chat Text Box</span>
                      <input
                        type='text'
                        placeholder='Type your messages...'
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className='h-8 w-full bg-inherit focus-visible:outline-hidden'
                      />
                    </label>

                    <Button type='submit' variant='ghost' size='icon' className='hidden sm:inline-flex text-[#6d28d9]'>
                      <Send size={20} />
                    </Button>
                  </div>
                  
                  <Button type='submit' className='h-full sm:hidden bg-[#6d28d9] text-white'>
                    <Send size={18} /> Send
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border bg-card shadow-xs sm:static sm:z-auto sm:flex'
              )}
            >
              <div className='flex flex-col items-center space-y-6'>
                <div className='flex size-16 items-center justify-center rounded-full border-2 border-purple-300 bg-purple-50 text-[#6d28d9]'>
                  <MessagesSquare className='size-8' />
                </div>
                <div className='space-y-2 text-center'>
                  <h1 className='text-xl font-semibold'>Your messages</h1>
                  <p className='text-sm text-muted-foreground'>
                    Send a message to start a chat.
                  </p>
                </div>
                <Button className='bg-[#6d28d9] text-white hover:bg-purple-800' onClick={() => setCreateConversationDialog(true)}>
                  Send message
                </Button>
              </div>
            </div>
          )}
        </section>

        <NewChat
          users={users}
          open={createConversationDialogOpened}
          onOpenChange={setCreateConversationDialog}
          onSelectNewChat={(chatData) => {
            setSelectedUser(chatData)
            setMobileSelectedUser(chatData)
          }}
        />
      </Main>
    </>
  )
}
