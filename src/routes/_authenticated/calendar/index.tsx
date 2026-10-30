import { createFileRoute } from '@tanstack/react-router'
import CalendarPage from '@/features/calendar'

export const Route = createFileRoute('/_authenticated/calendar' as any)({
  component: CalendarPage,
})
