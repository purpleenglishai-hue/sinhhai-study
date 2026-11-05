import { z } from 'zod'

// Trạng thái tài khoản người dùng
const userStatusSchema = z.union([
  z.literal('active'),     // Đang hoạt động
  z.literal('inactive'),   // Ngưng hoạt động
  z.literal('invited'),    // Đã gửi lời mời
  z.literal('suspended'),  // Đã bị khóa
])
export type UserStatus = z.infer<typeof userStatusSchema>

// Vai trò người dùng (Dành cho môi trường Học thuật / Giáo dục)
const userRoleSchema = z.union([
  z.literal('superadmin'), // Quản trị cấp cao
  z.literal('admin'),      // Quản trị viên
  z.literal('manager'),    // Quản lý học tập
  z.literal('teacher'),    // Giảng viên / Giáo viên
  z.literal('student'),    // Học sinh / Sinh viên
])
export type UserRole = z.infer<typeof userRoleSchema>

const _userSchema = z.object({
  id: z.string(),
  name: z.string(),         // Họ và tên
  username: z.string(),     // Tên đăng nhập
  email: z.string(),        // Email
  phoneNumber: z.string(),  // Số điện thoại
  status: userStatusSchema, // Trạng thái
  role: userRoleSchema,     // Vai trò
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof _userSchema>
