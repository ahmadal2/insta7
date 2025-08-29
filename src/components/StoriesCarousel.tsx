'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Mock data for stories
const STORIES = [
  { id: 1, username: 'ahmad_aln...', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', hasStory: true },
  { id: 2, username: '3nvus', avatar: 'https://randomuser.me/api/portraits/men/33.jpg', hasStory: true },
  { id: 3, username: '_963i', avatar: 'https://randomuser.me/api/portraits/men/34.jpg', hasStory: true },
  { id: 4, username: 'abojody.99', avatar: 'https://randomuser.me/api/portraits/men/35.jpg', hasStory: true },
  { id: 5, username: 'omar.kbalan', avatar: 'https://randomuser.me/api/portraits/men/36.jpg', hasStory: true },
  { id: 6, username: 'tarek.m.el...', avatar: 'https://randomuser.me/api/portraits/men/37.jpg', hasStory: true },
  { id: 7, username: 'ahmad.r', avatar: 'https://randomuser.me/api/portraits/men/38.jpg', hasStory: true },
  { id: 8, username: 'mohamed.s', avatar: 'https://randomuser.me/api/portraits/men/39.jpg', hasStory: true },
  { id: 9, username: 'sara.j', avatar: 'https://randomuser.me/api/portraits/women/32.jpg', hasStory: true },
  { id: 10, username: 'noura.k', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', hasStory: true },
]

export default function StoriesCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollAmount = direction === 'left' ? -300 : 300
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })

    // Update arrows after scroll
    setTimeout(() => {
      if (container.scrollLeft <= 0) {
        setShowLeftArrow(false)
      } else {
        setShowLeftArrow(true)
      }

      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        setShowRightArrow(false)
      } else {
        setShowRightArrow(true)
      }
    }, 300)
  }

  return (
    <div className="relative mb-4 mt-2">
      {/* Left scroll button */}
      {showLeftArrow && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-black/70 p-1 rounded-full shadow-md"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      
      {/* Stories container */}
      <div 
        ref={containerRef}
        className="stories-container px-4"
      >
        {STORIES.map((story) => (
          <div key={story.id} className="story-item">
            <div className="story-avatar">
              <img src={story.avatar} alt={story.username} />
            </div>
            <span className="story-username">{story.username}</span>
          </div>
        ))}
      </div>
      
      {/* Right scroll button */}
      {showRightArrow && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-black/70 p-1 rounded-full shadow-md"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}