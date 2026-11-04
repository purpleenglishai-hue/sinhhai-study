import { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface ChartData {
  name: string
  total: number
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([
    { name: 'Th 2', total: 0 },
    { name: 'Th 3', total: 0 },
    { name: 'Th 4', total: 0 },
    { name: 'Th 5', total: 0 },
    { name: 'Th 6', total: 0 },
    { name: 'Th 7', total: 0 },
    { name: 'CN', total: 0 },
  ])

  useEffect(() => {
    const fetchWeeklyTasks = async () => {
      const user = auth.currentUser
      if (!user) return

      try {
        const querySnapshot = await getDocs(collection(db, `users/${user.uid}/tasks`))
        // Khởi tạo đếm theo thứ: 0: CN, 1: Th 2, ... 6: Th 7
        const counts = [0, 0, 0, 0, 0, 0, 0]

        querySnapshot.forEach((doc) => {
          const taskData = doc.data()
          if (taskData.startDate) {
            const date = new Date(taskData.startDate)
            if (!isNaN(date.getTime())) {
              const day = date.getDay() // 0 là Chủ Nhật, 1 là Th 2...
              counts[day]++
            }
          }
        })

        // Sắp xếp lại mảng cho đúng chuẩn hiển thị từ Th 2 đến CN
        // counts theo getDay(): [CN(0), Th2(1), Th3(2), Th4(3), Th5(4), Th6(5), Th7(6)]
        setData([
          { name: 'Th 2', total: counts[1] },
          { name: 'Th 3', total: counts[2] },
          { name: 'Th 4', total: counts[3] },
          { name: 'Th 5', total: counts[4] },
          { name: 'Th 6', total: counts[5] },
          { name: 'Th 7', total: counts[6] },
          { name: 'CN', total: counts[0] },
        ])
      } catch (error) {
        console.error('Lỗi tải dữ liệu biểu đồ:', error)
      }
    }

    fetchWeeklyTasks()
  }, [])

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
