'use client';
import { motion, useReducedMotion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  durationMs?: number;
  onComplete?: () => void;
};

export const LoadingScreen: React.FC<Props> = ({
  durationMs = 5200,
  onComplete,
}) => {
  const reduce = useReducedMotion();
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const palette = useMemo(
    () => ({
      blue: '#225BE4',
      blueDeep: '#1C4FD9',
      cyan: '#69B8FF',
      white: '#F8FAFF',
    }),
    []
  );

  // RAF progreso
  useEffect(() => {
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const t = ts - startRef.current;
      const lin = Math.min(1, t / durationMs);
      const eased = reduce ? lin : lin === 1 ? 1 : 1 - Math.pow(1 - lin, 2.2);
      setProgress(eased);
      if (eased < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [durationMs, reduce]);

  // Fin oficial
  useEffect(() => {
    const t = setTimeout(() => {
      setFinished(true);
      onComplete?.();
    }, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onComplete]);

  // Skip con Esc o click/tap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFinished(true);
        onComplete?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onComplete]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (reduce) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const rx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ry = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setParallax({ x: rx, y: ry });
    },
    [reduce]
  );

  const handleSkip = useCallback(() => {
    setFinished(true);
    onComplete?.();
  }, [onComplete]);

  if (finished) return null;

  // Ring
  const R = 98;
  const C = 2 * Math.PI * R;
  const dash = C * (1 - progress);

  return (
    <motion.div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 z-[9999] overflow-hidden select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      onPointerMove={onPointerMove}
      onClick={handleSkip}
      style={{
        background: `
          radial-gradient(1200px 600px at 50% 35%, ${palette.cyan}22 0%, transparent 45%),
          conic-gradient(from 200deg at 70% 10%, rgba(255,255,255,0.08), transparent 35%, rgba(255,255,255,0.06), transparent 65%),
          linear-gradient(180deg, ${palette.blue} 0%, ${palette.blueDeep} 100%)
        `,
        cursor: 'pointer',
      }}
    >
      {/* Vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow:
            'inset 0 0 180px rgba(0,0,0,0.35), inset 0 0 420px rgba(0,0,0,0.25)',
        }}
      />

      {/* Grid técnico */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.16]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '28px 28px, 28px 28px',
          maskImage:
            'radial-gradient(65% 55% at 50% 40%, black 60%, transparent 100%)',
        }}
      />

      {/* Auroras laterales */}
      {!useReducedMotion() && (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-1/4 top-[-10%] h-[120%] w-1/2 blur-[50px] opacity-70"
            style={{
              background:
                'radial-gradient(50% 60% at 50% 50%, rgba(105,184,255,0.25) 0%, rgba(255,255,255,0) 70%)',
            }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-1/4 bottom-[-10%] h-[120%] w-1/2 blur-[50px] opacity-60"
            style={{
              background:
                'radial-gradient(50% 60% at 50% 50%, rgba(34,91,228,0.35) 0%, rgba(255,255,255,0) 70%)',
            }}
            animate={{ y: [12, -8, 12] }}
            transition={{ duration: 11.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Centro */}
      <div
        className="absolute inset-0 grid place-items-center"
        style={{
          transform: `perspective(900px) rotateX(${parallax.y * 4}deg) rotateY(${parallax.x * -6}deg)`,
          transition: reduce ? 'none' : 'transform 200ms ease',
        }}
      >
        <div className="relative w-[280px] h-[280px] grid place-items-center">
          {/* Halo interno */}
          {!reduce && (
            <motion.div
              className="absolute inset-0 rounded-full blur-[90px]"
              style={{
                background: `radial-gradient(circle, ${palette.cyan}45 0%, transparent 70%)`,
              }}
              animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.98, 1.05, 0.98] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Ticks */}
          <svg width="280" height="280" className="absolute">
            <defs>
              <filter id="tickBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.6" />
              </filter>
            </defs>
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i / 60) * 2 * Math.PI;
              const r1 = 118;
              const r2 = i % 5 === 0 ? 130 : 126;
              const x1 = 140 + r1 * Math.cos(angle);
              const y1 = 140 + r1 * Math.sin(angle);
              const x2 = 140 + r2 * Math.cos(angle);
              const y2 = 140 + r2 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={i % 5 === 0 ? 2 : 1}
                  filter="url(#tickBlur)"
                />
              );
            })}
          </svg>

          {/* Anillo base + progreso (sin shine) */}
          <svg width="280" height="280" className="absolute">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
              </linearGradient>
            </defs>
            <circle
              cx="140"
              cy="140"
              r={R}
              stroke="url(#ringGrad)"
              strokeWidth="10"
              fill="none"
              style={{
                filter:
                  'drop-shadow(0 0 10px rgba(255,255,255,0.28)) drop-shadow(0 12px 36px rgba(35,93,230,0.35))',
              }}
            />
            <motion.circle
              cx="140"
              cy="140"
              r={R}
              stroke={palette.white}
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 140 140)"
              strokeDasharray={C}
              strokeDashoffset={dash}
              style={{
                filter:
                  'drop-shadow(0 0 14px rgba(255,255,255,0.7)) drop-shadow(0 0 30px rgba(35,93,230,0.55))',
              }}
            />
          </svg>

          {/* Logo (sin specular shine) */}
          <motion.img
            src="/logo.png"
            alt="VencePronto"
            className="w-28 h-28 md:w-32 md:h-32 object-contain relative z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={reduce ? { scale: 1, opacity: 1 } : { scale: [1, 1.03, 1], opacity: 1 }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              filter:
                'drop-shadow(0 0 22px rgba(255,255,255,0.8)) drop-shadow(0 0 32px rgba(35,93,230,0.5))',
            }}
          />

          {/* Contador */}
          <div className="absolute bottom-[-46px] text-center">
            <div className="text-white text-3xl font-extrabold drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]">
              {Math.round(progress * 100)}%
            </div>
            <div className="mt-1 text-[11px] text-white/80 tracking-wide">
              Preparando VencePronto…
            </div>
          </div>
        </div>
      </div>

      {/* Barra progreso */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[28px] w-[70vw] max-w-[360px] h-[8px] rounded-full bg-white/15 overflow-hidden">
        <motion.div
          className="h-full"
          style={{
            width: `${Math.max(5, progress * 100)}%`,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))',
            boxShadow: '0 0 20px rgba(255,255,255,0.55)',
          }}
          transition={{ type: 'tween', ease: 'linear' }}
        />
      </div>

      <div className="absolute bottom-[8px] w-full text-center text-[10px] text-white/60">
        Toca para continuar • Pulsar Esc para omitir
      </div>

      <span className="sr-only">
        Cargando VencePronto… {Math.round(progress * 100)}%
      </span>
    </motion.div>
  );
};
