import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Calendar as CalendarIcon, Plus, Clock, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StudyCalendar() {
  const [events, setEvents] = useState([
    { id: 1, title: 'Học Toán Cao Cấp - Chương 3', time: '08:00 - 10:00', date: '2026-10-30', type: 'study' },
    { id: 2, title: 'Nộp bài tập Tiếng Anh AI', time: '23:59', date: '2026-10-30', type: 'deadline' },
    { id: 3, title: 'Ôn tập từ vựng lập trình', time: '14:00 - 15:00', date: '2026-10-31', type: 'review' },
  ])

  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventTime, setNewEventTime] = useState('')

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle) return
    setEvents([...events, {
      id: Date.now(),
      title: newEventTitle,
      time: newEventTime || 'Cả ngày',
      date: new Date().toISOString().split('T')[0],
      type: 'study'
    }])
    setNewEventTitle('')
    setNewEventTime('')
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-white'>Lịch biểu học tập</h1>
            <p className='text-muted-foreground text-sm'>
              Quản lý thời gian tự học, thời hạn nộp bài và các mốc sự kiện quan trọng của bạn.
            </p>
          </div>
        </div>

        {/* Khung giao diện lịch và danh sách sự kiện */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Cột trái: Thêm lịch học */}
          <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <Plus className='h-5 w-5 text-primary' /> Thêm lịch học mới
            </h2>
            <form onSubmit={handleAddEvent} className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground mb-1 block'>Nội dung / Môn học</label>
                <input 
                  type='text' 
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder='Ví dụ: Ôn tập ngữ pháp...' 
                  className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground mb-1 block'>Thời gian</label>
                <input 
                  type='text' 
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  placeholder='Ví dụ: 19:00 - 21:00' 
                  className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
              <Button type='submit' className='w-full'>Thêm vào lịch học</Button>
            </form>
          </div>

          {/* Cột phải: Danh sách sự kiện học tập */}
          <div className='lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <CalendarIcon className='h-5 w-5 text-primary' /> Sự kiện & Deadline sắp tới
            </h2>
            <div className='space-y-3'>
              {events.map((ev) => (
                <div key={ev.id} className='flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4 transition-all hover:border-primary/50'>
                  <div className='flex items-start gap-3'>
                    <div className='mt-1 rounded-full bg-primary/10 p-2 text-primary'>
                      {ev.type === 'deadline' ? <Clock className='h-4 w-4 text-red-400' /> : <BookOpen className='h-4 w-4' />}
                    </div>
                    <div>
                      <h3 className='font-medium text-white'>{ev.title}</h3>
                      <p className='text-xs text-muted-foreground flex items-center gap-2 mt-1'>
                        <span>📅 {ev.date}</span>
                        <span>⏰ {ev.time}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    ev.type === 'deadline' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                    {ev.type === 'deadline' ? 'Deadline' : 'Tự học'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
