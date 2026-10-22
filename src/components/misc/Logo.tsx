import React, { FC } from 'react'
import { cn } from '@/lib/utils'

const Logo: FC<{ width?: number; height?: number; className?: string }> = ({
  width = 38,
  height = 38,
  className = 'mb-2 ml-px mt-1',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, 'transition-transform duration-200 hover:scale-105 select-none')}
    >
      <defs>
        <linearGradient id="crashcopGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" />
          <stop offset="0.5" stopColor="#9333ea" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <filter id="purpleGlow" x="-2" y="-2" width="44" height="44" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#9333ea" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#crashcopGradient)" filter="url(#purpleGlow)" />
      {/* Sleek dynamic "C" + graduation/star motif */}
      <path
        d="M26 14.5C24.5 13 22.4 12 19.8 12C15 12 11 15.6 11 20.4C11 25.2 15 28.8 19.8 28.8C22.4 28.8 24.5 27.8 26 26.3"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="27" cy="20.4" r="2.4" fill="white" />
    </svg>
  )
}

export default Logo
