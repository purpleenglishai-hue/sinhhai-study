import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { type User } from './data/schema'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  
  const [userList, setUserList] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Lấy dữ liệu độc lập từ collection 'study_members' của không gian học tập
  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, 'study_members'), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[]
        setUserList(list)
      } catch (error) {
        console.error("Lỗi khi tải danh sách thành viên từ Firebase: ", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' placeholder='Tìm kiếm...' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Quản lý Thành viên</h2>
            <p className='text-muted-foreground'>
              Quản lý danh sách thành viên và phân quyền trong hệ thống học tập.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-10 text-muted-foreground'>
            Đang tải dữ liệu từ hệ thống...
          </div>
        ) : (
          <UsersTable data={userList} search={search} navigate={navigate} />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
