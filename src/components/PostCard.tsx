'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from '@supabase/supabase-js'
import { supabase, Post, Comment } from '@/lib/supabaseClient'
import { repostPost, unrepostPost, deletePost, deleteComment, followUser, unfollowUser, checkIfFollowing } from '@/lib/postActions'
import { Heart, MessageCircle, Send, Share2, User as UserIcon, Loader2, MoreHorizontal, Trash2, UserPlus, UserMinus } from 'lucide-react'
import OptimizedImage from '@/components/OptimizedImage'

const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
})

type CommentFormData = z.infer<typeof commentSchema>

interface PostCardProps {
  post: Post
  currentUser: User | null
  onPostDelete?: (postId: string) => void
  lazy?: boolean // New prop for lazy loading
}

export default function PostCard({ post, currentUser, onPostDelete, lazy = true }: PostCardProps) {
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
  const [showPostMenu, setShowPostMenu] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
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
    
    // Check if following the post author
    if (currentUser && post.user_id !== currentUser.id) {
      checkIfFollowing(post.user_id).then(setIsFollowing)
    }
  }, [currentUser, post.likes, post.reposts, post.user_id])

  // Close post menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPostMenu) {
        setShowPostMenu(false)
      }
    }

    if (showPostMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showPostMenu])

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

  const handleDeletePost = async () => {
    if (!currentUser || currentUser.id !== post.user_id) return
    
    const confirmDelete = window.confirm('Are you sure you want to delete this post? This action cannot be undone.')
    if (!confirmDelete) return

    setDeleteLoading(true)
    try {
      await deletePost(post.id)
      onPostDelete?.(post.id)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    } finally {
      setDeleteLoading(false)
      setShowPostMenu(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return

    const confirmDelete = window.confirm('Are you sure you want to delete this comment?')
    if (!confirmDelete) return

    try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment. Please try again.')
    }
  }

  const handleFollowToggle = async () => {
    if (!currentUser || post.user_id === currentUser.id) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await unfollowUser(post.user_id)
        setIsFollowing(false)
      } else {
        await followUser(post.user_id)
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      alert('Failed to update follow status. Please try again.')
    } finally {
      setFollowLoading(false)
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
    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl overflow-hidden mb-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border/50">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center ring-2 ring-border">
            {post.profiles?.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt={post.profiles.username || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {post.profiles?.username || 'Anonymous'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
        
        {/* Follow button for other users' posts */}
        {currentUser && currentUser.id !== post.user_id && (
          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 ${
              isFollowing
                ? 'bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {followLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isFollowing ? (
              <UserMinus className="w-3 h-3" />
            ) : (
              <UserPlus className="w-3 h-3" />
            )}
            <span>{followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}</span>
          </button>
        )}
        
        {/* Post Menu (Delete) - Only show for post owner */}
        {currentUser && currentUser.id === post.user_id && (
          <div className="relative">
            <button
              onClick={() => setShowPostMenu(!showPostMenu)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all duration-200"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showPostMenu && (
              <div className="absolute right-0 top-12 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl z-10 min-w-[120px] overflow-hidden">
                <button
                  onClick={handleDeletePost}
                  disabled={deleteLoading}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{deleteLoading ? 'Deleting...' : 'Delete Post'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="relative w-full overflow-hidden">
        <OptimizedImage
          src={post.image_url}
          alt={post.caption || 'Post image'}
          lazy={lazy}
          className="w-full h-auto object-cover max-h-96 group-hover:scale-[1.02] transition-transform duration-500"
          style={{
            aspectRatio: '1 / 1',
            objectFit: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center space-x-6 mb-4">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`group/btn relative p-2 rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-110 ${
              isLiked 
                ? 'text-red-500 bg-red-50 dark:bg-red-500/10' 
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
            }`}
          >
            {likeLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Heart className={`w-6 h-6 transition-all duration-200 group-hover/btn:scale-110 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
            )}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="group/btn p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <MessageCircle className="w-6 h-6 transition-all duration-200 group-hover/btn:scale-110" />
          </button>
          <button
            onClick={handleRepost}
            disabled={repostLoading}
            className={`group/btn relative p-2 rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-110 ${
              isReposted 
                ? 'text-green-500 bg-green-50 dark:bg-green-500/10' 
                : 'text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'
            }`}
          >
            {repostLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Share2 className={`w-6 h-6 transition-all duration-200 group-hover/btn:scale-110 ${isReposted ? 'fill-current animate-pulse' : ''}`} />
            )}
          </button>
        </div>

        {/* Engagement counts */}
        <div className="space-y-1 mb-3">
          <p className="text-sm font-semibold text-foreground">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </p>
          {repostsCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {repostsCount} {repostsCount === 1 ? 'repost' : 'reposts'}
            </p>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-3 p-3 bg-muted/50 rounded-xl">
            <span className="text-sm text-foreground">
              <span className="font-semibold text-primary">{post.profiles?.username || 'Anonymous'}</span>{' '}
              <span className="text-foreground">{post.caption}</span>
            </span>
          </div>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-muted-foreground mb-3 hover:text-primary transition-colors font-medium"
          >
            {showComments ? 'Hide' : 'View'} all {comments.length} comments
          </button>
        )}

        {showComments && (
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-secondary/50 rounded-xl p-3 text-sm transition-colors hover:bg-secondary/70 group/comment">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="font-semibold text-primary">
                      {comment.profiles?.username || 'Anonymous'}
                    </span>{' '}
                    <span className="text-foreground">{comment.text}</span>
                    <span className="text-muted-foreground ml-2 text-xs block mt-1">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  
                  {/* Delete comment button - Only show for comment owner */}
                  {currentUser && currentUser.id === comment.user_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="opacity-0 group-hover/comment:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 ml-2"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        {currentUser && (
          <div className="border-t border-border/50 pt-4">
            <form onSubmit={handleSubmit(onSubmitComment)} className="flex items-center space-x-3">
              <input
                {...register('text')}
                placeholder="Add a comment..."
                className="flex-1 text-sm border border-border/50 outline-none bg-secondary/30 rounded-xl px-4 py-3 focus:bg-secondary/50 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-primary hover:text-primary/80 disabled:opacity-50 p-3 rounded-xl hover:bg-primary/10 transition-all duration-200 group/send hover:scale-110"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5 group-hover/send:translate-x-1 transition-transform duration-200" />
                )}
              </button>
            </form>
            
            {/* Error display */}
            {commentError && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
                <p className="font-medium">Comment Error:</p>
                <p>{commentError}</p>
                {commentError.includes('database setup') && (
                  <p className="mt-1 text-primary">
                    Please check the FIX_COMMENTS_AND_FOLLOWS.md file for setup instructions.
                  </p>
                )}
              </div>
            )}
            
            {/* Form validation error */}
            {errors.text && (
              <p className="text-xs text-destructive mt-2">{errors.text.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}