import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, CheckCircle2 } from 'lucide-react'

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())

  // Danh sách mẫu sự kiện/deadline học tập của user
  const events = [
    { id: 1, time: '08:00 - 09:30', title: 'Học lập trình React & Tailwind', type: 'Học tập', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id: 2, time: '14:00 - 16:00', title: 'Làm bài tập Toán cao cấp & Nộp Deadline', type: 'Deadline', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    { id: 3, time: '19:30 - 21:00', title: 'Ôn từ vựng Tiếng Anh chuyên ngành', type: 'Ngoại ngữ', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  ]

  const daysInMonth = 30 // Tháng mẫu hiển thị gọn gàng
  const startDayOffset = 2 // Thứ 3 bắt đầu

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
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Lịch biểu học tập cá nhân</h2>
            <p className='text-muted-foreground text-sm'>
              Quản lý thời gian biểu, lịch tự học và deadline hàng ngày của bạn.
            </p>
          </div>
          <button className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors'>
            <Plus className='mr-2 h-4 w-4' /> Thêm lịch hẹn / Task
          </button>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Cột trái: Khung lịch tháng trực quan */}
          <div className='lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <CalendarIcon className='h-5 w-5 text-primary' /> Tháng 10, 2026
              </h3>
              <div className='flex items-center space-x-2'>
                <button className='p-2 rounded-lg border hover:bg-muted transition-colors'>
                  <ChevronLeft className='h-4 w-4' />
                </button>
                <button className='p-2 rounded-lg border hover:bg-muted transition-colors'>
                  <ChevronRight className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Các ngày trong tuần */}
            <div className='grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground mb-3'>
              <span>CN</span><span>Thứ 2</span><span>Thứ 3</span><span>Thứ 4</span><span>Thứ 5</span><span>Thứ 6</span><span>Thứ 7</span>
            </div>

            {/* Lưới ngày trong tháng */}
            <div className='grid grid-cols-7 gap-2'>
              {Array.from({ length: startDayOffset }).map((_, index) => (
                <div key={`empty-${index}`} className='h-12 rounded-lg bg-muted/20 opacity-30' />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const isSelected = selectedDay === day
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`h-12 rounded-lg flex flex-col items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md font-bold'
                        : 'hover:bg-muted/50 border-transparent bg-card text-card-foreground'
                    }`}
                  >
                    <span className='text-sm'>{day}</span>
                    {day % 3 === 0 && (
                      <span className={`h-1 w-1 rounded-full mt-1 ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cột phải: Chi tiết lịch trình trong ngày được chọn */}
          <div className='rounded-xl border bg-card p-6 shadow-sm flex flex-col'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Clock className='h-5 w-5 text-primary' /> Lịch trình ngày {selectedDay}/10
            </h3>

            <div className='space-y-3 flex-1'>
              {events.map((ev) => (
                <div key={ev.id} className={`p-4 rounded-lg border ${ev.color} flex flex-col gap-1`}>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-semibold px-2 py-0.5 rounded bg-background/50'>
                      {ev.type}
                    </span>
                    <span className='text-xs opacity-80'>{ev.time}</span>
                  </div>
                  <p className='text-sm font-medium mt-1'>{ev.title}</p>
                </div>
              ))}
            </div>

            <div className='mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'><CheckCircle2 className='h-4 w-4 text-emerald-500' /> Đồng bộ tự động từ Tasks</span>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
