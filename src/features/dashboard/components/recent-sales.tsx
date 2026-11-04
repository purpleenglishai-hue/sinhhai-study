import { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock } from 'lucide-react'

interface TaskItem {
  id: string
  title: string
  status: string
  dueDate?: string
}

export function RecentSales() {
  const [tasks, setTasks] = useState<TaskItem[]>([])

  useEffect(() => {
    const fetchRecentTasks = async () => {
      const user = auth.currentUser
      if (!user) return

      try {
        const q = query(collection(db, `users/${user.uid}/tasks`), limit(5))
        const querySnapshot = await getDocs(q)
        const taskList: TaskItem[] = []
        querySnapshot.forEach((doc) => {
          taskList.push({ id: doc.id, ...doc.data() } as TaskItem)
        })
        setTasks(taskList)
      } catch (error) {
        console.error('Lỗi tải nhiệm vụ gần đây:', error)
      }
    }

    fetchRecentTasks()
  }, [])

  if (tasks.length === 0) {
    return (
      <div className='text-sm text-muted-foreground py-6 text-center'>
        Chưa có nhiệm vụ nào. Hãy tạo nhiệm vụ mới để bắt đầu!
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {tasks.map((task) => (
        <div key={task.id} className='flex items-center justify-between'>
          <div className='flex items-center gap-3 pr-2'>
            {task.status === 'done' ? (
              <CheckCircle2 className='h-5 w-5 text-green-600 shrink-0' />
            ) : (
              <Clock className='h-5 w-5 text-blue-600 shrink-0' />
            )}
            <div className='space-y-1'>
              <p className='text-sm font-medium leading-none text-foreground truncate max-w-[180px] sm:max-w-[220px]'>
                {task.title}
              </p>
              <p className='text-xs text-muted-foreground'>
                Hạn chót: {task.dueDate ? task.dueDate : 'Không có'}
              </p>
            </div>
          </div>
          <Badge
            variant={task.status === 'done' ? 'default' : 'outline'}
            className='text-xs shrink-0'
          >
            {task.status === 'done' ? 'Hoàn thành' : 'Cần làm'}
          </Badge>
        </div>
      ))}
    </div>
  )
}
