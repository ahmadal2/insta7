'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'
import { Camera, Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [resetEmail, setResetEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Attempting login with:', data.email)
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      console.log('Auth response:', { authData, authError })

      if (authError) {
        console.error('Login error:', authError)
        // Provide more specific error messages
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before logging in.')
        } else if (authError.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a moment and try again.')
        } else if (authError.message.includes('Signup requires email confirmation')) {
          setError('Your email needs to be confirmed. Please check your email for a confirmation link.')
        } else {
          setError(`Login failed: ${authError.message}`)
        }
        return
      }

      if (authData.user) {
        console.log('Login successful, user:', authData.user.id)
        
        // Check if user has confirmed email
        if (!authData.user.email_confirmed_at) {
          setError('Please confirm your email address before logging in. Check your email for a confirmation link.')
          return
        }
        
        // Force router refresh to ensure navigation works
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email address')
      return
    }

    setResetLoading(true)
    setError(null)
    setResetMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setError(`Password reset failed: ${error.message}`)
      } else {
        setResetMessage('Check your email for a password reset link!')
        setShowForgotPassword(false)
        setResetEmail('')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl opacity-50"></div>
                <Camera className="relative h-16 w-16 text-primary drop-shadow-sm" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Sign in to AhmadInsta
            </h2>
          </div>
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl backdrop-blur-sm">
              {error}
            </div>
          )}
          
          {resetMessage && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl backdrop-blur-sm">
              {resetMessage}
            </div>
          )}

          {!showForgotPassword ? (
            <>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      {...register('email')}
                      type="email"
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-border bg-background rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      {...register('password')}
                      type="password"
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-border bg-background rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      placeholder="Enter your password"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-primary-foreground bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-5">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-foreground mb-2">
                    Email address for password reset
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-border bg-background rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-primary-foreground bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setError(null)
                  }}
                  className="flex-1 py-3 px-4 border border-border text-sm font-semibold rounded-xl text-foreground bg-secondary/50 hover:bg-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}

          <div className="text-center pt-6 border-t border-border/50">
            <span className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </span>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}