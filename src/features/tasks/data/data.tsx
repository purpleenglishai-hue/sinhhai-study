import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons'

export const labels = [
  {
    value: 'bug',
    label: 'Lỗi / Vấn đề',
  },
  {
    value: 'feature',
    label: 'Tính năng',
  },
  {
    value: 'documentation',
    label: 'Tài liệu',
  },
]

export const statuses = [
  {
    value: 'backlog',
    label: 'Đang chờ',
    icon: QuestionMarkCircledIcon,
  },
  {
    value: 'todo',
    label: 'Cần làm',
    icon: CircleIcon,
  },
  {
    value: 'in progress',
    label: 'Đang thực hiện',
    icon: StopwatchIcon,
  },
  {
    value: 'done',
    label: 'Đã hoàn thành',
    icon: CheckCircledIcon,
  },
  {
    value: 'canceled',
    label: 'Đã hủy',
    icon: StopwatchIcon,
  },
]

export const priorities = [
  {
    value: 'low',
    label: 'Thấp',
    icon: ArrowDownIcon,
  },
  {
    value: 'medium',
    label: 'Trung bình',
    icon: ArrowRightIcon,
  },
  {
    value: 'high',
    label: 'Cao',
    icon: ArrowUpIcon,
  },
]
