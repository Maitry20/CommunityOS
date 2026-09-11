import React, { useEffect, useState, useRef } from 'react';

/**
 * RadialGlowBackground with Liquid Warp Scroll Animation
 * - Background gradients distort like liquid as the user scrolls.
 * - Dynamic SVG fractal noise turbulence filter deforms background gradient layers based on scroll velocity and direction.
 * - Liquid distortion smoothly settles back to rest when scrolling stops.
 * - Ambient radial glow follows scroll depth and cursor position across workspace sections.
 */
export default function RadialGlowBackground() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activeSection, setActiveSection] = useState(1);
  const [warp, setWarp] = useState({ scale: 0, frequency: 0.012, skewY: 0, scaleY: 1.0 });

  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(performance.now());
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.min(Math.max(currentY / totalHeight, 0), 1) : 0;
      
      const now = performance.now();
      const dt = Math.max(now - lastScrollTime.current, 10);
      const dy = currentY - lastScrollY.current;
      const velocity = Math.min(Math.abs(dy) / dt, 14); // Scroll speed

      lastScrollY.current = currentY;
      lastScrollTime.current = now;

      // Calculate dynamic liquid warp values based on scroll velocity
      const targetScale = Math.min(velocity * 8.0, 45); // Liquid displacement scale up to 45px
      const targetFreq = 0.012 + Math.min(velocity * 0.0035, 0.04);
      const targetSkew = Math.min(Math.max(dy * 0.045, -4.0), 4.0);
      const targetScaleY = 1.0 + Math.min(velocity * 0.04, 0.22);

      requestAnimationFrame(() => {
        setScrollProgress(progress);
        setWarp({
          scale: targetScale,
          frequency: targetFreq,
          skewY: targetSkew,
          scaleY: targetScaleY
        });

        // Determine active section based on scroll depth
        if (progress < 0.35) {
          setActiveSection(1); // Top Hero Workspace (AWS Orange)
        } else if (progress < 0.70) {
          setActiveSection(2); // AWS Community Hub (AWS Blue)
        } else {
          setActiveSection(3); // Community Shared Feed & Links (Purple / Gold)
        }
      });

      // Liquid Settling: When scrolling stops, smoothly decay distortion back to rest
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const settleStep = () => {
          setWarp(prev => {
            if (prev.scale <= 0.3) {
              return { scale: 0, frequency: 0.012, skewY: 0, scaleY: 1.0 };
            }
            return {
              scale: prev.scale * 0.76,
              frequency: 0.012 + (prev.frequency - 0.012) * 0.76,
              skewY: prev.skewY * 0.72,
              scaleY: 1.0 + (prev.scaleY - 1.0) * 0.72
            };
          });
        };
        requestAnimationFrame(settleStep);
      }, 90);
    };

    const handleMouseMove = (e) => {
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;
      requestAnimationFrame(() => {
        setMousePos({ x: xPercent, y: yPercent });
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Primary scroll-tracking coordinates
  const mainGlowY = 18 + scrollProgress * 68;
  const mainGlowX = 42 + (mousePos.x - 50) * 0.12;

  // Section-specific liquid gradient palettes
  const getSectionGlowStyles = () => {
    switch (activeSection) {
      case 1:
        return {
          primaryColor: 'rgba(255, 153, 0, 0.25)',
          secondaryColor: 'rgba(236, 114, 17, 0.15)',
          accentColor: 'rgba(9, 114, 211, 0.10)',
          glowX: 32 + (mousePos.x * 0.08),
          glowY: 18 + (scrollProgress * 20),
          scale: 1.0,
          blur: '85px'
        };
      case 2:
        return {
          primaryColor: 'rgba(9, 114, 211, 0.28)',
          secondaryColor: 'rgba(53, 63, 77, 0.20)',
          accentColor: 'rgba(255, 153, 0, 0.15)',
          glowX: 68 - (mousePos.x * 0.08),
          glowY: 48 + (scrollProgress * 20),
          scale: 1.15,
          blur: '95px'
        };
      case 3:
      default:
        return {
          primaryColor: 'rgba(139, 92, 246, 0.24)',
          secondaryColor: 'rgba(255, 153, 0, 0.18)',
          accentColor: 'rgba(9, 114, 211, 0.16)',
          glowX: 48 + (mousePos.x * 0.06),
          glowY: 78 + (scrollProgress * 15),
          scale: 1.25,
          blur: '105px'
        };
    }
  };

  const currentGlow = getSectionGlowStyles();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#090d14]">
      {/* SVG Liquid Warp Filter Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="liquidWarpFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${warp.frequency} ${warp.frequency * 1.4}`}
              numOctaves="2"
              result="liquidNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="liquidNoise"
              scale={warp.scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Primary Liquid-Warping Ambient Background Container */}
      <div
        className="absolute w-full h-full transition-transform duration-100 ease-out"
        style={{
          filter: warp.scale > 0.4 ? 'url(#liquidWarpFilter)' : 'none',
          transform: `skewY(${warp.skewY}deg) scaleY(${warp.scaleY})`,
          transformOrigin: 'center center',
          willChange: 'filter, transform',
        }}
      >
        {/* Main Liquid Scroll-Tracking Radial Gradient Orb */}
        <div
          className="absolute rounded-full transition-all duration-700 ease-out"
          style={{
            width: '800px',
            height: '800px',
            left: `${currentGlow.glowX}%`,
            top: `${mainGlowY}%`,
            transform: `translate(-50%, -50%) scale(${currentGlow.scale})`,
            background: `radial-gradient(circle, ${currentGlow.primaryColor} 0%, ${currentGlow.secondaryColor} 45%, transparent 75%)`,
            filter: `blur(${currentGlow.blur})`,
            willChange: 'transform, left, top, background',
          }}
        />

        {/* Secondary Liquid Counter-Balancing Gradient Orb */}
        <div
          className="absolute rounded-full transition-all duration-1000 ease-out"
          style={{
            width: '600px',
            height: '600px',
            right: `${18 + scrollProgress * 50}%`,
            top: `${82 - mainGlowY * 0.8}%`,
            transform: 'translate(50%, -50%)',
            background: `radial-gradient(circle, ${currentGlow.accentColor} 0%, transparent 70%)`,
            filter: 'blur(90px)',
            willChange: 'transform, right, top',
          }}
        />

        {/* Fluid Ambient Wave Glow Overlay */}
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: 0.15 + (warp.scale / 45) * 0.25,
            background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, ${currentGlow.primaryColor} 0%, transparent 60%)`
          }}
        />
      </div>

      {/* Floating Tech Mesh Background Grid with Liquid Skew Shift */}
      <div 
        className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] transition-transform duration-300"
        style={{
          transform: `translate3d(0, ${-scrollProgress * 45}px, 0) skewY(${warp.skewY * 0.35}deg)`,
        }}
      />
    </div>
  );
}
