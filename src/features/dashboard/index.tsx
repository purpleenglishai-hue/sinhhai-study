import { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { CheckCircle2, Clock, ListTodo, AlertTriangle } from 'lucide-react'

export function Dashboard() {
  const [taskStats, setTaskStats] = useState({
    total: 0,
    done: 0,
    todo: 0,
    urgent: 0,
  })

  // Lấy dữ liệu thật từ Firestore để hiển thị thống kê học tập
  useEffect(() => {
    const fetchTaskStats = async () => {
      const user = auth.currentUser
      if (!user) return

      try {
        const querySnapshot = await getDocs(collection(db, `users/${user.uid}/tasks`))
        let total = 0
        let done = 0
        let todo = 0
        let urgent = 0

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          total++
          if (data.status === 'done') {
            done++
          } else {
            todo++
          }
          // Kiểm tra nếu có hạn chót và gần đến hạn
          if (data.dueDate) {
            const today = new Date().toISOString().split('T')[0]
            if (data.dueDate <= today && data.status !== 'done') {
              urgent++
            }
          }
        })

        setTaskStats({ total, done, todo, urgent })
      } catch (error) {
        console.error('Lỗi khi tải thống kê nhiệm vụ:', error)
      }
    }

    fetchTaskStats()
  }, [])

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='me-auto font-semibold text-lg'>Không gian học tập SinhHAI</div>
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-4 flex items-center justify-between space-y-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Tổng quan học tập</h1>
            <p className='text-muted-foreground text-sm'>
              Theo dõi tiến độ học tập và quản lý nhiệm vụ cá nhân của bạn.
            </p>
          </div>
        </div>

        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
              <TabsTrigger value='analytics'>Phân tích chi tiết</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='overview' className='space-y-4'>
            {/* Các thẻ thống kê nhiệm vụ học tập */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Tổng số nhiệm vụ</CardTitle>
                  <ListTodo className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{taskStats.total}</div>
                  <p className='text-xs text-muted-foreground'>
                    Đã tạo trong hệ thống
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Đã hoàn thành</CardTitle>
                  <CheckCircle2 className='h-4 w-4 text-green-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-green-600'>{taskStats.done}</div>
                  <p className='text-xs text-muted-foreground'>
                    Nhiệm vụ đạt kết quả tốt
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Đang thực hiện</CardTitle>
                  <Clock className='h-4 w-4 text-blue-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-blue-600'>{taskStats.todo}</div>
                  <p className='text-xs text-muted-foreground'>
                    Cần tiếp tục tập trung
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Cần lưu ý / Quá hạn</CardTitle>
                  <AlertTriangle className='h-4 w-4 text-red-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-red-600'>{taskStats.urgent}</div>
                  <p className='text-xs text-muted-foreground'>
                    Deadline cần xử lý ngay
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Biểu đồ tiến độ</CardTitle>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>

              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                  <CardDescription>
                    Các nhiệm vụ và cập nhật mới nhất của bạn.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
