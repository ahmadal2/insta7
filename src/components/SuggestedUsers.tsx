'use client'

// Mock data for suggested users
const SUGGESTED_USERS = [
  { 
    id: 1, 
    username: 'seyfullah_mzk', 
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg', 
    followedBy: 'tahaa_1890' 
  },
  { 
    id: 2, 
    username: '55avcn', 
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg', 
    isNew: true
  },
  { 
    id: 3, 
    username: 'zaid_pl', 
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg', 
    followedBy: 'yassar_am1' 
  },
  { 
    id: 4, 
    username: 'ghazal.husein', 
    avatar: 'https://randomuser.me/api/portraits/women/41.jpg', 
    followedBy: 'm.amiro58' 
  },
  { 
    id: 5, 
    username: 'oka__sha', 
    avatar: 'https://randomuser.me/api/portraits/women/42.jpg', 
    followedBy: 'ibrahim.5i' 
  },
]

export default function SuggestedUsers() {
  return (
    <div className="suggested-for-you">
      <div className="suggested-header">
        <span className="suggested-title">Suggested for you</span>
        <span className="suggested-see-all">See All</span>
      </div>
      
      <div className="space-y-3">
        {SUGGESTED_USERS.map((user) => (
          <div key={user.id} className="suggested-user">
            <img 
              src={user.avatar} 
              alt={user.username} 
              className="suggested-avatar"
            />
            <div className="suggested-user-info">
              <div className="suggested-username">{user.username}</div>
              {user.followedBy ? (
                <div className="suggested-follows-you">Followed by {user.followedBy}</div>
              ) : user.isNew ? (
                <div className="suggested-follows-you">Suggested for you</div>
              ) : null}
            </div>
            <button className="suggested-follow">Follow</button>
          </div>
        ))}
      </div>
    </div>
  )
}