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

  // Hàm đẩy dữ liệu THẬT lên Cloud Firestore
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
      {/* Thêm h-screen và flex để quản lý khung nhìn chuẩn */}
      <SheetContent className='flex flex-col h-screen overflow-hidden opacity-100 backdrop-blur-none bg-background border-l sm:max-w-md'>
        <SheetHeader className='text-start shrink-0'>
          <SheetTitle>{isUpdate ? 'Cập nhật nhiệm vụ' : 'Tạo nhiệm vụ mới'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Chỉnh sửa thông tin chi tiết nhiệm vụ.'
              : 'Thêm nhiệm vụ mới vào danh sách học tập của bạn.'}
          </SheetDescription>
        </SheetHeader>

        {/* Thêm overflow-y-auto để tạo thanh cuộn mượt mà ở phần thân form */}
        <div className='flex-1 overflow-y-auto py-4 px-1'>
          <Form {...form}>
            <form
              id='tasks-mutate-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-5'
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
        </div>

        {/* SheetFooter được giữ cố định ở đáy drawer luôn hiển thị rõ ràng */}
        <SheetFooter className='gap-2 sm:space-x-0 pt-4 border-t shrink-0'>
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
