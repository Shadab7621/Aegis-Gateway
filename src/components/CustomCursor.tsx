'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);

    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.05;
      cursorY += (mouseY - cursorY) * 0.05;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX - 200}px, ${cursorY - 200}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updateCursor);
    };

    updateCursor();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-0"
      style={{
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,110,255,0.06) 0%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  );
}
