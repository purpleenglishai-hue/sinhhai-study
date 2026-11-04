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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { type Task, taskSchema } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow

  const form = useForm<Task>({
    resolver: zodResolver(taskSchema),
    defaultValues: currentRow ?? {
      title: '',
      status: 'todo',
      label: 'feature',
      priority: 'medium',
    },
  })

  const onSubmit = async (data: Task) => {
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
          updatedAt: new Date().toISOString(),
        })
      } else {
        await addDoc(collection(db, `users/${user.uid}/tasks`), {
          title: data.title,
          status: data.status,
          label: data.label,
          priority: data.priority,
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
      <SheetContent className='flex flex-col opacity-100 backdrop-blur-none bg-background border-l'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Cập nhật nhiệm vụ' : 'Tạo nhiệm vụ mới'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Chỉnh sửa thông tin chi tiết của nhiệm vụ.'
              : 'Thêm nhiệm vụ mới vào hệ thống của bạn.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='tasks-mutate-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-5 flex-1'
          >
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
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn trạng thái' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='todo'>Cần làm (Todo)</SelectItem>
                      <SelectItem value='in progress'>Đang thực hiện</SelectItem>
                      <SelectItem value='done'>Đã hoàn thành</SelectItem>
                      <SelectItem value='canceled'>Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Nhãn dán</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
            <FormField
              control={form.control}
              name='priority'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Mức độ ưu tiên</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
        <SheetFooter className='gap-2 sm:space-x-0'>
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
