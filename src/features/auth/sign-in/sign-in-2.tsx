import { Link } from '@tanstack/react-router'
import { SignUpForm } from './components/sign-up-form' // Hoặc form đăng ký tương ứng

export function SignUp2() {
  return (
    <div className='relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-6'>
      <div className='w-full max-w-md space-y-6'>
        
        {/* Logo & Tên thương hiệu sinhHAI chính giữa */}
        <div className='flex flex-col items-center justify-center space-y-2 text-center'>
          <div className='flex items-center justify-center gap-3'>
            <img 
              src='/images/logo.png' 
              alt='sinhHAI Logo' 
              className='h-10 w-10 object-contain' 
            />
            <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
              sinh<span className='text-purple-600 dark:text-purple-400'>HAI</span>
            </h1>
          </div>
        </div>

        {/* Khung form đăng ký */}
        <div className='rounded-2xl border bg-card p-6 shadow-sm sm:p-8'>
          <div className='flex flex-col space-y-2 text-start mb-6'>
            <h2 className='text-xl font-semibold tracking-tight'>Create an account</h2>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password to create an account.{' '}
              Already have an account?{' '}
              <Link
                to='/sign-in'
                className='text-nowrap underline underline-offset-4 hover:text-primary font-medium text-foreground'
              >
                Sign In
              </Link>
            </p>
          </div>

          <SignUpForm />

          <div className='mt-6 text-center'>
            <p className='text-xs text-muted-foreground'>
              By creating an account, you agree to our{' '}
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
