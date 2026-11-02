import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn2() {
  return (
    <div className='relative container flex h-svh flex-col items-center justify-center px-4'>
      <div className='mx-auto flex w-full max-w-md flex-col justify-center space-y-6'>
        
        {/* Phần Logo & Tên thương hiệu sinhHAI */}
        <div className='flex flex-col items-center space-y-2 text-center'>
          <div className='flex items-center justify-center gap-2'>
            {/* Logo hình trái thông / biểu tượng của anh (đặt trong thư mục public) */}
            <img 
              src='/logo.png' 
              alt='sinhHAI Logo' 
              className='h-10 w-10 object-contain' 
            />
            {/* Tên thương hiệu: sinh (thường) + HAI (tím nổi bật) */}
            <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
              sinh<span className='text-purple-600 dark:text-purple-400'>HAI</span>
            </h1>
          </div>
        </div>

        {/* Khung Form Đăng nhập chính giữa */}
        <div className='grid gap-6 bg-card p-6 sm:p-8 rounded-xl border shadow-sm'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-xl font-semibold tracking-tight'>Sign in</h2>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password below to log into your account.{' '}
              Don't have an account?{' '}
              <Link
                to='/sign-up'
                className='text-nowrap underline underline-offset-4 hover:text-primary'
              >
                Sign Up
              </Link>
            </p>
          </div>

          <UserAuthForm />

          <p className='px-2 text-center text-xs text-muted-foreground'>
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
  )
}
