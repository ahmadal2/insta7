import { getSupabaseClient } from './supabaseClient'

/**
 * Helper functions for advanced Instagram-clone features
 * Frontend explicitly sets user_id for all operations (Solution 1)
 */

// POST OPERATIONS
export async function createPost(imageUrl: string, caption?: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase.from('posts').insert({
    user_id: user.id,   // 👈 explicit user_id (REQUIRED)
    image_url: imageUrl,
    caption: caption || null,
    content: caption || null  // Also set content for compatibility
  }).select()

  if (error) throw error
  return data
}

export async function deletePost(postId: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)  // Extra safety check

  if (error) throw error
  return data
}

// COMMENT OPERATIONS
export async function addComment(postId: string, text: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase.from('comments').insert({
    user_id: user.id,    // 👈 explicit user_id (REQUIRED)
    post_id: postId,
    text: text
  }).select()

  if (error) throw error
  return data
}

export async function deleteComment(commentId: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)  // Extra safety check

  if (error) throw error
  return data
}

// LIKE OPERATIONS
export async function likePost(postId: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase.from('likes').insert({
    user_id: user.id,   // 👈 explicit user_id (REQUIRED)
    post_id: postId
  }).select()

  if (error) throw error
  return data
}

export async function unlikePost(postId: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('post_id', postId)

  if (error) throw error
  return data
}

// FOLLOW OPERATIONS (NEW)
export async function followUser(followingId: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  if (user.id === followingId) {
    throw new Error('Cannot follow yourself!')
  }

  const { data, error } = await supabase.from('follows').insert({
    follower_id: user.id,   // 👈 explicit follower_id (REQUIRED)
    following_id: followingId
  }).select()

  if (error) throw error
  return data
}

export async function unfollowUser(followingId: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) throw error
  return data
}

export async function checkIfFollowing(followingId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return false

  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single()

  return !error && !!data
}

// REPOST OPERATIONS (NEW)
export async function repostPost(originalPostId: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase.from('reposts').insert({
    user_id: user.id,           // 👈 explicit user_id (REQUIRED)
    original_post_id: originalPostId
  }).select()

  if (error) throw error
  return data
}

export async function unrepostPost(originalPostId: string) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase
    .from('reposts')
    .delete()
    .eq('user_id', user.id)
    .eq('original_post_id', originalPostId)

  if (error) throw error
  return data
}

export async function checkIfReposted(originalPostId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return false

  const { data, error } = await supabase
    .from('reposts')
    .select('*')
    .eq('user_id', user.id)
    .eq('original_post_id', originalPostId)
    .single()

  return !error && !!data
}

// USER STATS
export async function getUserStats(userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// FEED OPERATIONS - OPTIMIZED FOR MOBILE PERFORMANCE
export async function getFollowingFeed(limit = 5, offset = 0) {
  const supabase = getSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  // Get following IDs first
  const { data: followingData, error: followingError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  if (followingError) throw followingError

  const followingIds = followingData?.map(f => f.following_id) || []
  // Include own posts in the feed
  const allIds = [...followingIds, user.id]

  // Single optimized query with joins to reduce database round trips
  // Reduced limit to 5 for better mobile performance
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      image_url,
      caption,
      created_at,
      profiles:user_id(
        id,
        username,
        avatar_url,
        bio,
        updated_at
      ),
      likes(
        user_id
      ),
      comments(
        id
      ),
      reposts(
        user_id
      )
    `)
    .in('user_id', allIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

export async function getPublicFeed(limit = 5, offset = 0) {
  const supabase = getSupabaseClient()
  // Single optimized query with all related data
  // Reduced limit to 5 for better mobile performance
  // Only fetch essential data to reduce payload
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      image_url,
      caption,
      created_at,
      profiles:user_id(
        id,
        username,
        avatar_url,
        bio,
        updated_at
      ),
      likes(
        user_id
      ),
      comments(
        id
      ),
      reposts(
        user_id
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data || []
}

/**
 * Alternative functions for Solution 2 approach
 * (Database automatically sets user_id)
 */

export async function createPostSimplified(imageUrl: string, caption?: string) {
  const supabase = getSupabaseClient()
  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  // With DEFAULT auth.uid() set, user_id is automatic - no need to pass it
  const { data, error } = await supabase.from('posts').insert({
    user_id: user.id,  // Explicitly set user_id for compatibility
    image_url: imageUrl,
    caption: caption || null,
    content: caption || null  // Also set content for compatibility
  }).select()

  if (error) throw error
  return data
}

export async function createPostAuto(imageUrl: string, caption?: string) {
  const supabase = getSupabaseClient()
  // With DEFAULT auth.uid() set, user_id is automatic
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase.from('posts').insert({
    user_id: user.id,  // Explicitly set user_id for compatibility
    image_url: imageUrl,
    caption: caption || null,
    content: caption || null  // Also set content for compatibility
  }).select()

  if (error) throw error
  return data
}

export async function addCommentAuto(postId: string, text: string) {
  const supabase = getSupabaseClient()
  // With DEFAULT auth.uid() set, user_id is automatic
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase.from('comments').insert({
    user_id: user.id,  // Explicitly set user_id for compatibility
    post_id: postId,
    text: text
  }).select()

  if (error) throw error
  return data
}

export async function likePostAuto(postId: string) {
  const supabase = getSupabaseClient()
  // With DEFAULT auth.uid() set, user_id is automatic
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not logged in!')

  const { data, error } = await supabase.from('likes').insert({
    user_id: user.id,  // Explicitly set user_id for compatibility
    post_id: postId
  }).select()

  if (error) throw error
  return data
}