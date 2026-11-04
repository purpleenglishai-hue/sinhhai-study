import { useState, useEffect } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'
import { auth, db } from '@/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export function Tasks() {
  const [tasksData, setTasksData] = useState<any[]>([])

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const tasksQuery = query(collection(db, `users/${user.uid}/tasks`))
        
        unsubscribeSnapshot = onSnapshot(tasksQuery, (snapshot) => {
          if (!snapshot.empty) {
            const fetchedTasks = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            setTasksData(fetchedTasks)
          } else {
            // Đã xóa sạch task mẫu, trả về mảng rỗng cho user tự tạo mới
            setTasksData([])
          }
        }, (error) => {
          console.error("Lỗi đồng bộ tasks:", error)
        })
      } else {
        setTasksData([])
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeSnapshot) unsubscribeSnapshot()
    }
  }, [])

  return (
    <TasksProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Nhiệm vụ & Deadline</h2>
            <p className='text-muted-foreground'>
              Quản lý danh sách nhiệm vụ và tiến độ học tập của bạn!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <TasksTable data={tasksData} />
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
