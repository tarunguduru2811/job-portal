import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export default function Logo({ className = "", onClick }: LogoProps) {
  return (
    <motion.div 
      className={`flex flex-col items-center justify-center cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Icon Part */}
      <div className="relative w-16 h-10 mb-1">
        <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]">
          <defs>
            <linearGradient id="arch-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" /> {/* Blue-600 */}
              <stop offset="50%" stopColor="#3b82f6" /> {/* Blue-500 */}
              <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan-500 */}
            </linearGradient>
            <linearGradient id="arrow-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan-500 */}
              <stop offset="100%" stopColor="#22d3ee" /> {/* Cyan-400 */}
            </linearGradient>
          </defs>
          
          {/* Main Arch */}
          <path 
            d="M 10 60 A 40 40 0 0 1 90 60 L 75 60 A 25 25 0 0 0 25 60 Z" 
            fill="url(#arch-grad)" 
          />
          
          {/* Swoosh Body */}
          <path 
            d="M 15 40 Q 55 55, 80 15 L 68 25 Q 50 42, 15 28 Z" 
            fill="url(#arrow-grad)" 
          />
          
          {/* Arrow Head */}
          <polygon 
            points="65,10 95,2 85,30" 
            fill="url(#arrow-grad)" 
          />
        </svg>
      </div>
      
      {/* Text Part */}
      <div className="flex items-center text-2xl md:text-3xl font-extrabold tracking-tight">
        <span className="text-white">TALENT</span>
        <span className="text-[#0ea5e9]">ARC</span>
      </div>
    </motion.div>
  );
}
