'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../atoms/Button';

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
      id: 'model3',
      title: 'Model 3',
      subtitle: '0.99% APR Available',
      imageUrl: '/branding/hero-bg.jpg',
      orderUrl: '/register?vehicle=model3',
      learnUrl: '#portfolios',
    },
    {
      id: 'cybertruck',
      category: 'Utility Truck',
      title: 'CYBERTRUCK',
      subtitle: 'Lease From $949/mo',
      imageUrl: '/branding/car-diamond.jpg',
      orderUrl: '/register?vehicle=cybertruck',
      learnUrl: '#portfolios',
    },
    {
      id: 'modely',
      title: 'Model Y',
      subtitle: '1.99% APR Available — Dual Motor All-Wheel Drive',
      imageUrl: '/branding/car-silver.jpg',
      orderUrl: '/register?vehicle=modely',
      learnUrl: '#portfolios',
    },
    {
      id: 'models',
      title: 'Model S Plaid',
      subtitle: 'Tri-Motor All-Wheel Drive — 1,020 HP & 200 mph Top Speed',
      imageUrl: '/branding/car-gold.jpg',
      orderUrl: '/register?vehicle=models',
      learnUrl: '#portfolios',
    },
  ];

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = activeSlides[currentIndex];

  return (
    <section
      aria-label="Tesla Vehicle Showcase Carousel"
      className="relative h-[84vh] w-full overflow-hidden bg-black flex flex-col justify-between pt-16 pb-14 text-center border-b border-[#1E2433] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 z-0">
        {activeSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-90 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              onError={(e) => { e.currentTarget.src = '/branding/car-bronze.jpg'; }}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F] via-black/25 to-black/60" />
          </div>
        ))}
      </div>

      <div className="relative z-20 space-y-2 px-4 transition-all duration-300 transform">
        {currentSlide.category && (
          <h2 className="text-sm sm:text-lg font-bold tracking-[0.25em] text-gray-300 uppercase font-mono animate-fade-in">
            {currentSlide.category}
          </h2>
        )}
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl font-sans drop-shadow-lg">
          {currentSlide.title}
        </h1>
        <p className="text-base sm:text-xl font-medium text-gray-200 underline underline-offset-8 decoration-white/60 font-sans drop-shadow-md">
          {currentSlide.subtitle}
        </p>
      </div>

      <button
        onClick={handlePrev}
        aria-label="Previous Vehicle Slide"
        className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-xl backdrop-blur-md hover:bg-black hover:scale-110 transition"
      >
        ‹
      </button>
      <button
        onClick={handleNext}
        aria-label="Next Vehicle Slide"
        className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-xl backdrop-blur-md hover:bg-black hover:scale-110 transition"
      >
        ›
      </button>

      {/* Upgraded Sleek Tesla Rectangular Buttons + Pagination Dots (`IMG_7587 / 7588` exact layout match!) */}
      <div className="relative z-20 space-y-6 px-6 max-w-xl mx-auto w-full font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <a href={currentSlide.orderUrl} className="w-full sm:flex-1">
            <Button variant="tesla-red" size="lg" className="w-full py-4 text-xs sm:text-sm shadow-red-glow">
              Order Now &rarr;
            </Button>
          </a>
          <a href={currentSlide.learnUrl} className="w-full sm:flex-1">
            <Button variant="glass-white" size="lg" className="w-full py-4 text-xs sm:text-sm shadow-xl">
              Learn More
            </Button>
          </a>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Switch to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'h-2.5 w-8 bg-white shadow-md'
                  : 'h-2.5 w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
