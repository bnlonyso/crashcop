import React, { FC } from 'react'
import { cn } from '@/lib/utils'

const Logo: FC<{ width?: number; height?: number; className?: string }> = ({
  width = 38,
  height = 38,
  className = 'mb-1 ml-px mt-0.5',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, 'transition-transform duration-200 hover:scale-105 select-none shrink-0')}
    >
      <defs>
        <linearGradient id="crashcopBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a0b2e" />
          <stop offset="0.6" stopColor="#0a0312" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
        <linearGradient id="purpleNeon" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e9d5ff" />
          <stop offset="0.3" stopColor="#c084fc" />
          <stop offset="0.7" stopColor="#9333ea" />
          <stop offset="1" stopColor="#6b21a8" />
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#a855f7" floodOpacity="0.6" />
        </filter>
      </defs>
      {/* Outer rounded container with neon purple border */}
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="13"
        fill="url(#crashcopBg)"
        stroke="#a855f7"
        strokeWidth="2.5"
      />
      {/* Glowing modern stylized C emblem */}
      <path
        d="M33 16.5C30.2 13.5 26.2 12 21.5 12C14.5 12 9 17.5 9 24.5C9 31.5 14.5 37 21.5 37C26.2 37 30.2 35.5 33 32.5"
        stroke="url(#purpleNeon)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#neonGlow)"
      />
      {/* Inner core dot and arrow */}
      <circle cx="26.5" cy="24.5" r="3" fill="#ffffff" filter="url(#neonGlow)" />
      <path
        d="M32 21L36 24.5L32 28"
        stroke="#c084fc"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Logo
