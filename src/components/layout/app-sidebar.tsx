import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        {/* Phần Logo và Tên thương hiệu tùy chỉnh */}
        <div className='flex items-center gap-3 px-3 py-2'>
          <img 
            src='/images/logo.png' 
            alt='SinhHAI Logo' 
            className='w-8 h-8 rounded-lg object-contain bg-primary/10 p-1' 
          />
          <div className='flex flex-col'>
            <span className='font-bold text-sm tracking-tight'>SinhHAI</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
