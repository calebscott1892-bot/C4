import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getAllCaseStudies } from '../portfolio/caseStudyData';

const ease = [0.22, 1, 0.36, 1];

export default function PortfolioPreview() {
  const studies = getAllCaseStudies();
  const featured = studies.find(s => s.featured) || studies[0];

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--c4-bg-alt)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* ── Section header ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="flex items-end justify-between mb-12 md:mb-16"
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium" style={{ color: 'var(--c4-text-subtle)' }}>
              Portfolio
            </span>
            <h2 className="mt-3 text-[1.6rem] md:text-[2.2rem] font-semibold tracking-[-0.035em] leading-[1.1]" style={{ color: 'var(--c4-text)' }}>
              Explore our work
            </h2>
            <p className="mt-4 text-[13.5px] md:text-[14px] leading-[1.65] max-w-[440px]" style={{ color: 'var(--c4-text-muted)' }}>
              A selection of projects that reflect our standards — each one designed, built, and delivered in-house.
            </p>
          </div>
          <Link
            to={createPageUrl('Portfolio')}
            className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.13em] font-medium transition-colors duration-300 group"
            style={{ color: 'var(--c4-text-subtle)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c4-link-hover)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c4-text-subtle)'}
          >
            View all
            <ArrowRight size={13} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* ── Featured project card ──────────────────── */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            <Link
              to={createPageUrl(`CaseStudy?slug=${featured.slug}`)}
              className="group block rounded-[3px] overflow-hidden transition-shadow duration-500 hover:shadow-lg"
              style={{ border: '1px solid var(--c4-border)', backgroundColor: 'var(--c4-card-bg)' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Thumbnail */}
                <div className="aspect-[16/10] md:aspect-auto overflow-hidden" style={{ backgroundColor: 'var(--c4-bg)' }}>
                  {featured.thumbnail ? (
                    <img
                      src={featured.thumbnail}
                      alt={featured.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.16em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>
                        {featured.name}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--c4-text-faint)' }}>
                        Thumbnail coming soon
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-7 md:p-10 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>
                      Featured
                    </span>
                    <h3 className="mt-2 text-[1.15rem] md:text-[1.35rem] font-semibold tracking-[-0.02em] leading-[1.15]" style={{ color: 'var(--c4-text)' }}>
                      {featured.name}
                    </h3>
                    <p className="mt-3 text-[13px] md:text-[13.5px] leading-[1.65]" style={{ color: 'var(--c4-text-muted)' }}>
                      {featured.oneLiner}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {featured.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-[3px] text-[9px] uppercase tracking-[0.14em] font-medium rounded-[2px]" style={{ color: 'var(--c4-text-faint)', backgroundColor: 'var(--c4-tag-bg)' }}>
                          {tag}
                        </span>
                      ))}
                      {featured.year && (
                        <span className="text-[9px] uppercase tracking-[0.14em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>
                          · {featured.year}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <span
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.13em] font-medium transition-colors duration-300"
                      style={{ color: 'var(--c4-text)' }}
                    >
                      View case study
                      <ArrowRight size={13} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    {featured.liveUrl && (
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] font-medium"
                        style={{ color: 'var(--c4-text-faint)' }}
                      >
                        Live site
                        <ArrowUpRight size={11} strokeWidth={2} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── Mobile "View all" link ─────────────────── */}
        <div className="mt-8 md:hidden">
          <Link
            to={createPageUrl('Portfolio')}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.13em] font-medium"
            style={{ color: 'var(--c4-text-subtle)' }}
          >
            View all projects
            <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}