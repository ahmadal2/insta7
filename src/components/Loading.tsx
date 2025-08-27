'use client'

import { useEffect, useState } from 'react'

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
    ? 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4'

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        {/* Instagram-style loading spinner */}
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
          <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-pink-500 animate-spin`}></div>
        </div>
        
        {/* Loading text with animated dots */}
        {text && (
          <div className={`${textSizeClasses[size]} text-gray-600 font-medium min-w-[80px] text-center`}>
            {text}{dots}
          </div>
        )}
      </div>
    </div>
  )
}

// Skeleton loading component for posts
export function PostSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center p-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="ml-3 space-y-2">
          <div className="h-3 bg-gray-300 rounded w-24"></div>
          <div className="h-2 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
      
      {/* Image skeleton */}
      <div className="w-full h-64 bg-gray-300"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex space-x-4">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  )
}

// Page loading component
export function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Ahmad Insta</h2>
        <p className="text-gray-500">Loading your feed...</p>
      </div>
    </div>
  )
}