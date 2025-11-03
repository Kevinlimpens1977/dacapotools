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
    <div className="py-6 px-4 sm:px-8 mb-8 border-2 border-emerald-600/20 rounded-2xl bg-white/50 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-gray-400">({items.length} items)</span>
        </h2>
      </div>
      
      <div className="relative">
        {showLeftButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{
              scale: 1.2,
              backgroundColor: "rgb(16 185 129 / 0.15)",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm border-2 border-emerald-600 rounded-full shadow-lg group"
            onClick={() => scroll('left')}
          >
            <motion.svg
              className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700 group-hover:fill-emerald-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              whileHover={{ rotate: -15 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </motion.svg>
          </motion.button>
        )}
        
        {showRightButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{
              scale: 1.2,
              backgroundColor: "rgb(16 185 129 / 0.15)",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm border-2 border-emerald-600 rounded-full shadow-lg group"
            onClick={() => scroll('right')}
          >
            <motion.svg
              className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700 group-hover:fill-emerald-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </motion.button>
        )}

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto px-12 sm:px-16 pb-4 no-scrollbar relative"
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
        <div className="absolute bottom-0 left-12 right-12 sm:left-16 sm:right-16 h-1.5 bg-emerald-100/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="absolute top-0 left-0 h-full bg-emerald-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
