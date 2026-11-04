import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { auth, db } from '@/firebase'
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Task } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

// Schema mở rộng tích hợp Ngày bắt đầu và Hạn chót
const formSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống.'),
  status: z.string().min(1, 'Vui lòng chọn trạng thái.'),
  label: z.string().min(1, 'Vui lòng chọn nhãn dán.'),
  priority: z.string().min(1, 'Vui lòng chọn mức độ ưu tiên.'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
})

type TaskFormValues = z.infer<typeof formSchema>

export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          title: currentRow.title || '',
          status: currentRow.status || 'todo',
          label: currentRow.label || 'feature',
          priority: currentRow.priority || 'medium',
          startDate: (currentRow as any).startDate || '',
          dueDate: (currentRow as any).dueDate || '',
        }
      : {
          title: '',
          status: 'todo',
          label: 'feature',
          priority: 'medium',
          startDate: '',
          dueDate: '',
        },
  })

  // Hàm lưu dữ liệu thật lên Firestore
  const onSubmit = async (data: TaskFormValues) => {
    const user = auth.currentUser
    if (!user) {
      alert('Vui lòng đăng nhập để thực hiện tác vụ này!')
      return
    }

    try {
      if (isUpdate && currentRow?.id) {
        const taskRef = doc(db, `users/${user.uid}/tasks`, currentRow.id)
        await updateDoc(taskRef, {
          title: data.title,
          status: data.status,
          label: data.label,
          priority: data.priority,
          startDate: data.startDate || '',
          dueDate: data.dueDate || '',
          updatedAt: new Date().toISOString(),
        })
      } else {
        await addDoc(collection(db, `users/${user.uid}/tasks`), {
          title: data.title,
          status: data.status,
          label: data.label,
          priority: data.priority,
          startDate: data.startDate || '',
          dueDate: data.dueDate || '',
          createdAt: new Date().toISOString(),
        })
      }

      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Lỗi khi lưu Task vào Firestore:', error)
      alert('Đã có lỗi xảy ra khi lưu nhiệm vụ!')
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col h-full sm:max-w-md p-6 overflow-hidden'>
        <SheetHeader className='text-start pb-2'>
          <SheetTitle>{isUpdate ? 'Cập nhật nhiệm vụ' : 'Tạo nhiệm vụ mới'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Chỉnh sửa thông tin chi tiết nhiệm vụ.'
              : 'Thêm nhiệm vụ mới vào danh sách học tập của bạn.'}
          </SheetDescription>
        </SheetHeader>

        {/* Form chứa thanh cuộn dọc mượt mà */}
        <div className='flex-1 overflow-y-auto pr-2 py-2'>
          <Form {...form}>
            <form
              id='tasks-mutate-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              {/* Tiêu đề nhiệm vụ */}
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Nhập tiêu đề nhiệm vụ...' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ngày bắt đầu (Green) & Hạn chót (Red) */}
              <div className='grid grid-cols-2 gap-3'>
                <FormField
                  control={form.control}
                  name='startDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-green-600 dark:text-green-400 font-semibold'>
                        Ngày bắt đầu
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          {...field}
                          className='border-green-500/50 focus-visible:ring-green-500'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dueDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-red-600 dark:text-red-400 font-semibold'>
                        Hạn chót (Deadline)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          {...field}
                          className='border-red-500/50 focus-visible:ring-red-500'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Trạng thái */}
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Chọn trạng thái'
                      items={[
                        { label: 'Cần làm (Todo)', value: 'todo' },
                        { label: 'Đang thực hiện (In Progress)', value: 'in progress' },
                        { label: 'Đang chờ (Backlog)', value: 'backlog' },
                        { label: 'Đã hoàn thành (Done)', value: 'done' },
                        { label: 'Đã hủy (Canceled)', value: 'canceled' },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nhãn dán */}
              <FormField
                control={form.control}
                name='label'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel>Nhãn dán</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className='flex flex-col space-y-1'
                      >
                        <FormItem className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value='documentation' />
                          </FormControl>
                          <FormLabel className='font-normal'>Tài liệu</FormLabel>
                        </FormItem>
                        <FormItem className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value='feature' />
                          </FormControl>
                          <FormLabel className='font-normal'>Tính năng</FormLabel>
                        </FormItem>
                        <FormItem className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value='bug' />
                          </FormControl>
                          <FormLabel className='font-normal'>Lỗi / Vấn đề</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mức độ ưu tiên */}
              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel>Mức độ ưu tiên</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className='flex flex-col space-y-1'
                      >
                        <FormItem className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value='low' />
                          </FormControl>
                          <FormLabel className='font-normal'>Thấp</FormLabel>
                        </FormItem>
                        <FormItem className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value='medium' />
                          </FormControl>
                          <FormLabel className='font-normal'>Trung bình</FormLabel>
                        </FormItem>
                        <FormItem className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value='high' />
                          </FormControl>
                          <FormLabel className='font-normal'>Cao</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Chân trang cố định chứa các nút tác vụ */}
        <SheetFooter className='pt-2 border-t flex flex-row justify-end gap-2'>
          <SheetClose asChild>
            <Button type='button' variant='outline'>
              Đóng
            </Button>
          </SheetClose>
          <Button type='submit' form='tasks-mutate-form'>
            Lưu thay đổi
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
