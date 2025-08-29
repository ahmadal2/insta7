'use client'

import { Loader } from 'lucide-react'
import { useState, useEffect } from 'react'

// Page loading component - optimized for mobile with glass effect
export function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto glass rounded-full">
          <div className="absolute inset-0 rounded-full border-4 border-border/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Ahmad Insta
          </h2>
          <p className="text-muted-foreground animate-pulse">Loading your feed...</p>
        </div>
      </div>
    </div>
  )
}

// Skeleton loading component for posts - optimized for mobile with glass effect
export function PostSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl overflow-hidden mb-6 animate-pulse shadow-lg glass">
      {/* Header skeleton */}
      <div className="flex items-center p-4 border-b border-border/50">
        <div className="w-10 h-10 bg-gradient-to-br from-muted to-secondary rounded-full"></div>
        <div className="ml-3 space-y-2 flex-1">
          <div className="h-3 bg-gradient-to-r from-muted to-secondary rounded-lg w-24"></div>
          <div className="h-2 bg-gradient-to-r from-muted to-secondary rounded-lg w-16"></div>
        </div>
      </div>
      
      {/* Image skeleton - optimized aspect ratio for mobile */}
      <div className="w-full aspect-square bg-gradient-to-br from-muted via-secondary to-muted animate-pulse"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        <div className="flex space-x-6">
          <div className="w-8 h-8 bg-gradient-to-br from-muted to-secondary rounded-xl"></div>
          <div className="w-8 h-8 bg-gradient-to-br from-muted to-secondary rounded-xl"></div>
          <div className="w-8 h-8 bg-gradient-to-br from-muted to-secondary rounded-xl"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gradient-to-r from-muted to-secondary rounded-lg w-3/4"></div>
          <div className="h-3 bg-gradient-to-r from-muted to-secondary rounded-lg w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

export function StorySkeleton() {
  return (
    <div className="story-item animate-pulse">
      <div className="w-16 h-16 rounded-full bg-muted"></div>
      <div className="w-12 h-3 bg-muted rounded-full mt-2"></div>
    </div>
  )
}

export function ButtonLoader({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  }
  
  return <Loader className={`${sizeClasses[size]} animate-spin`} />
}

interface LoadingProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullScreen?: boolean
}

export default function Loading({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4'

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        {/* Modern loading spinner with gradient and glass effect */}
        <div className={`${sizeClasses[size]} relative glass rounded-full`}>
          <div className="absolute inset-0 rounded-full border-2 border-border/30"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 animate-pulse"></div>
        </div>
        
        {/* Loading text with animated dots */}
        {text && (
          <div className={`${textSizeClasses[size]} text-muted-foreground font-medium min-w-[80px] text-center glass px-4 py-2 rounded-full`}>
            {text}{dots}
          </div>
        )}
      </div>
    </div>
  )
}