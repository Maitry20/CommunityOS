import React from 'react';

/**
 * HeroTitleSection Component for Community OS
 * 
 * Design Features:
 * - Floating typography sitting directly on existing dark background (NO card, panel, or border).
 * - "Community" rendered in soft near-white.
 * - "OS" rendered with subtle blue-to-purple gradient (from-[#3b82f6] to-[#a855f7]) and a diffused ambient purple glow.
 * - Refined modern font weight (medium/semibold) avoiding heavy bold appearance.
 * - Subtle background network effect: 3-4 drifting nodes & thin connection lines.
 * - Subtle OS Orbital Arc behind "OS" with 2 tiny orbiting nodes.
 * - Muted tagline underneath: "CONNECT. COLLABORATE. BUILD TOGETHER." with wide letter spacing.
 * - Elegant fast load animations (fadeSlideUp & blurSharp).
 */
export default function HeroTitleSection({ compact = false }) {
  return (
    <div className={`relative select-none text-center flex flex-col items-center justify-center overflow-visible transition-all duration-300 ${compact ? 'py-1 mb-2' : 'py-3 mb-6'}`}>
      {/* Dynamic Inline CSS for On-Load Animations & Orbital Motions */}
      <style>{`
        @keyframes communityFadeUp {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes osBlurSharp {
          0% { opacity: 0; filter: blur(8px); transform: scale(0.97); }
          100% { opacity: 1; filter: blur(0); transform: scale(1); }
        }
        @keyframes glowFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes taglineFadeUp {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 0.85; transform: translateY(0); }
        }
        @keyframes orbitRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes nodePulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes signalTravel {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }

        .anim-community {
          animation: communityFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-os {
          animation: osBlurSharp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
        }
        .anim-glow {
          animation: glowFadeIn 0.8s ease-out 0.2s forwards;
        }
        .anim-tagline {
          animation: taglineFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
        }
      `}</style>

      {/* Ambient Diffused Glow behind "OS" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-36 bg-purple-600/15 blur-3xl rounded-full pointer-events-none anim-glow opacity-0 z-0" />

      {/* Subtle Background Network Lines & OS Orbital SVG Overlay */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" 
        style={{ minHeight: '140px' }}
      >
        <defs>
          <linearGradient id="networkLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Thin Network Connection Lines between floating nodes */}
        <line x1="28%" y1="35%" x2="42%" y2="65%" stroke="url(#networkLineGrad)" strokeWidth="0.75" strokeDasharray="3 3" />
        <line x1="72%" y1="30%" x2="58%" y2="68%" stroke="url(#networkLineGrad)" strokeWidth="0.75" strokeDasharray="3 3" />
        <line x1="42%" y1="65%" x2="58%" y2="68%" stroke="url(#networkLineGrad)" strokeWidth="0.6" />

        {/* 3 Floating Network Nodes with subtle pulsing */}
        <circle cx="28%" cy="35%" r="2" fill="#3b82f6" opacity="0.6" style={{ animation: 'nodePulse 4s ease-in-out infinite' }} />
        <circle cx="72%" cy="30%" r="2" fill="#8b5cf6" opacity="0.6" style={{ animation: 'nodePulse 5s ease-in-out 1s infinite' }} />
        <circle cx="42%" cy="65%" r="1.8" fill="#a855f7" opacity="0.5" style={{ animation: 'nodePulse 3.5s ease-in-out 0.5s infinite' }} />
        <circle cx="58%" cy="68%" r="1.8" fill="#60a5fa" opacity="0.5" style={{ animation: 'nodePulse 4.5s ease-in-out 1.5s infinite' }} />
      </svg>

      {/* Floating Main Title Typography */}
      <div className="relative z-10 flex items-center justify-center space-x-2 tracking-tight">
        {/* "Community" in Near-White */}
        <span className="font-sans text-4xl sm:text-5xl md:text-6xl font-medium text-slate-100 tracking-tight opacity-0 anim-community">
          Community
        </span>

        {/* "OS" Container with Gradient & Thin Orbital Arc Overlay */}
        <div className="relative inline-block ml-2 opacity-0 anim-os">
          {/* Subtle OS Orbital Ellipse Arc */}
          <div 
            className="absolute -inset-2.5 pointer-events-none flex items-center justify-center"
            style={{ animation: 'orbitRotate 24s linear infinite' }}
          >
            <svg className="w-20 h-20 overflow-visible" viewBox="0 0 80 80">
              <ellipse 
                cx="40" 
                cy="40" 
                rx="36" 
                ry="18" 
                fill="none" 
                stroke="rgba(139, 92, 246, 0.22)" 
                strokeWidth="0.8" 
                transform="rotate(-15 40 40)" 
              />
              {/* 2 Tiny Traveling Orbital Nodes */}
              <circle cx="76" cy="40" r="1.5" fill="#a855f7" opacity="0.75" />
              <circle cx="4" cy="40" r="1.5" fill="#3b82f6" opacity="0.75" />
            </svg>
          </div>

          {/* "OS" Text with Gradient & Soft Diffused Glow */}
          <span 
            className="font-sans text-4xl sm:text-5xl md:text-6xl font-semibold bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#a855f7] bg-clip-text text-transparent tracking-tight relative z-10"
            style={{
              filter: 'drop-shadow(0 0 14px rgba(139, 92, 246, 0.35))'
            }}
          >
            OS
          </span>
        </div>
      </div>

      {/* Muted Tagline directly underneath "Community OS" */}
      <p className="relative z-10 mt-3.5 text-[11px] sm:text-xs font-mono font-medium tracking-[0.26em] uppercase bg-gradient-to-r from-[#94a3b8] via-[#a5b4fc] to-[#94a3b8] bg-clip-text text-transparent opacity-0 anim-tagline">
        CONNECT. COLLABORATE. BUILD TOGETHER.
      </p>
    </div>
  );
}
