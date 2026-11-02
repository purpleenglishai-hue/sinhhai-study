import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SignIn2 } from '@/features/auth/sign-in/sign-in-2' // Đổi sang SignIn2 đã sửa thương hiệu

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn2, // Gọi SignIn2 tại đây
  validateSearch: searchSchema,
})
