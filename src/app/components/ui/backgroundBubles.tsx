/* eslint-disable prefer-const */
'use client';
import { useEffect, useRef } from 'react';

const BackgroundBubbles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles: { x: number; y: number; r: number; d: number }[] = [];

    const maxParticles = 100;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 4 + 1,
        d: Math.random() * maxParticles,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#FF8C00'; // Laranja translúcido
      ctx.beginPath();

      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      }

      ctx.fill();
      update();
    };

    let angle = 0;
    const update = () => {
      angle += 0.01;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
        p.x += Math.sin(angle) * 2;

        if (p.y > height) {
          particles[i] = {
            x: Math.random() * width,
            y: 0,
            r: p.r,
            d: p.d,
          };
        }
      }
    };

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    animate();

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default BackgroundBubbles;
