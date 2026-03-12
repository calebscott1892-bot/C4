import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import CraftHeatmap from './CraftHeatmap';

const ease = [0.22, 1, 0.36, 1];

function RevealLine({ children, delay = 0, className = '' }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const ruleWidth = useTransform(scrollYProgress, [0, 0.3], ['100%', '40%']);

  return (
    <section ref={ref} className="relative h-[100svh] flex flex-col overflow-hidden">
      {/* Interactive branded background */}
      <CraftHeatmap />
      <motion.div style={{ y, opacity }} className="relative z-10 flex-1 flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">
          <div className="max-w-[800px]">
            {/* Overline */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3 mb-10 md:mb-14"
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
                className="text-[10.5px] uppercase tracking-[0.22em] font-medium"
              style={{ color: 'var(--c4-text-subtle)' }}
              >
                Design & Development Studio
              </motion.span>
            </motion.div>

            {/* Headline — line-by-line reveal for cinematic entrance */}
            <h1 className="text-[clamp(2rem,5.5vw,4rem)] font-semibold leading-[1.1] tracking-[-0.035em]" style={{ color: 'var(--c4-text)' }}>
              <RevealLine delay={0.25}>We design and build</RevealLine>
              <RevealLine delay={0.35}>premium digital products</RevealLine>
              <RevealLine delay={0.45}>
                <span style={{ color: 'var(--c4-text-faint)' }}>for ambitious brands.</span>
              </RevealLine>
            </h1>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease }}
              className="mt-7 md:mt-9 text-[14.5px] md:text-[15px] leading-[1.7] max-w-[420px]"
              style={{ color: 'var(--c4-text-muted)' }}
            >
              C4 Studios is a founder-led studio. We partner with businesses that take
              their digital presence seriously — delivering work built to a standard
              most agencies can't reach.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-8 md:mt-10 flex items-center gap-7"
            >
              <Link
                to={createPageUrl('StartProject')}
                className="group inline-flex items-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-300"
                style={{ backgroundColor: 'var(--c4-text)', color: 'var(--c4-bg)' }}
              >
                Start a Project
                <ArrowRight size={13} strokeWidth={2} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
              </Link>
              <Link
                to={createPageUrl('Portfolio')}
                className="text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-300"
                style={{ color: 'var(--c4-text-subtle)' }}
              >
                View Work
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom anchor */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 w-full pb-7 md:pb-9">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <motion.div style={{ width: ruleWidth, backgroundColor: 'var(--c4-border)' }} className="h-px mb-4 transition-[width]" />
          <div className="flex justify-between text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>
            <span>Perth, Australia</span>
            <span className="hidden sm:inline">Available Worldwide</span>
            <span>Est. 2022</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}