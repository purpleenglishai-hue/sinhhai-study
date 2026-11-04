import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Tạo mới</span> <Plus size={18} />
      </Button>
    </div>
  )
}
