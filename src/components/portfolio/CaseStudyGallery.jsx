import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import GallerySkeleton from './GallerySkeleton';

const ease = [0.22, 1, 0.36, 1];

function GalleryTile({ shot, index, onClick }) {
  const hasImage = !!shot.url;

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04, ease }}
      onClick={onClick}
      className="group relative aspect-[16/10] rounded-[3px] overflow-hidden"
      style={{ backgroundColor: 'var(--c4-bg-alt)' }}
    >
      {hasImage ? (
        <img
          src={shot.url}
          alt={shot.caption || `Screenshot ${index + 1}`}
          className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-600"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
          <ImageIcon size={20} strokeWidth={1.2} style={{ color: 'var(--c4-text-faint)' }} />
          <span className="text-[9px] uppercase tracking-[0.14em] font-medium" style={{ color: 'var(--c4-text-faint)' }}>
            {index + 1}
          </span>
        </div>
      )}
      {shot.caption && (
        <div className="absolute bottom-0 inset-x-0 px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ background: `linear-gradient(to top, var(--c4-caption-from), var(--c4-caption-via), transparent)` }}>
          <span className="text-[11px] font-medium" style={{ color: 'var(--c4-caption-text)' }}>{shot.caption}</span>
        </div>
      )}
    </motion.button>
  );
}

function Lightbox({ screenshots, activeIndex, onClose, onPrev, onNext }) {
  const shot = screenshots[activeIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 backdrop-blur-lg flex items-center justify-center"
      style={{ backgroundColor: 'var(--c4-lightbox-bg)' }}
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--c4-lightbox-control)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--c4-lightbox-control-hover)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--c4-lightbox-control)'}>
        <X size={16} style={{ color: 'var(--c4-lightbox-text)' }} />
      </button>

      {screenshots.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 md:left-8 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--c4-lightbox-control)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--c4-lightbox-control-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--c4-lightbox-control)'}
          >
            <ChevronLeft size={16} style={{ color: 'var(--c4-lightbox-text)' }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 md:right-8 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--c4-lightbox-control)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--c4-lightbox-control-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--c4-lightbox-control)'}
          >
            <ChevronRight size={16} style={{ color: 'var(--c4-lightbox-text)' }} />
          </button>
        </>
      )}

      <div className="max-w-[1000px] w-full mx-4 md:mx-8" onClick={(e) => e.stopPropagation()}>
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease }}
        >
          {shot.url ? (
            <img src={shot.url} alt={shot.caption} className="w-full rounded-[3px]" />
          ) : (
            <div className="aspect-[16/10] rounded-[3px] flex flex-col items-center justify-center gap-2" style={{ backgroundColor: 'var(--c4-lightbox-placeholder-bg)' }}>
              <ImageIcon size={28} strokeWidth={1} style={{ color: 'var(--c4-lightbox-placeholder-icon)' }} />
              <span className="text-[11px]" style={{ color: 'var(--c4-lightbox-placeholder-text)' }}>Screenshot pending</span>
            </div>
          )}
        </motion.div>
        <p className="mt-3 text-center text-[11px]" style={{ color: 'var(--c4-lightbox-text-dim)' }}>
          {activeIndex + 1} / {screenshots.length}
          {shot.caption && <span style={{ color: 'var(--c4-lightbox-text-accent)' }}> — {shot.caption}</span>}
        </p>
      </div>
    </motion.div>
  );
}

export default function CaseStudyGallery({ screenshots }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // Guard: no screenshots at all
  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  if (loading) {
    return <GallerySkeleton count={screenshots.length} />;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {screenshots.map((shot, i) => (
          <GalleryTile
            key={i}
            shot={shot}
            index={i}
            onClick={() => setLightboxIndex(i)}
          />
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            screenshots={screenshots}
            activeIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex((i) => (i === 0 ? screenshots.length - 1 : i - 1))}
            onNext={() => setLightboxIndex((i) => (i === screenshots.length - 1 ? 0 : i + 1))}
          />
        )}
      </AnimatePresence>
    </>
  );
}