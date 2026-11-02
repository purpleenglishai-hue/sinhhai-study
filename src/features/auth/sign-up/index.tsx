import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  return (
    <div className='relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-6'>
      <div className='w-full max-w-md space-y-6'>
        
        {/* Phần Logo & Tên thương hiệu sinhHAI chính giữa */}
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

        {/* Khung Card Đăng ký trung tâm */}
        <Card className='w-full border shadow-sm rounded-2xl p-2 sm:p-4'>
          <CardHeader className='space-y-1 pb-4'>
            <CardTitle className='text-xl font-semibold tracking-tight'>
              Create an account
            </CardTitle>
            <CardDescription>
              Enter your email and password to create an account.{' '}
              <br className='max-sm:hidden' /> Already have an account?{' '}
              <Link
                to='/sign-in'
                className='underline underline-offset-4 hover:text-primary font-medium text-foreground'
              >
                Sign In
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className='pb-4'>
            <SignUpForm />
          </CardContent>
          <CardFooter className='pt-0'>
            <p className='w-full text-center text-xs text-muted-foreground'>
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
          </CardFooter>
        </Card>

      </div>
    </div>
  )
}
