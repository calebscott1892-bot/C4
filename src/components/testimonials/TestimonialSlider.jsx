import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import TestimonialCard from './TestimonialCard';

const AUTOPLAY_INTERVAL = 8000;
const ease = [0.22, 1, 0.36, 1];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 6 : -6 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -6 : 6 }),
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export default function TestimonialSlider({ testimonials, label = 'What clients say', variant = 'light' }) {
  const dark = variant === 'dark';
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const total = testimonials?.length ?? 0;

  const goTo = useCallback((index, dir) => {
    setDirection(dir);
    setCurrent(index);
    setProgress(0);
    startTimeRef.current = null;
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % total, 1);
  }, [current, total, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + total) % total, -1);
  }, [current, total, goTo]);

  // Autoplay + progress
  useEffect(() => {
    if (reducedMotion || paused || total <= 1) {
      cancelAnimationFrame(progressRef.current);
      return;
    }

    startTimeRef.current = performance.now();
    setProgress(0);

    const tick = (now) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(elapsed / AUTOPLAY_INTERVAL, 1);
      setProgress(pct);

      if (pct >= 1) {
        next();
      } else {
        progressRef.current = requestAnimationFrame(tick);
      }
    };

    progressRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(progressRef.current);
  }, [current, paused, reducedMotion, total, next]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }, [next, prev]);

  const transitionConfig = reducedMotion
    ? { duration: 0.05 }
    : { duration: 0.5, ease };

  // Dark / light palette — use inverted tokens for dark variant sections
  const bg = dark ? 'var(--c4-inverted-bg)' : 'var(--c4-bg)';
  const textSubtle = dark ? 'var(--c4-inverted-text-faint)' : 'var(--c4-text-subtle)';
  const textMuted = dark ? 'var(--c4-inverted-text-muted)' : 'var(--c4-text-muted)';
  const border = dark ? 'var(--c4-inverted-border)' : 'var(--c4-border)';
  const borderLight = dark ? 'var(--c4-inverted-border)' : 'var(--c4-border-light)';
  const bgAlt = dark ? 'var(--c4-inverted-bg)' : 'var(--c4-bg-alt)';

  if (total === 0) return null;

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: bg }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Header row */}
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: textSubtle }}>
              {label}
            </span>
            {/* Hover hint — only visible when not paused */}
            <AnimatePresence>
              {!paused && !reducedMotion && total > 1 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hidden md:inline text-[9px] uppercase tracking-[0.1em]"
                  style={{ color: dark ? 'var(--c4-inverted-text-faint)' : 'var(--c4-text-faint)' }}
                >
                  Hover to pause
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            {/* Paused indicator */}
            <AnimatePresence>
              {paused && !reducedMotion && (
                <motion.span
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-[0.12em] font-medium mr-2"
                  style={{
                    color: textSubtle,
                    border: `1px solid ${border}`,
                    backgroundColor: bgAlt,
                  }}
                >
                  <Pause size={9} strokeWidth={2.5} />
                  Paused
                </motion.span>
              )}
            </AnimatePresence>

            {/* Arrows */}
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300"
              style={{ border: `1px solid ${border}`, color: textMuted }}
            >
              <ChevronLeft size={15} strokeWidth={2} />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300"
              style={{ border: `1px solid ${border}`, color: textMuted }}
            >
              <ChevronRight size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Slider area */}
        <div
          className="relative"
          tabIndex={0}
          role="region"
          aria-label="Testimonials"
          aria-roledescription="carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={handleKeyDown}
          style={{ outline: 'none' }}
        >
          <div className="max-w-[720px] mx-auto min-h-[280px] md:min-h-[260px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transitionConfig}
                aria-live="polite"
              >
                <TestimonialCard testimonial={testimonials[current]} variant={variant} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress dots */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                aria-label={`Go to testimonial ${i + 1}`}
                className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500"
                style={{
                  width: i === current ? 32 : 12,
                  backgroundColor: i === current ? border : borderLight,
                }}
              >
                {i === current && !reducedMotion && (
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: textMuted,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}