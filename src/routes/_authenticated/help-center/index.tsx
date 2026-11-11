import { HelpCircle, BookOpen, MessageSquare, CheckSquare, HardDrive, Cpu, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Separator } from '@/components/ui/separator'

export function HelpCenter() {
  const guides = [
    {
      title: 'Tổng quan học tập (Dashboard)',
      icon: <BookOpen className='size-6 text-purple-600' />,
      description: 'Nơi tổng hợp toàn bộ tiến độ học tập, biểu đồ thống kê chuyên cần và các lối tắt truy cập nhanh vào không gian làm việc.'
    },
    {
      title: 'Trợ lý AI đọc tài liệu chuyên sâu',
      icon: <Cpu className='size-6 text-purple-600' />,
      description: 'Cho phép tải lên tài liệu dung lượng lớn (tới 1GB), quản lý sách/tài liệu cá nhân dạng bìa sách hoặc danh sách và trò chuyện trực tiếp cùng AI để phân tích sâu.'
    },
    {
      title: 'Tin nhắn & Hỗ trợ (Inbox)',
      icon: <MessageSquare className='size-6 text-purple-600' />,
      description: 'Trò chuyện real-time với thành viên hoặc hệ thống hỗ trợ chính thức (englishai purple). Hỗ trợ đính kèm ảnh, tài liệu, gọi Video/Thoại trực tuyến qua Jitsi Meet bảo mật.'
    },
    {
      title: 'Nhiệm vụ & Deadline',
      icon: <CheckSquare className='size-6 text-purple-600' />,
      description: 'Quản lý lịch trình học tập, tạo các task cần làm, theo dõi thời hạn hoàn thành để tối ưu hóa hiệu suất cá nhân.'
    },
    {
      title: 'Kho tài liệu (Storage)',
      icon: <HardDrive className='size-6 text-purple-600' />,
      description: 'Lưu trữ tệp tin an toàn trên đám mây, hỗ trợ phân loại tài liệu học tập, sách điện tử và tài nguyên số cá nhân.'
    },
    {
      title: 'Tài khoản & Bản quyền',
      icon: <ShieldCheck className='size-6 text-purple-600' />,
      description: 'Theo dõi thông tin định danh cá nhân đồng bộ trực tiếp từ Firebase, quản lý gói dịch vụ (Pro Standard) và trạng thái kích hoạt bản quyền.'
    }
  ]

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='overflow-y-auto h-full pb-16'>
        <div className='max-w-5xl mx-auto space-y-6'>
          {/* Tiêu đề */}
          <div className='space-y-1 pt-2'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl text-purple-700 dark:text-purple-300 flex items-center gap-2'>
              <HelpCircle className='size-8 text-purple-600' /> Hướng dẫn Sử dụng sinhHAI
            </h1>
            <p className='text-muted-foreground text-sm'>
              Cẩm nang chi tiết các tính năng và cách vận hành hệ thống học tập thông minh dành cho bạn.
            </p>
          </div>

          <Separator className='my-4' />

          {/* Lưới hướng dẫn các tính năng */}
          <div className='grid gap-6 md:grid-cols-2 pb-12'>
            {guides.map((item, index) => (
              <div key={index} className='rounded-xl border bg-card p-6 shadow-sm space-y-3 hover:border-purple-300 transition-colors'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200/50'>
                    {item.icon}
                  </div>
                  <h2 className='font-semibold text-lg text-foreground'>{item.title}</h2>
                </div>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Phần hỗ trợ nhanh */}
          <div className='rounded-xl border bg-gradient-to-r from-purple-900 to-purple-700 text-white p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='space-y-1 text-center sm:text-left'>
              <h3 className='font-bold text-lg'>Bạn cần hỗ trợ thêm?</h3>
              <p className='text-xs text-purple-200'>Hệ thống hỗ trợ trực tuyến hoạt động 24/7 luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
            </div>
            <a 
              href='/chats' 
              className='px-4 py-2 rounded-lg bg-white text-purple-900 font-semibold text-sm hover:bg-purple-50 transition-colors shadow'
            >
              Liên hệ Trợ lý Hỗ trợ
            </a>
          </div>
        </div>
      </Main>
    </>
  )
}
