import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Lock, Unlock, Sparkles, X } from 'lucide-react';
import { SECRET_CONFIG } from '../../data/config';

/**
 * Secret Lock Screen (Requirements 2, 3, 4, 5)
 * - Fullscreen cinematic dark overlay
 * - "ONE MORE LITTLE SECRET" & "Some memories are kept a little closer."
 * - Simple password comparison against SECRET_CONFIG.SECRET_CODE (case-insensitive)
 * - Wrong password: shake input, display "That's not the key."
 * - Correct password: input fades, 🔒 -> 🔓 -> ✨ -> "SECRET MEMORY ROOM"
 */
export default function SecretLockModal({ isOpen, onClose, onUnlocked }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockPhase, setUnlockPhase] = useState(0); // 0: locked, 1: unlocked icon, 2: sparkles reveal

  const inputContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
      setPassword('');
      setErrorMsg('');
      setIsUnlocking(false);
      setUnlockPhase(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 200);
    } else {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }

    return () => {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetCode = (SECRET_CONFIG.SECRET_CODE || 'sanjana').trim().toLowerCase();
    const enteredCode = password.trim().toLowerCase();

    if (enteredCode === targetCode) {
      // Correct password -> trigger unlock sequence
      setIsUnlocking(true);
      setUnlockPhase(1);

      // Phase 1 -> Phase 2 (unlock icon + sparkles)
      setTimeout(() => {
        setUnlockPhase(2);
      }, 700);

      // Complete transition into Secret Room
      setTimeout(() => {
        onUnlocked();
      }, 1800);
    } else {
      // Wrong password -> shake input and show message
      setErrorMsg("That's not the key.");
      if (inputContainerRef.current) {
        gsap.fromTo(
          inputContainerRef.current,
          { x: -10 },
          {
            x: 10,
            duration: 0.07,
            repeat: 5,
            yoyo: true,
            ease: 'power1.inOut',
            onComplete: () => {
              gsap.set(inputContainerRef.current, { x: 0 });
            },
          }
        );
      }
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#07070b]/96 backdrop-blur-2xl p-6 select-none"
      >
        {/* Subtle ambient gold radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-[140px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close lock screen"
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/15 bg-black/40 text-white/70 hover:text-gold hover:border-gold/40 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center">
          {!isUnlocking ? (
            // ─── LOCK SCREEN FORM ──────────────────────────────────────────
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center w-full"
            >
              {/* Header Tag */}
              <div className="flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold/30 bg-gold/5 mb-6">
                <Lock className="w-3.5 h-3.5 text-gold" />
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.35em] text-gold uppercase">
                  ONE MORE LITTLE SECRET
                </span>
              </div>

              {/* Cinematic Heading */}
              <h2 className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-white/90 leading-tight mb-8">
                Some memories are kept a little closer.
              </h2>

              {/* Password Form */}
              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-5">
                <div ref={inputContainerRef} className="w-full max-w-xs relative">
                  <input
                    ref={inputRef}
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter the secret"
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full px-5 py-3.5 rounded-full bg-[#12121a] border border-white/20 focus:border-gold text-white text-center font-sans text-sm tracking-widest placeholder:text-white/30 placeholder:tracking-normal outline-none transition-all shadow-inner focus:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  />
                </div>

                {/* Error message */}
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif italic text-xs text-gold/90 -mt-2 tracking-wide"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                {/* Unlock Button */}
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full border border-gold/60 bg-gold/15 hover:bg-gold hover:text-black text-gold font-sans text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.2)] hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] cursor-pointer active:scale-95"
                >
                  UNLOCK
                </button>
              </form>
            </motion.div>
          ) : (
            // ─── UNLOCK ANIMATION (Requirement 4) ──────────────────────────
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center gap-5 py-8"
            >
              {/* Animated Lock / Unlock Icon */}
              <div className="relative w-20 h-20 rounded-full border border-gold/40 bg-gold/10 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.3)]">
                {unlockPhase === 1 ? (
                  <Lock className="w-8 h-8 text-gold animate-pulse" />
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, rotate: -15 }}
                    animate={{ scale: 1.15, rotate: 0 }}
                    transition={{ duration: 0.4, type: 'spring' }}
                  >
                    <Unlock className="w-8 h-8 text-gold" />
                  </motion.div>
                )}
                {unlockPhase === 2 && (
                  <Sparkles className="w-5 h-5 text-gold absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '4s' }} />
                )}
              </div>

              {/* Reveal Text */}
              {unlockPhase === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="font-mono text-xs tracking-[0.4em] uppercase text-gold">
                    ✧ UNLOCKED ✧
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-white font-light uppercase tracking-[0.2em]">
                    SECRET MEMORY ROOM
                  </h3>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
