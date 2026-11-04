import {
  IconTelegram,
  IconNotion,
  IconFigma,
  IconTrello,
  IconSlack,
  IconZoom,
  IconGmail,
  IconMedium,
  IconSkype,
  IconDiscord,
  IconWhatsapp,
} from '@/assets/brand-icons'

export interface AppItem {
  name: string
  logo: React.ReactNode
  connected: boolean
  desc: string
  url: string
}

export const apps: AppItem[] = [
  {
    name: 'Zalo',
    logo: <IconTelegram />,
    connected: true,
    desc: 'Ứng dụng nhắn tin, gọi điện và trao đổi nhóm học tập phổ biến.',
    url: 'https://chat.zalo.me',
  },
  {
    name: 'Zoom Meeting',
    logo: <IconZoom />,
    connected: true,
    desc: 'Tham gia và tổ chức các lớp học trực tuyến, phòng họp từ xa.',
    url: 'https://zoom.us',
  },
  {
    name: 'Google Drive',
    logo: <IconNotion />,
    connected: true,
    desc: 'Kho lưu trữ tài liệu, giáo án và chia sẻ tệp học tập cá nhân.',
    url: 'https://drive.google.com',
  },
  {
    name: 'Canva',
    logo: <IconFigma />,
    connected: true,
    desc: 'Thiết kế slide bài giảng, hình ảnh và banner học tập bắt mắt.',
    url: 'https://www.canva.com',
  },
  {
    name: 'Google Meet',
    logo: <IconSlack />,
    connected: false,
    desc: 'Hội họp và giảng dạy trực tuyến nhanh chóng qua trình duyệt.',
    url: 'https://meet.google.com',
  },
  {
    name: 'YouTube',
    logo: <IconMedium />,
    connected: true,
    desc: 'Nguồn video bài giảng, khóa học và tư liệu học tập phong phú.',
    url: 'https://www.youtube.com',
  },
  {
    name: 'TikTok',
    logo: <IconDiscord />,
    connected: false,
    desc: 'Khám phá các video ngắn kiến thức, mẹo học tập và giải trí.',
    url: 'https://www.tiktok.com',
  },
  {
    name: 'Gmail',
    logo: <IconGmail />,
    connected: true,
    desc: 'Quản lý hộp thư điện tử, nhận thông báo và tài liệu quan trọng.',
    url: 'https://mail.google.com',
  },
  {
    name: 'Notion',
    logo: <IconNotion />,
    connected: false,
    desc: 'Ghi chú thông minh, quản lý tri thức và kế hoạch cá nhân.',
    url: 'https://www.notion.so',
  },
  {
    name: 'Trello',
    logo: <IconTrello />,
    connected: false,
    desc: 'Quản lý tiến độ công việc và nhiệm vụ theo dạng bảng trực quan.',
    url: 'https://trello.com',
  },
  {
    name: 'Skype',
    logo: <IconSkype />,
    connected: false,
    desc: 'Kết nối liên lạc và trò chuyện trực tuyến với bạn bè, học viên.',
    url: 'https://www.skype.com',
  },
  {
    name: 'WhatsApp',
    logo: <IconWhatsapp />,
    connected: false,
    desc: 'Nhắn tin trực tiếp nhanh chóng, bảo mật và ổn định.',
    url: 'https://web.whatsapp.com',
  },
]
