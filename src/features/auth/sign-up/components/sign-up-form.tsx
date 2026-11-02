import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus, Globe } from 'lucide-react'
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
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, facebookProvider } from '@/firebase'

const formSchema = z
  .object({
    email: z.string().min(1, 'Please enter your email.').email('Invalid email address.'),
    password: z
      .string()
      .min(1, 'Please enter your password.')
      .min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth: storeAuth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Đăng ký tài khoản mới bằng Email/Password qua Firebase
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      const appUser = {
        accountNo: user.uid,
        email: user.email || data.email,
        role: ['user'],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }

      storeAuth.setUser(appUser)
      storeAuth.setAccessToken(await user.getIdToken())

      toast.success(`Account created successfully for ${user.email}!`)
      navigate({ to: '/', replace: true })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  // Đăng nhập / Đăng ký nhanh bằng Google
  const handleGoogleSignUp = async () => {
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
        toast.info('Bạn đã hủy thao tác đăng ký.')
      } else {
        toast.error(error.message || 'Google sign-up failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Đăng nhập / Đăng ký nhanh bằng Facebook
  const handleFacebookSignUp = async () => {
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
        toast.info('Bạn đã hủy thao tác đăng ký.')
      } else {
        toast.error(error.message || 'Facebook sign-up failed')
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
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <UserPlus />}
          Create Account
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
            className='w-full'
            type='button'
            disabled={isLoading}
            onClick={handleGoogleSignUp}
          >
            <Globe className='h-4 w-4 mr-1 text-blue-500' /> Google
          </Button>

          {/* Nút Facebook */}
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={isLoading}
            onClick={handleFacebookSignUp}
          >
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
