import { Link } from '@tanstack/react-router'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn2() {
  return (
    <div className='relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-6'>
      <div className='w-full max-w-md space-y-6'>
        
        {/* Khu vực Logo & Tên thương hiệu sinhHAI chính giữa */}
        <div className='flex flex-col items-center justify-center space-y-2 text-center'>
          <div className='flex items-center justify-center gap-3'>
            {/* Logo thương hiệu (nếu file ảnh chưa khớp, hiển thị icon thay thế an toàn hoặc gọi đúng tên file trong public) */}
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 font-bold text-xl'>
              SH
            </div>
            {/* Tên thương hiệu: sinh (thường) + HAI (tím nổi bật) */}
            <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
              sinh<span className='text-purple-600 dark:text-purple-400'>HAI</span>
            </h1>
          </div>
        </div>

        {/* Khung chứa Form đăng nhập trung tâm */}
        <div className='rounded-2xl border bg-card p-6 shadow-sm sm:p-8'>
          <div className='flex flex-col space-y-2 text-start mb-6'>
            <h2 className='text-xl font-semibold tracking-tight'>Sign in</h2>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password below to log into your account.{' '}
              Don't have an account?{' '}
              <Link
                to='/sign-up'
                className='text-nowrap underline underline-offset-4 hover:text-primary font-medium text-foreground'
              >
                Sign Up
              </Link>
            </p>
          </div>

          <UserAuthForm />

          <div className='mt-6 text-center'>
            <p className='text-xs text-muted-foreground'>
              By clicking sign in, you agree to our{' '}
              <a
                href='/terms'
                className='underline underline-offset-4 hover:text-primary'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='/privacy'
                className='underline underline-offset-4 hover:text-primary'
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
