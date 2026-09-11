import React, { useState, useRef, useEffect } from 'react';

export default function ParallaxCard({
  children,
  className = '',
  depth = 12,
  rotateLimit = 8,
  glareColor = 'rgba(255, 153, 0, 0.2)',
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
  const [glare, setGlare] = useState({ opacity: 0, x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -rotateLimit;
    const rotateY = ((x - centerX) / centerX) * rotateLimit;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(${depth}px)`);
    setGlare({
      opacity: 0.18,
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
    setGlare({ opacity: 0, x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <div style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>

      {/* Dynamic Interactive Glare Overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-inherit"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, ${glareColor} 0%, rgba(9, 114, 211, 0.1) 45%, transparent 80%)`,
        }}
      />
    </div>
  );
}

export function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Slow Speed Parallax Orb 1 */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#ff9900]/10 blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translate3d(0, ${scrollY * 0.18}px, 0)` }}
      />
      {/* Reverse Speed Parallax Orb 2 */}
      <div
        className="absolute top-1/3 -right-36 w-[28rem] h-[28rem] rounded-full bg-[#0972d3]/12 blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translate3d(0, ${scrollY * -0.25}px, 0)` }}
      />
      {/* Faster Speed Parallax Orb 3 */}
      <div
        className="absolute top-2/3 left-1/4 w-80 h-80 rounded-full bg-[#ec7211]/8 blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translate3d(0, ${scrollY * 0.35}px, 0)` }}
      />
      {/* Floating Subtle Tech Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
        style={{ transform: `translate3d(0, ${scrollY * 0.08}px, 0)` }}
      />
    </div>
  );
}
