'use client';
import { SafeImage } from '@/components/atoms/SafeImage';

import React, { useState, useEffect, useRef } from 'react';

export interface IVehicleSlide {
  id: string;
  category?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  orderUrl: string;
  learnUrl: string;
}

export const HeroSwiper: React.FC<{ slides?: IVehicleSlide[] }> = ({ slides }) => {
  const defaultSlides: IVehicleSlide[] = [
    {
      id: 'bronze',
      category: 'Tier I Allocation — Featured Vehicle: Model 3',
      title: 'BRONZE',
      subtitle: 'Entry capital structuring · From $1,000 · 24-day maturity term',
      imageUrl: '/branding/hero-bg.jpg',
      orderUrl: '/register?planId=plan-bronze',
      learnUrl: '/plans',
    },
    {
      id: 'silver',
      category: 'Tier II Allocation — Featured Vehicle: Model Y / Cybertruck',
      title: 'SILVER',
      subtitle: 'Enhanced momentum allocation · From $5,000 · 3-day maturity term',
      imageUrl: '/branding/car-silver.jpg',
      orderUrl: '/register?planId=plan-silver',
      learnUrl: '/plans',
    },
    {
      id: 'gold',
      category: 'Tier III Allocation — Featured Vehicle: Model S Plaid',
      title: 'GOLD',
      subtitle: 'Premium compounding pool · From $10,000 · 7-day maturity term',
      imageUrl: '/branding/car-gold.jpg',
      orderUrl: '/register?planId=plan-gold',
      learnUrl: '/plans',
    },
    {
      id: 'diamond',
      category: 'Flagship Allocation — Featured Vehicle: Cybertruck / Roadster',
      title: 'DIAMOND',
      subtitle: 'Elite executive capital pool · From $50,000 · 14-day maturity term',
      imageUrl: '/branding/car-diamond.jpg',
      orderUrl: '/register?planId=plan-diamond',
      learnUrl: '/plans',
    },
  ];

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-play interval (every 6 seconds unless touched/hovered)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = activeSlides[currentIndex];

  return (
    <section
      aria-label="Structured Capital Allocation Showcase"
      className="relative h-[86vh] w-full overflow-hidden bg-black flex flex-col justify-between pt-20 pb-16 border-b border-[#1E2433] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with Smooth Crossfade */}
      <div className="absolute inset-0 z-0">
        {activeSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-90 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <SafeImage
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F] via-black/30 to-black/60" />
          </div>
        ))}
      </div>

      {/* Slide Headline Block */}
      <div className="relative z-20 px-6 sm:px-12 max-w-5xl mx-auto w-full text-center space-y-4">
        {currentSlide.category && (
          <div key={`cat-${currentIndex}`} className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#EF4444]" />
            <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-gray-300">
              {currentSlide.category}
            </span>
            <span className="h-px w-8 bg-[#EF4444]" />
          </div>
        )}
        <h1
          key={`title-${currentIndex}`}
          className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white font-sans drop-shadow-2xl"
        >
          {currentSlide.title}
        </h1>
        <p
          key={`sub-${currentIndex}`}
          className="mx-auto max-w-xl font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gray-300"
        >
          {currentSlide.subtitle}
        </p>
      </div>

      {/* Navigation Arrows — hairline square chrome with SVG chevrons */}
      <button
        onClick={handlePrev}
        aria-label="Previous Allocation Slide"
        className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-black/50 text-gray-300 backdrop-blur-md hover:border-white/50 hover:text-white transition"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        aria-label="Next Allocation Slide"
        className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-black/50 text-gray-300 backdrop-blur-md hover:border-white/50 hover:text-white transition"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Action Buttons + Precision Index Rail */}
      <div className="relative z-20 px-6 w-full max-w-xl mx-auto space-y-7">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={currentSlide.orderUrl} className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-[240px] h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Allocate Capital
            </button>
          </a>
          <a href={currentSlide.learnUrl} className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-[200px] h-12 rounded-lg border border-white/20 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              Compare Plans
            </button>
          </a>
        </div>

        {/* Thin Bars + Monospace Slide Counter */}
        <div className="flex items-center justify-center gap-5">
          <div className="flex items-center gap-2.5">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Switch to slide ${idx + 1}`}
                className={`h-[3px] transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-10 bg-white'
                    : 'w-5 bg-white/25 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-gray-400">
            {String(currentIndex + 1).padStart(2, '0')} <span className="text-gray-600">/ {String(activeSlides.length).padStart(2, '0')}</span>
          </span>
        </div>
      </div>
    </section>
  );
};
