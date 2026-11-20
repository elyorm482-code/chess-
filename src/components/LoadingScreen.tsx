import React from 'react';
import { motion } from 'motion/react';
import { ChessPieceSvg } from './PieceIcons';

interface LoadingScreenProps {
  label: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ label }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08090E] text-slate-100"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center gap-5 mb-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14"
        >
          <ChessPieceSvg type="n" color="w" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -14, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          className="w-20 h-20"
        >
          <ChessPieceSvg type="k" color="b" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="w-14 h-14"
        >
          <ChessPieceSvg type="q" color="w" />
        </motion.div>
      </div>

      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-amber-400 text-center px-4">
        CHESS &amp; CHECKERS ULTIMATE
      </h1>
      <p className="mt-2 text-sm text-slate-400 tracking-wide">{label}</p>

      <div className="mt-6 w-56 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-purple-500"
        />
      </div>
    </div>
  );
};
