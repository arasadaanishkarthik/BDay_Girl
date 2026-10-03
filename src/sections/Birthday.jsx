import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Gift } from 'lucide-react';
import { SITE_CONFIG } from '../data/config';
import { birthdayPhoto } from '../data/mediaLoader';
import MagneticButton from '../components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

// ─── BIRTHDAY TARGET ──────────────────────────────────────────────────────────
// October 4 of the current year (or next year if already past)
function getBirthdayTarget() {
  const now = new Date();
  let target = new Date(now.getFullYear(), 9, 4, 0, 0, 0, 0); // month is 0-indexed (9 = Oct)
  const endOfBirthday = new Date(now.getFullYear(), 9, 4, 23, 59, 59, 999);

  if (now >= target && now <= endOfBirthday) {
    // It's her birthday today!
    return target;
  }
  if (now > endOfBirthday) {
    // Birthday has passed this year, count down to next year
    target = new Date(now.getFullYear() + 1, 9, 4, 0, 0, 0, 0);
  }
  return target;
}

function getTimeLeft(target) {
  const now  = Date.now();
  const diff = target.getTime() - now;
  if (diff <= 0) return null; // birthday has arrived
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

// ─── CANVAS PARTICLES ─────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create a small number of elegant gold particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4,
        dx: (Math.random() - 0.5) * 0.3,
        dy: -(Math.random() * 0.6 + 0.2),
        alpha: Math.random() * 0.6 + 0.2,
        fade: Math.random() * 0.005 + 0.002,
      });
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.dx;
        p.y += p.dy;
        p.alpha -= p.fade;

        if (p.alpha <= 0 || p.y < -10) {
          // Reset particle
          particles[i] = {
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            r: Math.random() * 1.8 + 0.4,
            dx: (Math.random() - 0.5) * 0.3,
            dy: -(Math.random() * 0.6 + 0.2),
            alpha: Math.random() * 0.5 + 0.2,
            fade: Math.random() * 0.004 + 0.001,
          };
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#d4af37';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#d4af37';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      animId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

// ─── COUNTDOWN UNIT ───────────────────────────────────────────────────────────
function CountUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <span className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.35em] text-gold/70 mt-1">
        {label}
      </span>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Birthday({ onSelectPhoto }) {
  const containerRef    = useRef(null);
  const dateRevealRef   = useRef(null);
  const target          = useRef(getBirthdayTarget());

  const [timeLeft, setTimeLeft]     = useState(() => getTimeLeft(target.current));
  const [celebrated, setCelebrated] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const left = getTimeLeft(target.current);
      setTimeLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // GSAP date reveal animation on scroll
  useEffect(() => {
    const el = dateRevealRef.current;
    if (!el) return;
    const children = el.querySelectorAll('.date-reveal-item');
    gsap.fromTo(
      children,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 75%',
          once: true,
        },
      }
    );
    return () => ScrollTrigger.getAll().forEach((t) => {
      if (t.vars.trigger === el) t.kill();
    });
  }, []);

  const triggerCelebration = useCallback(() => {
    setCelebrated(true);
    // Lightweight canvas confetti-style burst via Particles (already running)
    // Extra GSAP burst on the birthday heading
    gsap.fromTo(
      '.birthday-heading',
      { scale: 1 },
      { scale: 1.04, duration: 0.3, ease: 'back.out(2)', yoyo: true, repeat: 1 }
    );
  }, []);

  const isBirthdayToday = timeLeft === null;

  return (
    <section
      id="birthday"
      ref={containerRef}
      className="relative w-full min-h-screen py-24 md:py-36 bg-[#080810] text-[#f7f3eb] overflow-hidden select-none flex flex-col"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gold/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-[#080810] to-transparent pointer-events-none" />

      {/* Elegant floating particles */}
      <Particles />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 w-full flex flex-col gap-20 md:gap-32">

        {/* ── DATE REVEAL ────────────────────────────────────────────────── */}
        <div ref={dateRevealRef} className="flex flex-col items-center text-center gap-6">
          {/* Chapter tag */}
          <div className="date-reveal-item flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[11px] font-mono tracking-widest text-gold uppercase">
              Chapter IV • The Special Day
            </span>
          </div>

          {/* OCTOBER */}
          <div className="date-reveal-item overflow-hidden">
            <span className="font-mono text-sm sm:text-base md:text-lg tracking-[0.6em] uppercase text-gold/80 block">
              OCTOBER
            </span>
          </div>

          {/* 04 — large cinematic number */}
          <div className="date-reveal-item relative">
            <span className="font-display text-6xl sm:text-8xl md:text-9xl leading-none font-light text-white tracking-tight select-none">
              04
            </span>
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* A Special Day */}
          <div className="date-reveal-item">
            <span className="font-serif italic text-lg sm:text-2xl md:text-3xl text-gold/80 tracking-widest">
              A Special Day
            </span>
          </div>
        </div>

        {/* ── COUNTDOWN / CELEBRATION ─────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center gap-8">
          {isBirthdayToday ? (
            // Birthday is NOW
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-4"
              >
                <span className="font-display text-4xl sm:text-7xl text-gold">✧</span>
                <h2 className="birthday-heading font-display text-2xl sm:text-5xl md:text-6xl font-light text-white uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                  HAPPY BIRTHDAY
                </h2>
                <p className="font-serif italic text-lg sm:text-2xl text-gold">
                  {SITE_CONFIG.HER_NAME}
                </p>
              </motion.div>
            </AnimatePresence>
          ) : (
            // Countdown (Mobile: 2x2 grid, Desktop: 4-item row)
            <div className="flex flex-col items-center gap-6">
              <p className="font-mono text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white/50">
                THE DAY IS ALMOST HERE
              </p>
              <div className="grid grid-cols-2 sm:flex sm:items-start gap-4 sm:gap-10 md:gap-14">
                <CountUnit value={timeLeft.days}    label="DAYS"    />
                <span className="hidden sm:inline font-display text-3xl sm:text-5xl text-gold/30 mt-2 sm:mt-3">:</span>
                <CountUnit value={timeLeft.hours}   label="HOURS"   />
                <span className="hidden sm:inline font-display text-3xl sm:text-5xl text-gold/30 mt-2 sm:mt-3">:</span>
                <CountUnit value={timeLeft.minutes} label="MINUTES" />
                <span className="hidden sm:inline font-display text-3xl sm:text-5xl text-gold/30 mt-2 sm:mt-3">:</span>
                <CountUnit value={timeLeft.seconds} label="SECONDS" />
              </div>
              <div className="w-px h-6 sm:h-8 bg-white/10" />
              <p className="font-serif italic text-white/40 text-xs sm:text-sm">
                Until October 04
              </p>
            </div>
          )}
        </div>

        {/* ── BIRTHDAY PHOTO ────────────────────────────────────────────── */}
        {birthdayPhoto && (
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Photo */}
            <div
              className="relative w-full md:w-[45%] flex-shrink-0 cursor-pointer group"
              onClick={() => onSelectPhoto && onSelectPhoto(birthdayPhoto)}
            >
              <div className="relative overflow-hidden rounded-xl border border-gold/20 shadow-2xl">
                {birthdayPhoto.blur && !photoLoaded && (
                  <img
                    src={birthdayPhoto.blur}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110"
                  />
                )}
                <picture>
                  <source media="(min-width: 1024px)" srcSet={birthdayPhoto.large || birthdayPhoto.src} type="image/webp" />
                  <img
                    src={birthdayPhoto.medium || birthdayPhoto.src}
                    alt={birthdayPhoto.title}
                    loading="lazy"
                    onLoad={() => setPhotoLoaded(true)}
                    className={`w-full aspect-[3/4] object-cover object-center transition-all duration-500 group-hover:scale-105 ${photoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />
                {/* Glow on hover */}
                <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/40 rounded-xl transition-all duration-500 pointer-events-none" />
              </div>
            </div>

            {/* Birthday message */}
            <div className="flex flex-col gap-6 max-w-lg text-center md:text-left">
              <div className="flex items-center gap-2 md:justify-start justify-center">
                <span className="w-8 h-[1px] bg-gold/40" />
                <span className="font-mono text-[11px] tracking-[0.35em] uppercase text-gold">
                  October 04
                </span>
                <span className="w-8 h-[1px] bg-gold/40" />
              </div>

              <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-wide uppercase">
                {SITE_CONFIG.BIRTHDAY_TOUCH.heading}
              </h3>

              <p className="font-serif italic text-white/70 text-base md:text-lg leading-relaxed">
                "Another year.
                <br />
                Another collection of beautiful moments."
              </p>

              <p className="font-serif italic text-gold/80 text-sm md:text-base leading-relaxed">
                {SITE_CONFIG.BIRTHDAY_TOUCH.message}
              </p>

              {/* OPEN YOUR DAY button */}
              <MagneticButton
                onClick={triggerCelebration}
                ariaLabel="Open birthday celebration"
                className="self-center md:self-start mt-2 px-8 py-3.5 rounded-full border border-gold bg-gold hover:bg-transparent text-black hover:text-gold font-sans text-xs uppercase tracking-[0.3em] font-semibold transition-all duration-400 shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center gap-2 group cursor-pointer"
              >
                <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>{celebrated ? 'Wishes Sent ✧' : 'Open Your Day'}</span>
              </MagneticButton>
            </div>
          </div>
        )}

        {/* ── CELEBRATION MESSAGE (after button click) ─────────────────── */}
        <AnimatePresence>
          {celebrated && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center gap-4 py-8"
            >
              <span className="font-display text-3xl text-gold">✧</span>
              <p className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-white uppercase tracking-[0.2em]">
                Happy Birthday, {SITE_CONFIG.HER_NAME}
              </p>
              <p className="font-serif italic text-white/60 text-base max-w-md">
                {SITE_CONFIG.BIRTHDAY_TOUCH.wish}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
