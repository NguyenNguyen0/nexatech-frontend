import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/custom/button'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '@/services/userApi'
import { getApiErrorMessage, logout } from '@/services/authApi'
import { clearAuthTokens, getRefreshToken } from '@/services/authSession'

const passwordFormSchema = z
  .object({
    oldPassword: z.string().min(1, { message: 'Old password is required.' }),
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
      .regex(/\d/, { message: 'Password must contain at least one number.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function PasswordForm() {
  const navigate = useNavigate()
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        await logout(refreshToken).catch(err => console.error('Logout failed:', err))
      }
      
      clearAuthTokens()
      toast.success('Password changed successfully. Please login again.')
      
      setTimeout(() => {
        navigate('/auth', { replace: true })
      }, 1500)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to change password'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='oldPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='••••••••' {...field} />
              </FormControl>
              <FormDescription>
                Must be at least 8 characters long and contain letters and numbers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' loading={form.formState.isSubmitting}>
          Change Password
        </Button>
      </form>
    </Form>
  )
}
