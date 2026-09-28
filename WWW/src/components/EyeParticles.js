import React, {useEffect, useRef} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Drifting eye icons joined by faint lines, drawn behind the hero banner.
export default function EyeParticles({count = 350, linkDistance = 75, style}) {
  const canvasRef = useRef(null);
  const eyeSrc = useBaseUrl('img/eye.png');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const eye = new Image();
    eye.src = eyeSrc;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let frame = null;
    let particles = [];

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const n = Math.round((count * width * height) / (1000 * 1000));
      particles = Array.from({length: n}, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 1 + Math.random() * 5,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          if (dx * dx + dy * dy < linkDistance * linkDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 0.5;
      for (const p of particles) {
        if (eye.complete && eye.naturalWidth) {
          ctx.drawImage(eye, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        }
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    resize();
    eye.onload = draw;
    if (reduceMotion) {
      draw();
    } else {
      frame = requestAnimationFrame(step);
    }
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [count, linkDistance, eyeSrc]);

  return <canvas ref={canvasRef} aria-hidden="true" style={style} />;
}
