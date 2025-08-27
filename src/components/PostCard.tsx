'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from '@supabase/supabase-js'
import { supabase, Post, Comment } from '@/lib/supabaseClient'
import { repostPost, unrepostPost } from '@/lib/postActions'
import { Heart, MessageCircle, Send, Share2, User as UserIcon, Loader2 } from 'lucide-react'

const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
})

type CommentFormData = z.infer<typeof commentSchema>

interface PostCardProps {
  post: Post
  currentUser: User | null
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [comments, setComments] = useState<Comment[]>(post.comments || [])
  const [showComments, setShowComments] = useState(false)
  const [loading, setLoading] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [likeLoading, setLikeLoading] = useState(false)
  const [repostLoading, setRepostLoading] = useState(false)
  const [isReposted, setIsReposted] = useState(false)
  const [repostsCount, setRepostsCount] = useState(post.reposts?.length || 0)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  })

  useEffect(() => {
    if (currentUser && post.likes) {
      setIsLiked(post.likes.some(like => like.user_id === currentUser.id))
    }
    if (currentUser && post.reposts) {
      setIsReposted(post.reposts.some(repost => repost.user_id === currentUser.id))
    }
  }, [currentUser, post.likes, post.reposts])

  const handleLike = async () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    setLikeLoading(true)
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUser.id)

        if (!error) {
          setIsLiked(false)
          setLikesCount(prev => prev - 1)
        }
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([
            {
              post_id: post.id,
              user_id: currentUser.id,
            },
          ])

        if (!error) {
          setIsLiked(true)
          setLikesCount(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Error handling like:', error)
    } finally {
      setLikeLoading(false)
    }
  }

  const handleRepost = async () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    setRepostLoading(true)
    try {
      if (isReposted) {
        // Remove repost
        await unrepostPost(post.id)
        setIsReposted(false)
        setRepostsCount(prev => prev - 1)
      } else {
        // Add repost
        await repostPost(post.id)
        setIsReposted(true)
        setRepostsCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error handling repost:', error)
    } finally {
      setRepostLoading(false)
    }
  }

  const onSubmitComment = async (data: CommentFormData) => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    setCommentError(null)
    
    try {
      console.log('Submitting comment:', { post_id: post.id, user_id: currentUser.id, text: data.text })
      
      const { data: commentData, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: post.id,
            user_id: currentUser.id,
            text: data.text,
          },
        ])
        .select('*, profiles(username, avatar_url)')
        .single()

      console.log('Comment response:', { commentData, error })

      if (error) {
        console.error('Comment error:', error)
        
        // Handle specific errors
        if (error.message.includes('relation "comments" does not exist')) {
          setCommentError('Comments feature is not set up. Please run the database setup script.')
        } else if (error.message.includes('RLS') || error.message.includes('policy')) {
          setCommentError('Permission denied. Please ensure you are logged in and the database is properly configured.')
        } else if (error.message.includes('foreign key')) {
          setCommentError('Invalid post or user reference. Please refresh the page and try again.')
        } else {
          setCommentError(`Failed to add comment: ${error.message}`)
        }
        return
      }

      if (commentData) {
        setComments(prev => [...prev, commentData as Comment])
        reset()
        console.log('Comment added successfully!')
      }
    } catch (error) {
      console.error('Unexpected error adding comment:', error)
      setCommentError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center p-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          {post.profiles?.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.username || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="w-5 h-5 text-gray-600" />
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-semibold">
            {post.profiles?.username || 'Anonymous'}
          </p>
          <p className="text-xs text-gray-500">
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Image */}
      <div className="w-full">
        <img
          src={post.image_url}
          alt={post.caption || 'Post image'}
          className="w-full h-auto object-cover max-h-96"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-2">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`p-1 rounded-full transition-colors disabled:opacity-50 ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}
            }`}
          >
            {likeLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            )}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="p-1 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button
            onClick={handleRepost}
            disabled={repostLoading}
            className={`p-1 rounded-full transition-colors disabled:opacity-50 ${isReposted ? 'text-green-500' : 'text-gray-600 hover:text-green-500'}
            }`}
          >
            {repostLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Share2 className={`w-6 h-6 ${isReposted ? 'fill-current' : ''}`} />
            )}
          </button>
        </div>

        {/* Engagement counts */}
        <div className="space-y-1 mb-2">
          <p className="text-sm font-semibold">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </p>
          {repostsCount > 0 && (
            <p className="text-sm text-gray-600">
              {repostsCount} {repostsCount === 1 ? 'repost' : 'reposts'}
            </p>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <span className="text-sm">
              <span className="font-semibold">{post.profiles?.username || 'Anonymous'}</span>{' '}
              {post.caption}
            </span>
          </div>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-gray-500 mb-2 hover:text-gray-700"
          >
            {showComments ? 'Hide' : 'View'} all {comments.length} comments
          </button>
        )}

        {showComments && (
          <div className="space-y-2 mb-3">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold">
                  {comment.profiles?.username || 'Anonymous'}
                </span>{' '}
                {comment.text}
                <span className="text-gray-500 ml-2 text-xs">
                  {formatTimeAgo(comment.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        {currentUser && (
          <div>
            <form onSubmit={handleSubmit(onSubmitComment)} className="flex items-center space-x-2">
              <input
                {...register('text')}
                placeholder="Add a comment..."
                className="flex-1 text-sm border-none outline-none bg-gray-50 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-blue-500 hover:text-blue-600 disabled:opacity-50 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            
            {/* Error display */}
            {commentError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                <p className="font-medium">Comment Error:</p>
                <p>{commentError}</p>
                {commentError.includes('database setup') && (
                  <p className="mt-1 text-blue-600">
                    Please check the FIX_COMMENTS_AND_FOLLOWS.md file for setup instructions.
                  </p>
                )}
              </div>
            )}
            
            {/* Form validation error */}
            {errors.text && (
              <p className="text-xs text-red-500 mt-1">{errors.text.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}