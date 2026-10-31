import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

function AiAssistantPage() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-col flex-1 p-0'>
        {/* Khung nhúng NextChat SinhHAI trực tiếp vào dashboard */}
        <div className='w-full h-[calc(100vh-4rem)] bg-card overflow-hidden'>
          <iframe
            src='https://sinhhai.pages.dev'
            title='SinhHAI AI Assistant'
            className='w-full h-full border-0'
            allow='clipboard-read; clipboard-write'
          />
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/ai-assistant' as any)({
  component: AiAssistantPage,
})
