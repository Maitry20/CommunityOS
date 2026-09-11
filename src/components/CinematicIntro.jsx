import React, { useEffect, useRef, useState } from 'react';

/**
 * CinematicIntro Component for Community OS
 * 
 * 3-Second Cinematic Opening Animation Timeline:
 * - 0.0 - 0.7s: Individual connections (glowing scattered dots, connection lines forming)
 * - 0.7 - 1.5s: Community forms (nodes converge into abstract AWS-inspired cloud network silhouette + floating doodles)
 * - 1.5 - 2.1s: Brand reveal ("COMMUNITY OS" with blur->sharp & scale 95%->100%, + tagline "Connect. Collaborate. Build Together.")
 * - 2.1 - 2.7s: Network comes alive (cloud pulses once, data packets flow through lines, doodles shift & disperse)
 * - 2.7 - 3.0s: Transition to login (cloud expands, particles dissolve into seamless crossfade out)
 */
export default function CinematicIntro({ onComplete }) {
  const canvasRef = useRef(null);
  const [skipVisible, setSkipVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let startTime = null;

    // Show skip button after 400ms
    const skipTimer = setTimeout(() => setSkipVisible(true), 400);

    // Resize Canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 - 20;

    // Generate Abstract Cloud Silhouette Target Points (36 nodes forming an elegant cloud network outline & inner matrix)
    const generateCloudNodes = () => {
      const nodes = [];
      const count = 36;
      
      // Bottom flat base of cloud
      for (let i = 0; i < 9; i++) {
        const x = centerX - 140 + i * 35;
        const y = centerY + 45 + (Math.sin(i * 0.5) * 4);
        nodes.push({ cloudX: x, cloudY: y });
      }
      
      // Left cloud hump arc
      for (let i = 0; i < 7; i++) {
        const angle = Math.PI * 0.6 + (i / 6) * Math.PI * 0.7;
        const radius = 65;
        const x = centerX - 90 + Math.cos(angle) * radius;
        const y = centerY + 10 + Math.sin(angle) * radius;
        nodes.push({ cloudX: x, cloudY: y });
      }

      // Main top center cloud hump arc
      for (let i = 0; i < 11; i++) {
        const angle = Math.PI * 1.1 + (i / 10) * Math.PI * 0.8;
        const radius = 95;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY - 15 + Math.sin(angle) * radius;
        nodes.push({ cloudX: x, cloudY: y });
      }

      // Right cloud hump arc
      for (let i = 0; i < 7; i++) {
        const angle = Math.PI * 1.6 + (i / 6) * Math.PI * 0.7;
        const radius = 60;
        const x = centerX + 90 + Math.cos(angle) * radius;
        const y = centerY + 15 + Math.sin(angle) * radius;
        nodes.push({ cloudX: x, cloudY: y });
      }

      // Inner network core points
      nodes.push({ cloudX: centerX - 40, cloudY: centerY + 10 });
      nodes.push({ cloudX: centerX, cloudY: centerY + 15 });
      nodes.push({ cloudX: centerX + 40, cloudY: centerY + 10 });

      return nodes;
    };

    const cloudTargets = generateCloudNodes();

    // Create Particles initialized at random positions across viewport
    const particles = cloudTargets.map((target, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.min(width, height) * 0.4 + 100;
      return {
        id: i,
        startX: centerX + Math.cos(angle) * dist,
        startY: centerY + Math.sin(angle) * dist,
        currentX: centerX + Math.cos(angle) * dist,
        currentY: centerY + Math.sin(angle) * dist,
        cloudX: target.cloudX,
        cloudY: target.cloudY,
        size: Math.random() * 2.5 + 2,
        pulseOffset: Math.random() * Math.PI * 2,
        color: i % 3 === 0 ? '#ff9900' : i % 3 === 1 ? '#0972d3' : '#ffffff'
      };
    });

    // AWS-inspired Engineering Doodles surrounding the network
    const doodles = [
      { type: 'cloud', label: '☁️', angle: 0.3, radius: 210, speed: 0.001 },
      { type: 'lightning', label: '⚡', angle: 1.4, radius: 190, speed: -0.0012 },
      { type: 'nodes', label: '☍', angle: 2.5, radius: 220, speed: 0.0008 },
      { type: 'people', label: '👤', angle: 3.6, radius: 200, speed: -0.001 },
      { type: 'dots', label: '•••', angle: 4.7, radius: 215, speed: 0.0015 },
      { type: 'arrow', label: '➔', angle: 5.7, radius: 195, speed: -0.0009 }
    ];

    // Smooth Cubic Easing
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

    // Main Render Loop
    const render = (now) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime; // Total elapsed ms (0 to 3000)
      const totalDuration = 3000;
      const normTime = Math.min(elapsed / totalDuration, 1.0);

      ctx.clearRect(0, 0, width, height);

      // 0. Background Ambient Glow
      const ambientGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, width * 0.6);
      ambientGlow.addColorStop(0, 'rgba(255, 153, 0, 0.12)');
      ambientGlow.addColorStop(0.5, 'rgba(9, 114, 211, 0.06)');
      ambientGlow.addColorStop(1, 'rgba(15, 20, 28, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // --- PHASE 1: 0.0 - 0.7s (Individual connections forming) ---
      // --- PHASE 2: 0.7 - 1.5s (Community forms into Cloud network) ---
      // --- PHASE 4: 2.1 - 2.7s (Network comes alive / pulse) ---
      // --- PHASE 5: 2.7 - 3.0s (Transition expand out) ---

      let convergeFactor = 0;
      if (elapsed > 700) {
        convergeFactor = Math.min((elapsed - 700) / 800, 1.0);
        convergeFactor = easeInOutCubic(convergeFactor);
      }

      // Network Expansion during final transition (2.7s - 3.0s)
      let expansionScale = 1.0;
      if (elapsed > 2700) {
        const expT = (elapsed - 2700) / 300;
        expansionScale = 1.0 + easeOutQuad(expT) * 0.35;
      }

      // Network Pulse during Phase 4 (2.1s - 2.7s)
      let pulseScale = 1.0;
      if (elapsed >= 2100 && elapsed <= 2700) {
        const pulseT = (elapsed - 2100) / 600;
        pulseScale = 1.0 + Math.sin(pulseT * Math.PI) * 0.06;
      }

      const activeScale = expansionScale * pulseScale;

      // Update Particle Positions
      particles.forEach((p, idx) => {
        // Natural wandering in phase 1
        const wanderX = Math.sin(elapsed * 0.002 + p.pulseOffset) * 12 * (1 - convergeFactor);
        const wanderY = Math.cos(elapsed * 0.0025 + p.pulseOffset) * 12 * (1 - convergeFactor);

        const targetX = p.startX + (p.cloudX - p.startX) * convergeFactor;
        const targetY = p.startY + (p.cloudY - p.startY) * convergeFactor;

        p.currentX = centerX + (targetX + wanderX - centerX) * activeScale;
        p.currentY = centerY + (targetY + wanderY - centerY) * activeScale;
      });

      // Draw Connection Lines between nearby nodes
      ctx.lineWidth = 0.8;
      const maxConnDist = 75 * activeScale;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.currentX - p2.currentX;
          const dy = p1.currentY - p2.currentY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnDist) {
            const connAlpha = (1 - dist / maxConnDist) * 0.35 * Math.min(elapsed / 500, 1.0);
            ctx.beginPath();
            ctx.moveTo(p1.currentX, p1.currentY);
            ctx.lineTo(p2.currentX, p2.currentY);

            const lineGrad = ctx.createLinearGradient(p1.currentX, p1.currentY, p2.currentX, p2.currentY);
            lineGrad.addColorStop(0, `rgba(255, 153, 0, ${connAlpha})`);
            lineGrad.addColorStop(1, `rgba(9, 114, 211, ${connAlpha})`);
            ctx.strokeStyle = lineGrad;
            ctx.stroke();
          }
        }
      }

      // Draw Data Packets flowing through network (Phase 4: 2.1s - 2.7s)
      if (elapsed >= 2100 && elapsed <= 2700) {
        const flowProgress = ((elapsed - 2100) / 600);
        for (let i = 0; i < 10; i++) {
          const p1 = particles[i % particles.length];
          const p2 = particles[(i + 7) % particles.length];
          const flowX = p1.currentX + (p2.currentX - p1.currentX) * flowProgress;
          const flowY = p1.currentY + (p2.currentY - p1.currentY) * flowProgress;

          ctx.beginPath();
          ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ff9900';
          ctx.shadowColor = '#ff9900';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw Glowing Particles
      particles.forEach((p) => {
        const glow = Math.sin(elapsed * 0.005 + p.pulseOffset) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.arc(p.currentX, p.currentY, p.size * glow, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // --- Subtle Engineering Doodles (Phase 2 & Phase 4) ---
      if (elapsed >= 700 && elapsed <= 2700) {
        let doodleAlpha = 0;
        if (elapsed < 1200) doodleAlpha = (elapsed - 700) / 500;
        else if (elapsed > 2200) doodleAlpha = 1 - (elapsed - 2200) / 500;
        else doodleAlpha = 1.0;

        doodles.forEach((d) => {
          const currAngle = d.angle + elapsed * d.speed;
          // Inward movement & dispersal during phase 4
          const inwardShift = elapsed > 2100 ? Math.sin((elapsed - 2100) / 600 * Math.PI) * 20 : 0;
          const r = (d.radius - inwardShift) * activeScale;
          const dx = centerX + Math.cos(currAngle) * r;
          const dy = centerY + Math.sin(currAngle) * r;

          ctx.font = '14px monospace';
          ctx.fillStyle = `rgba(255, 153, 0, ${doodleAlpha * 0.6})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(d.label, dx, dy);
        });
      }

      // --- BRAND REVEAL (1.5s - 2.7s) ---
      // # COMMUNITY OS & Tagline reveal
      if (elapsed >= 1500) {
        const textElapsed = elapsed - 1500;
        const titleAlpha = Math.min(textElapsed / 400, 1.0);
        const titleScale = 0.95 + Math.min(textElapsed / 400, 1.0) * 0.05;
        const blurPx = Math.max(8 - (textElapsed / 400) * 8, 0);

        ctx.save();
        ctx.translate(centerX, centerY - 10);
        ctx.scale(titleScale, titleScale);

        // Render Title "COMMUNITY OS"
        ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Title Glow & Text
        ctx.shadowColor = 'rgba(255, 153, 0, 0.7)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
        ctx.fillText('COMMUNITY OS', 0, 0);
        ctx.shadowBlur = 0;

        // AWS Orange Accent Sub-Line under title
        ctx.fillStyle = `rgba(255, 153, 0, ${titleAlpha})`;
        ctx.fillRect(-60, 24, 120, 3);

        // Tagline reveal (1.7s onward): "Connect. Collaborate. Build Together."
        if (elapsed >= 1700) {
          const tagElapsed = elapsed - 1700;
          const tagAlpha = Math.min(tagElapsed / 400, 1.0);
          const tagY = 52 - Math.min(tagElapsed / 400, 1.0) * 6; // Upward smooth slide

          ctx.font = '500 13px font-mono, monospace';
          ctx.fillStyle = `rgba(200, 210, 225, ${tagAlpha})`;
          ctx.letterSpacing = '2px';
          ctx.fillText('Connect. Collaborate. Build Together.', 0, tagY);
        }

        ctx.restore();
      }

      // Check Completion at 3.0 seconds
      if (elapsed >= 3000) {
        handleFinish();
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(skipTimer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    sessionStorage.setItem('community_os_intro_seen', 'true');
    setTimeout(() => {
      onComplete();
    }, 350); // 350ms smooth crossfade into app
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-[#0a0e17] flex items-center justify-center transition-opacity duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* HTML5 Canvas for 60fps cinematic animation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle Top-Right Skip Option */}
      {skipVisible && !isFadingOut && (
        <button
          onClick={handleFinish}
          className="absolute top-6 right-6 font-mono text-xs text-neutral-400 hover:text-[#ff9900] bg-[#161b24]/80 border border-[#353f4d] hover:border-[#ff9900] px-3.5 py-1.5 rounded-sm transition-all cursor-pointer focus:outline-none tracking-wider uppercase backdrop-blur-sm z-50 flex items-center gap-1.5"
        >
          <span>Skip</span>
          <span className="text-[10px] text-[#ff9900]">➔</span>
        </button>
      )}
    </div>
  );
}
