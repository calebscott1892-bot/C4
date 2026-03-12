import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

const ease = [0.22, 1, 0.36, 1];

export default function FinalCTA() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <section ref={ref} className="pt-8 pb-20 md:pb-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="h-px mb-16 md:mb-24" style={{ backgroundColor: 'var(--c4-border)' }} />

        <motion.div style={{ y, opacity }} className="max-w-[480px]">
          <h2 className="text-[1.4rem] md:text-[1.85rem] font-semibold tracking-[-0.025em] leading-[1.15]" style={{ color: 'var(--c4-text)' }}>
            Have a project in mind?
          </h2>
          <p className="mt-3.5 text-[14px] leading-[1.65]" style={{ color: 'var(--c4-text-muted)' }}>
            Tell us what you're building. We respond within 24 hours with an honest
            assessment of how we can help.
          </p>
          <Link
            to={createPageUrl('StartProject')}
            className="group inline-flex items-center gap-2 mt-7 px-6 py-3 text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-300"
            style={{ backgroundColor: 'var(--c4-text)', color: 'var(--c4-bg)' }}
          >
            Start a Project
            <ArrowRight size={13} strokeWidth={2} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}