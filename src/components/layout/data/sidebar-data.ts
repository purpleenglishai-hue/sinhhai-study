import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Package,
  Bot,
  MessageSquareText,
  Users,
  FolderCloud,
  Settings,
  HelpCircle,
  AudioWaveform,
  GalleryVerticalEnd,
} from 'lucide-react'
import { Logo } from '@/assets/logo' // Import logo SinhHAI chính
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'SinhHAI User',
    email: 'user@sinhhai.study',
    avatar: '/images/favicon.png',
  },
  teams: [
    {
      name: 'SinhHAI StudyPlace',
      logo: Logo,
      plan: 'Subscription Plan',
    },
    {
      name: 'SinhHAI Enterprise',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'SinhHAI Startup',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Học tập & Không gian',
      items: [
        {
          title: 'Tổng quan học tập',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Nhiệm vụ & Deadline',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Lịch biểu học tập',
          url: '/calendar',
          icon: CalendarDays,
        },
        {
          title: 'Công cụ & Office',
          url: '/apps',
          icon: Package,
        },
      ],
    },
    {
      title: 'Tương tác & Cộng đồng',
      items: [
        {
          title: 'Trợ lý AI SinhHAI',
          url: '/ai-chat',
          badge: '24/7',
          icon: Bot,
        },
        {
          title: 'Tin nhắn & Hỗ trợ',
          url: '/messages',
          icon: MessageSquareText,
        },
        {
          title: 'Nhóm học tập',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Kho tài liệu (Storage)',
          url: '/storage',
          icon: FolderCloud,
        },
      ],
    },
    {
      title: 'Hệ thống',
      items: [
        {
          title: 'Cài đặt & Tài khoản',
          url: '/settings',
          icon: Settings,
        },
        {
          title: 'Trợ giúp & Hướng dẫn',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
