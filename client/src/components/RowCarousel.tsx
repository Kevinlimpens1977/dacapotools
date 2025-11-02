import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import type { App } from '../lib/types'
import AppTile from './AppTile'

interface RowCarouselProps {
  title: string;
  items: App[];
}

export default function RowCarousel({ title, items }: RowCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideSound = useRef<HTMLAudioElement | null>(null);
  const hoverSound = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Laad geluiden
    slideSound.current = new Audio('/sounds/slide.mp3');
    hoverSound.current = new Audio('/sounds/hover.mp3');
    
    // Stel volumes in
    if (slideSound.current) slideSound.current.volume = 0.2;
    if (hoverSound.current) hoverSound.current.volume = 0.1;

    // Update scroll width bij resize
    const updateScrollWidth = () => {
      if (carouselRef.current) {
        setScrollWidth(carouselRef.current.scrollWidth - carouselRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', updateScrollWidth);
    return () => window.removeEventListener('resize', updateScrollWidth);
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      setScrollWidth(carouselRef.current.scrollWidth - carouselRef.current.clientWidth);
    }
  }, [items]);

  if (!items.length) return null;

  const playSlideSound = () => {
    if (slideSound.current) {
      slideSound.current.currentTime = 0;
      slideSound.current.play();
    }
    // Haptische feedback voor mobiel
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(scrollWidth, scrollPosition + scrollAmount);
    
    playSlideSound();
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  const showLeftButton = scrollPosition > 0;
  const showRightButton = scrollWidth > 0 && scrollPosition < scrollWidth;

  // Bereken scroll progress (0-100)
  const progress = scrollWidth > 0 ? (scrollPosition / scrollWidth) * 100 : 0;

  return (
    <div className="py-6">
      {/* Header met titel */}
      <div className="mb-4 px-4 sm:px-8">
        <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-gray-400">({items.length} items)</span>
        </h2>
      </div>
      
      {/* Carousel container met navigatie */}
      <div className="relative">
        {/* Navigatie knoppen */}
        {showLeftButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white border-2 border-emerald-600 rounded-r-xl shadow-lg hover:shadow-xl hover:border-emerald-500 transition-all"
            onClick={() => scroll('left')}
          >
            <svg className="w-6 h-6 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}
        
        {showRightButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white border-2 border-emerald-600 rounded-l-xl shadow-lg hover:shadow-xl hover:border-emerald-500 transition-all"
            onClick={() => scroll('right')}
          >
            <svg className="w-6 h-6 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}

        {/* Items container */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto px-4 sm:px-8 [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {items.map((app) => (
            <AppTile 
              key={app.id} 
              app={app} 
              onMouseEnter={() => {
                if (hoverSound.current) {
                  hoverSound.current.currentTime = 0;
                  hoverSound.current.play();
                }
                if (window.navigator.vibrate) {
                  window.navigator.vibrate(20);
                }
              }} 
            />
          ))}
        </div>

        {/* Scroll indicator */}
        {scrollWidth > 0 && (
          <div className="absolute -bottom-2 left-0 right-0 h-1">
            <motion.div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
