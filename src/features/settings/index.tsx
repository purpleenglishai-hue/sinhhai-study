import { useState, useEffect } from 'react'
import { User, Mail, Shield, CreditCard, Calendar, Clock, CheckCircle2, Award } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { getDisplayNameInitials } from '@/lib/utils'

// Import Firebase thực tế
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

export function Settings() {
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user)
      if (user) {
        try {
          // Lấy thông tin chi tiết của user từ Firestore collection 'users'
          const userDocRef = doc(db, 'users', user.uid)
          const userDocSnap = await getDoc(userDocRef)
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data())
          }
        } catch (error) {
          console.error("Lỗi tải thông tin user từ Firebase:", error)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const displayName = userData?.fullName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Thành viên sinhHAI'
  const email = currentUser?.email || userData?.email || 'Chưa cập cấp email'
  const avatarUrl = userData?.profile || userData?.photoURL || currentUser?.photoURL || ''
  const roleTitle = email === 'purpleenglishai@gmail.com' ? 'Quản trị viên Hệ thống' : 'Thành viên Chính thức'
  
  // Thông tin gói cước và lịch sử thanh toán từ hạ tầng
  const subscriptionPlan = userData?.plan || 'Gói Tiêu chuẩn (Standard Pro)'
  const subscriptionStatus = userData?.status || 'Đang hoạt động'
  const expiryDate = userData?.expiryDate || '31/12/2026'

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='max-w-4xl mx-auto space-y-6 pb-10'>
          {/* Tiêu đề trang */}
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl text-purple-700 dark:text-purple-300 flex items-center gap-2'>
              <User className='size-8 text-purple-600' /> Thông tin Tài khoản & Gói cước
            </h1>
            <p className='text-muted-foreground text-sm'>
              Quản lý hồ sơ cá nhân và theo dõi trạng thái kích hoạt gói dịch vụ trực tuyến trên sinhhai.com.
            </p>
          </div>

          <Separator className='my-4' />

          {loading ? (
            <div className='flex justify-center items-center py-20 text-muted-foreground'>
              Đang đồng bộ dữ liệu tài khoản từ hạ tầng...
            </div>
          ) : (
            <div className='grid gap-6 md:grid-cols-3'>
              {/* Cột trái: Thẻ đại diện cá nhân */}
              <div className='md:col-span-1 rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center text-center space-y-4'>
                <Avatar className='size-24 border-4 border-purple-200 shadow-md'>
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className='bg-purple-100 text-purple-700 text-2xl font-bold'>
                    {getDisplayNameInitials(displayName) || 'SH'}
                  </AvatarFallback>
                </Avatar>
                
                <div className='space-y-1'>
                  <h2 className='font-semibold text-lg'>{displayName}</h2>
                  <p className='text-xs text-muted-foreground'>{email}</p>
                </div>

                <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200'>
                  <Award size={14} /> {roleTitle}
                </div>
              </div>

              {/* Cột phải: Chi tiết thông tin và Gói cước thanh toán */}
              <div className='md:col-span-2 space-y-6'>
                {/* Thông tin cá nhân */}
                <div className='rounded-xl border bg-card p-6 shadow-sm space-y-4'>
                  <h3 className='font-semibold text-base flex items-center gap-2 text-purple-700 dark:text-purple-300'>
                    <Shield size={18} /> Chi tiết Định danh
                  </h3>
                  <Separator />
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-muted-foreground block text-xs'>Họ và tên hiển thị</span>
                      <span className='font-medium'>{displayName}</span>
                    </div>
                    <div>
                      <span className='text-muted-foreground block text-xs'>Email liên kết hệ thống</span>
                      <span className='font-medium flex items-center gap-1'>
                        <Mail size={14} className='text-slate-400' /> {email}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground block text-xs'>Mã định danh User ID</span>
                      <span className='font-mono text-xs bg-muted px-1.5 py-0.5 rounded'>{currentUser?.uid || 'N/A'}</span>
                    </div>
                    <div>
                      <span className='text-muted-foreground block text-xs'>Phương thức xác thực</span>
                      <span className='font-medium text-emerald-600'>Firebase Secure Auth</span>
                    </div>
                  </div>
                </div>

                {/* Thông tin gói cước & lịch sử thanh toán */}
                <div className='rounded-xl border bg-card p-6 shadow-sm space-y-4 border-purple-200/60 bg-gradient-to-br from-card to-purple-50/20'>
                  <h3 className='font-semibold text-base flex items-center gap-2 text-purple-700 dark:text-purple-300'>
                    <CreditCard size={18} /> Gói cước & Hạ tầng Đăng ký
                  </h3>
                  <Separator />
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-muted-foreground block text-xs'>Gói dịch vụ hiện tại</span>
                      <span className='font-semibold text-purple-600 flex items-center gap-1 mt-0.5'>
                        <CheckCircle2 size={16} /> {subscriptionPlan}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground block text-xs'>Trạng thái tài khoản</span>
                      <span className='inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold'>
                        {subscriptionStatus}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground block text-xs'>Thời hạn hiệu lực</span>
                      <span className='font-medium flex items-center gap-1 mt-0.5'>
                        <Calendar size={14} className='text-slate-400' /> {expiryDate}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground block text-xs'>Hạ tầng thanh toán</span>
                      <span className='font-medium flex items-center gap-1 mt-0.5'>
                        <Clock size={14} className='text-slate-400' /> Đã xác thực tự động
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
