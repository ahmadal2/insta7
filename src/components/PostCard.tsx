'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Post } from '@/lib/supabaseClient'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'
import { likePost, unlikePost } from '@/lib/postActions'
import Link from 'next/link'
import Image from 'next/image'

interface PostCardProps {
  post: Post
  currentUser: User | null
  onPostDelete?: (postId: string) => void
}

export default function PostCard({ post, currentUser, onPostDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(() => {
    return post.likes?.some(like => like.user_id === currentUser?.id) || false
  })
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [loading, setLoading] = useState(false)
  const [showFullCaption, setShowFullCaption] = useState(false)

  const handleLike = async () => {
    if (!currentUser || loading) return
    
    setLoading(true)
    try {
      if (isLiked) {
        await unlikePost(post.id)
        setLikesCount(prev => prev - 1)
      } else {
        await likePost(post.id)
        setLikesCount(prev => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format post time (e.g., "2h" for 2 hours ago)
  const formatPostTime = (dateString: string) => {
    const postDate = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - postDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) {
      return `${diffMins}m`
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h`
    } else {
      return `${Math.floor(diffMins / 1440)}d`
    }
  }

  const postTime = formatPostTime(post.created_at)
  
  const truncateCaption = (caption: string | null, length = 125) => {
    if (!caption) return ""
    return caption.length > length && !showFullCaption 
      ? `${caption.substring(0, length)}... `
      : caption
  }

  return (
    <article className="post">
      {/* Post header */}
      <div className="post-header">
        <Link href={`/profile/${post.user_id}`}>
          <img 
            src={post.profiles?.avatar_url || "https://via.placeholder.com/150"} 
            alt={post.profiles?.username || "user"}
            className="post-avatar"
          />
        </Link>
        
        <div className="flex flex-col">
          <div className="flex items-center">
            <Link href={`/profile/${post.user_id}`} className="post-user">
              {post.profiles?.username || (post.user_id ? post.user_id.substring(0, 8) : 'Unknown User')}
            </Link>
            <span className="post-time">• {postTime}</span>
          </div>
        </div>
        
        <button className="post-more">
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      {/* Post image */}
      <div className="relative">
        <img
          src={post.image_url || "https://via.placeholder.com/400"}
          alt={post.caption || "Post image"}
          className="post-image"
        />
      </div>
      
      {/* Post actions */}
      <div className="post-actions">
        <button 
          className={`post-action ${isLiked ? 'text-red-500' : ''}`} 
          onClick={handleLike}
          disabled={loading}
        >
          <Heart size={24} fill={isLiked ? "#ef4444" : "none"} />
        </button>
        <button className="post-action">
          <MessageCircle size={24} />
        </button>
        <button className="post-action">
          <Send size={24} />
        </button>
        <button className="post-action save">
          <Bookmark size={24} />
        </button>
      </div>
      
      {/* Likes count */}
      {likesCount > 0 && (
        <div className="post-likes">
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </div>
      )}
      
      {/* Caption */}
      {post.caption && (
        <div className="post-caption">
          <span className="font-semibold mr-2">{post.profiles?.username || 'user'}</span>
          <span>{truncateCaption(post.caption)}</span>
          {post.caption.length > 125 && !showFullCaption && (
            <button 
              className="text-muted-foreground font-medium"
              onClick={() => setShowFullCaption(true)}
            >
              more
            </button>
          )}
        </div>
      )}
      
      {/* View all comments link - show only if there are comments */}
      {post.comments && post.comments.length > 0 && (
        <div className="px-3 pb-2">
          <button className="text-muted-foreground text-sm">
            View all {post.comments.length} comments
          </button>
        </div>
      )}
    </article>
  )
}