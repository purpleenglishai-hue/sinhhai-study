import { useState, useEffect, useRef } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import {
  ArrowLeft,
  MoreVertical,
  Edit,
  Paperclip,
  Phone,
  PhoneOff,
  ImagePlus,
  Plus,
  Search as SearchIcon,
  Send,
  Video,
  MessagesSquare,
  Trash2,
  UserCheck,
  ShieldAlert,
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

// Import Firebase thực tế
import { db, auth, storage } from '@/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc,
  getDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export function Chats() {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [mobileSelectedUser, setMobileSelectedUser] = useState<ChatUser | null>(null)
  const [createConversationDialogOpened, setCreateConversationDialog] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  
  // Trạng thái điều khiển khung gọi video trực tiếp ngay trong chat
  const [inCall, setInCall] = useState(false)
  const [callRoomId, setCallRoomId] = useState('')

  const [conversations, setConversations] = useState<ChatUser[]>([])
  const [realtimeMessages, setRealtimeMessages] = useState<Convo[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [realtimeMessages])

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
      if (!user) {
        setConversations([])
      }
    })
    return () => unsubscribeAuth()
  }, [])

  // Lấy danh sách user thật và ánh xạ chuẩn tên "englishai purple" kèm logo thương hiệu
  useEffect(() => {
    if (!currentUser) {
      setConversations([])
      return
    }

    const fetchRealUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const realUsers: ChatUser[] = []

        usersSnapshot.forEach((docSnap) => {
          const data = docSnap.data() as any
          if (docSnap.id !== currentUser.uid) {
            let displayName = data.fullName || data.name || (data.email ? data.email.split('@')[0] : 'Thành viên')
            let avatarUrl = data.profile || data.photoURL || data.avatar || ''
            let userTitle = 'Hoạt động gần đây'

            if (data.email === 'purpleenglishai@gmail.com') {
              displayName = 'englishai purple'
              userTitle = 'Hệ thống hỗ trợ chính thức'
            }

            realUsers.push({
              id: docSnap.id,
              fullName: displayName,
              username: data.username || displayName,
              title: userTitle,
              profile: avatarUrl,
              messages: []
            })
          }
        })

        if (realUsers.length === 0) {
          realUsers.push({
            id: 'purple_english_real',
            fullName: 'englishai purple',
            username: 'purpleenglishai',
            title: 'Hệ thống hỗ trợ chính thức',
            profile: '',
            messages: []
          })
        }

        setConversations(realUsers)
      } catch (error) {
        console.error("Lỗi tải danh sách user thật:", error)
      }
    }

    fetchRealUsers()
  }, [currentUser])

  // Lấy tin nhắn real-time giữa 2 user
  useEffect(() => {
    if (!selectedUser?.id || !currentUser) return

    const chatId = [currentUser.uid, selectedUser.id].sort().join('_')

    const q = query(
      collection(db, 'conversations', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => {
        const data = docSnap.data()
        return {
          sender: data.senderId === currentUser?.uid ? 'You' : (data.sender || selectedUser.fullName),
          message: data.message,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
        } as Convo
      })
      setRealtimeMessages(msgs)
    })

    return () => unsubscribe()
  }, [selectedUser?.id, currentUser])

  // Gửi tin nhắn văn bản thực tế
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !selectedUser?.id || !currentUser) return

    const textToSend = inputMessage
    setInputMessage('') 

    try {
      const myName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Sinh Trần'
      const chatId = [currentUser.uid, selectedUser.id].sort().join('_')
      const convoRef = doc(db, 'conversations', chatId)
      
      const docSnap = await getDoc(convoRef)
      if (!docSnap.exists()) {
        await setDoc(convoRef, {
          participants: [currentUser.uid, selectedUser.id],
          fullName: selectedUser.fullName,
          profile: selectedUser.profile || '',
          updatedAt: serverTimestamp()
        })
      }

      await addDoc(collection(db, 'conversations', chatId, 'messages'), {
        senderId: currentUser.uid,
        sender: myName,
        message: textToSend,
        timestamp: serverTimestamp()
      })

      await updateDoc(convoRef, {
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error)
    }
  }

  // Gói lưu trữ chat & tài liệu (Dung lượng rộng rãi mặc định trong gói 499k, cảnh báo khi file > 50MB)
  const handleFileUpload = async (file: File, type: 'image' | 'doc') => {
    if (!selectedUser?.id || !currentUser) return

    const MAX_DEFAULT_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_DEFAULT_FILE_SIZE) {
      alert("⚠️ Tài liệu vượt quá giới hạn 50MB của gói tiêu chuẩn! Vui lòng nâng cấp các gói lưu trữ nâng cao (5GB/10GB/50GB) để tích hợp AI chuyên sâu.");
      return;
    }

    try {
      const folder = type === 'image' ? 'chat_images' : 'chat_docs'
      const storageRef = ref(storage, `${folder}/${currentUser.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      const myName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Sinh Trần'
      const chatId = [currentUser.uid, selectedUser.id].sort().join('_')
      const convoRef = doc(db, 'conversations', chatId)

      const docSnap = await getDoc(convoRef)
      if (!docSnap.exists()) {
        await setDoc(convoRef, {
          participants: [currentUser.uid, selectedUser.id],
          fullName: selectedUser.fullName,
          profile: selectedUser.profile || '',
          updatedAt: serverTimestamp()
        })
      }

      const messageContent = type === 'image' ? `[Hình ảnh]: ${downloadURL}` : `[Tài liệu]: ${file.name} - ${downloadURL}`

      await addDoc(collection(db, 'conversations', chatId, 'messages'), {
        senderId: currentUser.uid,
        sender: myName,
        message: messageContent,
        timestamp: serverTimestamp()
      })

      await updateDoc(convoRef, {
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error("Lỗi tải tệp lên Storage:", error)
      alert("Không thể tải tệp lên hệ thống lưu trữ.")
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
        <section className='flex h-full gap-4 md:gap-6 overflow-hidden'>
          {/* Left Side: Danh sách Inbox (Responsive co giãn linh hoạt) */}
          <div className={cn(
            'flex flex-col gap-2 w-full sm:w-64 lg:w-72 2xl:w-80 flex-shrink-0',
            mobileSelectedUser && 'hidden sm:flex'
          )}>
            <div className='sticky top-0 z-10 bg-background pb-3 shadow-md sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2 items-center'>
                  <h1 className='text-xl md:text-2xl font-bold'>Inbox</h1>
                  <MessagesSquare size={20} />
                </div>

                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='rounded-lg'
                >
                  <Edit size={22} className='stroke-muted-foreground' />
                </Button>
              </div>

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

            <ScrollArea className='h-[calc(100vh-200px)] pr-2'>
              {filteredChatList.length > 0 ? (
                filteredChatList.map((chatUsr) => {
                  const { id, profile, username, fullName } = chatUsr

                  return (
                    <Fragment key={id}>
                      <button
                        type='button'
                        className={cn(
                          'group hover:bg-accent hover:text-accent-foreground relative',
                          `flex w-full rounded-md px-2 py-2 text-start text-sm`,
                          selectedUser?.id === id && 'bg-muted'
                        )}
                        onClick={() => {
                          setSelectedUser(chatUsr)
                          setMobileSelectedUser(chatUsr)
                          setInCall(false) // Tắt chế độ gọi khi chuyển hội thoại
                        }}
                      >
                        <div className='flex gap-2 items-center w-full relative'>
                          <Avatar className='border border-purple-200 relative size-10 flex-shrink-0'>
                            <AvatarImage src={profile} alt={username || fullName} />
                            <AvatarFallback className='bg-purple-100 text-purple-700 font-semibold'>
                              {getDisplayNameInitials(fullName) || 'SH'}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 overflow-hidden'>
                            <div className='flex justify-between items-center'>
                              <span className='font-medium block truncate'>{fullName}</span>
                            </div>
                            <span className='line-clamp-1 text-ellipsis text-muted-foreground group-hover:text-accent-foreground/90 text-xs'>
                              {chatUsr.title || 'Nhấn để trò chuyện'}
                            </span>
                          </div>
                        </div>
                      </button>
                      <Separator className='my-1' />
                    </Fragment>
                  )
                })
              ) : (
                <p className='text-center text-xs text-muted-foreground py-4'>Chưa có tài khoản nào.</p>
              )}
            </ScrollArea>
          </div>

          {/* Right Side: Khu vực Chat / Giao diện Gọi Video nhúng trực tiếp */}
          {selectedUser ? (
            <div
              className={cn(
                'flex flex-1 flex-col border bg-background shadow-xs rounded-md overflow-hidden w-full',
                !mobileSelectedUser && 'hidden sm:flex'
              )}
            >
              {/* Header khung chat */}
              <div className='flex flex-none justify-between items-center bg-card p-3 md:p-4 shadow-sm relative'>
                <div className='flex gap-2 md:gap-3 items-center overflow-hidden'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-9 w-9 sm:hidden flex-shrink-0'
                    onClick={() => {
                      setMobileSelectedUser(null)
                      setInCall(false)
                    }}
                  >
                    <ArrowLeft className='rtl:rotate-180' />
                  </Button>
                  <div className='flex items-center gap-2 lg:gap-3 overflow-hidden'>
                    <Avatar className='size-9 lg:size-10 border border-purple-200 flex-shrink-0'>
                      <AvatarImage
                        src={selectedUser.profile}
                        alt={selectedUser.username}
                      />
                      <AvatarFallback className='bg-purple-100 text-purple-700 font-bold'>
                        {getDisplayNameInitials(selectedUser.fullName) || 'SH'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='overflow-hidden'>
                      <span className='text-sm font-medium lg:text-base block truncate'>
                        {selectedUser.fullName}
                      </span>
                      <span className='line-clamp-1 text-xs text-muted-foreground'>
                        {inCall ? '🟢 Đang trong cuộc gọi trực tiếp' : (selectedUser.title || 'Hệ thống trực tuyến')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Các nút tính năng (Video Call, Phone, Menu) */}
                <div className='flex items-center gap-1 flex-shrink-0 relative'>
                  {!inCall ? (
                    <>
                      <Button 
                        size='icon' 
                        variant='ghost' 
                        className='size-9 rounded-full text-purple-700 hover:bg-purple-100'
                        onClick={() => {
                          const roomId = `SinhHAI_${currentUser.uid}_${selectedUser.id}`
                          setCallRoomId(roomId)
                          setInCall(true)
                        }}
                        title="Gọi Video trực tuyến ngay trong ứng dụng"
                      >
                        <Video size={20} />
                      </Button>

                      <Button 
                        size='icon' 
                        variant='ghost' 
                        className='size-9 rounded-full text-purple-700 hover:bg-purple-100'
                        onClick={() => {
                          const roomId = `SinhHAI_Audio_${currentUser.uid}_${selectedUser.id}`
                          setCallRoomId(roomId)
                          setInCall(true)
                        }}
                        title="Gọi thoại bảo mật"
                      >
                        <Phone size={20} />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size='sm' 
                      variant='destructive' 
                      className='gap-1 rounded-full px-3 text-xs'
                      onClick={() => setInCall(false)}
                      title="Kết thúc cuộc gọi"
                    >
                      <PhoneOff size={16} /> Kết thúc
                    </Button>
                  )}

                  <Button 
                    size='icon' 
                    variant='ghost' 
                    className='size-9 rounded-md'
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    title="Cài đặt hội thoại"
                  >
                    <MoreVertical className='stroke-muted-foreground size-5' />
                  </Button>

                  {/* Menu thả xuống */}
                  {showOptionsMenu && (
                    <div className='absolute right-0 top-12 z-50 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md'>
                      <button 
                        className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent'
                        onClick={() => { alert(`Thông tin hội thoại với: ${selectedUser.fullName}`); setShowOptionsMenu(false); }}
                      >
                        <UserCheck size={16} /> Xem hồ sơ
                      </button>
                      <button 
                        className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-destructive'
                        onClick={() => { if(confirm("Xóa lịch sử trò chuyện?")) setRealtimeMessages([]); setShowOptionsMenu(false); }}
                      >
                        <Trash2 size={16} /> Xóa lịch sử chat
                      </button>
                      <button 
                        className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-amber-600'
                        onClick={() => { alert(`Đã chặn người dùng ${selectedUser.fullName}`); setShowOptionsMenu(false); }}
                      >
                        <ShieldAlert size={16} /> Chặn người dùng
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* THAY ĐỔI QUAN TRỌNG: Nếu đang gọi video (inCall = true) thì nhúng iframe Jitsi trực tiếp, ngược lại hiển thị khung chat */}
              {inCall ? (
                <div className='flex-1 w-full bg-slate-950 relative flex flex-col'>
                  <iframe
                    src={`https://meet.jit.si/${callRoomId}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.TOOLBAR_BUTTONS=['microphone','camera','closedcaptions','desktop','fullscreen','focusscreen','hangup','chat','settings']`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="w-full flex-1 border-0"
                    title="SinhHAI Video Call"
                  />
                </div>
              ) : (
                <>
                  {/* Danh sách tin nhắn */}
                  <div className='flex flex-1 flex-col gap-2 px-4 py-2 overflow-hidden bg-slate-50/50 dark:bg-slate-900/20'>
                    <div className='flex size-full flex-1'>
                      <div className='chat-text-container relative flex flex-1 flex-col overflow-y-hidden'>
                        <div className='chat-flex flex h-full w-full grow flex-col justify-start gap-3 overflow-y-auto py-2 pr-2'>
                          {currentMessage &&
                            Object.keys(currentMessage).map((key) => (
                              <Fragment key={key}>
                                <div className='text-center text-xs text-muted-foreground my-2'>{key}</div>
                                {currentMessage[key].map((msg, index) => (
                                  <div
                                    key={`${msg.sender}-${msg.timestamp}-${index}`}
                                    className={cn(
                                      'chat-box max-w-[85%] md:max-w-md px-3 py-2 rounded-lg shadow-sm text-sm break-words',
                                      msg.sender === 'You'
                                        ? 'self-end rounded-br-none bg-[#6d28d9] text-white'
                                        : 'self-start rounded-bl-none bg-purple-100 text-slate-900 dark:bg-purple-950 dark:text-purple-100'
                                    )}
                                  >
                                    {msg.message.startsWith('[Hình ảnh]:') ? (
                                      <a href={msg.message.replace('[Hình ảnh]: ', '')} target="_blank" rel="noreferrer">
                                        <img src={msg.message.replace('[Hình ảnh]: ', '')} alt="Uploaded" className="rounded-md max-h-48 object-cover mt-1" />
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
                                        'mt-1 block text-[10px] italic',
                                        msg.sender === 'You'
                                          ? 'text-end text-white/80'
                                          : 'text-slate-500 dark:text-purple-300'
                                      )}
                                    >
                                      {msg.timestamp ? format(new Date(msg.timestamp), 'h:mm a') : ''}
                                    </span>
                                  </div>
                                ))}
                              </Fragment>
                            ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                    </div>

                    {/* Form nhập tin nhắn & đính kèm file */}
                    <form onSubmit={handleSendMessage} className='flex w-full flex-none gap-2 pt-2 border-t bg-background'>
                      <input 
                        type="file" 
                        ref={imageInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => { const f = e.target.files?.[0]; if(f) handleFileUpload(f, 'image'); }} 
                      />
                      <input 
                        type="file" 
                        ref={docInputRef} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.txt,.zip"
                        onChange={(e) => { const f = e.target.files?.[0]; if(f) handleFileUpload(f, 'doc'); }} 
                      />

                      <div className='flex flex-1 items-center gap-1 md:gap-2 rounded-md border border-input bg-card px-2 py-1'>
                        <div className='flex items-center space-x-0.5'>
                          <Button 
                            size='icon' 
                            type='button' 
                            variant='ghost' 
                            className='h-8 w-8 rounded-md'
                            onClick={() => imageInputRef.current?.click()}
                            title="Đính kèm ảnh"
                          >
                            <Plus size={18} className='stroke-muted-foreground' />
                          </Button>

                          <Button 
                            size='icon' 
                            type='button' 
                            variant='ghost' 
                            className='hidden h-8 w-8 rounded-md sm:inline-flex'
                            onClick={() => imageInputRef.current?.click()}
                            title="Gửi ảnh"
                          >
                            <ImagePlus size={18} className='stroke-muted-foreground' />
                          </Button>

                          <Button 
                            size='icon' 
                            type='button' 
                            variant='ghost' 
                            className='hidden h-8 w-8 rounded-md sm:inline-flex'
                            onClick={() => docInputRef.current?.click()}
                            title="Gửi tài liệu"
                          >
                            <Paperclip size={18} className='stroke-muted-foreground' />
                          </Button>
                        </div>

                        <input
                          type='text'
                          placeholder='Type your messages...'
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          className='h-9 w-full bg-transparent text-sm focus-visible:outline-none px-2'
                        />

                        <Button type='submit' size='icon' variant='ghost' className='h-9 w-9 text-[#6d28d9] flex-shrink-0'>
                          <Send size={18} />
                        </Button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              className={cn(
                'hidden sm:flex flex-1 flex-col items-center justify-center rounded-md border bg-card shadow-xs p-6 text-center'
              )}
            >
              <div className='flex size-16 items-center justify-center rounded-full border-2 border-purple-300 bg-purple-50 text-[#6d28d9] mb-4'>
                <MessagesSquare className='size-8' />
              </div>
              <h1 className='text-xl font-semibold mb-1'>Your messages</h1>
              <p className='text-sm text-muted-foreground mb-6'>
                Send a message to start a chat.
              </p>
              <Button className='bg-[#6d28d9] text-white hover:bg-purple-800' onClick={() => setCreateConversationDialog(true)}>
                Send message
              </Button>
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
            setInCall(false)
          }}
        />
      </Main>
    </>
  )
}
