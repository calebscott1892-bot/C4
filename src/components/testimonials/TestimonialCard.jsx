import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TRUNCATE_LENGTH = 220;

const sourceBadgeStyle = {
  fontSize: '9.5px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontWeight: 500,
  borderRadius: '2px',
  padding: '3px 8px',
};

export default function TestimonialCard({ testimonial, variant = 'light' }) {
  const dark = variant === 'dark';
  const [expanded, setExpanded] = useState(false);
  const isLong = testimonial.quote.length > TRUNCATE_LENGTH;
  const displayQuote = isLong && !expanded
    ? testimonial.quote.slice(0, TRUNCATE_LENGTH).trimEnd() + '…'
    : testimonial.quote;

  // Token-driven palette for both variants
  // Dark variant: use a semi-transparent overlay on the inverted background
  // so the card works in both light-mode-inverted (#1A1A1A) and dark-mode-inverted (#0A0C10).
  const cardBg = dark ? 'rgba(255,255,255,0.05)' : 'var(--c4-card-bg)';
  const cardBorder = dark ? 'var(--c4-inverted-border)' : 'var(--c4-border)';
  const textPrimary = dark ? 'var(--c4-inverted-text)' : 'var(--c4-text)';
  const textSecondary = dark ? 'var(--c4-inverted-text-muted)' : 'var(--c4-text-muted)';
  const textTertiary = dark ? 'var(--c4-inverted-text-faint)' : 'var(--c4-text-subtle)';

  return (
    <>
      <div className="select-none h-full flex flex-col justify-between px-8 py-8 md:px-10 md:py-9 rounded-[3px]"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {/* Quote */}
        <div>
          <p className="text-[15px] md:text-[16px] leading-[1.75] font-normal italic"
            style={{ color: textPrimary }}
          >
            "{displayQuote}"
          </p>
          {isLong && !expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
              className="mt-2 text-[12px] font-medium transition-colors duration-300"
              style={{ color: 'var(--c4-accent)' }}
            >
              Read more
            </button>
          )}
        </div>

        {/* Attribution */}
        <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${cardBorder}` }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13.5px] font-semibold tracking-[-0.01em]" style={{ color: textPrimary }}>
                {testimonial.name}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: textSecondary }}>
                {testimonial.role}
                {testimonial.location && <span style={{ color: textTertiary }}> · {testimonial.location}</span>}
              </p>
            </div>
            {testimonial.source && (
              <span style={{
                ...sourceBadgeStyle,
                color: textTertiary,
                border: `1px solid ${cardBorder}`,
              }}>{testimonial.source}</span>
            )}
          </div>
        </div>
      </div>

      {/* Read more modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-[560px] w-full rounded-[3px] p-8 md:p-10"
              style={{ backgroundColor: 'var(--c4-card-bg)', border: '1px solid var(--c4-border-light)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                style={{ backgroundColor: 'var(--c4-bg-alt)' }}
              >
                <X size={14} style={{ color: 'var(--c4-text-subtle)' }} />
              </button>
              <p className="text-[15px] leading-[1.8] italic" style={{ color: 'var(--c4-text)' }}>
                "{testimonial.quote}"
              </p>
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--c4-border-light)' }}>
                <p className="text-[13.5px] font-semibold" style={{ color: 'var(--c4-text)' }}>{testimonial.name}</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--c4-text-subtle)' }}>
                  {testimonial.role}
                  {testimonial.location && <span style={{ color: 'var(--c4-text-faint)' }}> · {testimonial.location}</span>}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}