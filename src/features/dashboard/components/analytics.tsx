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

export function Analytics() {
  const [completedCount, setCompletedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const fetchRealStats = async () => {
      const user = auth.currentUser
      if (!user) return

      try {
        const querySnapshot = await getDocs(collection(db, `users/${user.uid}/tasks`))
        let total = 0
        let completed = 0

        querySnapshot.forEach((doc) => {
          total++
          if (doc.data().status === 'done') {
            completed++
          }
        })

        setTotalCount(total)
        setCompletedCount(completed)
      } catch (error) {
        console.error('Lỗi tải thống kê phân tích:', error)
      }
    }

    fetchRealStats()
  }, [])

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Hiệu suất hoàn thành</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-green-600'
            >
              <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
              <polyline points='22 4 12 14.01 9 11.01' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {totalCount > 0 ? `${completionRate}%` : '0%'}
            </div>
            <p className='text-xs text-muted-foreground'>Dựa trên nhiệm vụ thực tế</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Mức độ tập trung</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-blue-600'
            >
              <circle cx='12' cy='12' r='10' />
              <polyline points='12 6 12 12 16 14' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>Ổn định</div>
            <p className='text-xs text-muted-foreground'>Quản lý thời gian hiệu quả</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Mục tiêu tuần</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-purple-600'
            >
              <path d='M3 3v18h18' />
              <path d='M7 15l4-4 4 4 4-6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>Đang đạt</div>
            <p className='text-xs text-muted-foreground'>Bám sát kế hoạch đề ra</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Dữ liệu cá nhân</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>Bảo mật</div>
            <p className='text-xs text-muted-foreground'>Lưu trữ riêng tư tuyệt đối</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Trạng thái phân bổ nhiệm vụ</CardTitle>
            <CardDescription>Tổng hợp toàn bộ nhiệm vụ học tập</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={[
                { name: 'Đã hoàn thành', value: completedCount },
                { name: 'Tổng số nhiệm vụ', value: totalCount },
              ]}
              barClass='bg-primary'
              valueFormatter={(n) => `${n} task`}
            />
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Không gian sử dụng</CardTitle>
            <CardDescription>Các khu vực truy cập chính</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={[
                { name: 'Nhiệm vụ & Deadline', value: 90 },
                { name: 'Tổng quan học tập', value: 75 },
                { name: 'Trợ lý AI SinhHAI', value: 50 },
                { name: 'Kho tài liệu (Storage)', value: 30 },
              ]}
              barClass='bg-muted-foreground'
              valueFormatter={(n) => `${n}%`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className='space-y-3'>
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 truncate text-xs text-muted-foreground'>
                {i.name}
              </div>
              <div className='h-2.5 w-full rounded-full bg-muted'>
                <div
                  className={`h-2.5 rounded-full ${barClass}`}
                  style={{ width }}
                />
              </div>
            </div>
            <div className='ps-2 text-xs font-medium tabular-nums'>
              {valueFormatter(i.value)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
