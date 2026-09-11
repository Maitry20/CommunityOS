import React, { useEffect, useState, useRef } from 'react';

/**
 * ParallaxHeroSection - Maintains 100% full opacity and crispness while user is interacting/reading.
 * Only recedes smoothly into 3D background depth when user scrolls past the bottom of this section.
 */
export function ParallaxHeroSection({ children, className = '' }) {
  const sectionRef = useRef(null);
  const [exitProgress, setExitProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Measure when the section's bottom edge scrolls past the top 70% of the viewport (exiting)
      const exitDistance = windowHeight * 0.5;
      const distancePastScreen = windowHeight * 0.3 - rect.bottom;
      
      let rawExit = 0;
      if (distancePastScreen > 0) {
        rawExit = distancePastScreen / exitDistance;
      }
      
      const clampedExit = Math.min(Math.max(rawExit, 0), 1);
      requestAnimationFrame(() => setExitProgress(clampedExit));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scale = 1 - exitProgress * 0.05;
  const translateY = exitProgress * 25;
  // Maintains 100% (1.0) full opacity while viewing/scrolling within section
  const opacity = 1 - exitProgress * 0.35;
  const rotateX = exitProgress * 3;

  return (
    <div
      ref={sectionRef}
      style={{
        transform: `perspective(1200px) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg)`,
        opacity,
        transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * ParallaxDepthSection - Entrance transition that rises into view smoothly without obscuring content.
 */
export default function ParallaxDepthSection({ children, className = '' }) {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const currentPos = windowHeight - rect.top;
      const rawProgress = currentPos / (windowHeight * 0.6);
      const clamped = Math.min(Math.max(rawProgress, 0), 1);
      
      requestAnimationFrame(() => setProgress(clamped));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const translateY = (1 - progress) * 35;
  const scale = 0.97 + progress * 0.03;
  const opacity = Math.min(progress * 1.6, 1);
  const rotateX = (1 - progress) * 3;

  return (
    <div
      ref={sectionRef}
      style={{
        transform: `perspective(1200px) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg)`,
        opacity,
        transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
