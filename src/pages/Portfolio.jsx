import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import PortfolioHero from '../components/portfolio/PortfolioHero';
import PortfolioFilters from '../components/portfolio/PortfolioFilters';
import PortfolioSortMenu from '../components/portfolio/PortfolioSortMenu';
import { getAllCaseStudies } from '../components/portfolio/caseStudyData';
import { FeaturedCardSkeleton } from '../components/portfolio/PortfolioCardSkeleton';

const ease = [0.22, 1, 0.36, 1];

function sortStudies(studies, sortKey) {
  const sorted = [...studies];
  switch (sortKey) {
    case 'newest':
      return sorted.sort((a, b) => (b.year || '0').localeCompare(a.year || '0'));
    case 'oldest':
      return sorted.sort((a, b) => (a.year || '9999').localeCompare(b.year || '9999'));
    case 'budget_high':
      return sorted.sort((a, b) => (b.budgetOrder || 0) - (a.budgetOrder || 0));
    case 'budget_low':
      return sorted.sort((a, b) => (a.budgetOrder || 0) - (b.budgetOrder || 0));
    case 'name_az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'featured':
    default:
      return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}

function FeaturedCard({ study, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease }}
    >
      <Link to={createPageUrl(`CaseStudy?slug=${study.slug}`)} className="group block">
        <div className="relative overflow-hidden aspect-[16/9] rounded-[2px]" style={{ backgroundColor: 'var(--c4-bg-alt)' }}>
          {study.thumbnail ? (
            <img src={study.thumbnail} alt={study.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>{study.name}</span>
              <span className="text-[10px]" style={{ color: 'var(--c4-text-faint)' }}>↗ View project</span>
            </div>
          )}
          <div className="absolute bottom-4 right-4 md:bottom-5 md:right-5 w-10 h-10 rounded-full flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" style={{ backgroundColor: 'var(--c4-text)' }}>
            <ArrowUpRight size={15} strokeWidth={2} style={{ color: 'var(--c4-bg)' }} />
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
          <div>
            <h3 className="text-[1.05rem] md:text-[1.2rem] font-semibold tracking-[-0.015em] transition-colors duration-300" style={{ color: 'var(--c4-text)' }}>
              {study.name}
            </h3>
            <p className="text-[13px] leading-[1.55] mt-1 max-w-[520px]" style={{ color: 'var(--c4-text-muted)' }}>{study.oneLiner}</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {study.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>{tag}</span>
            ))}
            {study.year && (
              <>
                <span className="w-px h-2.5" style={{ backgroundColor: 'var(--c4-border)' }} />
                <span className="text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>{study.year}</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4">
          <span className="text-[10.5px]" style={{ color: 'var(--c4-text-subtle)' }}>{study.role}</span>
          <span className="text-[10.5px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--c4-accent)' }}>
            View case study →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function ProjectCard({ study, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease }}
    >
      <Link to={createPageUrl(`CaseStudy?slug=${study.slug}`)} className="group block">
        <div className="relative overflow-hidden aspect-[16/10] rounded-[2px]" style={{ backgroundColor: 'var(--c4-bg-alt)' }}>
          {study.thumbnail ? (
            <img src={study.thumbnail} alt={study.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>{study.name}</span>
            </div>
          )}
          <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" style={{ backgroundColor: 'var(--c4-text)' }}>
            <ArrowUpRight size={13} strokeWidth={2} style={{ color: 'var(--c4-bg)' }} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1.5">
            {study.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9.5px] uppercase tracking-[0.14em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>{tag}</span>
            ))}
          </div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-300" style={{ color: 'var(--c4-text)' }}>{study.name}</h3>
          <p className="text-[12.5px] mt-1 leading-[1.5] line-clamp-2" style={{ color: 'var(--c4-text-subtle)' }}>{study.oneLiner}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Portfolio() {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);
  const allStudies = getAllCaseStudies();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = allStudies;
    if (filter !== 'all') {
      list = list.filter((s) => s.category === filter || s.tags.map(t => t.toLowerCase()).includes(filter));
    }
    return sortStudies(list, sort);
  }, [allStudies, filter, sort]);

  const featured = sort === 'featured' ? filtered.filter((s) => s.featured) : [];
  const rest = sort === 'featured' ? filtered.filter((s) => !s.featured) : filtered;

  // Hide sort controls when there's only one study
  const showSort = allStudies.length > 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--c4-bg)' }}>
      <PortfolioHero />

      <section className="pb-20 md:pb-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Filters + Sort — only render toolbar if there's something to filter/sort */}
          {(showSort || allStudies.length > 1) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease }}
              className="mb-10 md:mb-14 pb-5 flex items-center justify-between gap-4"
              style={{ borderBottom: '1px solid var(--c4-border-light)' }}
            >
              <PortfolioFilters active={filter} onChange={setFilter} />
              {showSort && <PortfolioSortMenu value={sort} onChange={setSort} />}
            </motion.div>
          )}

          {loading ? (
            <div className="space-y-14 md:space-y-20">
              <FeaturedCardSkeleton />
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured.length > 0 && (
                <div className="space-y-14 md:space-y-20 mb-14 md:mb-20">
                  {featured.map((s, i) => (
                    <FeaturedCard key={s.slug} study={s} index={i} />
                  ))}
                </div>
              )}

              {/* More projects — only show divider if there are both featured and non-featured */}
              {rest.length > 0 && (
                <>
                  {featured.length > 0 && rest.length > 0 && (
                    <div className="pt-10 md:pt-14 mb-10 md:mb-14" style={{ borderTop: '1px solid var(--c4-border-light)' }}>
                      <span className="text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: 'var(--c4-text-subtle)' }}>More Projects</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-14 md:gap-y-16">
                    {rest.map((s, i) => (
                      <ProjectCard key={s.slug} study={s} index={i} />
                    ))}
                  </div>
                </>
              )}

              {filtered.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                  <p className="text-[13px]" style={{ color: 'var(--c4-text-subtle)' }}>No projects in this category yet.</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}