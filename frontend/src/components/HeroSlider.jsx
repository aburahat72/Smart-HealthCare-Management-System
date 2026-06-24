import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '../utils/helpers';

/**
 * Hero Slider Component
 * ---------------------
 * Dynamic image slider for the landing page hero section.
 * Preserves exact image size, position, and styling from the original design.
 * Fetches slides from GET /api/hero — falls back to defaults if API unavailable.
 */
const DEFAULT_SLIDES = [
  {
    title: 'Your Health, Our Priority',
    description: 'Trusted healthcare services for you and your family.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=700&fit=crop&crop=face',
  },
];

export default function HeroSlider({ slides: propSlides, slideInterval: propInterval, onSlideChange }) {
  const slides = propSlides?.length > 0 ? propSlides : DEFAULT_SLIDES;
  const interval = (propInterval || 5) * 1000;
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((index) => {
    if (index === current || fading) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
      onSlideChange?.(slides[index]);
    }, 400);
  }, [current, fading, slides, onSlideChange]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  useEffect(() => {
    onSlideChange?.(slides[current]);
  }, [current, slides, onSlideChange]);

  const slide = slides[current];

  return (
    <div className="relative flex justify-center">
      <div className="absolute -right-4 top-8 h-72 w-72 rounded-full bg-primary-100/50" />

      {/* Image — same classes as original static hero */}
      <div className="relative z-10">
        <img
          src={getMediaUrl(slide.image)}
          alt={slide.title}
          className={`max-h-[500px] rounded-3xl object-cover shadow-2xl transition-opacity duration-500 ease-in-out ${fading ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Manual navigation arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-md transition hover:bg-white"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-md transition hover:bg-white"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute -bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-primary-500' : 'w-2.5 bg-gray-300 hover:bg-primary-300'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Hook to expose current slide text for hero heading sync */
export function useHeroText(slides, slideInterval) {
  const [activeSlide, setActiveSlide] = useState(slides?.[0] || DEFAULT_SLIDES[0]);
  return { activeSlide, setActiveSlide, HeroSlider: (props) => (
    <HeroSlider slides={slides} slideInterval={slideInterval} onSlideChange={setActiveSlide} {...props} />
  )};
}
