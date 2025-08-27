'use client'

import { useState, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  lazy?: boolean
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
  width?: number
  height?: number
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  lazy = true,
  priority = false,
  onLoad,
  onError,
  width,
  height
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [optimizedSrc, setOptimizedSrc] = useState(src)

  useEffect(() => {
    // Optimize image for mobile devices
    if (src.includes('supabase')) {
      const url = new URL(src)
      
      // Set appropriate image dimensions based on device
      const screenWidth = window.innerWidth
      let imageWidth = width || 400
      
      if (screenWidth <= 480) {
        imageWidth = 400  // Small mobile
      } else if (screenWidth <= 768) {
        imageWidth = 600  // Large mobile/tablet
      } else {
        imageWidth = 800  // Desktop
      }
      
      url.searchParams.set('width', imageWidth.toString())
      url.searchParams.set('quality', '75')  // Reduced quality for faster loading
      url.searchParams.set('format', 'webp')
      
      setOptimizedSrc(url.toString())
    } else {
      setOptimizedSrc(src)
    }
  }, [src, width])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div className={`bg-muted/50 flex items-center justify-center ${className}`}>
        <div className="text-muted-foreground text-sm">Failed to load image</div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder with gradient animation */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse" />
      )}
      
      {/* Optimized image */}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={priority ? 'eager' : (lazy ? 'lazy' : 'eager')}
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          aspectRatio: '1 / 1',
          objectFit: 'cover'
        }}
      />
    </div>
  )
}

// Skeleton component for image loading
export function ImageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse ${className}`}
         style={{ aspectRatio: '1 / 1' }} />
  )
}