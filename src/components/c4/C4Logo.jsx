import React, { useState, useCallback, useRef, useEffect, useMemo, useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from './ThemeContext';

/**
 * C4 Logo — Animated brand logo system (two-layer architecture)
 *
 * LAYER 1 (base):  Mono-filled shapes — always visible. The logo never
 *                  disappears. At rest you see the full C4 mark in grey tones.
 *
 * LAYER 2 (overlay): Colour-filled duplicates of the same shapes, rendered
 *                    on top with animated clipPaths. On hover, colour is
 *                    "drawn onto" the mono base directionally:
 *                      • C arc   — colour sweeps top → bottom
 *                      • 4 body  — colour sweeps top → bottom (includes stem)
 *                      • 4 bar   — horizontal crossbar extends left → right
 *
 * LAYER 3A (upright): "Studios" upright serif letters from
 *                     "logo studios white.svg". Visible at rest.
 *                     Toppled like dominos on hover.
 * LAYER 3B (italic):  "Studios" italic calligraphic letters from
 *                     "logo studio as 4 MC.svg". Hidden at rest.
 *                     Snapped into the 4 after the domino run.
 *
 * State machine:
 *   IDLE ──(hover)──▸ FORWARD ──(completes)──▸ LOCKED
 *   IDLE ◂──(completes)── REVERSE ◂──(hover)── LOCKED
 *
 * Props:
 *  - size:      'small' | 'default' | 'large' | 'xl'
 *  - variant:   'mark' (C4 only) | 'full' (C4 + "Studios" in the 4)
 *  - context:   'header' | 'footer' | 'badge'
 *  - className: extra CSS classes
 */

/* ── Size map (height in px) ─────────────────────────── */
const SIZES = { small: 28, default: 36, large: 48, xl: 72 };

/* ── Colour palettes ─────────────────────────────────── */
const COLOURS = {
  mono: {
    fourBody: '#414243',
    fourArm:  '#6c6d6d',
    cArc:     '#efedec',
    text:     '#1a1a1b',
  },
  colour: {
    fourBody: '#a30000',
    fourArm:  '#22632f',
    cArc:     '#f3f2f3',
    text:     '#1a1a1b',
  },
};

/* ── Timing (seconds) ────────────────────────────────── */
const T = {
  cReveal:    0.50,
  bodyReveal: 0.42,
  armReveal:  0.38,
  studioIn:   0.50,
  reverse:    0.55,
};

/* Easing curves */
const EASE_OUT  = [0.22, 1, 0.36, 1];
const EASE_IO   = [0.42, 0, 0.58, 1];
const EASE_SNAP = [0.16, 1, 0.3, 1];

/* ── State constants ─────────────────────────────────── */
const IDLE    = 'idle';
const FORWARD = 'forward';
const LOCKED  = 'locked';
const REVERSE = 'reverse';

/* ================================================================
 * Path data — extracted verbatim from the supplied SVGs.
 * ================================================================ */

const MARK = {
  fourBody: '561.66 80.05 561.65 285.83 492.81 285.83 492.81 163.2 402.54 294.35 492.81 294.35 460.43 342.92 311.66 342.92 311.66 309.57 477.15 80.05 561.66 80.05',
  fourArm:  '646.24 294.35 613.86 342.92 561.66 342.92 561.66 455.2 510.59 455.2 510.59 342.92 479.43 342.92 511.81 294.35 646.24 294.35',
  cArc:     'M400.21,367.19l46.14.23c-37.51,42.67-88.07,71.58-143.72,82.18-89.36,18.53-180.58-21.95-227.2-100.84-38.2-64.03-30.58-145.6,18.81-201.36,33.03-37.88,79.34-61.48,129.25-65.84,54.95-7.68,110.91-3.18,163.94,13.21l-37.35,52.04c-31.05-6.52-62.94-8.01-94.46-4.43-43.92,2.39-84.09,25.62-108.22,62.6-14,27.78-16.89,59.89-8.07,89.75,13.18,47.07,49.79,83.83,96.62,97.01,55.93,11.27,114.02,2.58,164.26-24.57Z',
  /* Clip bounding boxes */
  cBox: { x: 55,  y: 60,  w: 400, h: 410 },
  bBox: { x: 300, y: 75,  w: 270, h: 270 },
  aBox: { x: 475, y: 290, w: 175, h: 170 },
};

const MARK_S = {
  fourBody: '532.7 131.46 532.69 302.44 475.49 302.44 475.49 200.55 400.48 309.51 475.49 309.51 448.59 349.88 324.97 349.88 324.97 322.16 462.48 131.46 532.7 131.46',
  cArc:     'M398.55,370.04l38.34.19c-31.17,35.46-73.18,59.48-119.42,68.29-74.25,15.4-150.05-18.24-188.79-83.79-31.75-53.21-25.41-120.98,15.63-167.31,27.45-31.48,65.93-51.08,107.4-54.71,45.66-6.38,92.16-2.64,136.22,10.98l-31.03,43.24c-25.8-5.41-52.3-6.65-78.49-3.68-36.49,1.99-69.87,21.29-89.92,52.02-11.63,23.08-14.03,49.76-6.71,74.57,10.95,39.11,41.37,69.66,80.28,80.61,46.47,9.37,94.73,2.15,136.49-20.41Z',
  /* Vertical post below the crossbar — always static, never animates */
  stem: { x: 490.27, y: 349.88, w: 42.44, h: 93.3 },
  /* Horizontal bar — extends rightward from the stem on FORWARD */
  bar:  { x: 532.7, y: 330, h: 20, idleW: 0, extW: 32 },
  cBox: { x: 55,  y: 100, w: 400, h: 380 },
  bBox: { x: 315, y: 125, w: 225, h: 320 },
};

/* Individual letter paths from "logo studio as 4 MC.svg" */
const LETTERS = [
  'M483.46,341.89c-.84,1.5-2.33,2.78-4.46,3.83-2.13,1.05-4.33,1.58-6.62,1.58s-3.94-.53-4.92-1.58c-.97-1.05-1.06-2.33-.25-3.83l3.23-5.98h5.69l-4.54,8.31c-.77,1.42-.34,2.12,1.31,2.12s2.83-.71,3.61-2.12l3.56-6.45c.97-1.76,1.26-3.3.85-4.63l-2.66-8.26c-.47-1.43-.23-3.02.71-4.76l2.73-5.05c.81-1.5,2.3-2.78,4.48-3.83,2.18-1.05,4.47-1.58,6.88-1.58s4.09.53,5.11,1.58c1.02,1.05,1.11,2.33.27,3.83l-3.34,5.98h-5.79l4.59-8.31c.78-1.42.33-2.12-1.36-2.12s-2.96.71-3.73,2.12l-3.4,6.21c-.95,1.74-1.22,3.28-.8,4.61l2.62,8.26c.43,1.43.15,3.03-.83,4.79l-2.95,5.28Z',
  'M494.43,347.04h-1.75c-2.28,0-3.88-.53-4.78-1.58-.91-1.05-.94-2.33-.09-3.83l11.95-21.21h-1.84l.54-.96h1.84l4.33-7.69,6.73-1.87-5.44,9.56h4.07l-.55.96h-4.06l-13.41,23.54c-.81,1.42-.39,2.12,1.26,2.12h1.75l-.55.96Z',
  'M514.51,347.04h-7.23l.44-.75c-1.42.67-2.97,1.01-4.64,1.01-4,0-5.06-1.62-3.18-4.87l12.71-22.01h-1.8l.55-.96h7.46l-14.46,24.75c-.79,1.35-.49,2.02.88,2.02.87,0,1.88-.3,3.04-.91l14.67-24.91h-1.8l.56-.96h7.46l-15.85,26.62h1.75l-.57.96Z',
  'M534.19,347.04h-7.23l.46-.75c-1.44.67-3.01,1.01-4.7,1.01-3.97,0-4.99-1.62-3.04-4.87l11.02-18.36c1.95-3.25,4.97-4.87,9.07-4.87,1.74,0,2.94.34,3.59,1.01l5.72-9.35h-1.82l.58-.96h7.54l-22.35,36.17h1.75l-.59.96ZM528,345.33l14.77-24.16c-.46-.6-1.14-.91-2.06-.91-1.39,0-2.49.67-3.31,2.02l-13.3,21.93c-.82,1.35-.55,2.02.8,2.02.89,0,1.92-.3,3.09-.91Z',
  'M544.64,347.04h-8.98l.6-.96h1.75l16-25.66h-1.8l.6-.96h7.46l-16.76,26.62h1.75l-.61.96ZM562.26,316.28h-5.68l3.97-6.37h5.72l-4.01,6.37Z',
  'M566.38,341.89c-.99,1.52-2.58,2.8-4.76,3.85-2.18,1.04-4.4,1.57-6.69,1.57s-3.85-.52-4.69-1.57c-.85-1.04-.79-2.33.17-3.85l10.96-17.27c.96-1.52,2.55-2.8,4.77-3.85,2.22-1.04,4.51-1.57,6.87-1.57s3.97.52,4.83,1.57c.86,1.04.79,2.33-.2,3.85l-11.27,17.27ZM559.35,344.22l14.17-21.93c.91-1.42.54-2.12-1.14-2.12s-3,.71-3.9,2.12l-14.05,21.93c-.91,1.42-.54,2.12,1.11,2.12s2.89-.71,3.81-2.12Z',
  'M584.99,341.89c-1.04,1.54-2.57,2.81-4.61,3.83-2.15,1.05-4.35,1.58-6.61,1.58s-3.77-.52-4.52-1.57c-.76-1.04-.64-2.33.36-3.85l2.16-3.29h5.54l-3.72,5.62c-.94,1.42-.66,2.12.82,2.12s2.6-.71,3.54-2.12l2.71-4.07c1.14-1.71,1.38-3.04.72-3.99l-3-4.3c-.76-1.07-.46-2.64.9-4.71l1.66-2.54c1.01-1.54,2.57-2.82,4.68-3.86,2.12-1.04,4.35-1.55,6.68-1.55s3.87.52,4.62,1.55c.74,1.04.59,2.32-.44,3.86l-2.21,3.29h-5.57l3.75-5.62c.94-1.42.69-2.12-.77-2.12s-2.62.71-3.56,2.12l-2.42,3.65c-1.13,1.71-1.37,3.03-.7,3.96l2.99,4.3c.73,1.09.39,2.67-1,4.74l-1.99,2.95Z',
];

/* Upright (serif) letter paths — from "logo studios white.svg" bottom instance.
 * These 7 letters spell "Studios" in upright form and are visible at IDLE. */
const UPRIGHT_LETTERS = [
  'M380.39,471.22c0,3.09-1.59,5.73-4.77,7.9-3.18,2.17-7.12,3.25-11.83,3.25s-8.72-1.08-11.9-3.25c-3.18-2.17-4.77-4.8-4.77-7.9v-12.33h11.58v17.13c0,2.92,1.69,4.38,5.08,4.38s5.01-1.46,5.01-4.38v-13.29c0-3.63-1.15-6.81-3.46-9.55l-14.47-17.02c-2.5-2.95-3.74-6.22-3.74-9.82v-10.4c0-3.09,1.59-5.73,4.77-7.9,3.18-2.17,7.14-3.25,11.9-3.25s8.65,1.08,11.83,3.25c3.18,2.17,4.77,4.8,4.77,7.9v12.33h-11.58v-17.13c0-2.92-1.67-4.38-5.01-4.38s-5.08,1.46-5.08,4.38v12.81c0,3.59,1.15,6.76,3.46,9.5l14.47,17.02c2.49,2.95,3.74,6.24,3.74,9.87v10.88Z',
  'M408.92,481.84h-3.6c-4.71,0-8.6-1.08-11.69-3.25-3.08-2.17-4.62-4.8-4.62-7.9v-43.7h-3.67v-1.97h3.67v-15.85l11.23-3.84v19.69h8.12v1.97h-8.12v48.5c0,2.92,1.69,4.38,5.08,4.38h3.6v1.97Z',
  'M450.29,481.84h-14.9v-1.55c-2.12,1.39-4.9,2.08-8.33,2.08-8.24,0-12.36-3.34-12.36-10.03v-45.35h-3.6v-1.97h14.9v51.01c0,2.78,1.41,4.16,4.24,4.16,1.79,0,3.51-.62,5.15-1.87v-51.33h-3.6v-1.97h14.9v54.85h3.6v1.97Z',
  'M490.82,481.84h-14.9v-1.55c-2.12,1.39-4.92,2.08-8.4,2.08-8.19,0-12.29-3.34-12.29-10.03v-37.83c0-6.69,4.1-10.03,12.29-10.03,3.48,0,6.28.69,8.4,2.08v-19.26h-3.6v-1.97h14.9v74.54h3.6v1.97ZM475.93,478.32v-49.78c-1.65-1.25-3.39-1.87-5.23-1.87-2.78,0-4.17,1.39-4.17,4.16v45.19c0,2.78,1.39,4.16,4.17,4.16,1.84,0,3.58-.62,5.23-1.87Z',
  'M512.36,481.84h-18.5v-1.97h3.6v-52.88h-3.6v-1.97h14.9v54.85h3.6v1.97ZM508.76,418.45h-11.3v-13.13h11.3v13.13Z',
  'M550.21,471.22c0,3.13-1.54,5.77-4.62,7.92-3.08,2.15-6.98,3.23-11.69,3.23s-8.61-1.08-11.72-3.23c-3.11-2.15-4.66-4.79-4.66-7.92v-35.59c0-3.13,1.55-5.77,4.66-7.92,3.11-2.15,7.01-3.23,11.72-3.23s8.6,1.08,11.69,3.23c3.08,2.15,4.62,4.79,4.62,7.92v35.59ZM538.91,476.02v-45.19c0-2.92-1.67-4.38-5.01-4.38s-5.08,1.46-5.08,4.38v45.19c0,2.92,1.69,4.38,5.08,4.38s5.01-1.46,5.01-4.38Z',
  'M588.33,471.22c0,3.17-1.39,5.8-4.17,7.9-2.96,2.17-6.78,3.25-11.44,3.25s-8.47-1.08-11.44-3.23-4.45-4.79-4.45-7.92v-6.78h11.3v11.58c0,2.92,1.53,4.38,4.59,4.38s4.38-1.46,4.38-4.38v-8.38c0-3.52-1.32-6.26-3.95-8.22l-11.86-8.86c-2.97-2.21-4.45-5.44-4.45-9.71v-5.23c0-3.17,1.44-5.82,4.31-7.95,2.87-2.13,6.64-3.2,11.3-3.2s8.43,1.07,11.3,3.2c2.87,2.13,4.31,4.79,4.31,7.95v6.78h-11.23v-11.58c0-2.92-1.46-4.38-4.38-4.38s-4.31,1.46-4.31,4.38v7.52c0,3.52,1.29,6.24,3.88,8.16l11.86,8.86c2.97,2.24,4.45,5.5,4.45,9.76v6.08Z',
];

/* Transform to position upright letters in MARK_S coordinate space.
 * Scale 1.5× — large and prominent, matching the reference image.
 * S left: 18 + 347×1.5 = 538.5 (just past arm right edge 532.71)
 * Cap:  -273 + 405×1.5 = 334.5 (above arm at 350)
 * Base: -273 + 482×1.5 = 450   (below arm bottom 443) */
const UPRIGHT_TRANSFORM = 'translate(18, -273) scale(1.5)';

/* Transform to position italic letters at the SAME screen size/position
 * as the upright letters. Native italic bounds ≈ (465–600, 309–347).
 * Scale 2.87× to match upright dimensions.
 * Left: -797 + 465×2.87 = 537.55   Right: -797 + 600×2.87 = 925
 * Top:  -547 + 309×2.87 = 339.8     Bot:   -547 + 347×2.87 = 448.9 */
const ITALIC_TRANSFORM = 'translate(-797, -547) scale(2.87)';

/* ── Theme-aware colour resolution ───────────────────── */
function useLogoColours(context) {
  const { isDark } = useTheme();
  return useMemo(() => {
    const m = { ...COLOURS.mono };
    if (isDark || context === 'footer') {
      m.fourBody = '#9a9b9c';
      m.fourArm  = '#8a8b8c';
      m.cArc     = '#d0cecc';
      m.text     = '#e8e6e3';
    }
    return { mono: m, colour: COLOURS.colour };
  }, [isDark, context]);
}

/* ================================================================
 * Main component
 * ================================================================ */
export default function C4Logo({
  size = 'default',
  variant = 'mark',
  context = 'header',
  className = '',
}) {
  const h = typeof size === 'number' ? size : (SIZES[size] || SIZES.default);
  const full = variant === 'full';
  const reduced = useReducedMotion();
  const { mono, colour } = useLogoColours(context);
  const uid = useId();

  /* ── State machine ── */
  const [state, setState] = useState(IDLE);
  const sRef = useRef(state);
  sRef.current = state;
  const doneRef = useRef(false);

  /* ── Interaction handlers ── */
  const handleHoverStart = useCallback(() => {
    if (reduced) {
      setState(s => s === IDLE ? LOCKED : IDLE);
      return;
    }
    const s = sRef.current;
    if (s === IDLE) { doneRef.current = false; setState(FORWARD); }
    else if (s === LOCKED) { setState(REVERSE); }
  }, [reduced]);

  const handleHoverEnd = useCallback(() => {
    if (reduced) return;
    if (sRef.current === FORWARD && !doneRef.current) setState(REVERSE);
  }, [reduced]);

  const handleTap = useCallback(() => {
    if (window.matchMedia('(hover: hover)').matches) return;
    if (reduced) { setState(s => s === IDLE ? LOCKED : IDLE); return; }
    const s = sRef.current;
    if (s === IDLE) { doneRef.current = false; setState(FORWARD); }
    else if (s === LOCKED) { setState(REVERSE); }
  }, [reduced]);

  /* ── Stagger anchors ──
   * bodyDelay → when 4 body starts drawing
   * barDelay  → when bar starts extending (waits for body to fully complete)
   * textDelay → the exact moment the bar reaches the first letter gap (5.79 / 32 units)
   * Italic letters appear 120ms after each upright starts, visibly mid-fall.
   */
  const bodyDelay  = T.cReveal * 0.35;
  const barDelay   = bodyDelay + T.bodyReveal; // body completes fully
  const barTravelDuration = T.armReveal * 0.7;
  const barArrivalGapFraction = 5.79 / 32; 
  const textDelay  = barDelay + (barTravelDuration * barArrivalGapFraction);
  const totalFwd   = textDelay + 0.12 + 6 * 0.042 + 0.22 + 0.12;
  const fwdMs      = totalFwd * 1000 + 150;

  /* ── Completion timers ── */
  useEffect(() => {
    if (state !== FORWARD) return;
    const t = setTimeout(() => { doneRef.current = true; setState(LOCKED); }, fwdMs);
    return () => clearTimeout(t);
  }, [state, fwdMs]);

  useEffect(() => {
    if (state !== REVERSE) return;
    const t = setTimeout(() => setState(IDLE), T.reverse * 1000 + 80);
    return () => clearTimeout(t);
  }, [state]);

  /* ── Choose geometry set ── */
  const paths = full ? MARK_S : MARK;

  /* ── ViewBox / sizing ── */
  const vb = full ? '50 100 880 400' : '265 55 395 420';
  const aspect = full ? (880 / 400) : (395 / 420);
  const w = Math.round(h * aspect);

  /* ── Unique clip IDs ── */
  const clipC    = `cc-${uid}`;
  const clipBody = `cb-${uid}`;
  const clipArm  = `ca-${uid}`;

  /* ── Horizontal bar extension — shoots right as the LAST draw action ── */
  const barExtV = full ? {
    [IDLE]:    { width: MARK_S.bar.idleW,
                 transition: { duration: T.reverse * 0.3, ease: EASE_IO } },
    [FORWARD]: { width: MARK_S.bar.extW,
                 transition: { duration: T.armReveal * 0.7, delay: barDelay, ease: [0.08, 0.95, 0.25, 1] } },
    [LOCKED]:  { width: MARK_S.bar.idleW,
                 transition: { duration: 0.18, delay: 0.10, ease: EASE_IO } },
    [REVERSE]: { width: MARK_S.bar.idleW,
                 transition: { duration: T.reverse * 0.25, ease: EASE_IO } },
  } : null;

  /* ── Clip variants for colour overlay reveals ────────
   *
   * These animate the rectangles inside <clipPath> elements.
   * The colour shapes (layer 2) are only visible where the
   * clip rect has expanded. The mono base (layer 1) is never
   * clipped — it's always fully visible underneath.
   *
   * IDLE/REVERSE: rect collapses → colour hidden → mono shows through
   * FORWARD/LOCKED: rect expands → colour paints over mono directionally
   */

  const cBox = paths.cBox || MARK.cBox;
  const bBox = paths.bBox || MARK.bBox;

  /* C arc colour overlay: top → bottom */
  const cClipV = {
    [IDLE]:    { height: 0,
                 transition: { duration: T.reverse * 0.65, delay: T.reverse * 0.2, ease: EASE_IO } },
    [FORWARD]: { height: cBox.h,
                 transition: { duration: T.cReveal, ease: EASE_OUT } },
    [LOCKED]:  { height: cBox.h,
                 transition: { duration: 0.06 } },
    [REVERSE]: { height: 0,
                 transition: { duration: T.reverse * 0.55, delay: T.reverse * 0.25, ease: EASE_IO } },
  };

  /* 4 body colour overlay: top → bottom */
  const bClipV = {
    [IDLE]:    { height: 0,
                 transition: { duration: T.reverse * 0.55, delay: T.reverse * 0.08, ease: EASE_IO } },
    [FORWARD]: { height: bBox.h,
                 transition: { duration: T.bodyReveal, delay: bodyDelay, ease: EASE_OUT } },
    [LOCKED]:  { height: bBox.h,
                 transition: { duration: 0.06 } },
    [REVERSE]: { height: 0,
                 transition: { duration: T.reverse * 0.45, delay: T.reverse * 0.05, ease: EASE_IO } },
  };

  /* Horizontal bar colour overlay: left → right */
  const barClipW = full ? MARK_S.bar.extW + 4 : MARK.aBox.w;
  const barClipV = {
    [IDLE]:    { width: 0,
                 transition: { duration: T.reverse * 0.3, ease: EASE_IO } },
    [FORWARD]: { width: barClipW,
                 transition: { duration: T.armReveal * 0.7, delay: barDelay, ease: [0.08, 0.95, 0.25, 1] } },
    [LOCKED]:  { width: barClipW,
                 transition: { duration: 0.06 } },
    [REVERSE]: { width: 0,
                 transition: { duration: T.reverse * 0.25, ease: EASE_IO } },
  };

  /* ── UPRIGHT Studios — visible at IDLE, topples on FORWARD ──
   * Upright serif letters from "logo studios white.svg" sit to
   * the right of the 4's crossbar at IDLE.
   *
   * On FORWARD the horizontal bar extends rightward and the
   * force "knocks" each upright letter over like a domino —
   * rotating clockwise around bottom-left and fading out.
   *
   * On REVERSE the letters stand back up right→left.        */
  const uprightFill = mono.text;

  const ugV = {
    [IDLE]:    { opacity: 1,
                 transition: { duration: 0.15, staggerChildren: 0.038, staggerDirection: -1 } },
    [FORWARD]: { opacity: 1,
                 transition: { staggerChildren: 0.042,
                               delayChildren: textDelay } },
    [LOCKED]:  { opacity: 0,
                 transition: { duration: 0.01 } },
    [REVERSE]: { opacity: 1,
                 transition: { opacity: { duration: 0.04 },
                               staggerChildren: 0.042,
                               staggerDirection: -1,
                               delayChildren: 0.08 } },
  };

  const ulV = {
    [IDLE]:    { opacity: 1, rotate: 0, x: 0, y: 0,
                 transition: {
                   opacity: { duration: 0.08, ease: 'easeOut' },
                   rotate:  { duration: 0.24, ease: EASE_SNAP },
                   x:       { duration: 0.20, ease: EASE_SNAP },
                   y:       { duration: 0.18, ease: EASE_SNAP },
                 } },
    [FORWARD]: { opacity: 0, rotate: 82, x: 14, y: 8,
                 transition: {
                   opacity: { duration: 0.04, delay: 0.18, ease: 'easeIn' },
                   rotate:  { duration: 0.20, ease: [0.05, 0.85, 0.40, 1] },
                   x:       { duration: 0.18, ease: [0.05, 0.85, 0.40, 1] },
                   y:       { duration: 0.16, ease: [0.10, 0.80, 0.35, 1] },
                 } },
    [LOCKED]:  { opacity: 0, rotate: 82, x: 14, y: 8,
                 transition: { duration: 0.01 } },
    [REVERSE]: { opacity: 1, rotate: 0, x: 0, y: 0,
                 transition: {
                   opacity: { duration: 0.08, ease: 'easeOut' },
                   rotate:  { duration: 0.24, ease: EASE_SNAP },
                   x:       { duration: 0.20, ease: EASE_SNAP },
                   y:       { duration: 0.18, ease: EASE_SNAP },
                 } },
  };

  /* ── ITALIC Studios — hidden at IDLE, snaps in on FORWARD ──
   * Italic calligraphic letters from "logo studio as 4 MC.svg".
   * They integrate into the 4 in the LOCKED state.
   *
   * On FORWARD each letter appears slightly after the
   * corresponding upright letter topples — rotated slightly
   * then snapping to rest.
   *
   * On REVERSE they retract while uprights stand back up.  */
  const italicFill = mono.text;

  const igV = {
    [IDLE]:    { opacity: 0,
                 transition: { duration: 0.06 } },
    [FORWARD]: { opacity: 1,
                 transition: { opacity: { duration: 0.01 },
                               staggerChildren: 0.042,
                               delayChildren: textDelay + 0.12 } },
    [LOCKED]:  { opacity: 1,
                 transition: { duration: 0.04 } },
    [REVERSE]: { opacity: 0,
                 transition: { opacity: { duration: 0.04, delay: 0.01 },
                               staggerChildren: 0.025,
                               staggerDirection: -1 } },
  };

  const ilV = {
    [IDLE]:    { opacity: 0, rotate: 82, x: 16, y: 10,
                 transition: { duration: 0.03 } },
    [FORWARD]: { opacity: 1, rotate: 0, x: 0, y: 0,
                 transition: {
                   opacity: { duration: 0.08, ease: 'easeOut' },
                   rotate:  { duration: 0.22, ease: EASE_SNAP },
                   x:       { duration: 0.18, ease: EASE_SNAP },
                   y:       { duration: 0.16, ease: EASE_SNAP },
                 } },
    [LOCKED]:  { opacity: 1, rotate: 0, x: 0, y: 0,
                 transition: { duration: 0.04 } },
    [REVERSE]: { opacity: 0, rotate: 40, x: 10, y: 6,
                 transition: {
                   opacity: { duration: 0.03, delay: 0.06 },
                   rotate:  { duration: 0.10, ease: [0.32, 0, 0.67, 0.35] },
                   x:       { duration: 0.08, ease: EASE_IO },
                   y:       { duration: 0.08, ease: EASE_IO },
                 } },
  };

  return (
    <motion.span
      className={`inline-flex items-center select-none cursor-pointer ${className}`}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onClick={handleTap}
      style={{ height: h }}
      role="img"
      aria-label="C4 Studios"
    >
      <svg
        viewBox={vb}
        width={w}
        height={h}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* ─── LAYER 1: Mono base — always visible, no clips ─── */}
        <path       d={paths.cArc}     fill={mono.cArc} />
        <polygon    points={paths.fourBody} fill={mono.fourBody} />
        {full ? (
          <>
            {/* Vertical post — static, never animates */}
            <rect
              x={MARK_S.stem.x} y={MARK_S.stem.y}
              width={MARK_S.stem.w} height={MARK_S.stem.h}
              fill={mono.fourArm}
            />
            {/* Horizontal bar — the ONLY moving element, shoots right */}
            <motion.rect
              x={MARK_S.bar.x} y={MARK_S.bar.y}
              height={MARK_S.bar.h}
              fill={mono.fourArm}
              variants={barExtV}
              animate={state}
              initial={IDLE}
            />
          </>
        ) : (
          <polygon points={paths.fourArm} fill={mono.fourArm} />
        )}

        {/* ─── Clip definitions for colour overlay ─── */}
        <defs>
          <clipPath id={clipC}>
            <motion.rect
              x={cBox.x} y={cBox.y} width={cBox.w} height={0}
              variants={cClipV}
              animate={state}
              initial={IDLE}
            />
          </clipPath>
          <clipPath id={clipBody}>
            <motion.rect
              x={bBox.x} y={bBox.y} width={bBox.w} height={0}
              variants={bClipV}
              animate={state}
              initial={IDLE}
            />
          </clipPath>
          <clipPath id={clipArm}>
            <motion.rect
              x={full ? MARK_S.bar.x : MARK.aBox.x}
              y={full ? MARK_S.bar.y - 2 : MARK.aBox.y}
              width={0}
              height={full ? MARK_S.bar.h + 6 : MARK.aBox.h}
              variants={barClipV}
              animate={state}
              initial={IDLE}
            />
          </clipPath>
        </defs>

        {/* ─── LAYER 2: Colour overlay — clipped directional reveals ─── */}
        <path
          d={paths.cArc}
          fill={colour.cArc}
          clipPath={`url(#${clipC})`}
        />
        <polygon
          points={paths.fourBody}
          fill={colour.fourBody}
          clipPath={`url(#${clipBody})`}
        />
        {full ? (
          <>
            {/* Stem colour — revealed by body clip (top→bottom with body) */}
            <rect
              x={MARK_S.stem.x} y={MARK_S.stem.y}
              width={MARK_S.stem.w} height={MARK_S.stem.h}
              fill={colour.fourArm}
              clipPath={`url(#${clipBody})`}
            />
            {/* Bar colour — revealed left→right with bar clip */}
            <motion.rect
              x={MARK_S.bar.x} y={MARK_S.bar.y}
              height={MARK_S.bar.h}
              fill={colour.fourArm}
              clipPath={`url(#${clipArm})`}
              variants={barExtV}
              animate={state}
              initial={IDLE}
            />
          </>
        ) : (
          <polygon
            points={paths.fourArm}
            fill={colour.fourArm}
            clipPath={`url(#${clipArm})`}
          />
        )}

        {/* ─── LAYER 3A: Upright Studios — visible at IDLE ─── */}
        {full && (
          <g transform={UPRIGHT_TRANSFORM}>
            <motion.g
              variants={ugV}
              animate={state}
              initial={IDLE}
            >
              {UPRIGHT_LETTERS.map((d, i) => (
                <motion.path
                  key={`u-${i}`}
                  d={d}
                  variants={ulV}
                  style={{
                    fill: uprightFill,
                    transformOrigin: 'left bottom',
                    transformBox: 'fill-box',
                  }}
                />
              ))}
            </motion.g>
          </g>
        )}

        {/* ─── LAYER 3B: Italic Studios — integrated into the 4 ─── */}
        {full && (
          <g transform={ITALIC_TRANSFORM}>
            <motion.g
              variants={igV}
              animate={state}
              initial={IDLE}
            >
              {LETTERS.map((d, i) => (
                <motion.path
                  key={`i-${i}`}
                  d={d}
                  variants={ilV}
                  style={{
                    fill: italicFill,
                    transformOrigin: 'left bottom',
                    transformBox: 'fill-box',
                  }}
                />
              ))}
            </motion.g>
          </g>
        )}
      </svg>
    </motion.span>
  );
}
