import { createFileRoute } from '@tanstack/react-router'
import StudyCalendar from '@/features/calendar'

export const Route = createFileRoute('/_authenticated/calendar/')({
  component: StudyCalendar,
})
