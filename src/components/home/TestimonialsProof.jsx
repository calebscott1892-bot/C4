import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import TestimonialSlider from '../testimonials/TestimonialSlider';
import { getFeaturedTestimonials } from '../testimonials/testimonialData';

const ease = [0.22, 1, 0.36, 1];

const STATS = [
  { val: '50+', label: 'Projects' },
  { val: '100%', label: 'Retention' },
  { val: '<24h', label: 'Response' },
];

export default function TestimonialsProof() {
  const featured = getFeaturedTestimonials();

  return (
    <div>
      <TestimonialSlider testimonials={featured} label="Client proof" variant="dark" />

      {/* Proof stats + link — still on inverted bg */}
      <div className="pb-16 md:pb-24 -mt-4" style={{ backgroundColor: 'var(--c4-inverted-bg)' }}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="pt-6"
            style={{ borderTop: '1px solid var(--c4-inverted-border)' }}
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-[520px]">
                {STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease }}
                  >
                    <div className="text-[1.4rem] md:text-[1.85rem] font-semibold tracking-[-0.03em] leading-none" style={{ color: 'var(--c4-inverted-text)' }}>{s.val}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-medium mt-2" style={{ color: 'var(--c4-inverted-text-faint)' }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>
              <Link
                to={createPageUrl('About')}
                className="text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-300"
                style={{ color: 'var(--c4-inverted-text-faint)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--c4-inverted-text-muted)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--c4-inverted-text-faint)'}
              >
                See more testimonials →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}