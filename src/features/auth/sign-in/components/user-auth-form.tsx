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

// Import Firebase Auth và Provider đã thiết lập chuẩn
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider, facebookProvider } from '@/firebase'

const formSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Invalid email address.'),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(6, 'Password must be at least 6 characters long.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
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

  // Đăng nhập bằng Email/Password thông thường qua Firebase
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
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  // Đăng nhập bằng Google (Đã sửa lỗi treo khi bấm Cancel)
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
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
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

  // Đăng nhập bằng Facebook (Đã sửa lỗi treo khi bấm Cancel)
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
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
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
          {/* Nút Google thay thế GitHub */}
          <Button 
            variant='outline' 
            type='button' 
            disabled={isLoading} 
            onClick={handleGoogleSignIn}
          >
            <Globe className='h-4 w-4 mr-1 text-blue-500' /> Google
          </Button>

          {/* Nút Facebook */}
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
  )
}
