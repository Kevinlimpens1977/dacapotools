import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import type { App } from '../lib/types'
import AppTile from './AppTile'

interface RowCarouselProps {
  title: string;
  items: App[];
  onPreview?: (app: App) => void;
}

export default function RowCarousel({ title, items, onPreview }: RowCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideSound = useRef<HTMLAudioElement | null>(null);
  const hoverSound = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    slideSound.current = new Audio('/sounds/slide.mp3');
    hoverSound.current = new Audio('/sounds/hover.mp3');
    
    if (slideSound.current) slideSound.current.volume = 0.2;
    if (hoverSound.current) hoverSound.current.volume = 0.1;

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
      slideSound.current.volume = 0.3;
      slideSound.current.playbackRate = 1.5;
      slideSound.current.play().catch(() => {});
    }
    if (window.navigator.vibrate) {
      window.navigator.vibrate([15, 10, 15]);
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
  const progress = scrollWidth > 0 ? (scrollPosition / scrollWidth) * 100 : 0;

  return (
    <div className="py-6 px-4 sm:px-8 mb-8 border-3 border-green-700 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm shadow-md" style={{ borderWidth: '3px' }}>
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-gray-500">({items.length} items)</span>
        </h2>
      </div>
      
      <div className="relative">
        {showLeftButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{
              backgroundColor: "rgb(21 128 61)",
              borderColor: "rgb(22 101 52)",
              boxShadow: "0 0 25px rgba(21, 128, 61, 0.6)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/95 backdrop-blur-sm border-green-700 rounded-full shadow-xl group"
            style={{ borderWidth: '4px' }}
            onClick={() => scroll('left')}
          >
            <motion.svg
              className="w-7 h-7 text-green-700 group-hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </motion.svg>
          </motion.button>
        )}
        
        {showRightButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{
              backgroundColor: "rgb(21 128 61)",
              borderColor: "rgb(22 101 52)",
              boxShadow: "0 0 25px rgba(21, 128, 61, 0.6)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/95 backdrop-blur-sm border-green-700 rounded-full shadow-xl group"
            style={{ borderWidth: '4px' }}
            onClick={() => scroll('right')}
          >
            <motion.svg
              className="w-7 h-7 text-green-700 group-hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </motion.svg>
          </motion.button>
        )}

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto px-12 sm:px-16 pb-4 no-scrollbar relative"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {items.map((app) => (
            <AppTile
              key={app.id}
              app={app}
              onClick={() => {
                if (onPreview) {
                  onPreview(app);
                }
                if (hoverSound.current) {
                  hoverSound.current.currentTime = 0;
                  hoverSound.current.play();
                }
                if (window.navigator.vibrate) {
                  window.navigator.vibrate(20);
                }
              }}
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

        {/* Progress bar */}
        <div className="absolute bottom-0 left-12 right-12 sm:left-16 sm:right-16 h-2 bg-orange-100/60 rounded-full overflow-hidden backdrop-blur-sm border border-orange-200">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
