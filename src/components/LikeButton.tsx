'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LikeButtonProps {
  photoId: string;
}

export default function LikeButton({ photoId }: LikeButtonProps) {
  const [likes, setLikes] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function readJsonSafely(response: Response) {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Invalid JSON response: ${text.slice(0, 120)}`);
    }
  }

  useEffect(() => {
    // Check local storage
    const likedPhotos = JSON.parse(localStorage.getItem('liked_photos') || '[]');
    if (likedPhotos.includes(photoId)) {
      setHasLiked(true);
    }

    // Fetch initial likes
    fetch(`/api/likes/?id=${photoId}`)
      .then(readJsonSafely)
      .then((data) => {
        if (typeof data.likes === 'number') {
          setLikes(data.likes);
        }
      })
      .catch((err) => console.error('Error fetching likes:', err));
  }, [photoId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked || isLoading) return;

    setIsLoading(true);

    // Optimistic UI update
    setLikes((prev) => (prev !== null ? prev + 1 : 1));
    setHasLiked(true);

    // Save to local storage
    const likedPhotos = JSON.parse(localStorage.getItem('liked_photos') || '[]');
    localStorage.setItem('liked_photos', JSON.stringify([...likedPhotos, photoId]));

    // Send request
    try {
      const res = await fetch('/api/likes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photoId }),
      });
      const data = await readJsonSafely(res);
      
      if (!res.ok) {
        // Revert on error
        setLikes((prev) => (prev !== null ? prev - 1 : 0));
        setHasLiked(false);
        const filtered = likedPhotos.filter((id: string) => id !== photoId);
        localStorage.setItem('liked_photos', JSON.stringify(filtered));
        console.error('Failed to like:', data.error);
      } else if (typeof data.likes === 'number') {
        // Sync with server count just in case
        setLikes(data.likes);
      }
    } catch (err) {
      console.error('Error liking photo:', err);
      // Revert on error
      setLikes((prev) => (prev !== null ? prev - 1 : 0));
      setHasLiked(false);
      const filtered = likedPhotos.filter((id: string) => id !== photoId);
      localStorage.setItem('liked_photos', JSON.stringify(filtered));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      className="pointer-events-auto flex items-center gap-2 group cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleLike}
      whileTap={hasLiked ? {} : { scale: 0.9 }}
    >
      <div className="relative w-8 h-8 flex items-center justify-center rounded-full border border-white/20 group-hover:border-white/40 transition-colors duration-300">
        <AnimatePresence mode="wait">
          {hasLiked ? (
            <motion.svg
              key="liked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-[#c25a4a]" // A subtle, vintage cinnabar red
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="unliked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-4 h-4 transition-colors duration-300 ${isHovered ? 'text-white/80' : 'text-white/40'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      <div className="w-6 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {likes !== null && (
            <motion.span
              key={likes}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className={`font-mono text-[10px] tracking-widest ${hasLiked ? 'text-[#c25a4a]' : 'text-white/40 group-hover:text-white/80'} transition-colors duration-300 block`}
            >
              {likes}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
