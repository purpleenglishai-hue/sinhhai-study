import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { IconFacebook } from '@/assets/brand-icons'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

// Import Firebase Auth và Providers
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider, facebookProvider } from '@/firebase'

const formSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Invalid email address.'),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(6, 'Password must be at least 6 characters long.'),
})

export function SignIn2() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth: storeAuth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Đăng nhập Email/Password
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      const appUser = {
        accountNo: user.uid,
        email: user.email || data.email,
        role: ['user'],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }

      storeAuth.setUser(appUser)
      storeAuth.setAccessToken(await user.getIdToken())

      toast.success(`Welcome back, ${user.email}!`)
      navigate({ to: '/', replace: true })
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  // Đăng nhập Google
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      const appUser = {
        accountNo: user.uid,
        email: user.email || '',
        role: ['user'],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }

      storeAuth.setUser(appUser)
      storeAuth.setAccessToken(await user.getIdToken())

      toast.success(`Welcome, ${user.displayName || user.email}!`)
      navigate({ to: '/', replace: true })
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Bạn đã hủy thao tác đăng nhập.')
      } else {
        toast.error(error.message || 'Google sign-in failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Đăng nhập Facebook
  const handleFacebookSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, facebookProvider)
      const user = result.user

      const appUser = {
        accountNo: user.uid,
        email: user.email || '',
        role: ['user'],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }

      storeAuth.setUser(appUser)
      storeAuth.setAccessToken(await user.getIdToken())

      toast.success(`Welcome, ${user.displayName || user.email}!`)
      navigate({ to: '/', replace: true })
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Bạn đã hủy thao tác đăng nhập.')
      } else {
        toast.error(error.message || 'Facebook sign-in failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

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

        {/* Khung Form Đăng nhập */}
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-3')}>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                    <Link
                      to='/forgot-password'
                      className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
                    >
                      Forgot password?
                    </Link>
                  </FormItem>
                )}
              />
              <Button className='mt-2' disabled={isLoading}>
                {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
                Sign in
              </Button>

              <div className='relative my-2'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <Button 
                  variant='outline' 
                  type='button' 
                  disabled={isLoading} 
                  onClick={handleGoogleSignIn}
                >
                  <Globe className='h-4 w-4 mr-1 text-blue-500' /> Google
                </Button>
                <Button 
                  variant='outline' 
                  type='button' 
                  disabled={isLoading} 
                  onClick={handleFacebookSignIn}
                >
                  <IconFacebook className='h-4 w-4' /> Facebook
                </Button>
              </div>
            </form>
          </Form>

          <div className='mt-6 text-center'>
            <p className='text-xs text-muted-foreground'>
              By clicking sign in, you agree to our{' '}
              <a href='/terms' className='underline underline-offset-4 hover:text-primary'>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href='/privacy' className='underline underline-offset-4 hover:text-primary'>
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
