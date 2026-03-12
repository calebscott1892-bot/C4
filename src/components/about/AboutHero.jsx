import React from 'react';
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

export default function AboutHero() {
  return (
    <section className="pt-28 md:pt-36 pb-14 md:pb-20" style={{ backgroundColor: 'var(--c4-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-8 md:mb-10"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="w-8 h-px origin-left" style={{ backgroundColor: 'var(--c4-accent)' }}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-[10px] uppercase tracking-[0.25em] font-medium" style={{ color: 'var(--c4-text-subtle)' }}
          >
            About
          </motion.span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
          {/* Left: headline + description */}
          <div className="md:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              className="text-[clamp(2rem,5vw,3.4rem)] font-semibold tracking-[-0.035em] leading-[1.08]"
              style={{ color: 'var(--c4-text)' }}
            >
              A founder-led studio built on care, craft, and conviction.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease }}
              className="mt-6 text-[14px] md:text-[15px] leading-[1.75] max-w-[540px]"
              style={{ color: 'var(--c4-text-muted)' }}
            >
              C4 Studios is a one-person design and development studio based in Perth, working with clients worldwide. Every project is handled directly by the founder — from initial strategy through to design, engineering, and launch. The standard is high because the relationship is personal.
            </motion.p>
          </div>

          {/* Right: founder photo placeholder + name */}
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease }}
          >
            <div className="aspect-[4/5] max-w-[320px] md:ml-auto rounded-[3px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--c4-bg-alt)', border: '1px solid var(--c4-border)' }}>
              {/* TODO: Replace with real founder photo — recommended 640×800 */}
              <div className="text-center px-6">
                <div className="w-10 h-px mx-auto mb-4" style={{ backgroundColor: 'var(--c4-accent)' }} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>Photo coming soon</span>
              </div>
            </div>
            <div className="mt-4 max-w-[320px] md:ml-auto">
              <p className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--c4-text)' }}>
                Founder & Web Solutions Architect
              </p>
              <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--c4-text-muted)' }}>
                C4 Studios · Perth, Australia
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}